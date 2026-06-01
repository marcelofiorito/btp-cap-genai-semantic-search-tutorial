# Aplicação UI5 com.sap.search.engine

Insira aqui o objetivo deste projeto e informações relevantes.

## Descrição

Esta aplicação demonstra um setup TypeScript para desenvolvimento de aplicações UI5. O ponto central de referência sobre TypeScript com UI5 está em [https://sap.github.io/ui5-typescript](https://sap.github.io/ui5-typescript).

**O template é inspirado no projeto [`SAP-samples/ui5-typescript-helloworld`](https://github.com/SAP-samples/ui5-typescript-helloworld), que também contém [um guia detalhado passo a passo](https://github.com/SAP-samples/ui5-typescript-helloworld/blob/main/step-by-step.md).**

## Requisitos

Use [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/) para gerenciamento de dependências.

## Preparação

Instale dependências com `npm` (ou `yarn`):

```sh
npm install
```

(Se usar yarn, rode apenas `yarn`.)

## Executar a aplicação

Rode o comando abaixo para desenvolvimento em modo watch (o navegador recarrega automaticamente ao detectar mudanças):

```sh
npm start
```

A aplicação ficará disponível em `http://localhost:8080/index.html`.

(Com yarn, use `yarn start`.)

## Debug da aplicação

No navegador, você pode depurar o TypeScript original via sourcemaps (habilite no DevTools se necessário). Se o navegador não abrir automaticamente o arquivo TypeScript ao criar breakpoints, use `Ctrl`/`Cmd` + `P` no Chrome para abrir o arquivo `*.ts` desejado.

## Build da aplicação

### Não otimizado (mais rápido)

```sh
npm run build
```

O resultado vai para `dist`. Para iniciar o pacote gerado:

```sh
npm run start:dist
```

Observação: `index.html` ainda referencia `resources/...` de forma relativa, que é servido dinamicamente pelo UI5 tooling. Para deploy real, ajuste para CDN ou sua distribuição local de UI5.

(Com yarn: `yarn build` e `yarn start:dist`.)

### Otimizado

Para build otimizado e autocontido (mais demorado):

```sh
npm run build:opt
```

Para iniciar:

```sh
npm run start:dist
```

Nesse caso, os recursos UI5 necessários ficam disponíveis em `dist`, permitindo deploy em servidor estático.

(Com yarn: `yarn build:opt` e `yarn start:dist`.)

## Verificar o código

Para validar tipos TypeScript:

```sh
npm run ts-typecheck
```

Para lint:

```sh
npm run lint
```

(Com yarn: `yarn ts-typecheck` e `yarn lint`.)

## Licença

Este projeto está licenciado sob Apache Software License, versão 2.0, exceto quando indicado de outra forma no arquivo [LICENSE](LICENSE).
