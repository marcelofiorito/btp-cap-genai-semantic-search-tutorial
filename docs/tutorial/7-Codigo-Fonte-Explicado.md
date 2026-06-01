# 7) Código-fonte explicado (arquitetura completa)

Este documento descreve, de ponta a ponta, o código autoral da solução de busca semântica do sample.

## Escopo desta explicação

Para manter o foco no que realmente foi desenvolvido no projeto, esta página cobre:

- Código autoral em `api/`, `ui/`, `router/` e raiz do projeto.
- Artefatos de deploy e segurança.
- Fluxo de execução da busca semântica e do embedding.

Não cobre em detalhe:

- `node_modules/` (dependências de terceiros).
- `api/gen/` e `ui/dist` / `router/dist` (artefatos gerados por build).

## Inventário completo de arquivos autorais

### Raiz

| Arquivo | Papel |
|---|---|
| `package.json` | Orquestra execução local e build/deploy MTAR. |
| `mta.yaml` | Topologia de deploy MTA (AppRouter, CAP srv, DB deployer, recursos). |
| `README.md` | Guia principal e índice do tutorial. |

### Backend (`api/`)

| Arquivo | Papel |
|---|---|
| `api/package.json` | Dependências CAP/AI SDK e scripts de build (`build:cf`). |
| `api/tsconfig.json` | Configuração TypeScript do backend. |
| `api/db/schema.cds` | Modelo de dados com entidade `Documents` e `Vector(1536)`. |
| `api/db/src/.hdiconfig` | Configuração de artefatos de banco para HDI. |
| `api/db/undeploy.json` | Controle de objetos em undeploy do HDI. |
| `api/srv/sample.cds` | Contrato OData (`Documents`, `embed`, `search`). |
| `api/srv/sample.ts` | Lógica principal de embedding, reformulação e busca vetorial. |
| `api/srv/cds-shim.d.ts` | Tipagens auxiliares para compatibilidade TS/CAP. |
| `api/xs-security.json` | Escopos e papéis XSUAA da aplicação. |
| `api/default-env.sample.json` | Exemplo de `VCAP_SERVICES` para execução local. |
| `api/test/requests.sample.http` | Template de requisições para teste manual da API. |
| `api/test/requests.http` | Requisições locais preenchidas; pode conter segredos, usar com cuidado. |

### AppRouter (`router/`)

| Arquivo | Papel |
|---|---|
| `router/package.json` | Dependência e scripts do AppRouter (`start`, `start:local`). |
| `router/xs-app.json` | Rotas produtivas (CF): `/api`, `/user-api`, UI estática. |
| `router/dev/xs-app.json` | Rotas de desenvolvimento local. |
| `router/dev/default-services.sample.json` | Exemplo de binding local da UAA. |
| `router/dev/default-services.json` | Binding local preenchido; pode conter segredos. |
| `router/dev/default-env.json` | Variáveis de ambiente locais de suporte ao router. |

### Front-end (`ui/`)

| Arquivo | Papel |
|---|---|
| `ui/package.json` | Scripts de build, lint, unit/integration/e2e. |
| `ui/tsconfig.json` | Configuração TypeScript da UI. |
| `ui/ui5.yaml` e `ui/ui5-dist.yaml` | Configuração do tooling UI5. |
| `ui/webapp/manifest.json` | Metadados, libs, roteamento e recursos da aplicação UI5. |
| `ui/webapp/Component.ts` | Bootstrap da aplicação e definição de content density. |
| `ui/webapp/controller/BaseController.ts` | Helpers comuns de navegação, models e i18n. |
| `ui/webapp/controller/App.controller.ts` | Inicialização da view raiz e densidade. |
| `ui/webapp/controller/Main.controller.ts` | Fluxo de busca/refinamento/reset/popover. |
| `ui/webapp/view/App.view.xml` | Container raiz de páginas (`sap.m.App`). |
| `ui/webapp/view/Main.view.xml` | Tela principal (busca, resultados e tabela). |
| `ui/webapp/fragment/SqlQuery.fragment.xml` | Popover com SQL retornada da busca. |
| `ui/webapp/model/models.ts` | Model de dispositivo (`Device`). |
| `ui/webapp/model/formatter.ts` | Formatter utilitário da UI. |
| `ui/webapp/css/searchEngine.css` | Estilo local (texto SQL monoespaçado). |
| `ui/webapp/i18n/*` | Textos internacionalizados da interface. |
| `ui/webapp/test/unit/*` | Testes unitários (QUnit). |
| `ui/webapp/test/integration/*` | Testes de integração UI (OPA5). |
| `ui/webapp/test/e2e/*` | Testes E2E (WDIO/wdi5). |

## Visão de arquitetura

### Módulos principais

- `ui` (SAPUI5): tela de busca, refinamento e exibição de resultados.
- `router` (AppRouter): autenticação e roteamento entre UI e API.
- `api` (CAP): OData v4, ações de embedding e busca vetorial.
- `HANA Cloud` (HDI): persistência dos documentos e vetor de embedding.
- `Generative AI Hub`:
  - Embeddings: `text-embedding-3-small`.
  - Orchestration/Chat: `gpt-4o` para reformulação e filtro SQL (idioma/data).

