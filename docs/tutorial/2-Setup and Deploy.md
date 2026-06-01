# **Guia de Setup e Deploy**

### **Clonando o Repositório**
Para começar com este projeto, siga os passos abaixo:

1. Clone este repositório.
   ```bash
   git clone https://github.com/marcelofiorito/btp-cap-genai-semantic-search-tutorial.git
   ```
2. Entre no diretório do projeto.
   ```bash
   cd btp-cap-genai-semantic-search
   ```

### **Preparação para Deploy**

1. [Crie uma instância do SAP AI Core](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/create-service-instance) com plano `extended` para habilitar o Generative AI Hub e depois [crie uma Service Key](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/create-service-key). Ao configurar o SAP AI Core, um resource group padrão chamado `default` é criado automaticamente. Use esse resource group nos próximos passos.

2. [Crie os deployments](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/create-deployment-for-generative-ai-model-in-sap-ai-core):

   - Usando o cenário `orchestration`, escolha um modelo com suporte a Chat Completions, como `gpt-4o` (recomendado).
   - Crie também um deployment para embeddings, como:
      - `text-embedding-3-small` (mais leve)
      - `text-embedding-3-large` (maior qualidade)

   Modelos disponíveis: [SAP Note 3437766](https://me.sap.com/notes/3437766).

3. [Crie uma Destination](https://help.sap.com/docs/btp/sap-business-technology-platform/create-destination) para o Generative AI Hub no SAP BTP Cockpit da subconta, com base na Service Key do SAP AI Core:

   ```yaml
   Name: GENERATIVE_AI_HUB
   Description: SAP AI Core deployed service (generative AI hub)
   URL: <AI-API-OF-AI-CORE-SERVICE-KEY>/v2 # obrigatorio adicionar /v2
   Type: HTTP
   ProxyType: Internet
   Authentication: OAuth2ClientCredentials
   tokenServiceURL: <TOKEN-SERVICE-URL-OF-AI-CORE-SERVICE-KEY>/oauth/token
   clientId: <YOUR-CLIENT-ID-OF-AI-CORE-SERVICE-KEY>
   clientSecret: <YOUR-CLIENT-SECRET-OF-AI-CORE-SERVICE-KEY>
   # Additional Properties:
   URL.headers.AI-Resource-Group: default # ajuste se necessario
   URL.headers.Content-Type: application/json
   HTML5.DynamicDestination: true
   ```

4. [Crie uma instância SAP HANA Cloud](https://help.sap.com/docs/HANA_CLOUD_ALIBABA_CLOUD/683a53aec4fc408783bbb2dd8e47afeb/7d4071a49c204dfc9e542c5e47b53156.html) com Vector Engine (QRC 1/2024 ou superior). Nessa versão o Vector Engine já vem habilitado.

### **Deploy**

> ℹ️ **Nota:**
> Garanta que o suporte a TypeScript esteja habilitado no CAP. Se necessário, rode `npm i -g typescript ts-node`.

1. Rode `npm install` (ou `yarn install`) na pasta `api`.
2. Volte para a raiz e rode `npm run build` (ou `yarn build`) para gerar o MTAR.
3. Faça login na subconta com o Cloud Foundry CLI (`cf login`).
4. Rode `npm run deploy` (ou `yarn deploy`) para publicar na subconta.

Após o deploy, você verá as instâncias abaixo em **Services -> Instances**:

```yaml
genai-semantic-search-sample-uaa
genai-semantic-search-sample-destination
genai-semantic-search-sample-hdi-container
```

### **Desenvolvimento**

> ℹ️ **Nota:**
> Garanta que o suporte a TypeScript esteja habilitado no CAP. Se necessário, rode `npm i -g typescript ts-node`.

1. Entre na pasta `router` e rode `npm install` (ou `yarn install`).
2. Faça login no Cloud Foundry (`cf login`).
3. Faça bind dos serviços para modo híbrido (crie Service Keys se necessário):

```yaml
cd api # execute na pasta api
cds bind -2 genai-semantic-search-sample-uaa
cds bind -2 genai-semantic-search-sample-destination
cds bind -2 genai-semantic-search-sample-hdi-container
cds bind -2 <NOME-DA-SUA-INSTANCIA-AI-CORE>
```

Após os binds, o arquivo `api/.cdsrc-private.json` deve existir com o profile `hybrid`.

4. Duplique `router/dev/default-services.sample.json` para `router/dev/default-services.json` e preencha `url`, `clientid` e `clientsecret` da instância UAA criada.
5. Rode `npm run watch:api` (ou `yarn watch:api`) na raiz para iniciar o backend CAP.
6. Duplique `api/test/requests.sample.http` para `api/test/requests.http` e preencha os dados do UAA via Service Key de `genai-semantic-search-sample-uaa`.

### Notas
* **Cloud Foundry Login**: `cf login -a API_ENDPOINT -o ORG_NAME`
