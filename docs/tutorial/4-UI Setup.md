**Pré-requisitos:**
Garanta que o [Node.js](https://nodejs.org/) (recomendado v21+) esteja instalado.

**Configurar e rodar a UI localmente:**
1. Entre na pasta `ui`.
    ```bash
    cd ui
    ```
2. Instale as dependências (`node_modules`).
    ```bash
    npm install
    ```
3. Volte para a raiz e inicie a aplicação (backend + frontend).
    ```bash
    cd .. && npm run watch
    ```
4. Após iniciar, a URL correta será aberta automaticamente no navegador:
    ```bash
    http://localhost:5000/index.html
    ```
    Essa rota é tratada pelo AppRouter, que autentica e faz proxy para frontend (8080) e backend (4040).