### Fluxo fim a fim

1. Usuário envia busca no front-end.
2. UI chama `POST /api/odata/v4/sample/search`.
3. CAP recebe `snippets`, reformula a query (quando há refinamento), gera embedding da busca e monta SQL vetorial.
4. HANA calcula `COSINE_SIMILARITY` na coluna vetorial `EMBEDDING`.
5. CAP retorna documentos + similaridade + query SQL executada.
6. UI renderiza tabela e permite ver SQL no popover.

## Raiz do projeto

### `package.json`

- Script `watch`: sobe API, AppRouter e UI localmente em paralelo.
- Script `build`: gera MTAR (`mbt build`).
- Script `deploy`: faz deploy do MTAR no Cloud Foundry.

### `mta.yaml`

Define o empacotamento e deploy no BTP:

- Módulo AppRouter: `genai-semantic-search-sample`.
- Módulo CAP srv: `genai-semantic-search-sample-srv`.
- Módulo DB deployer (HDI): `genai-semantic-search-sample-db-deployer`.
- Recursos:
  - `xsuaa` (autenticação).
  - `destination` (destinos).
  - `hana` (`hdi-shared`) para o container HDI.

Também define o encadeamento de build:

- `api`: `npm run build:cf --prefix api`
- `ui`: `npm run build --prefix ui`
- Cópia de `ui/dist` para `router/dist`.

## Backend CAP (`api/`)

### Modelagem de dados

#### `api/db/schema.cds`

Entidade principal: `sample.db.Documents`.

Campos de negócio:

- `text`, `title`, `author`, `date`, `summary`, `category`, `tags`, `language`, `publication`, `rights`, `numberOfPages`.

Campo vetorial:

- `embedding : Vector(1536)` com `@cds.api.ignore`.
- Isso significa:
  - A coluna existe no banco.
  - Não é exposta diretamente no OData público.

Tabela física gerada no HANA:

- `"SAMPLE_DB_DOCUMENTS"`

### Serviço OData e contratos

#### `api/srv/sample.cds`

Define o `SampleService` com:

- `entity Documents as projection on db.Documents`
- `action embed(data : String) returns Boolean`
- `action search(snippets: array of String) returns SearchResponse`

Estruturas auxiliares:

- `DocumentWithSimilarityStructure`: documento + `similarity`.
- `SearchResponse`: `documents`, `reformulatedText`, `sqlQuery`.

Segurança:

- `@requires: 'authenticated-user'`.

### Lógica de negócio principal

#### `api/srv/sample.ts`

Responsável por:

- Registrar handlers das ações `embed` e `search`.
- Chamar Generative AI Hub para embeddings e orquestração LLM.
- Executar SQL no HANA para inserção e busca por similaridade.

#### `onEmbed`: inserção de documento com embedding

1. Recebe JSON serializado no campo `data`.
2. Gera embedding do campo `text`.
3. Executa `INSERT` em `"SAMPLE_DB_DOCUMENTS"` usando `TO_REAL_VECTOR(?)`.

Trecho do SQL de `INSERT` usado no código:

```sql
INSERT INTO "SAMPLE_DB_DOCUMENTS"
("ID", "TEXT", "TITLE", "AUTHOR", "DATE", "SUMMARY", "CATEGORY", "TAGS", "LANGUAGE", "PUBLICATION", "RIGHTS", "NUMBEROFPAGES", "EMBEDDING")
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TO_REAL_VECTOR(?))
```

#### `onSearch`: busca semântica com refinamento

1. Junta `snippets` com `|`.
2. Se houver múltiplos snippets, chama LLM para reformular a consulta final.
3. Gera embedding da query final.
4. Chama LLM para montar `WHERE` de idioma/data (quando aplicável).
5. Executa SQL com `COSINE_SIMILARITY(...)` e `ORDER BY similarity DESC LIMIT 10`.
6. Mapeia resposta para o contrato OData.

Trecho da consulta principal:

```sql
SELECT ID, TEXT, TITLE, AUTHOR, DATE, SUMMARY, CATEGORY, TAGS, LANGUAGE, PUBLICATION, RIGHTS, NUMBEROFPAGES,
COSINE_SIMILARITY(EMBEDDING, TO_REAL_VECTOR('[...]')) as "similarity"
FROM "SAMPLE_DB_DOCUMENTS"
-- WHERE opcional gerado por LLM
ORDER BY "similarity" DESC
LIMIT ?
```

#### Orquestração LLM

- `reformulatePrompt(...)`: consolida múltiplos refinamentos em uma busca final.
- `extractMetadataAndBuildWhereClause(...)`: tenta inferir idioma e datas.
- `processChatPrompt(...)`: centraliza chamada `OrchestrationClient` com `gpt-4o`.

#### Modelo de embedding e resource group

- Embeddings: `text-embedding-3-small`.
- `resourceGroup`: `default` (AI Core).

### Significado das colunas da tabela `SAMPLE_DB_DOCUMENTS`

