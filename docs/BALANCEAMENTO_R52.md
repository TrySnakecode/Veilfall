# VEILFALL R52 — balanceamento reproduzível

Motor 1; SHA-256 `297dd9dbf13e0419ba793f6f7b06baf8d9fe70378d26a685423450d305572da3`. Execute `node tools/simulate-balance.cjs` com Node.js 24+. A execução escreve este relatório e `docs/balance-r52.json`. Não acessa contas nem altera o banco.

## Método e limites

Foram usados os mesmos ticks de 50 ms, 30 segundos por ataque, fórmulas, armaduras, regiões e técnicas do servidor. Cinco trios representam as três famílias e duas combinações. O piloto determinístico usa técnicas em recarga, conjura amplificadores primeiro, posterga Fome do Vazio até 7 s e troca de região destruída a cada 500 ms. Não busca a estratégia ótima entre todos os 84 trios possíveis.

Cada perfil tem nível de Raid e um pacote explícito de técnicas e melhorias. Isso permite comparar força, mas não prova que esse pacote seja financeiramente acessível naquela etapa. Os ataques são sequenciais: a vida compartilhada é a saída real do ataque anterior, sem multiplicar cegamente o dano inicial. Em ataques simultâneos, sobreposição contra uma mesma região pode desperdiçar dano e reduzir a capacidade.

O orçamento conservador é 6 ataques por pessoa em 48 horas (3 por dia UTC). Dependendo da hora de abertura, três datas UTC podem ser alcançadas e permitir até 9; esse benefício não foi necessário para a capacidade publicada. “Horas de capacidade” = ataques ÷ (3 × membros) × 24, uma taxa média equivalente, não tempo mínimo: membros podem atacar em paralelo ou concentrar os três ataques no começo do dia.

## Perfis e custos

| Nível | EXP acumulada | EXP seguinte | Poder | Técnica | Potência / Precisão | Marcas investidas* | Próxima técnica |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 80 | 100 | 1 | 0 / 0 | 0 | 25 |
| 10 | 1.008 | 152 | 159,41 | 3 | 2 / 1 | 336 | 61 |
| 25 | 4.128 | 272 | 317,85 | 5 | 4 / 2 | 1.132 | 145 |
| 50 | 13.328 | 472 | 1.011,34 | 8 | 8 / 4 | 5.976 | 538 |
| 100 | 46.728 | 872 | 8.352,74 | 12 | 12 / 6 | 36.554 | 3.102 |
| 200 | 173.528 | 1.672 | 480.718,23 | 16 | 16 / 8 | 223.254 | 17.903 |

* Investimento em três técnicas do mesmo nível, Potência e Precisão. Nenhum bônus de campanha ou Arma de Herói entra no Poder de Raid.

A curva revisada exige 80 + 8n EXP por avanço (n = nível − 1); o acumulado é quadrático: 80n + 4n(n−1). O Poder cresce 4% por nível e recebe +6% por nível de Potência. Custo de técnica cresce ×1,55 e de melhoria permanente ×1,6. O HP base da raid cresce ×1,052 por nível, com transições de chefe e armadura adicionais nos níveis 11 e 41.

## Correção aplicada após a simulação inicial

A primeira proposta tinha EXP acumulada cúbica e HP ×1,085 por nível. A simulação identificou um horizonte de anos para os níveis altos. A implementação foi então corrigida para a curva de EXP acima e HP ×1,052, preservando Poder, habilidades e recompensas. O comparativo abaixo usa os mesmos pacotes de técnicas e melhorias, muda somente a curva dos chefes e compara a melhor estratégia dentre as cinco.

| Nível | EXP antes → agora | HP antes → agora | Ataques para vencer antes (até 180) | Ataques agora |
|---:|---:|---:|---:|---:|
| 1 | 0 → 0 | 42.000 → 42.000 | 4 | 4 |
| 10 | 3.360 → 1.008 | 87.522 → 66.280 | 4 | 3 |
| 25 | 35.960 → 4.128 | 345.160 → 164.469 | 7 | 4 |
| 50 | 246.960 → 13.328 | 3.019.120 → 664.652 | 16 | 4 |
| 100 | 1.818.960 → 46.728 | 178.388.684 → 8.382.653 | 84 | 4 |
| 200 | 13.937.960 → 173.528 | 622.789.268.283 → 1.333.384.633 | >180 | 9 |

## Capacidade em 48 horas — raid do mesmo nível do jogador

