### Descrição do Schema

O schema que define a estrutura do modelo de dados desta aplicação está em `schema.cds`. Abaixo estão os atributos da entidade `Documents` com uma breve descrição:

```cds
using {cuid} from '@sap/cds/common';

context sample.db {
    entity Documents : cuid {
        text          : String;            // Texto completo do documento
        title         : String(200);       // Titulo do documento
        author        : String(150);       // Nome do autor
        date          : Date;              // Data de publicacao
        summary       : String(500);       // Resumo do documento
        category      : String(100);       // Categoria do documento
        tags          : array of String;   // Tags para otimizar busca
        language      : String(5);         // Codigo do idioma (ex.: EN, DE)
        publication   : String(100);       // Nome da publicacao
        rights        : String(100);       // Informacoes de direitos de uso
        numberOfPages : Integer;           // Numero total de paginas
        embedding     : Vector(1536);      // Representacao vetorial para processamento avancado
    }
}
```

### Build e Deploy do Modelo de Dados

> ℹ️ **Nota**
> O passo abaixo so e necessario se voce quiser testar com outro dataset ou outro modelo de dados.

Ao atualizar `schema.cds`, rode build e deploy novamente:

```bash
# Na raiz do projeto:
npm run build:deploy

# Para fazer deploy apenas do HDI container (ex.: apos alterar modelo/campos):
cds deploy -2 <nome-da-instancia-hdi-container>:hdi-container-service
```

### Exemplos de Modificacao

- **Adicionar novo atributo:**

  ```cds
  entity Documents : cuid {
      // Atributos existentes...
      version : Integer;  // Novo atributo para versao do documento
  }
  ```

- **Alterar tipo/tamanho de campo:**

  ```cds
  entity Documents : cuid {
      summary : String(1000);  // Alterado de String(500)
  }
  ```

Depois das alteracoes, publique novamente o HDI container para aplicar as mudancas.
