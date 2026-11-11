# VEILFALL R93 — Correção dos Únicos e feedback das coleções

**Data:** 04/11/2026. **Base de código:** R92. **Escopo:** melhorias reais na campanha, no cálculo dos equipamentos Únicos e no inventário; não foi criado laboratório novo.

## Problema corrigido na jogabilidade

Na R92, a Aura Única **Devoradora de Salmos** anunciava que seu efeito principal melhorava conforme o progresso dos pergaminhos. A apresentação calculava o bônus por `uniquePrimaryValue(item)`, mas o cálculo do bônus sobre o atributo principal do Anel em `totalStatSource()` ainda usava `aura.value` sem progressão. Isso fazia a Aura parecer evoluir, mas o Anel equipado não recebia toda essa evolução.

A R93 passa a usar `uniquePrimaryValue(aura)` também no cálculo real. O limite anterior de **20% de amplificação** permanece; a Aura amplifica apenas o **atributo principal** do Anel, nunca os afixos secundários, outros bônus de conjunto ou o próprio efeito. Não alteramos os valores brutos ou rolagens salvos de peças existentes. A correção pode ampliar pontualmente o atributo do Anel quando a Aura Única está equipada e tem progresso disponível; não é um rebalanceamento global.

## Clareza das recompensas e coleção

- Ao obter pela **primeira vez** qualquer um dos 16 Únicos, o jogo anuncia o nome e o bônus permanente exato que foi desbloqueado. Duplicatas não repetem a conquista nem acumulam o bônus.
- A descoberta continua registrada se a raridade Único foi configurada para venda automática; vender a peça não remove o bônus de coleção.
- Concluir um conjunto de 5 peças comunica explicitamente que **dois bônus permanentes cumulativos** foram ativados; as fórmulas dos conjuntos permanecem as da R92.
- No catálogo de Únicos, a taxa atual de crescimento do atributo principal é exibida, com o teto máximo de crescimento de 50% sobre o valor-base antes dos limites específicos de cada atributo. O catálogo exibe também a recompensa permanente da descoberta.
- Na aba **Equipamentos**, o filtro visual **ÚNICOS** permite localizar equipamentos de raridade Único dentro de cada categoria, inclusive peças legadas. O filtro não altera o inventário e não vende, equipa nem modifica um item.

## Sistemas preservados

- Dano e vida de inimigos, chefes, habilidades, prestígios, custos, ouro, relíquias, artefatos, pets, heróis, pergaminhos e transições de mundo.
- Chance de drops, raridades, pesos, qualidade e quantidade de afixos; nenhum Único ou conjunto novo.
- Itens Únicos antigos: nenhum reroll, migração de força ou alteração retroativa de afixos. Salvamentos da R92 e anteriores continuam no mesmo namespace e formato.
- Sprites, ícones, PNGs, áudio, servidor, clãs e raids intactos. Conferência byte a byte de todos os arquivos herdados em `docs/R93_INTEGRIDADE.json`.

## Testes realizados

- **R93: 8/8** verificações novas de Aura Única, limite de amplificação, ausência de buff de afixos secundários, descoberta única, duplicatas, venda automática, conclusão de conjunto, legado e filtro visual.
- **Regressão completa selecionada: 192/192** verificações de jogo no `npm run test:current`, incluindo as 8 da R93. Os testes herdados que exigiam o texto do título R92 foram atualizados apenas para R93; não foram desativadas verificações de regras.
- **Servidor: 18/18** verificações com `npm test`.
- **HTML offline:** `npm run build` e `npm run check` passaram; 22 scripts, 16 PNG e 3 WAV incluídos sem tags de recursos externos.
- O arquivo de integridade confirma **zero remoções** e **zero alterações em assets, servidor ou módulos shared**.

## Limitações

A verificação foi automatizada em execução Node e compilação HTML; não foi concluído teste visual manual no Windows físico. O endgame dos cinco mundos e todas as builds ainda não foram validados em sessões humanas longas. A R93 não pretende declarar o balanceamento geral concluído.

## Instalação

1. Exporte o save atual como backup.
2. Extraia o ZIP inteiro em uma pasta no Windows.
3. Abra `ABRIR_JOGO.bat` ou `VEILFALL.html`.
4. Na aba Equipamentos, use o filtro **ÚNICOS**, examine a Devoradora de Salmos e a progressão dos atributos. Na aba Conjuntos, verifique o estado das coleções.
