# VEILFALL — Revisão 52: balanceamento integrado (candidata experimental)

**Data:** 27 de outubro de 2026. **Base:** R51 Visual (motor R50).

## Escopo e natureza dos resultados

Esta revisão modifica fórmulas conectadas de progressão, com análise conjunta de inimigos,
ouro, experiência, atributos do cavaleiro, equipamentos, heróis passivos, pets,
pergaminhos, habilidades e artefatos. Almas e Runas foram preservadas e consideradas
como possíveis fontes adicionais, mas não foram suficientemente validadas nas
campanhas longas. A árvore de passivas foi preservada e seus investimentos foram
simulados por um bot em testes iniciais.

**Não afirmar que a jornada completa até a fase 24.000 da dificuldade V está
balanceada.** Essa jornada de 120.000 fases não foi reproduzida ponta a ponta.
Esta é uma **versão candidata**, com melhorias iniciais verificadas e testes analíticos
para o endgame ainda sujeitos a revisão baseada na economia realmente conquistada.

## Alterações principais

| Sistema | R51 | Candidata R52 |
|---|---|---|
| HP por fase, fases 1–250 | 4,8% | 4,7% |
| HP por fase, fases 251–2.000 | 5,7% | 3,9% |
| HP por fase, fases 2.001+ | 6,1% | 2,73% |
| Ouro-base por fase | 5,5% | 5,5%; continua entre os mundos |
| Relíquias por fase | 4,5% | 5,2%; continua entre os mundos |
| Crescimento base de EXP | 8% | 8,34%; continua entre os mundos |
| Bônus global de dano de artefatos | 0,06 × Nv^0,65 | 0,095 × Nv^0,72 |
| Inflação de artefatos acima do nível 250 | 0,6% por nível | 0,3% por nível |
| Escala da descoberta de novos artefatos | 1,85^n | 1,73^n |
| Ressonância de artefatos | Inexistente | Multiplicador dependente de total de níveis investidos |
| Físico / Fé / Magia | Físico cresce mais lentamente | Curvas similares de nível efetivo (1,063 por nível), com diferenciação de classe |
| Heróis | Bônus existentes da R49/R50 | Buff passivo base e diferença por posição moderadamente aumentados |
| Pets | 0,10 × Nv^1,07 | 0,115 × Nv^1,075 |
| Pergaminhos | 0,025 por nível e conjunto 0,015 | 0,029 por nível e conjunto 0,021 |
| Equipamentos | Peso de fase ×11 | Peso de fase ×14 e mais drops; graus separados |
| Custo de habilidade ativa | Progressão ×1,48 | Progressão ×1,44 |
| Limite efetivo de nível do cavaleiro | 24.000 | 60.000, condicionado ao avanço nos cinco mundos |
| Vida ao entrar no Mundo seguinte | ×1,5 da última fase | ×100 para preservar desafio da mudança de mundo |

Outras proteções: vida dos guardiões de limiar suavizada. Não foram criadas novas
moedas ou novas rotinas de Armas de Heróis/Clãs/Raids; esses são sistemas de outra expansão.

### A nova Ressonância

Além dos bônus já existentes dos 106 artefatos, cada nível de artefato comprado
contribui para uma Ressonância multiplicativa. Fórmula candidata:

`log10(Ressonância) = 6 × (SomaNiveisArtefatos / 40.000.000)^1,36`

É aplicada somente uma vez ao dano-base Físico, de Fé e Magia. O aumento não
é aplicado novamente ao `mod('damage')`, evitando multiplicação duplicada.
**Ainda precisa de testes de custo-benefício no endgame.**

### Continuidade entre mundos

O estágio exibido volta a 1 depois do Prestígio de Mundo, mas internamente a economia
usa `estagioGlobal = estagio + dificuldade × 24.000`. Isso evita a redução
artificial de ouro, EXP e relíquias diante de inimigos que conservam o escalonamento.
Um chefe da fase final do Mundo anterior é distinto de um monstro comum do novo mundo.
A vida-base do primeiro inimigo no novo mundo é intencionalmente 100× a vida-base do
último monstro comum do anterior, para preservar a dificuldade inicial. O jogador
pode voltar ao Mundo anterior e farmar. Prestígios normais no Mundo II–V preservam
um nível-base compatível com a progressão acumulada; níveis ganhos acima da base
precisam ser reconquistados.

