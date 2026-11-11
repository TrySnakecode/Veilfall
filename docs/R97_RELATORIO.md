# VEILFALL R97 — Inventário simplificado e correção de foco em chefes

**Base:** R96 — Pets, Pergaminhos e Heróis.  
**Escopo:** interface de equipamentos e uma correção de alcance/quantidade de áreas de habilidades; sem mudança de balanceamento de progressão.

## Alterações solicitadas

- Removida a faixa de filtros visuais **Todos / Ganhos sem perdas / Trocas de atributos / Favoritos / Únicos** da aba Equipamentos, incluindo o estado temporário e a ação correspondente. O inventário agora apresenta todos os itens da **categoria** selecionada.
- Permanecem as cinco abas: Arma, Capacete, Peitoral, Aura e Anel; ordenação de raridade descendente, nível e qualidade; paginação em grupos de 35 itens.
- Mantidos: comparação detalhada com a peça equipada, favoritar/desfavoritar, proteção opcional de boas peças, venda manual, venda automática e venda total de não protegidos. Nenhum item é excluído, descartado ou modificado pelo painel.
- Corrigida a função `r67Groups`: quando **Priorizar chefes** já preenche a quantidade máxima de áreas de uma habilidade (especialmente habilidade de **1 área**), o motor não adiciona mais uma área extra. As demais habilidades mantêm sua quantidade de impactos e lógica de alvos, respeitando alcance.

## Testes

- **R97: 6/6** testes novos: grupo único com chefe, três grupos, chefe fora do alcance, inventário e paginação sem filtros, venda/salvamento preservados, presença da correção no código.
- **Regressões de jogo: 226/226** verificações aprovadas; expectativas de testes antigos referentes ao filtro agora rejeitado foram substituídas por testes de inventário sempre visível e não mutável.
- **Servidor, clãs e raids: 18/18** testes aprovados.
- `npm run build` e `npm run check` passaram: 22 scripts, 16 PNG e 3 WAV incorporados no HTML offline.
- Arquivos originais preservados: **291** idênticos, **15** modificados de forma intencional, **0 removidos**. Dos arquivos de mídia em assets, **19/19** idênticos byte a byte à R96. Servidor e shared idênticos.

## Regras preservadas

Sem alterações em probabilidades de drop, inventário salvo, raridades, distribuição de afixos, bônus de Únicos/conjuntos, economia, prestígio, dano/vida dos inimigos, dano-base das habilidades, custos ou relíquias. A correção de área evita um impacto indevido apenas na combinação específica de priorização de chefes.

## Limitações

A versão foi testada em motor Node e verificação de HTML standalone; não foi concluída uma sessão visual manual em Windows físico nem uma campanha completa até o Mundo V. Exporte o save antes de atualizar. O namespace e o formato de save não foram alterados.