- `ID`: identificador técnico único (UUID).
- `TEXT`: conteúdo textual principal usado para gerar embedding.
- `TITLE`: título do documento.
- `AUTHOR`: autor do documento.
- `DATE`: data de publicação.
- `SUMMARY`: resumo do conteúdo.
- `CATEGORY`: categoria temática.
- `TAGS`: lista de tags serializada em JSON string.
- `LANGUAGE`: idioma (ex.: `EN`, `PT`, `ES`).
- `PUBLICATION`: nome da publicação/origem.
- `RIGHTS`: informação de direitos/licença.
- `NUMBEROFPAGES`: quantidade de páginas.
- `EMBEDDING`: vetor numérico (1536 dimensões) para similaridade semântica.

### Segurança e ambiente

#### `api/xs-security.json`

- Define app no XSUAA.
- Escopos e role template básicos.
- Redirect URIs para BTP e localhost.

#### `api/default-env.sample.json`

- Exemplo mínimo de `VCAP_SERVICES` local para HANA.

#### `api/test/requests.sample.http`

Roteiro manual para:

- Obter token OAuth2 no XSUAA.
- Chamar `embed`.
- Consultar `Documents`.
- Chamar `search`.

## AppRouter (`router/`)

#### `router/xs-app.json` (deploy no CF)

Rotas:

- `^/api(.*)$` -> destino `api` (backend CAP).
- `^/user-api(.*)` -> `sap-approuter-userapi`.
- `^/(.*)$` -> `./dist` (UI estática buildada).

#### `router/dev/xs-app.json` (execução local)

Rotas locais equivalentes, com UI indo para destino `ui`.

#### `router/dev/default-services.sample.json`

- Exemplo de binding local de `uaa` para rodar AppRouter com autenticação.

## Front-end SAPUI5 (`ui/`)

### Metadados e bootstrap

#### `ui/webapp/manifest.json`

- App ID, i18n, libs (`sap.m`, `sap.ui.core`), CSS global.
- Rota principal `""` para target `main`.

#### `ui/webapp/Component.ts`

- Inicializa modelo de device.
- Inicializa roteamento.
- Define densidade visual (`Compact` ou `Cozy`) conforme dispositivo.

#### `ui/webapp/model/models.ts`

- Cria model de `Device` em modo `OneWay`.

#### `ui/webapp/model/formatter.ts`

- Formatter simples para upper-case (utilitário de UI).

### Camada de controllers

#### `ui/webapp/controller/BaseController.ts`

Classe base com helpers para:

- `getRouter`, `navTo`, `onNavBack`.
- Acesso a models e i18n.

#### `ui/webapp/controller/App.controller.ts`

- Aplica classe de densidade de conteúdo na view raiz.

#### `ui/webapp/controller/Main.controller.ts`

Controller principal da busca:

- Mantém estado (`searchResults`, `isSearching`, `sQuery`, `sReformulationQuery`, `sSqlQuery`).
- `onSearch`:
  - chama `/api/odata/v4/sample/search`;
  - atualiza resultados;
  - mostra query SQL (com embedding mascarado na UI);
  - trata erro e estado de loading.
- `onExtraSearchStringChange`: adiciona refinamento à lista `snippets`.
- `onResetSearch`: limpa estado.
- `onShowPopover`: abre popover com SQL.

### Camada de views/fragments

#### `ui/webapp/view/App.view.xml`

- Container raiz `<App id="app" />`.

#### `ui/webapp/view/Main.view.xml`

Define duas experiências:

- Estado inicial (sem resultados): logo + campo de busca.
- Estado com resultados:
  - barra para refinamento;
  - botão reset;
  - `MessageStrip` com query final;
  - tabela de documentos com similaridade.

#### `ui/webapp/fragment/SqlQuery.fragment.xml`

- `Popover` que exibe a SQL retornada pelo backend.

#### `ui/webapp/css/searchEngine.css`

- Estiliza o texto SQL em fonte monoespaçada.

## Testes e qualidade

### Backend

- `api/test/requests.sample.http`: coleção de chamadas para validação manual de API.

### Front-end

Arquivos de teste em `ui/webapp/test/`:

- `unit`: testes unitários QUnit.
- `integration`: testes OPA5.
- `e2e`: testes WDIO (`sample.test.ts`).

Scripts relevantes em `ui/package.json`:

- `npm run lint`
- `npm run test`
- `npm run wdi5`

## Relação entre código original e artefatos gerados

- Código-fonte editável:
  - `api/srv/*.ts`, `api/srv/*.cds`, `api/db/*.cds`, `ui/webapp/**`, `router/*.json`, `mta.yaml`.
- Gerado automaticamente:
  - `api/gen/**`, `ui/dist/**`, `router/dist/**`.

Sempre que alterar fonte:

1. Rebuild de API/UI.
2. Reempacotar MTAR.
3. Redeploy no CF.

## Resumo técnico

Este sample implementa busca semântica baseada em vetor no HANA (`COSINE_SIMILARITY`) e usa LLM para melhorar intenção de busca (reformulação + filtros de idioma/data).  
O núcleo funcional está em `api/srv/sample.ts`, com UI SAPUI5 em `ui/webapp/controller/Main.controller.ts`, roteada e protegida pelo AppRouter.