Melhor entre os cinco pilotos testados em cada célula. “Falha” indica que não houve vitória dentro do orçamento; a porcentagem mede vida corporal removida, não armadura. Perfis permanecem fixos durante a raid (sem gastar ganhos entre ataques).

| Jogador / Raid | Clã 1 | Clã 5 | Clã 10 | Clã 20 | Clã 30 |
|---:|---|---|---|---|---|
| 1 | 4 ataques · 32 h | 4 ataques · 6,4 h | 4 ataques · 3,2 h | 4 ataques · 1,6 h | 4 ataques · 1,07 h |
| 10 | 3 ataques · 24 h | 3 ataques · 4,8 h | 3 ataques · 2,4 h | 3 ataques · 1,2 h | 3 ataques · 0,8 h |
| 25 | 4 ataques · 32 h | 4 ataques · 6,4 h | 4 ataques · 3,2 h | 4 ataques · 1,6 h | 4 ataques · 1,07 h |
| 50 | 4 ataques · 32 h | 4 ataques · 6,4 h | 4 ataques · 3,2 h | 4 ataques · 1,6 h | 4 ataques · 1,07 h |
| 100 | 4 ataques · 32 h | 4 ataques · 6,4 h | 4 ataques · 3,2 h | 4 ataques · 1,6 h | 4 ataques · 1,07 h |
| 200 | Falha · 69,32% | 9 ataques · 14,4 h | 9 ataques · 7,2 h | 9 ataques · 3,6 h | 9 ataques · 2,4 h |

## Comparação entre técnicas

Primeiro ataque contra os três arquétipos (raid 1, 15 e 45). Comparação abaixo usa jogador 25 / técnicas 5; como a vida pode acabar durante o ataque, o total de corpo + armadura não é um medidor ilimitado de DPS. Os outros níveis e todos os resultados estão no JSON.

| Trio | Raid 1: total / corpo / armadura | Raid 15: total / corpo / armadura | Raid 45: total / corpo / armadura |
|---|---:|---:|---:|
| Ruptura | 42.000 / 42.000 / 0 | 59.094,64 / 47.682,64 / 11.412 | 60.095,63 / 60.095,63 / 0 |
| Corrupção | 36.971,4 / 36.971,4 / 0 | 43.327,81 / 31.915,81 / 11.412 | 46.361,41 / 46.361,41 / 0 |
| Domínio | 42.000 / 42.000 / 0 | 58.474,51 / 47.062,51 / 11.412 | 59.685,85 / 59.685,85 / 0 |
| Misto contínuo | 42.000 / 42.000 / 0 | 55.133,27 / 43.721,27 / 11.412 | 64.450,33 / 64.450,33 / 0 |
| Misto perfuração | 42.000 / 42.000 / 0 | 58.435,14 / 47.023,14 / 11.412 | 57.186,94 / 57.186,94 / 0 |

Ruptura inclui uma técnica especializada em armadura: seu dano total alto pode representar quebra de placas, não redução de vida. Corrupção depende de manter efeitos e escolher quando consumi-los. Domínio ganha com sincronização e permanência no alvo, mas usar três amplificadores sem uma técnica de dano cria um custo de oportunidade. Esses efeitos são medidos pelo motor; nenhuma família recebe bônus oculto no relatório.

## Armas e conjuntos — Monte Carlo

Foram simuladas 5.000 coleções independentes, sorteio uniforme entre 32 heróis e reposição a cada arma, semente 520032. Não há proteção contra azar nem garantia por tempo. A primeira coleção tem esperança exata de 129,87 armas (32 × soma harmônica até 32).

| Conjuntos | Armas: média | P10 | Mediana | P90 | P95 |
|---:|---:|---:|---:|---:|---:|
| 1 | 129,75 | 88 | 123 | 181 | 205 |
| 2 | 191,49 | 142 | 184 | 250 | 275 |
| 3 | 245,4 | 190 | 237 | 310 | 338 |
| 5 | 343,51 | 280 | 335 | 418 | 451 |
| 10 | 565,6 | 484 | 556 | 659 | 697 |

Vitórias necessárias por volume de recompensa: mediana [P10–P90]. É necessário participar legitimamente de cada vitória; tentativas isoladas ou raids perdidas não concedem armas. A tabela pressupõe sempre a mesma faixa de recompensa e não mede o tempo para desbloqueá-la.

