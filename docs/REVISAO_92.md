# VEILFALL R92 — Conjuntos e Únicos inspirados em Tap Titans 2

**Base:** R91. **Data:** 04/11/2026. **Escopo:** mecânicas de coleções e equipamentos Únicos durante a campanha. Não foi criado um laboratório novo.

## Por que substituir R90 e R91

A R91 exigia abdicar do multiplicador principal de uma coleção para usar um efeito alternativo (apenas uma escolha ativa). Esse não é o modelo de conjuntos de Tap Titans 2. A R90 dava aos Únicos somente um afixo convencional garantido; faltavam um atributo principal especializado e uma recompensa permanente de descoberta.

## 1. Conjuntos permanentes cumulativos

- Cada um dos **16 conjuntos** exige suas cinco partes distintas (Arma, Capacete, Peitoral, Aura, Anel), como antes. As partes podem ser vendidas depois de registradas.
- Ao completar, ativa automaticamente **dois efeitos permanentes**: o multiplicador principal original da R90 e um secundário moderado. Os dois funcionam simultaneamente, mesmo sem o equipamento vestido.
- Todos os conjuntos completos se acumulam. Foi removido o mecanismo exclusivo de seleção da R91 e o campo legado `setFocusId` é neutralizado no carregamento; nenhuma peça nem progresso é perdido.
- Os efeitos secundários usam IDs válidos, e não os campos textuais obsoletos de `D.sets`. Os bônus de suporte e crítico continuam sujeitos aos tetos existentes.
- Os multiplicadores principais das 16 coleções **não foram reduzidos**. Os secundários representam algum poder adicional, por isso ainda é necessário observar o efeito cumulativo no endgame real; não é correto chamar essa mudança de neutralidade de força absoluta.

| Conjunto | Segundo efeito após completar |
|---|---|
| Juramento Cinéreo | +2,5% velocidade de ataque (cap de suporte) |
| Coral das Cinzas | +0,8 ponto percentual de chance crítica |
| Liturgia Pálida | +2,5% duração (cap de suporte) |
| Sol Desfeito | +3,5% dano em área |
| Fúria de Sangue | +2,5% duração (cap de suporte) |
| Moeda Profanada | +1,2% relíquias |
| Sepultura Cantante | +2,5% dano em área |
| Praga da Lua | +2,5% dano em área |
| Corte do Vazio | +2,5% velocidade de ataque |
| Pacto dos Gêmeos | +3,5% dano em área |
| Cortesão do Cofre | +1,5% chance de Mimic (cap de suporte) |
| Alvorada das Fadas | +1,5% frequência de fadas (cap de suporte) |
| Carrasco de Gigantes | +2% ouro de chefes |
| Guardião do Último Sopro | +2,5% regeneração (cap de suporte) |
| Magistrado dos Relicários | +2% defesa |
| Eclipse Absoluto | +2% ouro global |

## 2. Únicos: atributo principal especializado, assinatura e descoberta

- Os **16 Únicos** da R90 mantêm nome e categoria.
- Itens **novos**, marcados internamente com `uniqueVersion:2`, passam a ter **atributo principal exclusivo** correspondente à identidade, em vez de rolagem aleatória da mesma categoria. Esse efeito aumenta em função de um progresso real (talentos, pergaminhos, heróis, artefatos, mundo, fase, etc.) com fator **máximo de 1,5×** o atributo principal daquela peça. Nunca há crescimento exponencial por fase.
- O secundário de assinatura ocupa **um de três afixos** (não é um quarto). A contribuição da assinatura escala de forma suave, até 1,2× o valor sorteado. Os outros **dois afixos** continuam aleatórios e seguem a raridade e o slot do equipamento.
- A primeira descoberta de cada identidade concede **um bônus de coleção permanente** pequeno, geralmente +1,2% de um atributo temático (u04: +0,8% dano global), mesmo depois de venda ou substituição. Repetições nunca duplicam o bônus.
- Diferente de conjuntos de cinco peças, cada Único é uma coleção individual. Únicos novos só podem vir do drop previsto de guardiões; não são obtidos da Ferraria nem preenchem slots de conjuntos de cinco peças. Forjar uma peça com sorteio que antes seria Único resulta em Mítico, sem aumentar as chances de drop.

