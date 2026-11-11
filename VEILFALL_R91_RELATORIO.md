# VEILFALL R91 — Juramentos de conjunto com escolhas exclusivas

**Base:** R90, Windows/HTML offline. **Escopo:** sistema de conjuntos dentro da campanha. **Não é uma atualização de laboratório.**

## Problema encontrado

A R90 guardava em `D.sets` os campos `secondary` e `secondary_value`, porém `totalStatSource()` só aplicava o **multiplicador principal** das 16 coleções. Além disso, alguns secundários eram textos sem ID de atributo ou valores brutos que poderiam causar enormes aumentos de ouro/regen se fossem ativados literalmente (por exemplo `gold_boss: 5`, `gold: 8`, `health_regen: 2`). Ativar tudo como bônus adicional facilitaria o endgame e criaria crescimento acumulativo descontrolado.

## Implementação jogável

- Na aba **Conjuntos**, todas as 16 coleções podem oferecer uma especialização alternativa **após serem completadas (5/5 peças registradas)**.
- O jogador pode ativar **no máximo uma** alternativa por vez. Ao fazê-lo, o multiplicador **principal daquela coleção específica é removido**, sendo substituído pelo efeito secundário calibrado. Os bônus principais das demais coleções continuam.
- É possível trocar entre coleções ou **restaurar os bônus principais** a qualquer momento. Não são cobrados materiais, não se perdem peças nem se alteram drops.
- **Padrão da R91:** nenhum juramento alternativo. Todas as coleções continuam funcionando exatamente como na R90 até o usuário escolher uma troca. Saves R90 antigos carregam com o padrão original.
- O estado é salvo em `setFocusId` (campo opcional `null` por padrão); valores inválidos ou coleções incompletas nunca geram bônus. Nenhum outro campo ou formato de save foi alterado.
- O alternativo entra no caminho de atributos já existente: suporte com os mesmos tetos (+10% para origem de equipamento nos suportes especiais), chance de crítico com chance real adicional limitada a 90%, os demais efeitos pelo `mod()` normal. Não há efeitos novos de dano, vida ou economia fora dessa troca.

## Valores calibrados das 16 escolhas (em vez dos secundários legados inválidos)

| Conjunto | Bônus alternativo ao abdicar do principal |
|---|---|
| Juramento Cinéreo | +8% velocidade de ataque (dentro do orçamento de suporte) |
| Coral das Cinzas | +2 pontos percentuais na chance de crítico |
| Liturgia Pálida | +8% duração |
| Sol Desfeito | +8% dano em área |
| Fúria de Sangue | +8% duração |
| Moeda Profanada | +5% relíquias de prestígio (em troca do multiplicador de ouro) |
| Sepultura Cantante | +8% dano em área |
| Praga da Lua | +8% dano em área |
| Corte do Vazio | +8% velocidade de ataque |
| Pacto dos Gêmeos | +10% dano em área |
| Cortesão do Cofre | +5% chance de Mimic (bônus relativo, cap de suporte) |
| Alvorada das Fadas | +5% frequência de fadas |
| Carrasco de Gigantes | +5% ouro de chefes |
| Guardião do Último Sopro | +5% regeneração de vida |
| Magistrado dos Relicários | +5% defesa (substitui o `gear` legado sem efeito) |
| Eclipse Absoluto | +8% ouro global |

**Cuidado de balanceamento:** escolher o alternativo pode ser mais útil que um principal para determinadas builds; é uma opção estratégica, não uma garantia de neutralidade de DPS/economia. O custo é sacrificar o multiplicador principal de uma coleção, e não se acumula mais de um alternativo. A R91 **não** constitui prova de equilíbrio do endgame.

## O que foi preservado

- 16 conjuntos, 16 Únicos, 61 afixos, 9 habilidades, catálogo de itens e todo o sistema de geração da R90.
- Efeitos principais existentes, quando nenhum alternativo é selecionado; preço da Ferraria; chances de drop; salvamento, coleções, prestígios, artefatos, heróis, pets e pergaminhos.
- Curvas de vida e dano dos inimigos, chefes, economia de campanha, transições de mundo, clãs/raids e regras do laboratório.
- Todas as imagens, sons, sprites, arquivos de servidor e compartilhados — idênticos por SHA-256 à R90.

## Testes

- **R91: 12/12** casos específicos, incluindo troca unilateral, apenas uma alternativa, bloqueio em conjuntos incompletos, 16 efeitos funcionais, caps de suporte, chance crítica, combate simulado, save/load e retorno ao padrão.
- **Regressão de jogo: 174/174** verificações R91–R70 selecionadas pelo comando `npm run test:current`.
- **Servidor/clãs/raids: 18/18** testes aprovados.
- `npm run build` / `npm run check` completos: versão offline válida com 22 scripts, 16 PNG e 3 WAV incorporados.
- Verificação de integridade SHA-256 detalhada em `docs/R91_INTEGRIDADE.json`; nenhuma mídia alterada.

**Limitações:** a versão não passou por testes manuais com mouse e teclado em um Windows físico, nem por uma campanha legítima completa até o Mundo V. Testes automatizados não demonstram que os 16 alternativos sejam equivalentes em toda situação.

## Como jogar

1. Exporte um backup do save da R90. Extraia o ZIP e execute `ABRIR_JOGO.bat` ou `VEILFALL.html`.
2. Abra a aba **Conjuntos**, complete uma coleção e clique em **ESCOLHER FOCO SECUNDÁRIO**.
3. Consulte a alteração nos atributos da aba **Cavaleiro** e, se desejar, clique em **RESTAURAR BÔNUS PRINCIPAL**.
4. Trocas não concedem novo item, relíquia, talento ou prestígio.
