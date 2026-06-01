# Log de Execução - Etapas do Tutorial (SAP Presales BR - USA)

Este arquivo documenta o que foi efetivamente executado em cada etapa do tutorial neste deploy.

## Etapa 1 - Pré-requisitos

Status: Concluída

Validações realizadas:

- Node.js, npm, git, Cloud Foundry CLI, MBT e CDS CLI disponíveis localmente.
- Target do Cloud Foundry alterado para:
  - Org: `SAP Presales Brazil - BTP_sap-presales-br-usa`
  - Space: `DEV`
- AI Core com plano `extended` disponível e ativo na subconta.
- Serviços SAP HANA (`hdi-shared`) e Destination (`lite`) disponíveis.

## Etapa 2 - Setup e Deploy

Status: Concluída

Execuções:

- `npm install` na raiz e módulos.
- Pipeline de build e deploy:
  - `npm run build`
  - `npm run deploy`
- Recursos/apps MTA atualizados no mesmo ambiente:
  - `genai-semantic-search-sample-DEV`
  - `genai-semantic-search-sample-srv-DEV`
  - `genai-semantic-search-sample-db-deployer-DEV`

Ajustes técnicos aplicados para estabilidade do deploy:

- Engine em `router/package.json` atualizada para `^20.x`.
- Shim TypeScript para compatibilidade CAP:
  - `api/srv/cds-shim.d.ts`
- Ajustes de tipagem em handlers de serviço:
  - `api/srv/sample.ts`

## Etapa 3 - Modelo de Dados

Status: Concluída (conforme sample)

Validações:

- Artefatos HANA gerados no `cds build` e aplicados via DB deployer.
- Tipo `cds.Vector` ativo no target HANA (armazenamento de embeddings).

## Etapa 4 - Setup da UI

Status: Concluída

Execuções:

- Build da UI concluído no `npm run build`.
- Rota do AppRouter publicada e ativa.

URL publicada:

- `https://sap-presales-brazil---btp-sap-presales-br-usa-dev-genai73ca7346.cfapps.us10.hana.ondemand.com/index.html`

## Etapa 5 - Validação e Testes

Status: Concluída

Validações executadas:

- Geração de token XSUAA funcionando.
- Testes de backend com sucesso:
  - `POST /odata/v4/sample/embed` retornou `true`.
  - `POST /odata/v4/sample/search` retornou resultados semânticos com score de similaridade.
  - `GET /odata/v4/sample/Documents` retornou registros persistidos.
- Validação de UI concluída (tela operacional com resultados visíveis).

Bind de runtime importante:

- Serviço `aicore` vinculado explicitamente ao app `genai-semantic-search-sample-srv-DEV`.

## Etapa 6 - Extensões

Status: Não executada por decisão

Motivo:

- A pedido do usuário, nenhuma implementação de extensão foi iniciada.
- Apenas explicação conceitual da etapa 6 foi fornecida.

## Notas de Desenvolvimento Local

- Arquivos locais com credenciais continuam fora do git:
  - `router/dev/default-services.json`
  - `api/test/requests.http`
- Binds do profile híbrido atualizados com:
  - `cds bind -2 genai-semantic-search-sample-uaa`
  - `cds bind -2 genai-semantic-search-sample-destination`
  - `cds bind -2 genai-semantic-search-sample-hdi-container`
  - `cds bind -2 aicore`