### Atributos principais dos 16 Únicos novos

| Único | Principal exclusivo | Cresce com |
|---|---|---|
| Devoradora de Salmos | amplificação da Aura sobre Anel | pergaminhos |
| Lâmina dos Trinta e Dois Selos | dano físico | talentos investidos |
| Cântico Sepultado | Ceifa do Véu | pergaminhos |
| Cinza do Primeiro Rei | dano global | fase recorde |
| Presa do Último Eclipse | dano físico | prestígios |
| Tesouro do Abade Caído | ouro global | artefatos |
| Fagulha Proibida | Graça Celestial | talentos investidos |
| Voto Rubro | dano físico | níveis de heróis |
| Mão do Tesouro Profanado | ouro de Mimics | Mimics derrotados |
| Oráculo das Pestes | Maldição do Véu | invocações rúnicas |
| Ramo da Maldição Contagiosa | Ceifa do Véu | conjuntos completos |
| Juramento dos Trinta e Dois | LEGION | níveis de heróis |
| Fenda Entre Instantes | Golpe da Sombra | prestígios |
| Lança dos Imortais | dano físico | nível do cavaleiro (assinatura: Vida) |
| Antífona Rúnica | heróis de Fé | níveis de heróis |
| Última Palavra | dano crítico | prestígios de mundo |

## 3. Migração de saves e regras preservadas

- Saves R90/R91 e anteriores continuam com o mesmo formato básico (`version:1`). O campo opcional `uniqueDiscovered` registra descobertas. Os itens **Únicos antigos são preservados byte a byte na rolagem de seus atributos**, não recebem o novo atributo principal escalável.
- Únicos com `uniqueId` que ainda estejam no inventário/equipados quando a R92 carrega são contabilizados como descoberta. Se um Único foi vendido numa versão antiga, **não é possível provar essa aquisição retroativamente** sem registro no save anterior.
- O antigo campo `setFocusId` pode continuar presente para compatibilidade, mas não produz escolhas nem suprime bônus.
- Foram preservados: sprites, animações, 16 PNGs e WAVs de jogo, arquivos de mídia histórica, clãs, raids, chefes, fórmulas-base de vida/dano dos inimigos, prestígio, sistema de raridade, chance de drops, seteiras e limites de Auras.

## 4. Testes e limitações

- `npm run test:current`: **todos os testes concluídos**, incluindo novos testes R92 e as regressões selecionadas R91–R70. Os testes antigos de escolhas exclusivas foram reescritos para as regras solicitadas; as regressões não relacionadas continuam ativas. O teste de esquema da R78 exclui apenas o novo campo opcional de descoberta.
- `npm test`: **18/18 testes de servidor**.
- `npm run build` e `npm run check`: HTML offline válido, com **22 scripts, 16 PNGs e 3 áudios WAV**.
- Foram verificados por SHA-256 todos os arquivos de assets, server e shared (25 arquivos) presentes no ZIP da R91: **nenhuma alteração** nesses arquivos.
- **Não houve teste visual manual em Windows físico, nem validação real do equilíbrio nos cinco mundos.** Os tetos e curvas pontuais foram testados automaticamente, mas a força acumulada desses bônus precisa de acompanhamento de campanha.

## Fontes da mecânica TT2 (referência de design, sem copiar arte)

- [Tap Titans 2 – Equipment Sets](https://tap-titans-2.fandom.com/wiki/Equipment): coleções completas desbloqueiam bônus permanentes.
- [Game Hive – DevLog #140 (TT2 v6.2)](https://www.reddit.com/r/TapTitans2/comments/1674ksb/devlog_140_version_620_patch_notes/): bônus principais Únicos, um secundário único e dois aleatórios; coleção individual permanente.
- [Game Hive – DevUpdate #100](https://www.reddit.com/r/TapTitans2/comments/160zcp1/devupdate_100_tweak_your_chic_physique/): Únicos não forjáveis, identidade especial e bônus de descoberta.

**Para instalar no Windows:** exporte o save na versão anterior, extraia todo o ZIP, abra `ABRIR_JOGO.bat` ou `VEILFALL.html`, e confira Conjuntos/Equipamentos.
