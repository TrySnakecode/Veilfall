# Artes da expansão R52

## Origem e preservação

As imagens novas de raids foram criadas com Imagegen durante o desenvolvimento da R52. Os PNGs recebidos dessa geração estão preservados em `assets/source/raids/`, incluindo três conceitos de chefes. Os prompts exatos e os identificadores das chamadas de geração não estavam presentes entre os arquivos retidos; este documento não os reconstrói nem atribui autoria manual às imagens.

O trabalho de empacotamento faz somente extração, alinhamento e redução com vizinho mais próximo. Os arquivos visuais da campanha R51 não são substituídos por estas imagens. As fontes e os resultados têm hashes SHA-256, dimensões e descritores de recorte em `assets/raid-manifest.json`.

## Recursos de execução

| Arquivo em `assets/raids/` | Conteúdo | Grade e dimensões |
| --- | --- | --- |
| `sentinel.png` | Sentinela do Ossuário, tier I | 4 × 6; células 192 px; 768 × 1152 |
| `archon.png` | Arconte de Ferro, tier II | 4 × 6; células 192 px; 768 × 1152 |
| `abyss.png` | Matriz do Vazio, tier III | 4 × 6; células 192 px; 768 × 1152 |
| `arena.png` | Catedral em ruínas com área central para combate | 1536 × 1024 |
| `weapons-1.png` | 16 ícones para h01–h16 | 4 × 4; células 128 px; 512 × 512 |
| `weapons-2.png` | 16 ícones para h17–h32 | 4 × 4; células 128 px; 512 × 512 |
| `techniques.png` | 9 ícones de técnicas | 3 × 3; células 128 px; 384 × 384 |
| `heraldry.png` | 12 brasões, 3 cargos e 1 recompensa | 4 × 4; células 128 px; 512 × 512 |

A ordem dos ícones é da esquerda para a direita, de cima para baixo. O mapeamento das armas usa os IDs permanentes h01–h32, sem depender da ordem de exibição dos heróis na campanha. Os nomes e efeitos são definidos pelo código do jogo.

### Animações dos chefes

Todos os chefes têm seis estados com quatro poses diferentes em cada estado. A âncora de chão é (96, 168) na célula de 192 px.

| Linha, começando em zero | Estado | Cadência de execução | Repetição |
| --- | --- | --- | --- |
| 0 | idle — espera | 1 quadro a cada 430 ms (~2,33/s) | Sim |
| 1 | attack — ataque | 1 quadro a cada 250 ms (4/s) | Um gesto a cada 5,2 s |
| 2 | hurt — reação a impacto | 1 quadro a cada 95 ms (~10,53/s) | Enquanto o impacto recente durar 360 ms |
| 3 | vulnerable — vulnerável | 1 quadro a cada 380 ms (~2,63/s) | Sim, na janela de exposição |
| 4 | armorBreak — ruptura | 1 quadro a cada 170 ms (~5,88/s) | Na ruptura, por 650 ms |
| 5 | death — derrota | 4 quadros/s | Não |

Essas taxas correspondem a `src/r52-combat.js`. Os estados usam tempo transcorrido, sem multiplicação pela velocidade da campanha. A derrota termina na quarta pose e permanece nela, sem repetir o ciclo. As reações de impacto são breves; a espera permanece lenta para não dar a impressão de aceleração contínua.

As regiões normalizadas do manifesto — cabeça (0,50; 0,28), núcleo (0,50; 0,52), placas (0,28; 0,53) e base (0,50; 0,79) — representam zonas de seleção no corpo da pose neutra. A cabeça inclui elmo e coroa; não são coordenadas de colisão por pixel. Os controles de seleção devem conservar tamanho confortável mesmo quando a pose se move.

### Técnicas e heráldica

Os ícones de técnicas usam esta ordem:

1. Fenda Estelar; Martelo do Eclipse; Lança do Sepulcro.
2. Espinhos Rubros; Selo Profano; Fome do Vazio.
3. Juramento de Cerco; Ressonância Arcana; Olho do Caçador.

Na heráldica, os índices 0–11 são brasões selecionáveis; 12 é líder, 13 oficial, 14 membro e 15 recompensa/conjunto. A separação cromática das técnicas é dourado para Ruptura, vermelho e violeta para Corrupção, azul e ciano para Domínio. Os efeitos animados das habilidades são desenhados pelo renderizador, sobre estes recursos de imagem.

## Correção dos recortes

A grade visual das fontes dos ícones tem espaçamento irregular. Um recorte uniforme havia cortado pontas de armas e incluído fragmentos do item vizinho. O empacotador agora identifica a silhueta conectada completa de cada ícone antes de posicioná-la em sua célula final. O processo conserva as bordas de baixa opacidade próximas à silhueta e elimina fragmentos isolados de itens vizinhos. Não depende de apagar manualmente partes dos arquivos gerados.

Os chefes usam grade regular nas fontes e escala comum por personagem, com alinhamento da parte principal ao chão. Os frames são desenhados a partir de retângulos independentes; interpolação entre células deve permanecer desativada para preservar os contornos e evitar vazamento visual.

## Verificações realizadas

O comando `node tools/pack-raid-assets.cjs` reconstrói os atlas e executa as verificações. Requer Node e a biblioteca Sharp apenas para reempacotar arte; o jogo utiliza os PNGs já incluídos.

| Atlas | Quadros/ícones válidos | Quadros/ícones únicos | Menor margem transparente |
| --- | --- | --- | --- |
| Sentinela | 24 | 24 | 14 px |
| Arconte | 24 | 24 | 11 px |
| Matriz | 24 | 24 | 10 px |
| Armas h01–h16 | 16 | 16 | 9 px |
| Armas h17–h32 | 16 | 16 | 9 px |
| Técnicas | 9 | 9 | 9 px |
| Heráldica | 16 | 16 | 9 px |

Foram inspecionados visualmente todos os oito arquivos de execução, incluindo uma nova inspeção dos quatro atlas de ícones após a correção. Nenhum frame é vazio; nenhum frame de chefe repete exatamente outro; nenhum pixel com alfa acima de 24 invade as margens verificadas. Nas fontes finais dos chefes, nenhuma célula contém pixels visíveis em sua borda.

As poses geradas apresentam pequenas variações de forma entre quadros, características da geração por imagem. Os testes de margens e hashes não medem fluidez percebida; a validação final das transições pertence ao teste do jogo em execução. Esta documentação não constitui certificação de qualidade AAA ou de equivalência a uma animação desenhada manualmente quadro a quadro.
