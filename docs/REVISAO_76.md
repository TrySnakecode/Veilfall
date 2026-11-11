# R76 — Primeira calibração de prestígio e sobrevivência (base R75)

## Diagnóstico empiricamente reproduzido

A R75 possui salto de dano entre as fases 55 e 56. A função `enemyContactDamage` aplica `Math.log(1.025)` a todas as fases enquanto `stage<=55`, mas `Math.log(1.035)` a **todas** as fases quando `stage>55`. O contato do chefe na fase 55 passa de 43,82 para 76,61 na 56 (cavaleiro Nv 70, sem reduções), fazendo o jogador atingir cedo o teto de dano relativo ao HP. Esse teto faz um investimento em vida não melhorar a sobrevivência contra ataques limitados a uma fração dos próprios PV.

Com a R75, em uma simulação determinística de duas horas com heróis auto-comprados, equipamentos de maior escore, escolhas automáticas de passivas e prestígio após as mortes, o recorde foi de 72/68 com nove prestígios (sementes 17/47). Isso representa feedback insuficiente no início do prestígio, não uma conclusão estatística sobre o jogo inteiro.

## Solução localizada

### 1) Multiplicador de relíquias de prestígio — apenas início do Mundo I

`earlyPrestigeRelicMultiplier(stage, difficulty)`:

- Mundos II–V: ×1.
- Mundo I, fases >=250: ×1.
- Mundo I, 55<=fase<250: `1 + 6 × ((250 - fase) / 195)^2`.
- O intervalo abaixo de 55 utiliza o mesmo multiplicador da fase 55, mas o prestígio permanece bloqueado até 55.

Na fase 55: ×7; fase 100: ×4,55; fase 150: ×2,58; fase 200: ×1,39; fase 250: ×1.

Esse multiplicador é aplicado à **recompensa de prestígio do cavaleiro**, preservando a expressão exponencial de base, os itens de relíquia e os limites de elegibilidade. Não retroage sobre relíquias antigas nem multiplica baús ou drops.

### 2) Ameaça de contato no Mundo I entre as fases 56–250

A curva passa a partir exatamente do valor da fase 55 e cresce em relação a uma vida de cavaleiro de referência para aquela fase:

`T(stage) = [5,5 × 1,025^54] × [HPbase(floor(5+0,6×stage)) / HPbase(floor(5+0,6×55))] × [1 + 0,5×(stage−55)/195]`

Sobre T são aplicados os multiplicadores existentes de tipo de inimigo, ataque de chefe, defesa e redução de dano, sem alterar cooldown, invulnerabilidade ou animações. Fora desse intervalo, a fórmula da R75 permanece. Na fase 250 ela se aproxima do teto de segurança anterior sem salto abrupto na fase 251.

#### Exemplo de dano de contato de chefe (nível 70, sem bônus)

| Fase | R75 | R76 |
|---|---:|---:|
| 55 | 43,82 | 43,82 |
| 56 | 76,61 | 43,93 |
| 75 | 104,40 | 50,74 |
| 100 | 104,40 | 59,86 |
| 150 | 104,40 | 80,95 |
| 250 | 104,40 | 104,40 |

## Simulações determinísticas

| Agente e duração de combate simulado | Seed | R75: recorde/prestígios/mortes | R76: recorde/prestígios/mortes |
|---|---:|---|---|
| Prestígio após derrota, 2h | 17 | 72 / 9 / 10 | 121 / 4 / 5 |
| Prestígio após derrota, 2h | 47 | 68 / 9 / 9 | 140 / 4 / 4 |
| Sem prestígio, retomando após 20s, 1h | 17 | 87 / 0 / 45 | 116 / 0 / 28 |
| Sem prestígio, retomando após 20s, 1h | 47 | 101 / 0 / 45 | 121 / 0 / 28 |

Esses agentes não conhecem todas as estratégias, equipamentos e combinações de habilidades e **não substituem dados de partidas reais**. `tools/audit-r76.cjs` e `tools/prestige-r76.cjs` permitem repetir a simulação.

## Limites e próximos trabalhos

1. Não há comprovação de alcançabilidade ou ritmo satisfatório até 24.000 em cada um dos cinco mundos. A fórmula de vida inimiga a partir da fase 2.000, o crescimento natural do dano do cavaleiro e o efeito cumulativo de Artefatos precisam de uma avaliação endgame separada; não foram alterados às cegas.
2. As recompensas e os preços de descobrir/aprimorar Artefatos precisam de testes de economia em campanhas reais após esta primeira calibração.
3. Comparar builds Física, Mágica, Fé e híbridas com níveis de passiva obtidos naturalmente, não só em laboratórios maximizados.
4. Validar em Windows físico e entre máquinas diferentes para Clãs/Raids.

## Preservação

Nenhum sprite, PNG, áudio, módulo de Raid, código do servidor, regra de item ou estrutura de save foi alterado. O patch em combate está em `src/game.js`, enquanto `src/r75-ui.js` e `index.html` recebem apenas atualização do número/título da versão. O artefato final `VEILFALL.html` é reconstruído dos módulos originais e atualizados.
