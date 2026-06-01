using { dms.grounding as db } from '../db/schema';

@requires: 'any'
@path: '/grounding'
service DmsGroundingService {
  entity SourceDocuments as projection on db.SourceDocuments;

  entity DocumentChunks as projection on db.DocumentChunks;

  entity SyncRuns as projection on db.SyncRuns;

  type SyncResult {
    runID             : UUID;
    totalDocuments    : Integer;
    importedDocuments : Integer;
    skippedDocuments  : Integer;
    status            : String;
    message           : String;
  }

  type SearchHit {
    chunkID       : UUID;
    documentID    : UUID;
    documentName  : String;
    score         : Double;
    snippet       : String;
  }

  action syncRepository(repositoryId : String, folderPath : String, limit : Integer) returns SyncResult;
  action generateChunks(documentID : UUID, chunkSize : Integer, overlap : Integer) returns Integer;
  action semanticSearch(query : String, topK : Integer) returns array of SearchHit;
}
