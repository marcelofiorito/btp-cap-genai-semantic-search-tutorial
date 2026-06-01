# DMS Grounding App (POC isolada)

Esta aplicação é uma extensão separada do sample original.

Objetivo: testar grounding com documentos do SAP Document Management Service (DMS) sem impactar a app de similaridade já existente.

## Isolamento em relação à aplicação original

- Tudo fica em `extensions/dms-grounding-app`.
- Não altera `api/`, `ui/`, `router/` e `mta.yaml` da solução original.
- Runtime, modelo e serviço CAP próprios.

## O que esta POC entrega

- Serviço CAP OData: `DmsGroundingService` (`/grounding`).
- App SAP Fiori elements de operação: `app/dms-admin/webapp`.
- CRUD das entidades:
  - `SourceDocuments`
  - `DocumentChunks`
  - `SyncRuns`
- Ações:
  - `syncRepository(repositoryId, folderPath, limit)`
  - `generateChunks(documentID, chunkSize, overlap)`
  - `semanticSearch(query, topK)`
- Integração DMS:
  - Modo real via CMIS Browser (`/browser/...`)
  - Modo mock (default, sem credenciais), para validar fluxo local.
- Extração local de PDF com parser Node (`pdf-parse`) para grounding rápido.

## Arquitetura da POC

1. `syncRepository` lista documentos no DMS (ou mock) e persiste metadados + texto.
2. `generateChunks` quebra o texto em chunks com overlap e gera embedding para cada chunk.
3. `semanticSearch` calcula similaridade cosseno entre query e embeddings dos chunks.

## Pré-requisitos

- Node.js 20+
- npm

## Como rodar

```bash
cd extensions/dms-grounding-app
npm install
cp .env.sample .env
npm run watch
```

A URL padrão do CAP local normalmente fica em:

- `http://localhost:4004`

Serviço:

- `http://localhost:4004/grounding/`

UI Fiori elements:

- `http://localhost:4004/dms-admin/webapp/index.html`
- Atalho para `SyncRuns`: `http://localhost:4004/dms-admin/webapp/index.html#/SyncRuns`
- Atalho para `DocumentChunks`: `http://localhost:4004/dms-admin/webapp/index.html#/DocumentChunks`

## Teste rápido (modo mock)

Com `DMS_BASE_URL` vazio, o app usa documentos mock.

1. Sincronizar repositório mock:

```http
POST http://localhost:4004/grounding/syncRepository
Content-Type: application/json

{
  "repositoryId": "mock-repo",
  "folderPath": "/",
  "limit": 20
}
```

2. Verificar documentos:

```http
GET http://localhost:4004/grounding/SourceDocuments
```

3. Gerar chunks para um documento (substitua `documentID`):

```http
POST http://localhost:4004/grounding/generateChunks
Content-Type: application/json

{
  "documentID": "<UUID>",
  "chunkSize": 900,
  "overlap": 150
}
```

4. Buscar semanticamente:

```http
POST http://localhost:4004/grounding/semanticSearch
Content-Type: application/json

{
  "query": "como configurar destination para dms",
  "topK": 5
}
```

## Operação via Fiori elements

1. Abra a URL da UI.
2. Na tela de `SourceDocuments`, use a ação `Sincronizar Repositório`.
3. Preencha os parâmetros:
   - `repositoryId`
   - `folderPath` (ex.: `/`)
   - `limit` (ex.: `20`)
4. Acompanhe o histórico em `SyncRuns`.
5. Gere chunks via API (`generateChunks`) ou ajuste para acionar por ação de UI em próxima iteração.

## Conexão com DMS real

Preencha `.env` com base na service key do DMS:

- `DMS_BASE_URL`: valor de `uri` (sem barra no final)
- `DMS_REPOSITORY_ID`: ID do repositório CMIS
- autenticação:
  - opção A: `DMS_BEARER_TOKEN`
  - opção B: `DMS_CLIENT_ID`, `DMS_CLIENT_SECRET`, `DMS_TOKEN_URL`

Endpoint usado para leitura de filhos:

- `GET {DMS_BASE_URL}/browser/{repositoryId}/{folderPath}?cmisselector=children&succinct=true`

## Observações importantes

- Nesta POC, extração automática cobre `text/*` e `application/pdf`.
- PDFs sem camada de texto (scan/imagem) continuam exigindo OCR (ex.: Document AI) e usam fallback de metadados.
- Se o endpoint de conteúdo do repositório bloquear download (`403/405`), o sync continua com fallback de metadados.
- Embedding usa modo determinístico local por default; para AI Core:
  - instalar `@sap-ai-sdk/foundation-models`
  - configurar `GROUNDING_USE_AICORE=true`

## Próximos passos sugeridos

1. Conectar DMS real e validar leitura de metadados.
2. Plugar extração de PDF (Document AI ou parser próprio).
3. Trocar vetor em JSON por `Vector(...)` no HANA para busca vetorial nativa.
4. Expor uma UI Fiori Elements (List Report/Object Page) consumindo este OData.
