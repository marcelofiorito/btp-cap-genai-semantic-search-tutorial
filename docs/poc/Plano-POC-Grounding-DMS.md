# Plano de POC - Grounding com SAP Document Management Service (DMS)

## 1. Objetivo

Validar, em ambiente controlado, se o SAP DMS pode ser usado como fonte de grounding para casos de busca semântica/RAG, com qualidade e latência aceitáveis para evolução de produto.

## 2. Princípios do POC

1. Não alterar o baseline do sample principal.
2. Trabalhar em branch dedicada (`poc/dms-grounding-plan`).
3. Medir resultado com critérios objetivos (precisão, latência, cobertura).
4. Produzir evidências reproduzíveis (scripts, logs e checklist).

## 3. Escopo

### Dentro do escopo

1. Conectar um repositório DMS com conteúdo não estruturado.
2. Validar ingestão/indexação para grounding.
3. Testar consultas com perguntas reais e medir relevância.
4. Comparar duas estratégias:
   - Estratégia A: grounding gerenciado (AI Core/Document Grounding).
   - Estratégia B: grounding custom via CMIS + pipeline CAP.

### Fora do escopo

1. Hardening de produção (HA, DR, custos finais).
2. Migração completa de todo acervo documental.
3. Treinamento/fine-tuning de modelo.

## 4. Pré-requisitos técnicos

1. Subconta BTP com:
   - AI Core (extended)
   - DMS (service instance)
   - HANA Cloud (opcional para trilha custom)
2. Service Keys com permissões válidas.
3. Repositório DMS com documentos de teste (PDF/DOCX/TXT etc.).
4. Conjunto de perguntas de negócio para avaliação.

## 5. Arquiteturas a validar

## 5.1 Estratégia A - Grounding gerenciado

Fluxo:
1. Onboarding do DMS como fonte de grounding.
2. Configuração de secret/conector no AI Core.
3. Pipeline de indexação.
4. Consulta com grounding habilitado.

Hipótese:
- Menor esforço de engenharia.
- Menor controle fino de chunking/ranking.

## 5.2 Estratégia B - Grounding custom (CMIS + CAP)

Fluxo:
1. Leitura de documentos no DMS via CMIS (`getChildren`, `getContentStream`).
2. Extração e chunking.
3. Embedding por chunk.
4. Persistência vetorial.
5. Retrieval + prompt final.

Hipótese:
- Maior esforço.
- Maior controle funcional (ranking, filtros e governança).

## 6. Dados de teste do POC

Montar um dataset mínimo com:
1. 100 documentos.
2. 3 domínios de negócio (ex.: políticas, contratos, manuais).
3. Múltiplos idiomas (PT/EN opcional ES).
4. Documentos longos e curtos.
5. 20 perguntas “golden set” com resposta esperada.

## 7. Plano de execução (3 sprints curtas)

## Sprint 0 - Preparação (1-2 dias)

1. Confirmar acessos e credenciais.
2. Definir dataset.
3. Definir métricas.
4. Definir formato de evidência.

Entrega:
- Checklist de ambiente pronto.
- Lista de documentos e perguntas.

## Sprint 1 - Grounding gerenciado (2-3 dias)

1. Onboard do DMS para grounding.
2. Executar indexação.
3. Rodar 20 perguntas de teste.
4. Registrar:
   - precisão@k
   - taxa de resposta útil
   - latência média

Entrega:
- Relatório parcial Estratégia A.

## Sprint 2 - Grounding custom (3-4 dias)

1. Implementar leitor CMIS mínimo.
2. Criar pipeline de chunking + embedding.
3. Persistir índice vetorial.
4. Rodar o mesmo conjunto de perguntas.
5. Registrar as mesmas métricas.

Entrega:
- Relatório parcial Estratégia B.

## Sprint 3 - Comparativo e recomendação (1-2 dias)

1. Consolidar resultados.
2. Comparar esforço, custo e qualidade.
3. Decidir trilha recomendada para produto.

Entrega:
- Documento de decisão (go/no-go e próxima fase).

## 8. Métricas e critérios de sucesso

## Métricas

1. Precisão@5 (documentos relevantes entre os 5 primeiros).
2. Taxa de respostas úteis (% de perguntas respondidas com contexto correto).
3. Latência ponta a ponta (P50/P95).
4. Cobertura de fontes (quantos docs foram indexados com sucesso).
5. Esforço técnico (horas por trilha).

## Critérios de sucesso (mínimos)

1. Precisão@5 >= 0.70 no golden set.
2. Latência P95 <= 6s para consulta.
3. Cobertura de indexação >= 95%.
4. Zero bloqueador crítico de segurança/compliance no POC.

## 9. Riscos e mitigação

1. Permissões inconsistentes no DMS.
   - Mitigação: validar service key e escopos antes da indexação.
2. Qualidade baixa por chunking inadequado.
   - Mitigação: testar 2-3 estratégias de chunk size/overlap.
3. Erros com documentos complexos (scan/imagem).
   - Mitigação: separar OCR do escopo base e medir taxa de falha.
4. Custos de inferência acima do esperado.
   - Mitigação: limitar volume e janelas de execução no POC.

## 10. Evidências esperadas

1. Log de indexação (quantidade, falhas, tempo).
2. Tabela de métricas por pergunta.
3. Exemplos de resposta boa e ruim.
4. Relatório comparativo A vs B.
5. Recomendação final.

## 11. Decisão ao final do POC

Decidir entre:
1. Escalar grounding gerenciado.
2. Escalar grounding custom.
3. Híbrido (gerenciado para ingestão + custom para ranking/filtros).

## 12. Próximos passos após aprovação

1. Abrir branch de implementação (separada deste branch de planejamento).
2. Definir backlog técnico por épicos.
3. Planejar segurança, observabilidade e custos para produção.