## Simulações com o motor real

Um bot heurístico do mesmo motor JavaScript da campanha realizou compras legítimas
de heróis, habilidades, talentos passivos e equipamentos, realizou prestígios e
investiu relicários, sem injeção gratuita de atributos. Os resultados dependem
do seed e da estratégia de compra, que não é necessariamente ótima.

| Duração simulada | R51: maior fase (seeds) | R52: maior fase (seeds) | Mortes R51 | Mortes R52 |
|---|---|---|---|---|
| 30 min | 84, 89, 90, 84 | 125, 122, 122, 121 | 8, 9, 8, 6 | 0, 1, 0, 0 |
| 1 h | 93, 96 | 177, 178 | 28, 32 | 1, 0 |
| 2 h | Não repetida nesta bateria | 310, 307 | Não comparável | 0, 0 |

Nos testes de 1 h, o bot realizou 1 prestígio em cada versão; nos de 2 h da R52,
realizou 3 prestígios. **O tempo representa a simulação a 1×, não o tempo de CPU
ou uma previsão universal de quanto cada jogador demorará.**

## Verificação do endgame e limites

- **7.200 snapshots sintéticos:** 5 mundos × 12 estágios representativos × 3
  graus hipotéticos de investimento × 5 variações × 8 ablações de sistemas.
  Usaram as fórmulas reais de dano e vida e verificaram a contribuição de
  artefatos, heróis, pets, pergaminhos, equipamento, habilidades e nível.
- **Esses snapshots NÃO são campanhas jogadas:** níveis de investimento foram
  atribuídos artificialmente; não reproduzem a economia de drops e prestígios.
- Existem snapshots com dano muito abaixo e muito acima do PV inimigo nas fases
  avançadas, sobretudo Mundos III–V. Portanto não há evidência para fixar o
  tempo real de conclusão das cinco dificuldades.
- O desafio de ×100 no início de novos mundos ainda precisa de validação com
  inventários e recursos realmente adquiridos, inclusive opção de voltar e farmar.

## Verificação e integridade

- 396/396 testes de invariantes do motor foram aprovados em Node.js.
- Compilação standalone verificada: 6 scripts válidos, 8 PNGs, 3 WAVs.
- Todos os **15 arquivos originais em `assets/`** são idênticos aos da R51,
  comparados byte a byte com SHA-256; os arquivos de visual (`src/visual.js`,
  `src/base.css`, `src/visual.css`, `src/polish.css`) também permaneceram intactos.
- Preservação da estrutura do salvamento: `version:1`, mesma base de dados;
  não houve migração destrutiva intencional.
- Execução visual em navegador / Chromium e Windows físico **não validada**.
  Não confundir testes estáticos com aprovação visual.

## Próximos testes necessários antes de declarar o balanceamento definitivo

1. Campanhas longas com compras, drops e prestígios realmente conquistados,
   sobretudo fases 1.000, 5.000, 10.000 e 24.000 de cada mundo.
2. Estratégias dedicadas de Físico, Fé e Magia, e builds que priorizam ouro e
   sobrevivência.
3. Almas/Runas e conjuntos de pets e pergaminhos realmente obtidos nas chances
   do jogo, com diferenças entre jogador ativo e idle.
4. Validação real da transição de Mundo e do primeiro Prestígio no Mundo II.
5. Performance, interface e compatibilidade de importação/exportação de saves
   em Windows e navegadores reais.

## Arquivos de evidência

`TESTES_REVISAO_52.json`, `TESTES_MOTOR_R52.json`, `balance_matrix_r52.json`,
`simulacao_*.json`, `INTEGRIDADE_ASSETS_R52.json`.

Ferramentas reproduzíveis:

```text
node tools/test-balance-r52.cjs
node tools/audit-balance-r52.cjs
node tools/simulate-balance-r52.cjs . r52 1800 11,13,17,23
node tools/build-standalone.cjs
node tools/check-build.cjs
```

Para jogar no Windows: extraia e execute `ABRIR_JOGO.bat`. Faça backup dos
salvamentos existentes e, caso precise restaurá-los, importe-os no jogo.
