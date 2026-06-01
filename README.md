# Aplicação CAP: Busca Semântica Integrada ao Generative AI Hub e ao Vector Engine do SAP HANA Cloud
Exemplo básico de mecanismo de busca semântica na SAP Business Technology Platform.

[![REUSE status](https://api.reuse.software/badge/github.com/marcelofiorito/btp-cap-genai-semantic-search-tutorial)](https://api.reuse.software/info/github.com/marcelofiorito/btp-cap-genai-semantic-search-tutorial)

![Diagrama](docs/reference-architecture-semantic-search.svg)

## **Descrição**
Este projeto é um exemplo básico de mecanismo de busca semântica construído na SAP BTP. Ele utiliza o modelo Cloud Application Programming (CAP) e integra o Generative AI Hub com o Vector Engine do SAP HANA Cloud para oferecer recursos de busca escaláveis e poderosos.

**Principais Recursos:**
- Busca semântica com o Vector Engine do SAP HANA Cloud.
- Integração de IA generativa via Generative AI Hub.
- Estrutura modular com backend CAP e frontend SAPUI5.

### **Estrutura do Projeto**
- **`api/`**: contém lógica de backend, modelos de dados, definições de serviço e regras de negócio.
- **`ui/`**: contém componentes de frontend como views, controllers e assets com TypeScript e SAPUI5.

## Primeiros Passos
1. [Pré-requisitos](docs/tutorial/1-Requirements.md)
2. [Setup e Deploy](docs/tutorial/2-Setup%20and%20Deploy.md)
3. [Modelo de Dados](docs/tutorial/3-Data%20Model.md)
4. [Setup da UI](docs/tutorial/4-UI%20Setup.md)
5. [Validação e Testes](docs/tutorial/5-Validation%20and%20Testing.md)
6. [Extensões](docs/tutorial/6-Extend.md)
7. [Log de Execução (Este Deploy)](docs/tutorial/Execution-Log.md)
8. [Guia Detalhado por Etapa](docs/tutorial/Guia-Detalhado.md)
9. [Plano de POC - Grounding com SAP DMS](docs/poc/Plano-POC-Grounding-DMS.md)
10. [Código-fonte Explicado (Arquitetura Completa)](docs/tutorial/7-Codigo-Fonte-Explicado.md)

## Como obter suporte
[Abra uma issue](https://github.com/marcelofiorito/btp-cap-genai-semantic-search-tutorial/issues) neste repositório se encontrar bugs ou tiver dúvidas sobre o conteúdo.
 
Para suporte adicional, [faça uma pergunta na SAP Community](https://answers.sap.com/questions/ask.html).

## Contribuição
Se quiser contribuir com código, correções ou melhorias, envie um pull request. Por motivos legais, os contribuidores deverão aceitar o DCO ao criar o primeiro pull request neste projeto. Isso ocorre de forma automática durante o processo de submissão. A SAP usa [o texto padrão de DCO da Linux Foundation](https://developercertificate.org/).

## Licença
Copyright (c) 2024 SAP SE ou empresa afiliada da SAP. Todos os direitos reservados. Este projeto está licenciado sob a Apache Software License, versão 2.0, exceto quando indicado de outra forma no arquivo [LICENSE](LICENSE).