| Conjuntos | 5 armas | 8 armas | 11 armas | 14 armas | 17 armas | 20 armas | 23 armas | 26 armas |
|---:|---|---|---|---|---|---|---|---|
| 1 | 25 [18–37] | 16 [11–23] | 12 [8–17] | 9 [7–13] | 8 [6–11] | 7 [5–10] | 6 [4–8] | 5 [4–7] |
| 2 | 37 [29–50] | 23 [18–32] | 17 [13–23] | 14 [11–18] | 11 [9–15] | 10 [8–13] | 8 [7–11] | 8 [6–10] |
| 3 | 48 [38–62] | 30 [24–39] | 22 [18–29] | 17 [14–23] | 14 [12–19] | 12 [10–16] | 11 [9–14] | 10 [8–12] |
| 5 | 67 [56–84] | 42 [35–53] | 31 [26–38] | 24 [20–30] | 20 [17–25] | 17 [14–21] | 15 [13–19] | 13 [11–17] |
| 10 | 112 [97–132] | 70 [61–83] | 51 [44–60] | 40 [35–48] | 33 [29–39] | 28 [25–33] | 25 [22–29] | 22 [19–26] |

## Impacto estimado na campanha

Nível individual 0 / 1 / 5 / 10 / 20 corresponde a ×1 / ×1,15 / ×1,75 / ×2,5 / ×4 na contribuição daquele herói. O fator global é 2 elevado ao menor nível das 32 armas. Um conjunto não duplica a base do cavaleiro nem equipamentos ou relíquias; multiplica a parcela dos heróis uma vez. Suportes continuam sujeitos aos limites existentes.

| Conjuntos | Global | Armas todas no nível do conjunto | Multiplicador da contribuição | Estágios equivalentes assintóticos* |
|---:|---:|---:|---:|---:|
| 1 | ×2 | 1 | ×2,3 | 14,07 |
| 2 | ×4 | 2 | ×5,2 | 27,84 |
| 3 | ×8 | 3 | ×11,6 | 41,39 |
| 5 | ×32 | 5 | ×56 | 67,98 |
| 10 | ×1.024 | 10 | ×2.560 | 132,54 |

* Estimativa ln(multiplicador)/ln(1,061), supondo que a contribuição ofensiva dos heróis domine o dano. A expressão real por classe é (1 + contribuição antiga × fator)/(1 + contribuição antiga), portanto o ganho real depende dos heróis comprados e tende a ser menor. A curva de inimigos muda em trechos iniciais. Isto não é uma simulação integral da campanha nem comprovação dos prestígios, equipamentos ou 24.000 fases; os testes funcionais da integração são separados.

## Riscos e interpretação

1. Esta versão demonstra progressão cooperativa e limites de integridade. Não comprova retenção ou equilíbrio de vários meses. É necessário observar jogadores reais, abandono, duração por raid, composição dos clãs e distribuição dos conjuntos antes de tratar números como economia de produção.
2. HP por nível cresce mais rápido que Poder por nível. Clãs pequenos precisam repetir raids acessíveis, acumular EXP e investir em técnicas; jogador de nível X não deve presumir que vença raid X. Na matriz, falhas são resultados reais, não removidas para melhorar a apresentação.
3. Com a curva corrigida, o nível 200 requer 173.528 EXP. Uma vitória na raid 76 concede 972 EXP, além de 10 por participação. A conta idealizada de três vitórias diárias nessa mesma faixa produz um piso de cerca de 59 dias para essa EXP; não inclui o tempo para chegar à raid 76, derrotas ou indisponibilidade. Com uma vitória diária, são cerca de 177 dias. É uma ordem de grandeza compatível com meses, mas não é uma simulação cronológica de uma conta completa. O pacote de três técnicas 16 + Potência 16 + Precisão 8 também tem custo próprio (tabela), podendo ser o gargalo.
4. Sem proteção contra azar, faltantes específicos controlam conjuntos e a variância cresce entre jogadores. Os percentis mostram a cauda; a mediana não é promessa individual. Conjuntos são ilimitados e exponenciais, exigindo monitoramento de longo prazo, mesmo com ganhos de fases logarítmicos.
5. Simulações são determinísticas no combate e Monte Carlo com semente no loot. Não substituem teste de latência, concorrência real, FPS, UX, som, acessibilidade ou servidor público. O orçamento de 48 horas não obriga o jogador a esperar o prazo inteiro após uma vitória.
