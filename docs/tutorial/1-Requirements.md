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

#### Como criar cada item da configuração mínima

##### 3.1 Criar instância `aicore` com plano `extended`

No SAP BTP Cockpit:

1. Entre na sua subconta.
2. Vá em `Services > Service Marketplace`.
3. Procure por `AI Core` (offering `aicore`).
4. Clique em `Create`.
5. Selecione o plano `extended`.
6. Defina um nome de instância (ex.: `aicore` ou `default_aicore`) e confirme.

Opcional via CLI CF:

```bash
cf create-service aicore extended aicore
```

##### 3.2 Criar Service Key da instância

No SAP BTP Cockpit:

1. Vá em `Services > Instances and Subscriptions`.
2. Abra a instância `aicore`.
3. Em `Service Keys`, clique em `Create`.
4. Dê um nome para a key (ex.: `aicore-key`).
5. Salve e abra a key para copiar os campos de credencial.

Opcional via CLI CF:

```bash
cf create-service-key aicore aicore-key
cf service-key aicore aicore-key
```

Você vai precisar, no mínimo, de:

- `url` (autenticação XSUAA)
- `clientid`
- `clientsecret`
- `serviceurls.AI_API_URL`

##### 3.3 Garantir resource group `default`

No onboarding padrão do AI Core, o resource group `default` já existe.

Validação prática:

- Ao configurar a destination, use o header `AI-Resource-Group: default`.
- Se você usar outro resource group, ajuste também o backend (`resourceGroup`) para o mesmo valor.

##### 3.4 Criar deployments de modelos

No SAP AI Core / Generative AI Hub:

1. Abra o AI Core (ou launchpad de IA da subconta).
2. Selecione o resource group `default`.
3. Crie deployment para cenário de chat:
   - Cenário: `orchestration`
   - Modelo sugerido: `gpt-4o`
4. Crie deployment para embeddings:
   - Cenário de foundation model embedding
   - Modelo sugerido: `text-embedding-3-small`
5. Aguarde status `RUNNING` nos deployments.

Observação importante:

- O sample usa por padrão:
  - chat/orchestration para reformulação e extração de metadados
  - embedding `text-embedding-3-small` para vetorização

Se esse modelo não existir no seu tenant, ajuste o nome do modelo no backend para um deployment disponível.

##### 3.5 Criar destination `GENERATIVE_AI_HUB` com `/v2`

No SAP BTP Cockpit:

1. Vá em `Connectivity > Destinations`.
2. Clique em `New Destination`.
3. Preencha exatamente:

```yaml
Name: GENERATIVE_AI_HUB
Description: SAP AI Core deployed service (generative AI hub)
URL: <AI_API_URL_DA_SERVICE_KEY>/v2
Type: HTTP
Proxy Type: Internet
Authentication: OAuth2ClientCredentials
tokenServiceURL: <url_da_service_key>/oauth/token
clientId: <clientid_da_service_key>
clientSecret: <clientsecret_da_service_key>
```

4. Em `Additional Properties`, adicione:

```yaml
URL.headers.AI-Resource-Group: default
URL.headers.Content-Type: application/json
HTML5.DynamicDestination: true
```

5. Salve e rode `Check Connection`.

#### Dica de consistência

Mantenha os três pontos alinhados:

- deployment no resource group `default`
- header da destination `AI-Resource-Group: default`
- código/backend usando `resourceGroup: "default"`

#### Validação

- Instância `aicore` aparece em `cf services`.
- Service Key criada.
- Deployments de modelo ativos no AI Core.
- Destination `GENERATIVE_AI_HUB` criada e com `Check Connection` bem-sucedido.

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
