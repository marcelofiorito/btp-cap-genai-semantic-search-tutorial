using DmsGroundingService from '../../srv/dms-grounding-service';

annotate DmsGroundingService.SourceDocuments with @(UI : {
  HeaderInfo : {
    TypeName : 'Documento de Origem',
    TypeNamePlural : 'Documentos de Origem',
    Title : { Value : name },
    Description : { Value : mimeType }
  },
  LineItem : [
    { Value : name, Label : 'Nome' },
    { Value : repositoryId, Label : 'Repositório' },
    { Value : lastSyncStatus, Label : 'Status' }
  ]
});

annotate DmsGroundingService.DocumentChunks with @(UI : {
  HeaderInfo : {
    TypeName : 'Chunk',
    TypeNamePlural : 'Chunks',
    Title : { Value : chunkIndex },
    Description : { Value : tokenEstimate }
  },
  SelectionFields : [document_ID, chunkIndex],
  LineItem : [
    { Value : document_ID, Label : 'Documento' },
    { Value : chunkIndex, Label : 'Índice' },
    { Value : tokenEstimate, Label : 'Estimativa de Tokens' },
    { Value : modifiedAt, Label : 'Atualizado em' }
  ]
});

annotate DmsGroundingService.SyncRuns with @(UI : {
  HeaderInfo : {
    TypeName : 'Execução de Sync',
    TypeNamePlural : 'Execuções de Sync',
    Title : { Value : status },
    Description : { Value : details }
  },
  SelectionFields : [repositoryId, folderPath, status],
  LineItem : [
    { Value : repositoryId, Label : 'Repositório' },
    { Value : folderPath, Label : 'Pasta' },
    { Value : totalDocuments, Label : 'Total' },
    { Value : importedDocuments, Label : 'Importados' },
    { Value : skippedDocuments, Label : 'Ignorados' },
    { Value : status, Label : 'Status' },
    { Value : startedAt, Label : 'Início' },
    { Value : finishedAt, Label : 'Fim' }
  ]
});
