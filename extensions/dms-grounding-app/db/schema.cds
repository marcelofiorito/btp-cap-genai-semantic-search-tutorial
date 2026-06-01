namespace dms.grounding;

using {
  cuid,
  managed
} from '@sap/cds/common';

entity SourceDocuments : cuid, managed {
  repositoryId       : String(120);
  sourceObjectId     : String(256);
  name               : String(512);
  folderPath         : String(1024);
  mimeType           : String(127);
  contentUrl         : String(2000);
  extractedText      : LargeString;
  lastSyncStatus     : String(30) default 'NEW';
  lastSyncMessage    : String(500);
  externalCreatedAt  : Timestamp;
  externalModifiedAt : Timestamp;
}

entity DocumentChunks : cuid, managed {
  document      : Association to SourceDocuments;
  chunkIndex    : Integer;
  chunkText     : LargeString;
  embeddingJson : LargeString;
  tokenEstimate : Integer;
}

entity SyncRuns : cuid, managed {
  repositoryId      : String(120);
  folderPath        : String(1024);
  totalDocuments    : Integer;
  importedDocuments : Integer;
  skippedDocuments  : Integer;
  status            : String(30);
  details           : LargeString;
  startedAt         : Timestamp;
  finishedAt        : Timestamp;
}
