# VEILFALL — R68: Atlas de Passivas Multinível

## Alteração principal

- 210 nós em um único mapa contínuo com 245 ligações; regiões Físico, Magia, Fé e três ramificações econômicas especializadas, todas com conexões reais.
- 1 origem, 24 nós de deslocamento, 100 passivas comuns (nível máximo 20), 48 notáveis (nível máximo 15), 27 transformações exclusivas (3 por habilidade), 5 pactos globais (até dois ativos) e 5 talentos supremos com contrapartidas.
- A compra do primeiro nível abre ligações seguintes. Não é necessário maximizar um nó para prosseguir.
- Custo progressivo do nível `r`: comum `1 + floor((r-1)/2)` (custo total até NV 20 = 110 PT), notável `3 + 2*(r-1)` (total até NV 15 = 255 PT). Conexões, transformações e pactos são compras únicas com seus próprios preços.
- Os 100 nós comuns exigem 11.000 PT para maximizar; 48 notáveis exigem mais 12.240 PT, fora custos das rotas e escolhas únicas. Os 4.800 pontos de marco de fases não maximizam todos os talentos.
- O mapa mantém arraste, zoom, minimapa, busca, seleção de rota e presets; acrescenta exibição de nível atual/máximo, efeitos do nível atual e seguinte, compra +1, +5, máximo acessível, devolução −1 e restituição completa com dependências.

## Migração e preservação

- A R67 original continua intacta. Uma nova pasta R68 preserva as imagens, sprites, áudio, servidores e o código de campanha/raids da R67. Todo o design novo foi adicionado em arquivos separados `src/r68-tree.js`, `src/r68-ui.js`, `src/r68.css`.
- Salvos R67 são migrados uma vez para `passiveVersion:68`: `talentPoints` permanece inalterado, apenas a alocação da árvore antiga é zerada e `talentSpent` recalculado. Os presets antigos são arquivados no salvamento como `passivePresetsR67` e os novos presets usam ranks. Essa migração é idempotente.
- Preservados: progresso da campanha, estágio/dificuldade, relíquias/Artefatos, equipamento, heróis, pets, runas, Vila, habilidades, efeitos visuais, sistemas de Clãs/Raids e Armas de Heróis. Nenhum sprite original foi editado.
- Laboratório: todos os ranks possíveis no máximo, respeitando 1 transformação por habilidade e 2 pactos, sem gravar sobre a campanha real.
- Ao abrir um save antigo, exporte cópia antes. O arquivo migrado para R68 **não** é projetado para retroceder à R67 sem outra migração.

## Notas de balanceamento

- Conservadas as 27 transformações originais da R67 e seus efeitos de combate.
- Os novos valores por rank são uma proposta inicial funcional; não equivalem a uma simulação completa da progressão nas cinco dificuldades.
- As ramificações econômicas de monstros/chefes, Chesterson e fadas ficam separadas e cada uma consome um orçamento significativo para maximizar.
- Efeitos de suporte continuam sujeitos aos limites globais do motor da R67; talentos não concedem bônus à produção de construções da Vila.

## Verificações

- `node tests/r68-core.cjs`: 18/18 (grafo, preços, rota, rank, migração, saves, laboratório, restrições, economia e limites).
- `qa-r68.html`: 11/11 verificações de interface no navegador via injeção de scripts; compras, aplicação, reembolso, conexões, custos, preservação.
- `node --test tests/server/*.test.cjs`: 18/18 verificações de servidor de clãs/raids.
- `node tools/check-build.cjs`: 18 scripts compilados, 16 PNGs e 3 WAVs empacotados no HTML portátil.
- Teste de interface executado em Chromium headless com CSS e scripts do pacote; o ambiente bloqueou navegação por URL local, então a validação visual usou injeção da mesma página, scripts e estilos. Isso não é equivalente a testar Windows físico.

## Limitações

- Precisam ser feitos playtests prolongados e medição real de desempenho/clear nas dificuldades altas, incluindo sinergias com Artefatos, pets, pergaminhos e Armas de Heróis.
- O servidor de Clãs/Raids continua sendo local; multiplayer remoto requer uma implantação ou rede privada, como na R67.
