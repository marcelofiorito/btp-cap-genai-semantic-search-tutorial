### Extensões Avançadas para o Mecanismo de Busca Semântica

A busca semântica pode ser aprimorada das seguintes formas:

#### 1. Testes com Dados Mais Complexos
Atualmente, o modelo de dados CAP está ajustado para testar busca semântica em uma única tabela. Isso pode ser expandido para tabelas mais complexas, garantindo uma experiência mais completa. Considere:

- Testar com datasets maiores e mais complexos.
- Criar e carregar tabelas adicionais com mais relacionamentos.
- Atualizar UI e lógica de busca para consultas mais complexas.
- Adicionar mais documentos em diferentes idiomas.

#### 2. Recursos Avançados de Busca
Aprimore a busca para permitir pesquisa por faixa de páginas ou por número exato de páginas. Use a função `SCORE` do HANA para encontrar a correspondência mais próxima. Exemplo:

```javascript
const parts = attrMapping.map(item => `Score('${item.include}' in ${item.attribute} LINEAR SCALE 1)`);
return `(${parts.join(' + ')}) / ${attrMapping.length}`;
```

Com esses aprimoramentos, a aplicação de busca semântica fica mais versátil e com resultados mais precisos.
