# VEILFALL — R49 visual

Base: o arquivo `VEILFALL_WEB_REVISAO_48_WINDOWS(1).zip` enviado nesta conversa.
Esta revisão aplica correções de sprites e apresentação sobre essa R48. Não incorpora revisões de balanceamento de outros arquivos ou conversas.

## Sprites e animação

- Substituída a folha problemática do cavaleiro por um atlas de 48 poses isoladas, com células de 128 px e apoio alinhado. O cavaleiro mantém elmo dourado fechado, auréola, capa clara e espada dourada.
- O recorte usa a dimensão real do atlas: 8 colunas × 6 linhas. A limpeza de componentes isolados continua ativa em memória.
- Ciclos de inimigos: esqueleto 2,8; cultista 2,5; espectro 2,2; fera 3,6; colosso 1,9; mimic 2,5; chefes 2,3 quadros/s. A cadência visual não altera deslocamento, dano, frequência de ataque ou velocidade da simulação.
- Caminhadas em sequência de ida e volta; chefes não exibem a pose de preparação durante a caminhada.
- Cavaleiro com poses de preparação, impacto e recuperação, reação ao dano e retorno. O efeito de impacto começa na ação efetivamente aceita.
- O canvas preserva a proporção das imagens, evitando personagens esticados em janelas de outro formato.

## Habilidades e efeitos

| Habilidade | Apresentação |
| --- | --- |
| Graça Celestial | Crescentes dourados, halo e aura persistente |
| Ira do Mártir | Estilhaços rubros e anel de energia |
| Maldição do Véu | Selo violeta e marcas compactas nos alvos |
| Legião | Estandartes espectrais e aura de juramento |
| Golpe da Sombra | Trajetos reais entre alvos, pós-imagens e cortes |
| Nova de Fogo | Onda expansiva com línguas de fogo e pequenas faíscas nos alvos |
| Tormenta Elétrica | Raios ramificados e ligações entre impactos |
| Lança da Aurora | Lança luminosa descendente e selo de impacto |
| Foco Arcano | Prismas orbitais e círculo arcano |

Uma explosão em área é desenhada uma vez na origem. Cada inimigo recebe um impacto menor, evitando repetir explosões inteiras sobre a horda. Números de dano muito próximos não são desenhados uns sobre os outros. Partículas e efeitos conservam os limites de quantidade e as opções de qualidade.

## Interface

- Paleta de ardósia, dourado e cores próprias por habilidade; tipografia, espaçamento, bordas e foco de teclado consistentes.
- Novo acabamento do menu inicial, HUD, barras de vida/mana/EXP, painéis, cartões e botões.
- Habilidades mostram nome curto, atalho e recarga. O estado pronto considera desbloqueio e mana suficiente.
- Catálogo com instruções mais curtas e menos mensagens repetidas.
- Almas organizado em Invocação, Ecos, Pesquisa, Runas e Fontes. Todos os dados e comandos originais permanecem acessíveis.
- Layout verificado sem rolagem horizontal em quadros de 390, 768 e 1024 px, além da inspeção em desktop.

## Preservação da R48

`src/game.js` e `src/data.js` são idênticos à extração normalizada da R48: apenas os áudios incorporados foram separados em caminhos locais e são reincorporados na distribuição. A conferência é feita por SHA-256. As sete imagens de execução que não são o cavaleiro também mantêm os bytes originais.

Permanecem os 36 Ecos, as 24 Runas, pesquisa, migrações legadas, equipamentos, heróis, árvores, recuo, progressão, fórmulas de combate e salvamentos. Comparações determinísticas das nove habilidades com as funções originais da R48 deram resultados iguais.

## Validação e limites

- 40/40 verificações no navegador: margens dos 48 quadros, habilidades, rejeição de mana/recarga, 12 abas, Almas/Runas, migração, save, laboratório, equipamento, heróis, chefes, limites e cinco minutos de simulação.
- Inspeção visual de quadros, interface, efeitos e layout responsivo. HTML independente abriu e iniciou uma jornada sem erros JavaScript da página.
- O arquivo final tem seis scripts válidos, oito PNGs e três áudios incorporados, sem dependências externas de execução.
- As medições no JSON são tempo de CPU por chamada de desenho. Não medem FPS, custo total de GPU ou desempenho no computador do jogador.
- Os ciclos do cavaleiro usam quatro poses por ação, com temporização e efeitos complementares. Não são animações tradicionais longas quadro a quadro.
- O teste foi feito no Chromium desta sessão, não em Windows nativo.

O conjunto de prompts de edição e os caminhos das folhas usadas estão em `docs/ARTES_R49.md`. A sequência e os recortes dos quadros estão em `assets/knight-manifest.json`.
