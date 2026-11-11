# VEILFALL R69 — Seleção de nós e habilidades fixas

## Escopo
- Base R68 sem alterações na topologia, custos, rank e efeitos dos 210 nós/245 conexões.
- Remoção definitiva de níveis compráveis 1–40 das habilidades ativas; não confundir com ranks 1–20/1–15 das passivas.
- Seleção de nós por pointerup e proximidade em pixels (mínimo de 18px), sem suprimir o clique seguinte a um arrasto.
- Manutenção dos gestos de zoom e pan, com tolerância de movimento de 7px para distinguir clique de arrasto.

## Mudanças de código
- src/r67-ui.js: seleção por pointerup, hit-test no mapa transformado, remoção dos indicadores de nível e botões de evolução.
- src/game.js: removidas funções de compra, handlers, gasto e reserva de ouro, progressão dos níveis de skills e fatores de poder correspondentes.
- O carregamento de saves remove a antiga chave skillLevels; não mexe em passiveNodes, talentPoints, talentSpent ou inventário.
- Modificador base de LEGION fixo no equivalente do antigo NV 1; a árvore e demais sistemas ainda podem fortalecê-la.
- Scripts de simulação e QA atualizados para a ausência de compras de skills.

## Limitações
- As quatro habilidades equipáveis, desbloqueios por nível do cavaleiro e especializações da Constelação permanecem.
- A remoção do escalonamento por níveis comprados altera o dano de builds antigas, por design; precisa de acompanhamento de balanceamento.
- O teste de clique no Chromium usa um ambiente de DOM controlado com os ouvintes de eventos de produção; não substitui QA prolongado da aplicação completa.
- Arquivos de arte e de servidor mantidos byte a byte.

## Validação
- Node testes R68 e R69; QA de qualidade de vida; testes servidor de clã/raid.
- Cliques consecutivos, acerto por proximidade e clique imediato depois de pan em Chromium.
