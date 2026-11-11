# VEILFALL — R90 | Equipamentos Únicos com identidade real

**Base:** R89 — Conjuntos e Ferraria. **Data:** 04/11/2026. **Escopo:** loot da campanha e apresentação do inventário; não laboratório.

## Problema encontrado na R89

O motor selecionava aleatoriamente um dos 16 nomes Únicos, mas forçava **todos** os itens da raridade Único a ocupar o slot Arma e sorteava seu atributo principal e seus três afixos independentemente da identidade. A Ferraria poderia, portanto, ignorar a escolha de slot caso sorteasse um Único.

## Correções efetivamente implementadas

1. **16 identidades nos cinco slots:** cada entrada do catálogo de Únicos agora declara a categoria. Sem seleção de slot (drop), a identidade sorteada define a categoria. Quando a Ferraria especifica um slot, sorteia apenas identidades compatíveis, sempre respeitando a escolha.
2. **Assinatura útil e visível:** o primeiro dos três afixos normais é reservado à função do Único; não há quarto afixo, rolagem de valor maior nem multiplicador adicional. O valor é sorteado dentro da faixa de um afixo normal do slot e da raridade. Os outros dois são sorteados como antes.
3. **Funções não repetidas:** ajustes temáticos nas assinaturas de Mão do Tesouro Profanado (ouro de Mímicos), Ramo da Maldição Contagiosa (dano em área) e Última Palavra (dano crítico) evitam repetição de finalidade entre as 16 identidades. A Antífona Rúnica ocupa Capacete e reforça a contribuição passiva de heróis de Fé.
4. **Catálogo dentro da interface:** Equipamentos passa a mostrar uma relação dos 16 Únicos, sua categoria e assinatura. A peça recebida identifica a ASSINATURA em um dos três afixos.
5. **Saves antigos preservados:** objetos Únicos gerados até R89 não possuem `uniqueId` e **não** são alterados retroativamente; mantêm slot, nome, qualidade, afixos, valores e favoritos anteriores. Novos Únicos armazenam apenas `uniqueId` e um marcador no afixo de assinatura. Não há nova versão global de save ou migração destrutiva.

## Os 16 Únicos da R90

| Único | Categoria | Assinatura funcional |
|---|---|---|
| Devoradora de Salmos | Aura | Mana |
| Lâmina dos Trinta e Dois Selos | Arma | Dano físico |
| Cântico Sepultado | Anel | Dano de Fé |
| Cinza do Primeiro Rei | Arma | Dano global |
| Presa do Último Eclipse | Arma | Dano contra chefes |
| Tesouro do Abade Caído | Peitoral | Ouro global |
| Fagulha Proibida | Anel | Graça Celestial |
| Voto Rubro | Arma | Ira do Mártir |
| Mão do Tesouro Profanado | Peitoral | Ouro dos Mímicos |
| Oráculo das Pestes | Anel | Maldição do Véu |
| Ramo da Maldição Contagiosa | Anel | Dano em área |
| Juramento dos Trinta e Dois | Anel | LEGION |
| Fenda Entre Instantes | Anel | Golpe da Sombra |
| Lança dos Imortais | Arma | Vida máxima |
| Antífona Rúnica | Capacete | Heróis de Fé |
| Última Palavra | Arma | Dano crítico |

## O que não foi alterado

- **Combate e dificuldade:** fórmulas de HP/dano, inimigos, chefes, evolução, habilidades, prestígio, artefatos, heróis, pets e pergaminhos.
- **Economia:** chances de drop de equipamento, raridade, qualidade, limite de um drop por fase, requisitos de Prestígio de Mundo, quantidade de afixos, preços de venda, custo da Ferraria e chances de itens dos guardiões.
- **Arte e servidor:** nenhum sprite, PNG, áudio WAV, arquivo de rede, sistema de clãs ou raids foi modificado.

**Observação de balanceamento:** reservar afixos modifica a frequência de alguns efeitos nas peças Únicas novas e pode aumentar ou diminuir a utilidade para uma build específica. Não há aumento automático no número ou nos valores dos afixos, mas isso **não é** prova de neutralidade de DPS entre todas as builds. É necessária validação manual para cada especialização no endgame.

## Testes executados

- **R90: 9/9 testes específicos**: 16 identidades/efeitos, assinaturas efetivas, slots da Ferraria, gerações com três afixos, autosell sem proteção extra, legado intocado, save/load, inventário e preservação de regras/arte.
- **Regressão R90–R70: 162/162 testes de jogo** aprovados.
- **Servidor, clãs e raids: 18/18 testes** aprovados.
- **Build offline:** `npm run build` e `npm run check` concluídos; 22 scripts, 16 PNGs e 3 áudios WAV embutidos.
- **Smoke de combate com item Único novo equipado:** 12 segundos simulados, 19 abates, fase 1→3, sem exceção. Esse teste não avalia a dificuldade real do endgame.
- **Comparação de conteúdo da R89:** arquivos visuais, sonoros, de servidor e compartilhados idênticos. Confira `docs/R90_INTEGRIDADE.json`.

## Limitações e uso

Não foi concluída uma sessão manual em Windows físico nesta execução. Não houve validação de endgame longo nem de equilíbrio global das 16 assinaturas.

Extraia o ZIP completo, abra `ABRIR_JOGO.bat` ou `VEILFALL.html`, e consulte o catálogo de Únicos na aba Equipamentos. Faça **EXPORTAR SAVE** antes de atualizar.
