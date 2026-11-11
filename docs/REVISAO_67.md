# R67 · Constelação

## Mudança principal

As árvores individuais foram substituídas por um grafo compartilhado de 574 nós: uma origem, 492 passivas comuns, 49 notáveis, 27 especializações e cinco pactos. Existem 636 conexões, incluindo caminhos alternativos e pontes entre regiões. Não há habilidades novas nesta revisão: as nove existentes receberam funções de cobertura e três transformações cada.

A interface oferece busca sem acentos, filtros, navegação por região, zoom, minimapa, cálculo do caminho de menor custo, planejamento separado da build ativa, desfazer, restituição de dependências e três presets. Atualizações do combate preservam foco, posição e zoom da árvore. Há ajustes para telas estreitas e movimento reduzido.

## Habilidades

Valores base, antes de passivas, equipamentos e buffs. A barra e o catálogo consultam a mesma função usada para cobrar mana e iniciar recargas.

| Habilidade | Mana | Recarga | Duração | Função e especializações |
| --- | ---: | ---: | ---: | --- |
| Graça Celestial | 12 | 16 s | 10 s | Pulsos solares com cura. Peregrinação Solar, Catedral Viva, Procissão da Aurora. |
| Ira do Mártir | 18 | 26 s | 15 s | Amplificação física e ataques básicos em área. Ruptura Carmesim, Ímpeto do Mártir, Estrada de Sangue. |
| Golpe da Sombra | 28 | 22 s | 12 s | Percursos por cinco grupos a cada 1,2 s. Dança das Lâminas, Fendas do Horizonte, Vestígios do Eclipse. |
| Maldição do Véu | 20 | 18 s | 12 s | Marcas em grupos, dano periódico e explosões de morte. Contágio do Véu, Miasma Errante, Eclipse Profano. |
| LEGION | 28 | 28 s | 15 s | Amplifica atributos passivos dos heróis e alcance. Vanguarda, Concórdia, Estandarte da Colheita. |
| Nova de Fogo | 18 | 7 s | — | Explosões em grupos, combustão e detonação de Brasas. Cometas, Supernova Errante, Fornalha Itinerante. |
| Coração de Brasas | 24 | 12 s | — | Três áreas com marcas que detonam mesmo sem Nova. Incêndio em Cadeia, Chuva de Brasas, Coração Insaciável. |
| Ceifa do Véu | 24 | 13 s | — | Três frentes e sinergia com Maldição. Colheita do Horizonte, Réquiem em Ondas, Vigília do Véu. |
| Foco Arcano | 24 | 26 s | 15 s | Amplificação mágica, mana e alcance. Sobrecarga, Prisma do Infinito, Fluxo Inesgotável. |

Ondas seguintes penalizam áreas recentemente atingidas na seleção de alvos, procurando outros grupos. Queimaduras mantêm a habilidade que as originou. A Fornalha escolhe seus três campos antes dos impactos para não repetir uma área por causa dessa mudança de prioridade.

## Custos, progressão e preservação

Passivas comuns das oito faixas custam 1, 2, 4, 8, 12, 18, 25 ou 34 pontos. Notáveis custam 6 mais duas vezes o custo da faixa. As especializações custam 24 pontos, além do caminho; pactos custam 65. A rota inicial até Peregrinação Solar custa 60 pontos. A maximização legal do laboratório ocupa 552 nós e custa 7.285 pontos, escolhendo uma transformação por habilidade e dois pactos. Na campanha, o orçamento e as escolhas continuam limitando a build.

A migração conserva `talentPoints` como total conquistado, recalcula o gasto e remove apenas as antigas alocações. Ela não soma pontos gastos ao total já conquistado. Repetir a migração ou carregar o save novamente não gera pontos. Saves malformados têm nós inválidos, desconectados ou incompatíveis removidos dentro do orçamento. Ações de compra das árvores antigas ficam desativadas.

