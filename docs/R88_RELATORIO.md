# VEILFALL R88 — Loot relevante, afixos funcionais e inventário mais claro

**Base:** R87 — Equipamentos e Recompensas.  
**Tipo:** melhorias na campanha e na tela de equipamentos, **não** no laboratório.  
**Objetivo:** remover afixo sem efeito, oferecer uma especialização mágica real nas armas e facilitar a identificação de boas trocas sem alterar as regras de drop.

## 1. O afixo `dos Selos` agora é útil

- Na R87, o afixo de Aura `aff37` tinha efeito `gear` («Potência dos equipamentos»), sem aplicação real ao combate.
- Na R88, o mesmo afixo `aff37` passa a conceder `defense` (Defesa), efeito já reconhecido pelo cálculo de dano recebido.
- **Raridade mínima 2, peso 7 e rolagem 3%–16% preservados.** Não há multiplicadores novos, raridades novas nem mais oportunidades de drop.
- Os itens já existentes que tenham Aura + afixo `dos Selos` com efeito `gear` são migrados no carregamento do save, mantendo o valor da rolagem, qualidade, raridade, nome, ID, posição no inventário e favoritos. A migração é idempotente.
- A correção dá **uma defesa real** aos itens afetados, anteriormente inertes. Por isso ela constitui uma alteração pontual de força desses itens, **não** uma mudança nas curvas de HP/dano ou nos inimigos.

## 2. Uma opção de Arma especificamente mágica

- O afixo épico de Arma `aff09`, `do Eclipse`, deixa de oferecer `damage` global e passa a oferecer `magic` **somente quando um novo item é gerado**.
- Mesma raridade mínima 3, peso 6 e amplitude 3%–18%; nenhuma opção adicional foi introduzida na rolagem.
- **Armas antigas** que já tinham `do Eclipse` como dano global preservam o efeito anterior, evitando perda de poder retroativa.
- Equipamentos físicos e de Fé não recebem bônus ocultos; o novo afixo fortalece apenas o atributo de Magia.

## 3. Filtros de loot — qualidade de vida na campanha

A tela **Equipamentos**, dentro da aba de cada tipo de item, oferece:

| Filtro | O que exibe |
|---|---|
| TODOS | todos os itens daquele tipo, na ordenação existente |
| GANHOS SEM PERDAS | candidatos com ganhos efetivos e nenhuma perda calculada em comparação com o equipado |
| TROCAS DE ATRIBUTOS | candidatos com ganhos e perdas, para escolher de acordo com a build |
| FAVORITOS | itens marcados com ★ no tipo selecionado |

O filtro é **somente de interface, desativado no início (TODOS)**, não faz parte do save, não altera o inventário, não equipa, não protege nem vende automaticamente. A prévia continua sem pretender prever DPS global ou compatibilidade futura da build.

## 4. Preservação e compatibilidade

- Os **61 afixos** continuam na mesma quantidade, com todas as mesmas chances, slots, pesos, raridades e intervalos de rolagem. Apenas os efeitos de `aff09` e `aff37` foram trocados, conferidos também por comparação estrutural com os dados da R87.
- **Não alterados:** chance de dropar equipamentos (normal ou guardião), limite de itens por fase, regras de único/mítico/lendário, qualidade, graus, economia, relíquias, prestígio, ouro, drops de material, habilidades, inimigos, chefes, vida e dano-base, IA de combate, raids e clãs.
- Nenhum sprite, PNG, spritesheet, som ou arquivo de rede modificado. Todos os itens das cinco categorias existentes permanecem compatíveis.
- Não foi criado novo campo de save; alterações de filtros não são persistidas. Sempre faça **Exportar Save** antes de substituir os arquivos.

## 5. Verificações

- **R88: 11/11** testes novos: catálogo, efeitos reais, migração no `calibrateGearInventory`, roundtrip save/load, preservação de armas antigas, seleção de filtros, ausência de mutação na visualização e hashes de assets.
- **Regressão de jogo R88–R70: 142/142** testes aprovados (suítes selecionadas). Verificações de hashes anteriores foram mantidas, exceto a dispensa explícita do arquivo de dados `src/data.js`, cujo conteúdo semântico alterou somente dois afixos e passou a ser verificado especificamente pelos novos testes.
- **Servidor, clãs e raids: 18/18** testes aprovados.
- `npm run build` / `npm run check`: standalone com **22 scripts, 16 PNGs e 3 WAVs** corretamente embutidos, sem dependência externa em tempo de execução.
- Comparação byte a byte com a R87: alterações restritas ao código da tela/inventário, tabela de afixos, marcação de versão, testes e documentação. Nenhum arquivo original foi removido; todos os assets permanecem idênticos.
- Limitação: não foi realizada uma sessão de validação visual em Windows físico nem uma campanha legítima até o endgame. Os testes não demonstram que todas as builds estão balanceadas no Mundo V.

## 6. Como jogar

1. Faça backup do save na R87.
2. Extraia o ZIP completo e abra `ABRIR_JOGO.bat` ou `VEILFALL.html`.
3. Na aba **Equipamentos**, abra cada tipo (Arma, Capacete, Peitoral, Aura, Anel) e escolha TODOS, GANHOS SEM PERDAS, TROCAS DE ATRIBUTOS ou FAVORITOS.
4. Procure Auras `dos Selos` para testar defesa e futuras Armas épicas `do Eclipse` para builds de Magia.

**Próximo foco sugerido:** verificar a legibilidade dos atributos de itens e a utilidade prática dos sets/efeitos raros, não criar outro laboratório.
