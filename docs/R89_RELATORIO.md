# VEILFALL R89 — Conjuntos e Ferraria com escolha de equipamento

**Base:** R88 — Loot e Afixos.  
**Foco:** melhorias do JOGO, não do laboratório.  
**Data:** 04/11/2026.

## Melhorias implementadas na campanha

### 1. Forja direcionada após concluir um conjunto

- Antes, concluir as cinco peças transformava o botão em **FORJAR MELHORIA**, embora o item seguinte fosse de slot aleatório e **não houvesse garantia de melhoria**. O jogador podia gastar materiais em um tipo que não precisava.
- Agora, ao concluir um conjunto, a Ferraria exibe **ESCOLHER PEÇA PARA FORJAR**. É possível selecionar **Arma, Capacete, Peitoral, Aura ou Anel**, usando os mesmos materiais e as mesmas fórmulas de item da R88.
- **O preço continua `1 + quantidade de tipos já registrados`**: uma coleção completa custa 6 materiais por nova peça. Os sorteios de raridade, qualidade, afixos e valores são os anteriores; nenhum bônus ou drop foi adicionado.
- Enquanto o conjunto não estiver completo, a Ferraria continua produzindo **a primeira peça que falta**, com custo normal de 1 a 5 materiais. Tentar forjar um slot arbitrário antes da conclusão é rejeitado sem cobrar recursos.
- Os **filtros de venda automática continuam ativos**. Se o jogador configurou venda da raridade obtida, a peça forjada pode ser vendida. A interface informa isso para evitar surpresa.

### 2. Conjuntos mostram informações que existem de verdade

- A aba **Conjuntos** informa quais peças estão registradas, quais ainda faltam, qual é o multiplicador **principal efetivamente aplicado** e se o bônus está ativo.
- O sistema de progressão mantém os bônus principais como **permanentes após completar a coleção**, mesmo quando as peças não estiverem equipadas.
- O catálogo de dados (`src/data.js`) contém propriedades `secondary` e `secondary_value`, mas elas **não entram em `totalStatSource()`**. Antes a UI usava o texto `Complemento: ...` como se fosse uma recompensa funcional. A R89 remove a afirmação enganosa. **Não ativamos esses efeitos nesta revisão**, porque isso adicionaria poder, criaria dependências em vários sistemas e poderia facilitar o endgame sem revisão global de balanceamento.

### 3. Legibilidade de recompensas raras

- No inventário, itens associados a conjunto indicam **a qual coleção pertencem** e quantos tipos já foram registrados.
- Itens **Únicos** têm informação explícita de raridade; o nome não concede automaticamente outros atributos além das propriedades reais sorteadas. Essa informação também aparece quando o item único pertence a um conjunto.
- Equipamentos épicos/lendários/míticos **sem conjunto** utilizam nomes adequados ao slot em vez de todos serem chamados de “Lâmina do Crepúsculo Capacete/Peitoral/Aura/Anel”. A alteração é apenas textual; preserva os nomes dos itens já existentes em saves.

## Sistemas preservados

- Nenhuma modificação em vida/dano de monstros, inteligência de combate, cooldowns, habilidades, builds, prestígios, relíquias, artefatos, heróis, pets, pergaminhos, economia, drops, raridades, pesos, qualidade e valores dos equipamentos.
- Todas as 16 coleções mantêm seus multiplicadores principais, slots e regras de ativação.
- Nenhuma alteração em chances de drops de equipamentos lendários, míticos e únicos; suas propriedades permanecem roladas pela lógica existente.
- Nenhum novo campo de salvamento nem migração destrutiva.
- Nenhuma edição de sprites, imagens, áudio, servidor, clãs, raids ou assets visuais.

## Validações

- **11/11 testes novos R89**, incluindo conclusão de coleção, escolha dos cinco slots, cobrança adequada, falta de recursos, impossibilidade de burlar o requisito, venda automática, nomenclatura, item único + conjunto, save/load e preservação de parâmetros e assets.
- **153/153 testes de jogo** ao executar a bateria completa R89–R70 selecionada por `npm run test:current`.
- **18/18 testes de servidor/clãs/raids** por `npm test`.
- HTML offline recompilado com `npm run build` e conferido por `npm run check`: **22 scripts, 16 PNGs e 3 WAVs**.
- Comparação SHA-256 contra a R88 antes de acrescentar esta documentação: **267 arquivos herdados inalterados**, 10 arquivos alterados de modo intencional (código, títulos, pacote, asserts de versão e HTML recompilado), **zero arquivos removidos**, um teste novo. Nenhum asset nem arquivo de rede foi alterado.

### Limitações

Esta revisão não reequilibra os sistemas de conjuntos nem valida o endgame dos cinco mundos. A ferramenta de testes verificou a lógica e o comportamento dos comandos; não foi concluída uma validação visual em Windows físico neste ambiente. Uma sessão real com controle de navegação e save antigo ainda é recomendada.

## Como jogar

1. Exporte uma cópia de segurança do seu save na R88.
2. Extraia o ZIP completo e execute **ABRIR_JOGO.bat** ou **VEILFALL.html**.
3. Abra **Conjuntos**. Complete os tipos ausentes com a Ferraria, usando os mesmos materiais da R88.
4. Depois de completar as cinco peças, expanda **ESCOLHER PEÇA PARA FORJAR** e selecione o tipo desejado. Verifique se a raridade está marcada para venda automática na aba Equipamentos.
5. Compare a peça obtida com a atual usando a prévia de atributos antes de equipá-la.

**Próxima prioridade sugerida:** avaliar se bônus secundários de conjuntos devem existir como sistema real; qualquer ativação exige simulações conjuntas de poder e regras de dificuldade, e **não** deve ser feita isoladamente. Também é útil auditar se os nomes e efeitos dos 16 itens Únicos estão coerentes com sua identidade.
