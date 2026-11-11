# VEILFALL — R79: auditoria preliminar do endgame (sem alterações de gameplay)

**Base examinada:** `VEILFALL_R78_DANO_SEM_TETO_WINDOWS.zip` (código de `src/game.js`).  
**Motivo da revisão:** o jogador relatou que o endgame testado foi **fácil**; essa experiência deve prevalecer sobre comparações abstratas de vida inimiga e dano-base do cavaleiro.

## Conclusão prioritária

A comparação isolada entre HP dos monstros e dano físico-base do cavaleiro **não mede a dificuldade real**, pois ignora passivas, habilidades, área, equipamento, efeitos, defesa, heróis, pets, pergaminhos, artefatos e prestígios. Não foi demonstrado que a campanha real esteja difícil. **Não reduzir HP de inimigos ou aumentar recompensas com base apenas nessa comparação.**

## Achados confirmados na R78

1. `startEndgameTrial()` (`src/game.js`, aproximadamente linhas 2583–2620) prepara uma build sintética: todas as passivas no máximo, 32 heróis de nível 8000 e transcendência 120, todos os artefatos no nível máximo, todos os pets em 150, pergaminhos em 125, equipamento mítico e conjuntos preenchidos. Esses valores não representam aquisição natural.
2. Depois de configurar a build, a função recalibra os três tipos de ataque para a vida do inimigo da fase inicial do laboratório: `trialPower={physical:target.div(phy),faith:target.div(holy),magic:target.div(arcane)}`. Portanto, os danos-base são **80% do HP de um inimigo normal** no teste Mundo I/23.999 e **90%** no teste Mundo V/24.000, antes dos bônus de habilidades e contexto. O fator pode tanto aumentar quanto diminuir o dano; não é sempre um buff.
3. No laboratório Mundo V/24.000, `progressWorld()` avança a fase com as mortes de hordas **sem exigir a derrota do chefe da fase**. `stageBossPending()` e `queueStageBoss()` explicitamente contornam os chefes nesse cenário. Assim, o laboratório Mundo V testa principalmente limpeza de hordas e não testa o ciclo completo de obstáculos.
4. O nível do cavaleiro no laboratório começa em 24.000 **inclusive no Mundo V**. A correção de dano do laboratório compensa matematicamente esse ponto; comparações diretas com um cavaleiro alcançando 60.000 não são equivalentes.
5. A própria R78 registra que a simulação longa de campanha não terminou e não foi validado o ritmo de grinding até fase 24.000 e nos cinco mundos.

## Reproduzido no motor de testes incluído no ZIP

Usando o `tools/runtime-r67.cjs` na R78 e entrando nos modos pelo próprio `startEndgameTrial()`:

| Modo de QA | Estágio inicial | Ataque físico-base / HP de inimigo comum | Ataque Fé-base / HP | Ataque Magia-base / HP | Chefes de fase obrigatórios? |
|---|---:|---:|---:|---:|---|
| Mundo I | 23.999 | 0,80 | 0,80 | 0,80 | Sim |
| Mundo V | 24.000 | 0,90 | 0,90 | 0,90 | **Não** |

Esses são **quocientes matemáticos no início do cenário sintético**, não resultados de partidas reais, nem tempo real para limpar uma horda.

## Recomendações para a R79

1. Distinguir oficialmente **QA de efeitos visuais/estresse** de **QA de progressão e dificuldade**. O primeiro pode manter a build irreal, mas deve avisar claramente que não representa o jogo. O segundo deve operar sem `trialPower` e com chefes, utilizando perfis de equipamento/relíquias alcançáveis por fontes de renda reais.
2. Executar campanhas com estratégias diferentes: build física, fé, magia, híbrida; ofensiva máxima versus equilibrada; e ações de prestígio, upgrades e compras simuladas com seus custos verdadeiros.
3. Medir tempo de matar (inimigo comum, elite, chefe e guardião), mortes, tempo entre prestígios, ganho líquido de relíquias, desbloqueios, risco de travamento e fases por ciclo.
4. Testar patamares importantes nos cinco mundos. Só então alterar curvas — conjuntamente, nunca HP inimigo isolado.
5. Caso seja confirmado que o **combate real** está fácil, avaliar bosses, mecânicas de ameaça, sobrevivência e relação entre poder das builds e HP dos inimigos; manter o jogo difícil sem one-shots inevitáveis ou barreiras matematicamente impossíveis.

## O que NÃO foi feito

- Nenhuma alteração no jogo, arte, salvamento, economia ou fórmula de combate.
- Nenhuma alegação de que o endgame real foi balanceado com sucesso.
- Nenhuma classificação definitiva do endgame real como fácil ou difícil, pois ainda falta separar o modo de teste da campanha com progressão natural.
