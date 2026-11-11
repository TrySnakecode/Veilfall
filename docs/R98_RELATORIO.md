# VEILFALL R98 — Perseguição de chefes coerente com o foco de ataque

**Base:** R97 — Inventário sem filtros e limite de áreas. **Escopo:** gameplay de combate automático, sem adição de poder, recompensas ou sistemas de testes na interface.

## Problema confirmado

Em `src/game.js`, a aproximação automática chamava `getClosest(..., Boolean(bossActive && bossActive.bossType === 'stage'))`. Em contrapartida, `src/r67-combat.js` já aplicava a preferência **Priorizar chefes** ao ataque básico e às habilidades em área. Assim, contra chefes de limiar ou marco, o cavaleiro podia ficar se aproximando de monstros comuns apesar da preferência explícita por atacar o chefe. A R97 corrigira uma área extra, mas não a decisão de movimentação.

## Correção

1. `r98PursuitTarget()` devolve o chefe vivo e presente na arena quando **Priorizar chefes** está selecionado. A preferência obrigatória antiga por chefes de fase também é conservada.
2. No modo **Alvo mais próximo**, a aproximação normal continua baseada na distância ao inimigo mais próximo. Na ausência de chefe válido, a IA volta ao alvo comum automaticamente.
3. Para evitar prejudicar a sobrevivência, a avaliação de **ameaça próxima** usada pela esquiva automática é independente do alvo perseguido: um monstro junto ao cavaleiro ainda pode disparar o recuo mesmo quando o chefe escolhido está longe.
4. Movimentação manual continua prevalecendo sobre a IA, inclusive cancelando o recuo conforme a regra antiga.
5. Texto da seção **Prioridade de ataque** esclarece a perseguição e o recuo.

A R98 **não** altera as regras de ataque, o alcance, os cooldowns, o dano, a vida, a IA dos inimigos, as áreas das habilidades nem as quantidades de alvos. Ela apenas harmoniza a **decisão de aproximação** do cavaleiro com o foco escolhido pelo jogador.

## Sistemas preservados

- Inventário **sem filtros de visualização**, com cinco categorias, raridades, favoritos, comparação e venda automática preservados.
- Progressão, prestígio, artefatos, relíquias, heróis, pets, pergaminhos, Únicos, conjuntos, drop, grau, ouro, baús, vila e salvamentos inalterados.
- Nenhum novo campo de save, migração ou mudança do namespace; preferência de foco anterior continua funcionando ao carregar.
- Sprites, 42 arquivos de mídia e todos os arquivos de servidor/rede preservados byte a byte.

## Verificações executadas

- **R98: 11/11 casos novos**: escolha do chefe apesar de monstro próximo, movimento real, modo mais próximo, troca de foco sem reiniciar, preferência obrigatória por guardião de fase, chefe morto/ausente, ausência de chefe, recuo por ameaça próxima, movimento manual, inventário sem filtros e imutabilidade da economia e dos assets.
- **Regressão de jogo R98–R70: 237/237 verificações** aprovadas pela bateria atual.
- **Servidor/clãs/raids: 18/18 testes** aprovados.
- **HTML offline:** `npm run build` e `npm run check`: 22 scripts, 16 imagens PNG e 3 WAV incorporados sem recurso externo na execução.
- **Simulação curta de campanha:** 520 passos de 0,05 s (26 segundos simulados); 17 abates, fase 1→2, nenhuma exceção.
- **Comparação de origem:** dos 309 arquivos herdados do ZIP R97, 297 continuam byte a byte idênticos e 12 receberam alterações limitadas a código, rotulagem, testes e HTML recompilado; nenhum arquivo foi removido. 42/42 mídias idênticas. Novos arquivos: teste R98, relatório R98, manifesto de integridade R98.

## Limitações

Não houve teste visual/manual em um computador Windows físico, tampouco uma campanha completa até o Mundo V. A movimentação tem impacto tático: perseguir deliberadamente o chefe pode expor o cavaleiro a novos riscos, especialmente no fim do jogo; isso não representa um ajuste de força de personagens ou inimigos. Testes automatizados não garantem equilíbrio de todas as especializações.

## Instalação

Exporte o save antes de atualizar. Extraia todo o ZIP e execute `ABRIR_JOGO.bat` ou `VEILFALL.html`. Em **Cavaleiro → Prioridade de ataque**, selecione **Priorizar chefes** para perseguir os chefes ativos, ou **Alvo mais próximo** para manter o comportamento normal de aproximação.
