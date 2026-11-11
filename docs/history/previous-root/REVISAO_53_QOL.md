# VEILFALL — Revisão 53: Prestígio e Qualidade de Vida

Baseado na R52, com a identidade visual da R51. Código de jogabilidade alterado somente para as funcionalidades abaixo; assets originais preservados integralmente.

## Prestígio

- **Falha corrigida:** a R52 podia devolver o cavaleiro ao nível 1 em uma fase avançada do Mundo I, mantendo o HP e os custos dos inimigos daquela fase.
- **Novo nível de retorno:** por busca binária, estima o nível cujo custo de EXP para o próximo nível corresponde a aproximadamente quatro inimigos da fase de retorno, com as fórmulas `enemyXP` e `nextXP`, limitado por `knightLevelCap`. Não altera o nível base de fases que não sofreram prestígio.
- **Ouro de retomada:** ao prestigiar, recebe o equivalente a seis inimigos normais da fase para permitir a contratação inicial dos heróis, após a limpeza temporária das compras.
- **Reparo de salvamento legado:** um save da R52 já preso pode recuperar o nível da fase do último prestígio (e reserva de ouro se estava zerado). A migração é marcada e não reaplicada nas próximas leituras.

## Compras automáticas de heróis

- Ativadas por padrão, com controle persistente na aba Heróis e nas Configurações.
- A cada 10 segundos **simulados**, usa no máximo 70% do ouro em compras entre os 32 heróis, pela menor despesa marginal, preservando o preço de ao menos um próximo nível de habilidade desbloqueada.
- Botão separado `UPAR TODOS · 100% DO OURO`, usando a mesma lógica por limiar econômico, mas podendo gastar todo o saldo.
- Compras respeitam o custo geométrico exato, os níveis já pagos e o teto 8.000; não transcendem automaticamente.
- A automação funciona junto ao combate, não apenas no prestígio.

## Habilidades

- `EVOLUIR TODAS AS SKILLS · 100% DO OURO` compra melhorias de habilidade em ordem de custo crescente, para todas as habilidades desbloqueadas, até o nível 40.
- `UPAR MÁXIMO · OURO DISPONÍVEL` compra os níveis viáveis de uma habilidade específica até 40.
- Pontos das árvores de passivas não são alterados.

## Inventário

- `☆ FAVORITAR` em cada equipamento alterna proteção persistida no save.
- `VENDER TODOS NÃO PROTEGIDOS`: exclui sempre equipamentos favoritos e os que estão equipados; pede confirmação e converte os demais em cédulas, como a venda individual.
- Também protege itens favoritos contra venda individual inadvertida. Os filtros existentes de venda automática continuam disponíveis para novos drops.

## Santuário de Feras

| Nível | Intervalo de produção |
|---|---:|
| 1 | 2h |
| 11 (máximo) | 1h |

O intervalo diminui geometricamente entre 1 e 11; nunca cai abaixo de 1h. A rotina offline usa os mesmos intervalos. Os níveis já salvos não são apagados.

## Testes e limites

- 27 verificações de QoL, prestígio, compras, salvamentos, tempo de produção e proteções.
- 396 verificações matemáticas do motor herdado.
- 11 testes visuais e de operação reais no Chromium, sem erros de JavaScript.
- Prestígio de teste da fase 850 para 500 restaurou nível 203 e contratou 20 heróis automaticamente.
- Integridade de hashes dos arquivos de arte e áudio confirmada em relatório separado.

**Não houve nova simulação exaustiva da campanha até a dificuldade V/fase 24.000 nem teste em Windows físico.**
