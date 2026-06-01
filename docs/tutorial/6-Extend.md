### Extensões Avançadas para o Mecanismo de Busca Semântica

Esta etapa transforma o sample em algo mais próximo de um cenário real de produto.  
O objetivo não é apenas “adicionar campos”, mas evoluir em três eixos:

1. `modelo de dados`
2. `qualidade da busca`
3. `experiência de uso e governança`

## Estratégia recomendada antes de estender

Para não quebrar o baseline:

1. Mantenha este projeto como referência funcional.
2. Crie uma cópia paralela para extensões (ex.: `btp-cap-genai-semantic-search-advanced`).
3. Altere IDs/nomes do `mta.yaml` para evitar colisão de apps/serviços.
4. Faça deploy separado no mesmo space ou em outro space.

Assim você preserva um ambiente estável e outro de experimentação.

## 1) Extensão de modelo de dados (mais realista)

O sample usa uma única entidade principal (`Documents`). Em cenários reais, normalmente há:

- múltiplas fontes de conteúdo
- taxonomias
- relacionamentos
- controle de versão

### Exemplo de evolução do schema

#### a) Separar `Author` e `Category` em entidades próprias

```cds
using { cuid, managed } from '@sap/cds/common';

context sample.db {
  entity Authors : cuid, managed {
    name        : String(150);
    country     : String(3);
  }

  entity Categories : cuid, managed {
    code        : String(30);
    description : String(100);
  }

  entity Documents : cuid, managed {
    text          : String;
    title         : String(200);
    date          : Date;
    summary       : String(500);
    tags          : array of String;
    language      : String(5);
    publication   : String(100);
    rights        : String(100);
    numberOfPages : Integer;
    embedding     : Vector(1536);

    author        : Association to Authors;
    category      : Association to Categories;
  }
}
```

Resultado: melhora consistência dos dados e permite filtros mais robustos por autor/categoria.

#### b) Suporte a versão de documento

```cds
version : Integer;
isLatest : Boolean default true;
```

Resultado: você pode manter histórico e buscar “apenas versão atual”.

## 2) Extensão de ingestão (pipeline de dados)

Hoje o endpoint `embed` recebe um payload simples. Para produção, estenda para:

1. normalização de texto
2. deduplicação
3. validação de metadados obrigatórios
4. fallback de idioma

### Exemplo de regra de deduplicação

- Se já existir documento com mesmo `title + author + date`, atualizar embedding em vez de inserir novo.

Pseudo fluxo:

1. receber payload
2. validar campos mínimos
3. gerar hash textual
4. consultar existência
5. `UPSERT` em vez de `INSERT`

## 3) Extensão da busca semântica (ranking híbrido)

No sample, a ordenação principal é por similaridade vetorial.  
Você pode combinar:

- similaridade vetorial
- score textual por metadados
- regras de recência

### Exemplo de score híbrido

```javascript
const metadataScore = `(Score('AI' in TITLE LINEAR SCALE 1) + Score('AI' in SUMMARY LINEAR SCALE 1)) / 2`;
const vectorScore = `COSINE_SIMILARITY(EMBEDDING, TO_REAL_VECTOR('[${embedding}]'))`;
const recencyBoost = `CASE WHEN DATE >= '2024-01-01' THEN 0.05 ELSE 0 END`;

const finalScore = `(${vectorScore} * 0.75) + (${metadataScore} * 0.20) + (${recencyBoost})`;
```

Uso prático:

- resultados continuam semanticamente relevantes
- documentos mais “contextualmente úteis” sobem no ranking

## 4) Extensão de filtros inteligentes

Além de idioma e data, inclua:

1. faixa de páginas (`numberOfPages`)
2. publicação
3. categoria
4. autor

### Exemplo de interpretação de prompt

Entrada:

`"documentos em português sobre IA com 10 a 50 páginas publicados em 2024"`

Saída esperada para WHERE:

```sql
WHERE LANGUAGE = 'PT'
  AND NUMBEROFPAGES BETWEEN 10 AND 50
  AND DATE >= '2024-01-01'
  AND DATE <= '2024-12-31'
```

## 5) Extensão de UI (Fiori/SAPUI5)

No frontend, você pode evoluir de “caixa única de busca” para uma experiência orientada a exploração:

1. filtros avançados colapsáveis
2. chips de refinamento ativos
3. ordenação por similaridade/recência
4. paginação real de resultados

### Exemplo de melhoria visual

- Adicionar coluna `publication`
- Adicionar filtro `language` com `Select`
- Exibir score com arredondamento (ex.: `0.8234`)

## 6) Extensão de observabilidade e qualidade

Para operação contínua:

1. registrar tempo de embedding por requisição
2. registrar tempo de busca SQL
3. registrar taxa de “zero resultados”
4. criar dataset de regressão semântica

### Exemplo de teste de regressão semântica

Para cada query de controle:

- Query: `AI na saúde`
- Esperado: pelo menos 1 documento da categoria Health
- Threshold de score: `>= 0.45`

Se cair abaixo, marcar regressão.

## 7) Roadmap sugerido (incremental)

### Fase 1 (baixo risco)

1. adicionar filtros por páginas/publicação
2. ajustar UI para exibir novos campos
3. criar 50 documentos de teste

### Fase 2 (médio risco)

1. score híbrido vetorial + textual
2. deduplicação de ingestão
3. testes automáticos de regressão

### Fase 3 (alto impacto)

1. modelo relacional expandido (author/category/version)
2. multi-idioma robusto
3. governança de qualidade e observabilidade

## 8) Critérios de aceite para considerar a extensão “pronta”

1. Build/deploy sem erros no CF.
2. `embed` e `search` funcionando com novos campos/filtros.
3. UI exibindo e filtrando novos atributos.
4. Testes de regressão semântica passando.
5. Sem regressão no fluxo original do sample.
