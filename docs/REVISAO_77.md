# VEILFALL R77 — Dificuldade restaurada sem salto de dano

Base exata: **R76**. Nenhum asset foi substituído, alterado, recortado ou regenerado.

## Ajustes aprovados
- O multiplicador **extra** de relíquias da R76 foi reduzido de **7× para 1,75× na fase 55**, diminuindo suavemente até 1× na fase 250. O bônus não afeta os mundos II–V, itens, baús, preços, nem a fórmula base de relíquias.
- Nas fases **56–249 do Mundo I**, o dano de contato recebeu pressão adicional progressiva. O salto indevido da fase 55 para 56 continua corrigido (43,82 → ~44,87 no cenário de teste). A faixa 125–250 chega ao teto de dano relativo no cenário de referência — não foi alterado o teto de dano, defesa ou redução.
- Não houve buffs gratuitos, mudanças no HP dos inimigos, XP, ouro, curva de custos dos artefatos, skills, HUD, save, servidores e Raids.

## Objetivo
VEILFALL deve exigir farm, prestígios recorrentes, melhora dos artefatos e escolhas de build. Isso **não garante** dificuldade perfeita: o resto do jogo e o endgame ainda precisam de campanhas longas, jogadores e mais sementes de teste.

## Como jogar
Extraia tudo; use `ABRIR_JOGO.bat` no Windows ou abra `VEILFALL.html`. Para serviços online de Clãs/Raids, execute o servidor incluído e configure a conexão.

## Dados salvos
O formato de save não foi alterado. Faça **Exportar Save** antes de trocar versões; importe se o navegador não localizar o progresso ao jogar a partir de outra pasta.

## Repetição dos testes
`npm run test:current` para regras; `npm test` para serviços; `npm run build && npm run check` para geração e validação offline; `python tools/smoke-r77-browser.py` para smoke se Playwright/Chromium estiverem instalados.

**Importante:** `tests/r76-core.cjs` permanece como referência histórica da fórmula R76 e, por isso, não faz parte dos testes correntes. A revisão R77 usa `tests/r77-core.cjs`. O script `tools/prestige-r76.cjs` pode ser usado para comparações de campanha, apesar do nome original.

## Escopo de validação
A campanha automatizada original utiliza um agente simplificado que não conhece todas as estratégias do jogo. Não interpretar suas fases recordistas como prova de balanceamento universal.

## Simulação comparativa, mesma semente 17

| Tempo de combate simulado | R76: fase máxima / prestígios / mortes | R77: fase máxima / prestígios / mortes |
|---|---|---|
| 60 minutos | 114 / 2 / 3 | 77 / 3 / 4 |
| 120 minutos | 121 / 4 / 5 | 93 / 6 / 7 |

Comparação direta executada com `tools/prestige-r76.cjs`, equipado com auto-heróis, troca automática simplificada de equipamentos e passivas e prestígio após morte (quando elegível). O nome histórico do script permanece; ele lê o código de cada revisão em que é executado. Não é uma avaliação com jogadores nem endgame.

## Dano de contato — chefe de referência, sem reduções, nível 70

| Fase | R76 | R77 |
|---:|---:|---:|
| 55 | 43,82 | 43,82 |
| 56 | 43,93 | 44,87 |
| 75 | 50,74 | 68,34 |
| 100 | 59,86 | 94,18 |
| 150 | 80,95 | 104,40 (teto) |
| 250 | 104,40 | 104,40 |

## Testes realizados

- Nove testes de R77 para economia de prestígio, limites de dificuldade, mundo I–V, progressão de HP/ouro/XP, artefatos, preservação de arte e funcionalidade inicial.
- Quarenta testes de regressão das revisões anteriores (R72, R71 e R70).
- Dezoito testes de servidor/clãs/raid.
- Build offline com 21 scripts, 16 PNG e 3 WAV incorporados; Chromium abre o jogo e inicia a campanha sem erro de página.
- Manifesto SHA-256 da R76 em `tests/fixtures/r76-reference.json`, independente de possuir a R76 instalada.

## Áreas que continuam exigindo validação

A progressão física, mágica, fé e híbrida precisa de campanhas humanas e de benchmarks comparáveis. Não foi validada a progressão de 120 mil fases (24 mil por mundo).
