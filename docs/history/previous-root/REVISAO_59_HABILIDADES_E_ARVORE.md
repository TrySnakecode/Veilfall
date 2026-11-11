# VEILFALL R59 — Habilidades e árvore (base R57)

## Objetivo
Tornar quatro habilidades úteis fora de combinações específicas e melhorar a navegação da árvore sem reaproveitar os seis feitiços ou a árvore reduzida da R58 descartada.

## Efeitos
1. **Lança da Aurora:** quando um inimigo morre pelo golpe sagrado, prepara nova lança para o alvo mais próximo num raio de até 290 unidades. A sequência tem consumo máximo de 13 disparos por conjuração, janela de 2,8 s, alvos distintos e potência decrescente. Apenas abates propagam.
2. **Nova de Fogo:** explosão inicial em área e até 4 sementes de fogo; cada uma pode ricochetear mais duas vezes. Cada pequena explosão acerta no máximo 3 adversários, com dano gradualmente reduzido. Limitada a 16 entidades na fila.
3. **Tormenta Elétrica:** até 15 alvos distintos por conjuração, ou mais com a especialização já existente (teto 23), cadeia de arcos com ramificação e alcance local de 255 unidades. A progressão do dano é limitada por profundidade.
4. **Graça Celestial:** além da sinergia com ataques, provoca pulsos independentes de dano de área contra inimigos próximos a cada 1,65 s, recuperando 0,4% da vida máxima por pulso atingido.

Todos os novos efeitos respeitam os multiplicadores de atributo correspondentes, a função hurt() central, o limite de efeitos desenhados e as configurações normais de combate.

## Interface
- Abas por afinidade e mapa de 5 camadas por aba.
- Três colunas conectadas: duas habilidades ofensivas e o suporte/ouro ao centro.
- Cada camada agrupa os nós existentes, reduzindo o comprimento visual de cada tela.
- Informações e desbloqueios do nó, investimentos e respec disponíveis na ficha.
- Não houve alteração dos IDs, das regras de custo, dos pré-requisitos ou dos valores dos talentos da R57.

## Compatibilidade
- 9 habilidades originais (sem adições da R58).
- Árvore e afinidades R57 mantidas.
- Salvamentos R57 compatíveis, sem alteração no identificador de versão da árvore.
- Sem alteração dos 15 recursos visuais e sonoros presentes no diretório assets.

## Limitações
- Os testes incluem cenários controlados de 26 e 120 inimigos, mas não substituem validação de builds e longas campanhas de endgame.
- Executado no Chromium, sem teste em um computador Windows físico.
