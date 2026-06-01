## Validação e Testes

Nesta seção, você cria dados de teste, valida o backend com requisições de API e confirma o comportamento da aplicação pela UI.

### Testar o Backend

Como explicado em [Setup and Deploy](https://github.com/SAP-samples/btp-cap-genai-semantic-search/blob/main/docs/tutorial/2-Setup%20and%20Deploy.md), após configurar os dados de UAA com a Service Key da instância `genai-semantic-search-sample-uaa`, você pode testar o backend enviando requisições. Referência: `api/test/requests.sample.http`.

#### Iniciar a aplicação

Rode na raiz:

```bash
npm run watch
```

#### Instalar REST Client ou usar Postman

Se estiver no VS Code, instale a extensão REST Client. Caso contrário, use Postman.

#### Obter token XSUAA

Para acessar a API com segurança, obtenha um token via POST:

```
### GET XSUAA TOKEN
# @name getXsuaaToken
POST {{xsuaaHostname}}/oauth/token
Accept: application/json
Content-Type: application/x-www-form-urlencoded
Authorization: Basic {{btpXsuaaClient}}:{{btpXsuaaSecret}}

client_id={{btpXsuaaClient}}
&client_secret={{btpXsuaaSecret}}
&grant_type=client_credentials
```

#### Buscar documentos

Com o token, envie a requisição autorizada para validar se o backend está operante:

```
### FETCH DOCUMENTS
# @name fetchDocuments
GET {{btpAppHostname}}/odata/v4/sample/Documents
Authorization: Bearer {{token}}
```

#### Criar dados de teste

Para avaliar busca semântica, popule o banco com dados variados. Cada registro é transformado em embedding vetorial para busca por similaridade.

Use como base o schema de [Data Model](https://github.com/SAP-samples/btp-cap-genai-semantic-search/blob/main/docs/tutorial/3-Data%20Model.md) e envie requisições como a seguir:

```
### CREATE DATA AND CALCULATE EMBEDDINGS FOR THE "TEXT" ATTRIBUTE
# @name embed1
POST {{btpAppHostname}}/odata/v4/sample/embed
content-type: application/json
Authorization: Bearer {{token}}

{
  "data": "{\"text\":\"Artificial Intelligence (AI) has seamlessly integrated into our daily routines, from smart assistants to personalized recommendations. This article explores how AI has transformed everyday life.\", \"title\":\"AI Everyday: The Integration of Artificial Intelligence into Daily Life\", \"author\":\"Megan Lee\", \"date\":\"2018-07-12\", \"summary\":\"An overview of how artificial intelligence has become a fundamental part of our daily routines, improving efficiency and personalization.\", \"category\":\"Technology\", \"tags\":[\"AI\", \"technology\", \"daily life\", \"smart technology\"], \"language\":\"EN\", \"publication\":\"Tech Today\", \"rights\":\"All rights reserved.\"}"
}
```

Repita com conteúdos diferentes para inserir vários documentos. Para um teste melhor, use ao menos 15-20 entradas variadas.

Para confirmar os dados:
- rode `fetchDocuments` novamente; ou
- use o SAP HANA Database Explorer no BTP Cockpit.

Depois, teste a busca:

```
### SEARCH
# @name search
POST {{btpAppHostname}}/odata/v4/sample/search
content-type: application/json
Authorization: Bearer {{token}}

{
  "snippets": ["Looking for tech related documents"]
}
```

Para datasets maiores, você pode usar ferramentas como:
- [Kaggle](https://www.kaggle.com/)
- [Mockaroo](https://www.mockaroo.com/)

### Testar a UI

Após validar o backend e criar dados de teste:

1. Rode `npm run watch` na raiz. A URL `http://localhost:5000/index.html` será aberta.

A aplicação exibirá uma página com barra de busca.

![Initial Page](https://github.com/SAP-samples/btp-cap-genai-semantic-search/blob/main/docs/semantic_search_initial_page.png "Initial Page")

2. Faça uma busca semântica:
- Pesquise tópicos como AI, Health, Science, Technology, Space etc.
- Digite termos/frases na barra de busca.

Exemplos:
- `AI Technology`
- `Health and Wellness`
- `Space Exploration`
- `Science Research`

#### Revisar resultados

- A tabela mostra até 10 documentos.
- O título da tabela mostra a quantidade de resultados.
- Ao lado do título, o tooltip com `?` exibe a query SQL gerada.

![Search Results](https://github.com/SAP-samples/btp-cap-genai-semantic-search/blob/main/docs/search_results_ui.png "Search Results Overview")

3. Refinar a busca:
- Digite informações adicionais na barra.
- Ao executar novamente, o texto pode ser reformulado e exibido em message strip.
- A tabela será atualizada com os novos resultados.

![Message Strip](https://github.com/SAP-samples/btp-cap-genai-semantic-search/blob/main/docs/reformulation_search_msg_strip.png "Reformulated Text")

4. Verificar melhorias da busca:
- Extração de idioma: pesquise em outro idioma (ex.: espanhol) e confira no tooltip `WHERE LANGUAGE='ES'`.
- Extração de data: pesquise algo como “documentos de saúde do ano passado” e valide o intervalo de datas no `WHERE`.

![Sql Query](https://github.com/SAP-samples/btp-cap-genai-semantic-search/blob/main/docs/search_query_overview.png "Search Query Overview")
