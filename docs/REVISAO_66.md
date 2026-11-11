# VEILFALL R66 — interface e impacto visual

Base: revisão 65 enviada pelo usuário. Escopo: organização, legibilidade,
continuidade da interação e apresentação das habilidades.

## Interface

Os quinze destinos agora aparecem em cinco grupos, com ícones e nomes visíveis.
A busca global abre com Ctrl+K, aceita nomes sem acentos e oferece navegação por
setas, Enter e Escape. Coleções e Arsenal têm filtros locais, estado vazio e
consulta preservada durante atualização. Cada painel guarda sua rolagem.

O catálogo de habilidades é a primeira entrada; a árvore continua disponível e
a escolha é lembrada ao alternar de painel. A barra de quatro habilidades usa
elementos estáveis, preservando o foco enquanto os indicadores são atualizados.
A barra foi movida para fora da arena. As ações mostram desbloqueio, falta de
mana, habilidade pronta/ativa e recarga. Painéis podem ser ampliados, e F alterna
o foco na arena. A navegação móvel usa menu recolhível, foco delimitado e
elementos fora de tela inativos para teclado/leitor de tela.

## Efeitos

- Graça: asas de luz, eixo luminoso e onda dourada.
- Fúria: cortes rubros e estilhaços de impacto.
- Maldição: selo violeta com núcleo e inscrições.
- Legião: silhuetas espectrais e círculo de invocação.
- Sombra: cortes diagonais com rastros afilados.
- Nova: coroa de chamas, núcleo quente, fagulhas e dissipação.
- Brasas: pequenos cometas em rotação, preservando os projéteis simulados.
- Ceifa: lâminas curvas orbitais e fragmentos do véu.
- Foco arcano: prismas luminosos conectados.

As técnicas de raid usam o mesmo vocabulário visual. O desenho consome os eventos
já aceitos pelo combate, sem executar sorteios, gastar mana ou aplicar dano.
O brilho usa pequenas texturas procedurais em cache. O orçamento de efeitos
decorativos por quadro depende da qualidade e da intensidade escolhidas. O modo
de movimento reduzido elimina rotação e detalhes adicionais. Avisos de chefe
mantêm o contorno e a contagem visíveis acima das habilidades.

## Preservação e validação

- Arquivos de mecânica, serviço, arte e áudio de execução conferidos por SHA-256 contra
  a R65 e mantidos idênticos, incluindo game.js, data.js e o motor de raids.
- 18 testes automatizados do servidor aprovados, incluindo autenticação,
  tentativas de raid, recompensas e persistência após desconexão.
- 25 verificações de navegador aprovadas em sessão isolada, cobrindo foco,
  filtros, atalhos, navegação, desenho das nove habilidades, três intensidades,
  três qualidades, movimento reduzido, limites e ausência de alteração do combate.
- Layout inspecionado em contêineres de 390, 768 e 1280 px; quatro habilidades
  inteiras dentro da barra, sem rolagem horizontal do documento.
- HTML final conferido: 13 scripts válidos, 16 PNGs e três WAV incorporados.
- Treinamento real de raid de 30 segundos inspecionado no HTML final.

A inspeção de navegador foi realizada em Chromium. Não foi executada uma sessão
nativa de Windows/Firefox; o pacote inclui HTML padrão e inicializadores Windows.
Não é uma medição de FPS no computador do jogador.

O inicializador tools/launch.cjs, referenciado pelo BAT mas ausente na entrada,
foi incluído. O verificador de build, que ainda esperava a estrutura antiga de
seis scripts/oito imagens, foi atualizado. O servidor ganhou somente a rota
estática das páginas de QA R66; regras e APIs de combate permanecem as da R65.

## Reproduzir

`npm test` verifica o servidor. `npm run build` gera VEILFALL.html.
`npm run check` verifica o HTML. `npm run qa` gera as páginas de teste.
Com o servidor local em execução, abra qa-r66.html e clique em Executar testes.
qa-layout-r66.html permite inspecionar larguras de tela. Essas sessões mantêm os
saves de campanha em memória e não devem ser usadas como campanha real.

## Pacote de distribuição

Inclui o HTML autônomo, o código, o servidor, testes, documentação e todos os
assets de execução. Artes brutas em assets/source e capturas PNG de revisões
anteriores ficam fora da distribuição para reduzir o download. Essas imagens
não são dependências da partida ou da construção do HTML autônomo.
