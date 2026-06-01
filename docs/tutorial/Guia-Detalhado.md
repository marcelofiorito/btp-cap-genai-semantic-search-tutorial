# Guia Detalhado do Tutorial - SAP CAP GenAI Semantic Search

Este guia complementa o tutorial original com explicações mais profundas sobre objetivo, execução, validações e erros comuns em cada etapa.

## Etapa 1 - Pré-requisitos

### Objetivo
Garantir que o ambiente local e a subconta BTP têm todos os componentes necessários para executar a arquitetura completa:

- CAP (backend)
- SAP HANA Cloud com Vector Engine (persistência e busca vetorial)
- SAP AI Core / Generative AI Hub (embeddings e orquestração)
- AppRouter + UI5 (frontend e autenticação)

### O que precisa existir

- Ferramentas locais:
  - `node`, `npm`
  - `@sap/cds-dk` (`cds`)
  - `cf` CLI
  - `mbt`
- Serviços na subconta/space:
  - `aicore` (preferencialmente plano `extended`)
  - `hana` (`hdi-shared`)
  - `destination` (`lite`)
  - `xsuaa` (criado pelo MTA no deploy)

### Validação mínima

- `cf target` aponta para org/space corretos.
- `cf marketplace -e aicore` mostra plano suportado.
- `cf services` lista os serviços esperados.

### Erros comuns

- `aicore` sem capacidade de GenAI/deployments.
- Sem deployment de modelo no resource group usado pela aplicação.
- CLI não autenticada (token CF expirado).

## Etapa 2 - Setup e Deploy

### Objetivo
Publicar a aplicação completa no Cloud Foundry via MTA:

- AppRouter/UI
- Serviço CAP (`srv`)
- DB deployer
- Recursos de serviço (uaa/destination/hdi)

### Fluxo recomendado

1. Instalar dependências.
2. Gerar artefato MTA (`.mtar`) com `npm run build`.
3. Publicar com `npm run deploy`.

### O que acontece no deploy

- O `mta.yaml` define módulos e recursos.
- O CF cria/atualiza serviços gerenciados.
- Apps são staged e iniciadas.
- DB deployer executa tarefas de artefatos HDI.

### Validação mínima

- `cf apps` mostra:
  - `...-DEV` started
  - `...-srv-DEV` started
- Rotas HTTP acessíveis.

### Erros comuns

- Falha de staging por versão Node incompatível com buildpack.
- Operação MTA anterior em andamento (necessita abort/retry).
- Login CF expirado durante operação longa.

## Etapa 3 - Modelo de Dados

### Objetivo
Persistir documentos com metadados e embedding vetorial para busca semântica.

### Entidade principal

`Documents` contém:

- conteúdo textual (`text`, `summary`)
- metadados (`title`, `author`, `date`, `language`, `category`, `tags`)
- campo vetorial `embedding : Vector(1536)`

### Fluxo funcional

1. Requisição `embed` envia texto.
2. Backend gera embedding no AI Core.
3. Embedding é armazenado no HANA.
4. Requisição `search` gera embedding da query e calcula similaridade vetorial no banco.

### Ponto crítico

- Esse sample depende de HANA para `cds.Vector`.
- SQLite local não atende o caso vetorial deste projeto.

### Validação mínima

- Artefatos HDI gerados/aplicados.
- Inserções com embedding executam sem erro.

## Etapa 4 - Setup da UI

### Objetivo
Disponibilizar interface de busca e roteamento seguro para APIs CAP.

### Papel de cada componente

- UI5: renderização da tela e interação.
- AppRouter:
  - autenticação
  - roteamento de frontend e backend
  - mediação de chamadas HTTP

### Comportamento esperado

- Página carrega com campo de busca.
- Ações de busca disparam chamadas para o backend CAP.
- Tabela retorna resultados com score de similaridade.

### Validação mínima

- URL do AppRouter abre (com login quando protegido).
- UI renderiza e responde a buscas.

## Etapa 5 - Validação e Testes

### Objetivo
Comprovar funcionamento ponta a ponta:

- autenticação
- gravação de dados
- geração de embedding
- busca semântica
- visualização na UI

### Ordem recomendada de teste

1. Gerar token XSUAA.
2. `GET Documents` para sanidade de API.
3. `POST embed` para inserir e vetorizar documentos.
4. `POST search` para validar retorno semântico.
5. Testar UI com termos e refinamentos.

### O que observar nos resultados

- `embed` retornando sucesso (`true`).
- `search` retornando:
  - lista de documentos
  - score de similaridade
  - SQL executada (quando exposta)

### Erros comuns e causa raiz

- `500` no `embed/search`:
  - `aicore` não bound no app `srv`.
  - deployment de modelo ausente no resource group `default`.
- `401/redirect`:
  - token ausente ou rota protegida pelo AppRouter.

### Validação mínima

- Resultado semântico aparece no backend e na UI.

## Etapa 6 - Extensões

### Objetivo
Evoluir o sample para cenários de produção, sem quebrar o baseline.

### Eixos de evolução

- Dados mais complexos:
  - mais tabelas
  - relacionamentos
  - multilinguagem
  - maior volume
- Busca avançada:
  - filtros por metadados (ex.: páginas)
  - regras de scoring
  - consultas híbridas (metadado + vetorial)

### Estratégia recomendada

Manter duas linhas:

- `baseline` (original, estável)
- `advanced` (experimentos e melhorias)

Assim você protege o demo funcional e evolui sem risco de regressão no principal.

## Checklist final de operação

- Deploy CF concluído sem falhas.
- AppRouter e `srv` com status `started`.
- Serviço `aicore` bound ao `srv`.
- Deployments de modelos disponíveis no AI Core.
- `embed` e `search` funcionando.
- UI exibindo resultados semânticos.
