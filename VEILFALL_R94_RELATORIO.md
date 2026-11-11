# VEILFALL R94 — Artefatos e decisões de prestígio

**Base:** R93 — Coleções e Únicos. **Data:** 04/11/2026. **Foco:** mecânicas da campanha; nenhuma ferramenta de laboratório nova.

## 1. Compras justas em UPAR FAVORITOS

**Problema:** nos modos `1×`, `10×`, `100×` e `1.000×`, a R93 comprava todos os níveis solicitados do primeiro artefato favorito antes de passar ao próximo. Com saldo limitado, os favoritos da frente recebiam mais níveis simplesmente por estarem à frente na lista, embora todos fossem explicitamente selecionados pelo jogador.

**R94:** compras por **rodadas**. Cada favorito recebe no máximo um nível por rodada; somente depois os que ainda têm saldo suficiente participam da rodada seguinte. O sistema não compra níveis cujo custo não pode pagar e respeita os caps de nível. Se o saldo já for suficiente para comprar integralmente o lote desejado de todos os favoritos, usa o caminho em lote para evitar trabalho desnecessário.

- Os modos percentuais (`1%`, `5%`, `25%`, `100%`) mantêm a distribuição anterior por orçamento de relíquias, com reaproveitamento de sobras.
- O custo unitário de cada nível não foi alterado; nenhum desconto, aumento de poder ou bônus de prestígio foi criado.
- A escolha de favoritos, seus níveis e seu histórico continuam sendo salvos da mesma maneira.

## 2. Prévia de custos de artefatos no inventário

Cada artefato descoberto (que ainda não atingiu o teto) possui o botão **VER CUSTO**. Clicar nele mostra **no próprio cartão**, sem pagar nem alterar o save:

- modalidade de compra selecionada;
- nível atual e nível que seria alcançado;
- quantidade de níveis viáveis naquele orçamento;
- custo da compra e saldo restante;
- aviso explícito quando não há relíquias suficientes.

A prévia compartilha a função pura `artifactPurchasePlan()` com a compra real `buyArtifactBudget()`. Assim, com estado e modo iguais, a cotação indica o mesmo custo efetivamente cobrado. A prévia só é calculada para o item solicitado, evitando recalcular cotações grandes dos até 106 artefatos a cada renderização do painel.

**Nota sobre lotes enormes:** preservou-se a metodologia preexistente de `artifactLotCost()` para lotes acima de 1.300 níveis (limite superior conservador). Não houve alteração da curva de custos nesta revisão.

## 3. Planejamento do próximo prestígio

A aba **Cavaleiro → Prestígio do Cavaleiro** agora mostra:

- total previsto de relíquias depois de prestigiar (saldo existente + recompensa calculada pelo motor, sem concedê-la antes);
- custo da próxima descoberta de artefato;
- se o saldo projetado será suficiente para a descoberta.

O texto deixa claro que a projeção parte do saldo atual, sem compras intermediárias. Os requisitos e marcos de retorno do prestígio continuam idênticos aos da R93.

## Preservações explícitas

- Nenhuma mudança na vida ou dano dos inimigos, chefes, habilidades, equipamentos, heroísmo, XP, ouro, fadas, pets, pergaminhos, relíquias ganhas, preços dos artefatos, chances de drop, prestígio ou balanceamento das cinco dificuldades.
- Saves anteriores permanecem compatíveis; a seleção de **VER CUSTO** é estado temporário de interface, não um novo campo persistente.
- Nenhum sprite, PNG, WAV, módulo de clãs/raids ou código do servidor foi alterado.

## Testes realizados

- **R94: 9/9** verificações novas de cotação sem mutação, equivalência compra/prévia, teto de níveis, orçamento percentual, rodadas justas, preservação dos saldos, interface e regras de prestígio.
- **Regressões de jogo: 201/201**, incluindo R94 e os testes anteriores selecionados por `npm run test:current`.
- **Servidor/clãs/raids: 18/18** testes por `npm test`.
- `npm run build` e `npm run check` concluídos: HTML standalone com 22 scripts, 16 PNGs e 3 áudios WAV incorporados, sem recursos externos de execução.
- Teste breve de combate com quatro habilidades equipadas, iniciando uma campanha nova, concluído sem exceções.
- Integridade da base R93 conferida: 285 arquivos herdados idênticos, 10 modificados intencionalmente e nenhum removido; **42 arquivos de mídia intactos**. A lista consta em `docs/R94_INTEGRIDADE.json`.

**Limitações:** não foi realizada sessão manual em Windows físico nem uma campanha longa até o Mundo V. Os testes confirmam as correções de fluxo de compra e preservação das regras, não constituem comprovação de balanceamento de endgame.

## Como jogar

1. Exporte seu save na R93 antes de substituir a versão.
2. Extraia o ZIP e abra `ABRIR_JOGO.bat` ou `VEILFALL.html`.
3. Na aba **Artefatos**, selecione `1×`, `10×`, `100×`, `1.000×` ou percentuais, clique **VER CUSTO** em uma peça e examine a prévia **no próprio cartão**.
4. Marque seus favoritos com ★; ao usar **UPAR FAVORITOS** nos modos de níveis, as compras ocorrerão por rodadas.
5. Em **Cavaleiro → Prestígio do Cavaleiro**, confira o saldo previsto e o custo da próxima descoberta antes de renascer.