As regras de obtenção de Conhecimento, progressão de mundos, vida dos inimigos, custos de heróis e artefatos e servidor de raids foram mantidas. Ouro da árvore é aplicado uma única vez, depois dos multiplicadores econômicos existentes, por fonte. Produção de madeira, pedra, ferro e forja não recebe bônus da árvore ou dos artefatos. Heróis não atacam e não viram entidades de combate.

As imagens e sons de execução são idênticos aos do pacote R66. A limpeza de recortes e o relógio visual independente da velocidade da simulação foram preservados. Os novos efeitos usam os alvos e áreas reais, respeitam a intensidade configurada e mantêm os avisos dos chefes legíveis.

## Limites do combate

- Redução de recarga: 80%; duração: +80%; raio: +85%; economia de mana: 45%.
- Mana e regeneração: +150%; defesa: +65%; crítico: 90%, até 95% nas habilidades.
- Retorno conjunto por abates: até 8 mana por segundo simulado.
- Ímpeto: até um segundo de recarga devolvido por segundo simulado.
- Até dois impactos por vítima em uma sequência de ondas; pulsos independentes são novos eventos.
- Até oito explosões secundárias por evento; explosões secundárias não iniciam novas cadeias.
- Até 24 zonas, oito por habilidade, e 48 eventos atrasados. O limite existente de 320 inimigos continua ativo.
- Automação alterna a prioridade dos quatro espaços; buffs ativos aguardam seu término para serem conjurados novamente.

## Validação

`TESTES_R67.json`: 57 testes de grafo, orçamento, rotas, exclusividade, restituições, migração, importação, economia, Arsenal, custos de conjuração, limites de reações, suportes e cobertura distribuída. Inclui teste de 320 vítimas com uma recompensa por vítima.

Interface: 20 verificações aprovadas em desktop, 390 px e 768 px. Incluem planejamento e aplicação, foco/zoom preservados, presets, importação e ausência de overflow horizontal. Há inspeção visual do mapa, catálogo e combate. A página de QA apresenta uma demonstração isolada com vida normalizada; não representa o poder real de uma campanha no Mundo V.

`BALANCEAMENTO_R67.json`: 18 rotações combinando três famílias, orçamentos de 125/500/960 pontos e dois padrões de dispersão; 18 variantes ofensivas isoladas; 45 medições de fontes com as fórmulas reais. Nas rotações, 80% do lote inicial de 150 inimigos foi eliminado em até 1,3 s de simulação, sem mana negativa nem ultrapassar limites. Os testes das nove variantes de suporte verificam diretamente seus benefícios e contrapartidas.

O ensaio de limpeza usa inventários sintéticos fixos e vida dos inimigos normalizada para 2,4 impactos da habilidade principal antes das passivas. Nível do cavaleiro fica fixo; mana, recargas, movimento, recompensas e reposição de hordas seguem o motor. É uma comparação de cobertura e sustentação, não uma previsão de tempo até o late game. As medições de fontes removem separadamente heróis, artefatos, pets, pergaminhos, equipamentos, conjuntos, passivas e Arsenal; seus inventários também são sintéticos.

`CAMPANHA_R67.json`: três sementes de campanha nova por revisão, por 20 minutos simulados, com XP, ouro e drops naturais. Compra automática de heróis, melhorias pagas e equipamento de drops permanecem ativos. Sem níveis gratuitos, invulnerabilidade ou prestígios. R66 terminou na fase 80 nas três sementes; R67 nas fases 83, 82 e 83; nenhuma morte nas seis execuções. Esse ensaio verifica regressões no início; não substitui telemetria de campanhas longas.

Os 18 testes existentes do servidor e do motor de raids continuam sendo executados separadamente. O build valida os 16 scripts, 16 PNGs e três WAVs incorporados ao HTML. O pacote final passa por CRC, extração e comparação de bytes após ser disponibilizado.

## Reproduzir

```sh
npm test
npm run test:constellation
npm run balance
node tools/campaign-r67.cjs /caminho/para/VEILFALL_R66
npm run build
npm run check
npm run qa
npm start
```

Sem o argumento de baseline, o teste de campanha executa apenas a R67. Relatórios históricos referem-se às versões indicadas nos próprios nomes; este documento descreve a revisão atual.
