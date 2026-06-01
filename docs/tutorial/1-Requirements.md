## Pré-requisitos

Esta seção descreve não apenas o que é necessário, mas também como instalar e validar cada item.

### 1) Node.js (recomendado v21+)

Referência oficial: [Node.js](https://nodejs.org/)

#### Instalação

- macOS (Homebrew):
  ```bash
  brew install node
  ```
- Windows/macOS/Linux (instalador oficial):
  - Baixe em [https://nodejs.org/](https://nodejs.org/) e execute o instalador.

#### Validação

```bash
node --version
npm --version
```

### 2) Subconta Cloud Foundry

Referência oficial: [Criar Subconta](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/create-subaccount)

#### O que precisa estar habilitado

- Entitlement para Cloud Foundry Runtime.
- Org e Space criados (por exemplo: `DEV`).

#### Ferramentas locais recomendadas

- Cloud Foundry CLI:
  - Docs: [Install CF CLI](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html)
- CAP CLI:
  ```bash
  npm install -g @sap/cds-dk
  ```
- MBT (Multi-Target Application Build Tool):
  ```bash
  npm install -g mbt
  ```

#### Validação

```bash
cf login -a https://api.cf.<region>.hana.ondemand.com
cf target
```

### 3) Acesso ao Generative AI Hub (SAP AI Core plano `extended`)

Referências oficiais:
- [Criar instância SAP AI Core](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/create-service-instance)
- [Criar Service Key](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/create-service-key)
- [Criar deployment de modelo](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/create-deployment-for-generative-ai-model-in-sap-ai-core)

#### Configuração mínima

1. Criar instância `aicore` com plano `extended`.
2. Criar Service Key da instância.
3. Garantir resource group `default`.
4. Criar deployments de modelos:
   - Orchestration/Chat (ex.: `gpt-4o`)
   - Embeddings (ex.: `text-embedding-3-small`)
5. Criar destination `GENERATIVE_AI_HUB` com URL da Service Key + sufixo `/v2`.

#### Validação

- Instância `aicore` aparece em `cf services`.
- Service Key criada.
- Deployments de modelo ativos no AI Core.

### 4) Acesso ao SAP HANA Cloud Vector Engine (QRC 1/2024+)

Referência oficial: [SAP HANA Cloud](https://help.sap.com/docs/HANA_CLOUD_ALIBABA_CLOUD/683a53aec4fc408783bbb2dd8e47afeb/7d4071a49c204dfc9e542c5e47b53156.html)

#### Configuração mínima

1. Criar instância SAP HANA Cloud.
2. Criar container HDI (`hdi-shared`) no space alvo.
3. Confirmar que a versão suporta Vector Engine (QRC 1/2024 ou superior).

> No QRC 1/2024+, o Vector Engine já vem habilitado por padrão.

#### Validação

- Serviço HANA e HDI aparecem em `cf services`.
- O deploy CAP cria/aplica os artefatos da entidade com `Vector(1536)` sem erro.
