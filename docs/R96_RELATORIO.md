# VEILFALL R96 — Afinidades dos Pets, Escrituras e Marcos dos Heróis

**Base:** R95 (versão completa para Windows). **Data:** 04/11/2026. **Escopo:** melhorias na campanha, nas decisões de equipamento de Pets e no acompanhamento da progressão dos 32 Pergaminhos. **Nenhuma alteração nas curvas de força ou dificuldade.**

## Diagnóstico da R95

1. A aba **Pets** mostrava uma porcentagem chamada "efeito quando não selecionado" que correspondia à *fração da contribuição-base*, não à contribuição real do pet no atributo. Ficava difícil saber o que mudava ao trocar o pet de um slot.
2. A aba **Pergaminhos** mostrava o nível mínimo, mas não explicava **quantos pergaminhos** estavam impedindo a próxima evolução do conjunto, nem permitia filtrar esses pergaminhos.
3. A introdução da aba Heróis dizia que a contribuição aumentava **+1% por posição**, mas o código aplica **+2,5% por rank** somente à contribuição pessoal do herói (`HERO_RANK_PASSIVE_STEP=.025`). Esse era um erro de descrição, não de dano.

## Mudanças implementadas

### Pets: contribuição passiva e bônus de afinidade

- Cada pet adquirido passa a exibir a **contribuição passiva bruta** do próprio pet, sua contribuição **se equipado** e o ganho incremental de afinidade ao equipá-lo.
- Quando há outro pet no mesmo slot, informa qual companheiro será substituído, **quanto de afinidade ele perde** e que seu bônus passivo continuará ativo.
- Continua sendo permitida a seleção de apenas **um pet ofensivo e um de suporte**; trocar não custa recurso, não altera níveis nem remove passivos dos não selecionados.
- A prévia informa que suas porcentagens são **contribuições antes dos limites**; o multiplicador total efetivo do personagem continua disponível no próprio cartão. Não são comparações genéricas de DPS entre efeitos diferentes.
- Fórmula antiga foi apenas centralizada numa função pura `petContributionAt(level, selected)`; **nenhum coeficiente foi modificado**.

### Pergaminhos: acompanhar o próximo nível global

- Mostra quantos dos **32 pergaminhos** já estão **acima do menor nível** e quantos continuam exatamente nele.
- Explicita o próximo nível global e **quantos pergaminhos distintos precisam subir pelo menos uma vez** para o conjunto avançar. Isso **não é** uma previsão da quantidade de drops necessários, que continuam aleatórios.
- Adicionado o controle **MOSTRAR APENAS NÍVEL MÍNIMO**, com opção de voltar a exibir todos. Trata-se apenas de filtro visual em memória, **não persistido** no save.
- Cada pergaminho mostra sua **contribuição própria** (antes dos tetos) e o multiplicador total atual do cavaleiro. Mesma fórmula de conjunto e de nível que existia na R95, agora compartilhada com a interface.

### Heróis: descrição de rank corrigida

- Corrigido o texto introdutório de +1% para **+2,5% por rank/posição na contribuição pessoal**, que corresponde ao cálculo real em `heroRankPassiveMultiplier()`. Não altera a ordem, os custos, marcos de poder ou transcendências.

## Integridade, balanceamento e salvamentos

- **Inalterados:** valores de Pet, Pergaminhos e Heróis; recompensas de Vila e baús; custos de nível, marcos e transcendências; dano do cavaleiro; vida, dano e IA dos inimigos; prestígio, artefatos, equipamentos, loot e raridades; mundos, clãs e raids.
- O namespace do save e `version:1` permanecem. O filtro de pergaminhos é temporário, não cria campo de save; visualizações não compram, equipam nem vendem.
- Numa build controlada com o **mesmo `heroOrder`**, os 13 multiplicadores comparados entre R95 e R96 foram **exatamente iguais**: físico, Fé, Magia, Potência dos Equipamentos, defesa, regen de mana, área, velocidade, relíquias, chance de crítico, ouro, dano em chefes e vida.
- O primeiro confronto da comparação pareceu diferente porque campanhas criadas separadamente sorteiam ordens diferentes de heróis; após fixar a **mesma ordem**, todos os atributos coincidiram.
- **Nenhuma edição de sprites, spritesheets, imagens, áudio, servidor ou rede.** Comparação de hashes descrita no `docs/R96_INTEGRIDADE.json`.

## Testes realizados

- **R96 10/10:** equivalência exata das fórmulas anteriores, comportamento de dois pets com mesmo atributo, preservação de slots, cálculo passivo/equipado, painel sem mutação, progresso mínimo de 32 pergaminhos, filtro e reset, roundtrip do mínimo, save intocado, texto correto e assets aprovados.
- **Bateria completa de regressões R96–R70 selecionadas: 220/220 verificações**.
- **Servidor/clãs/raids: 18/18 testes**.
- **Build standalone:** `npm run build` e `npm run check`, com 22 scripts, 16 PNG e 3 WAV embutidos, sem dependências externas em execução.
- **Teste breve do motor:** 20 segundos simulados, fase 1 → 3, 28 abates e nenhuma exceção no ambiente Node.
- **Não realizado:** sessão visual manual no Windows físico e teste prolongado do Mundo V. Esta versão não pretende comprovar equilíbrio global do endgame.

## Como utilizar

1. Exporte o save atual como backup e extraia o ZIP integralmente.
2. Abra `ABRIR_JOGO.bat` ou `VEILFALL.html`.
3. Na aba **Pets**, compare o valor passivo com a afinidade equipada; selecione seu pet ofensivo e de suporte de acordo com a build.
4. Na aba **Pergaminhos**, consulte o próximo nível global e clique em **MOSTRAR APENAS NÍVEL MÍNIMO** para identificar o que falta à coleção.
5. Na aba **Heróis**, consulte a informação de bônus de rank corrigida.
