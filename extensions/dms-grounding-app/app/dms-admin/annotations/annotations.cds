using DmsGroundingService as service from '../../../srv/dms-grounding-service';

annotate service.SourceDocuments with @(
  UI.HeaderInfo : {
    TypeName       : 'Documento de Origem',
    TypeNamePlural : 'Documentos de Origem',
    Title          : { Value : name },
    Description    : { Value : mimeType }
  },
  UI.LineItem : [
    { Value : name, Label : 'Nome' },
    { Value : repositoryId, Label : 'Repositório' },
    { Value : folderPath, Label : 'Pasta' },
    { Value : mimeType, Label : 'MIME Type' },
    { Value : lastSyncStatus, Label : 'Status' },
    { Value : modifiedAt, Label : 'Última Atualização' }
  ],
  UI.SelectionFields : [ repositoryId, folderPath, name, lastSyncStatus ]
);

annotate service.DocumentChunks with @(
  UI.HeaderInfo : {
    TypeName       : 'Chunk',
    TypeNamePlural : 'Chunks',
    Title          : { Value : chunkIndex },
    Description    : { Value : tokenEstimate }
  },
  UI.LineItem : [
    { Value : document_ID, Label : 'Documento' },
    { Value : chunkIndex, Label : 'Índice' },
    { Value : tokenEstimate, Label : 'Estimativa de Tokens' },
    { Value : modifiedAt, Label : 'Atualizado em' }
  ]
);

annotate service.SyncRuns with @(
  UI.HeaderInfo : {
    TypeName       : 'Execução de Sync',
    TypeNamePlural : 'Execuções de Sync',
    Title          : { Value : status },
    Description    : { Value : details }
  },
  UI.LineItem : [
    { Value : repositoryId, Label : 'Repositório' },
    { Value : folderPath, Label : 'Pasta' },
    { Value : totalDocuments, Label : 'Total' },
    { Value : importedDocuments, Label : 'Importados' },
    { Value : skippedDocuments, Label : 'Ignorados' },
    { Value : status, Label : 'Status' },
    { Value : startedAt, Label : 'Início' },
    { Value : finishedAt, Label : 'Fim' }
  ]
);
