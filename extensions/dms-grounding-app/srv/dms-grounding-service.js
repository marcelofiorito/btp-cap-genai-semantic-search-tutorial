const cds = require('@sap/cds');
const { DmsClient } = require('./lib/dms-client');
const { EmbeddingProvider } = require('./lib/embedding-provider');
const { splitIntoChunks, cosineSimilarity } = require('./lib/text-utils');

module.exports = cds.service.impl(async function () {
  const { SourceDocuments, DocumentChunks, SyncRuns } = this.entities;

  const dmsClient = new DmsClient();
  const embeddingProvider = new EmbeddingProvider();

  this.on('syncRepository', async (req) => {
    const repositoryId = (req.data.repositoryId || process.env.DMS_REPOSITORY_ID || '').trim();
    const folderPath = (req.data.folderPath || '/').trim() || '/';
    const limit = Number.isInteger(req.data.limit) && req.data.limit > 0 ? req.data.limit : 50;

    if (!repositoryId) {
      req.reject(400, 'repositoryId é obrigatório (payload ou env DMS_REPOSITORY_ID).');
    }

    const tx = cds.tx(req);
    const now = new Date().toISOString();

    const runEntry = {
      repositoryId,
      folderPath,
      totalDocuments: 0,
      importedDocuments: 0,
      skippedDocuments: 0,
      status: 'RUNNING',
      details: 'Sincronização iniciada.',
      startedAt: now
    };

    await tx.run(INSERT.into(SyncRuns).entries(runEntry));
    const run = await tx.run(
      SELECT.one
        .from(SyncRuns)
        .where({ repositoryId, folderPath, startedAt: now })
        .orderBy('createdAt desc')
    );

    let totalDocuments = 0;
    let importedDocuments = 0;
    let skippedDocuments = 0;
    const issues = [];

    try {
      const documents = await dmsClient.listDocuments({ repositoryId, folderPath, limit });
      totalDocuments = documents.length;

      for (const doc of documents) {
        try {
          let extractedText = '';
          let extractionError = '';
          try {
            extractedText = await dmsClient.getDocumentText(doc);
          } catch (error) {
            extractionError = error.message || 'erro desconhecido na extração';
          }
          const maxLen = Number.parseInt(process.env.GROUNDING_MAX_TEXT_LENGTH || '20000', 10);
          const trimmedText = (extractedText || '').slice(0, Number.isFinite(maxLen) ? maxLen : 20000);
          const fallbackText = `Document metadata fallback. Name: ${doc.name}. Repository: ${doc.repositoryId}. Path: ${doc.folderPath}. MimeType: ${doc.mimeType}.`;
          const persistedText = trimmedText || fallbackText;
          const message = trimmedText
            ? 'Texto carregado com sucesso.'
            : extractionError
              ? `Falha ao extrair conteúdo (${extractionError}); aplicado fallback de metadados.`
              : 'Sem extração de texto; aplicado fallback de metadados.';

          const existing = await tx.run(
            SELECT.one.from(SourceDocuments).where({
              repositoryId: doc.repositoryId,
              sourceObjectId: doc.sourceObjectId
            })
          );

          const payload = {
            repositoryId: doc.repositoryId,
            sourceObjectId: doc.sourceObjectId,
            name: doc.name,
            folderPath: doc.folderPath,
            mimeType: doc.mimeType,
            contentUrl: doc.contentUrl,
            extractedText: persistedText,
            lastSyncStatus: 'SYNCED',
            lastSyncMessage: message,
            externalCreatedAt: toIsoOrNull(doc.externalCreatedAt),
            externalModifiedAt: toIsoOrNull(doc.externalModifiedAt)
          };

          if (existing) {
            await tx.run(
              UPDATE(SourceDocuments)
                .set(payload)
                .where({ ID: existing.ID })
            );
          } else {
            await tx.run(INSERT.into(SourceDocuments).entries(payload));
          }

          importedDocuments += 1;
        } catch (error) {
          skippedDocuments += 1;
          issues.push(`${doc.name || doc.sourceObjectId}: ${error.message}`);
        }
      }

      await tx.run(
        UPDATE(SyncRuns)
          .set({
            totalDocuments,
            importedDocuments,
            skippedDocuments,
            status: skippedDocuments > 0 ? 'PARTIAL' : 'SUCCESS',
            details: issues.length ? issues.slice(0, 20).join(' | ') : 'Sincronização concluída sem erros.',
            finishedAt: new Date().toISOString()
          })
          .where({ ID: run.ID })
      );

      return {
        runID: run.ID,
        totalDocuments,
        importedDocuments,
        skippedDocuments,
        status: skippedDocuments > 0 ? 'PARTIAL' : 'SUCCESS',
        message: issues.length ? issues[0] : 'Sincronização concluída.'
      };
    } catch (error) {
      await tx.run(
        UPDATE(SyncRuns)
          .set({
            totalDocuments,
            importedDocuments,
            skippedDocuments,
            status: 'ERROR',
            details: error.message,
            finishedAt: new Date().toISOString()
          })
          .where({ ID: run.ID })
      );

      req.reject(500, `Falha na sincronização: ${error.message}`);
    }
  });

  this.on('generateChunks', async (req) => {
    const documentID = req.data.documentID;
    if (!documentID) req.reject(400, 'documentID é obrigatório.');

    const chunkSize = Number.isInteger(req.data.chunkSize) && req.data.chunkSize > 0 ? req.data.chunkSize : 1200;
    const overlap = Number.isInteger(req.data.overlap) && req.data.overlap >= 0 ? req.data.overlap : 200;

    const tx = cds.tx(req);
    const document = await tx.run(SELECT.one.from(SourceDocuments).where({ ID: documentID }));

    if (!document) req.reject(404, 'Documento não encontrado.');

    const chunks = splitIntoChunks(document.extractedText || '', chunkSize, overlap);

    await tx.run(DELETE.from(DocumentChunks).where({ document_ID: documentID }));

    for (const chunk of chunks) {
      const embedding = await embeddingProvider.embed(chunk.chunkText);
      await tx.run(
        INSERT.into(DocumentChunks).entries({
          document_ID: documentID,
          chunkIndex: chunk.chunkIndex,
          chunkText: chunk.chunkText,
          tokenEstimate: chunk.tokenEstimate,
          embeddingJson: JSON.stringify(embedding)
        })
      );
    }

    return chunks.length;
  });

  this.on('semanticSearch', async (req) => {
    const query = (req.data.query || '').trim();
    const topK = Number.isInteger(req.data.topK) && req.data.topK > 0 ? req.data.topK : 5;

    if (!query) req.reject(400, 'query é obrigatória.');

    const tx = cds.tx(req);
    const [queryEmbedding, allChunks, allDocuments] = await Promise.all([
      embeddingProvider.embed(query),
      tx.run(SELECT.from(DocumentChunks)),
      tx.run(SELECT.from(SourceDocuments))
    ]);

    const docById = new Map(allDocuments.map((doc) => [doc.ID, doc]));

    const scored = allChunks
      .map((chunk) => {
        let chunkEmbedding = [];
        try {
          chunkEmbedding = JSON.parse(chunk.embeddingJson || '[]');
        } catch (error) {
          chunkEmbedding = [];
        }

        return {
          chunk,
          score: cosineSimilarity(queryEmbedding, chunkEmbedding)
        };
      })
      .filter((item) => Number.isFinite(item.score))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((item) => {
        const doc = docById.get(item.chunk.document_ID);
        return {
          chunkID: item.chunk.ID,
          documentID: item.chunk.document_ID,
          documentName: doc?.name || 'documento-sem-nome',
          score: Number(item.score.toFixed(6)),
          snippet: (item.chunk.chunkText || '').slice(0, 240)
        };
      });

    return scored;
  });
});

function toIsoOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}
