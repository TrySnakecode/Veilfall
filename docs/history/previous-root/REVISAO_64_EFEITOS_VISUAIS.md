# VEILFALL — R64: Refinamento Visual das Habilidades

**Base oficial:** Revisão 63 — Sinergias. Mantém a árvore contínua, nove habilidades, Ceifa do Véu, Coração de Brasas e todas as fórmulas e funcionalidades anteriores.

## Melhoria visual (somente apresentação)
- **Ceifa do Véu:** golpes em arco com rastro violeta, círculos rúnicos, explosões profanas em múltiplas etapas, fragmentos e arcos luminosos entre os inimigos marcados.
- **Coração de Brasas:** sigilos flamejantes, marcas mais reconhecíveis, pétalas incendiárias, cintilações, ondas de choque e núcleo quente na detonação. A Nova de Fogo continua causando as detonações mecânicas existentes.
- **Nova de Fogo:** aparência refinada dos projéteis, trilhas de brasas, faíscas e explosões de ricochete.
- **Maldição do Véu e Graça Celestial:** símbolos de status legíveis, círculo de conjuração, anéis de energia e pulsos de luz.
- **Outras habilidades:** um selo de conjuração discreto no momento da ativação.
- Os efeitos são ligados aos eventos reais de conjuração e reação no combate. Não geram nenhum dano extra.
- Modos de qualidade alta/baixa controlam brilhos e quantidades desenhadas para estabilidade.
- O tempo dos efeitos visuais é independente da velocidade de simulação (inclusive 100×).

## Preservação
- Os **15 arquivos existentes de arte e áudio** permanecem binariamente idênticos aos da R63, conforme hash SHA-256.
- Nenhuma mudança em cooldowns, fórmulas de dano, relíquias, ouro, heróis, pets, passivas, salvamentos ou habilidades equipadas.
- Não foram criadas novas spritesheets: os novos efeitos são desenhados em Canvas, por código.
- A versão no arquivo `VEILFALL.html` inclui todas as dependências offline. `src/polish.js` contém o código-fonte da nova camada, de modo que reconstruir usando `node tools/build-standalone.cjs` mantém as mudanças.

## Testes
- Compilação JavaScript de todos os seis scripts e reconstrução standalone sem dependências externas: aprovadas.
- Chromium: Ceifa, Brasas, Graça, reações das duas duplas, pontos máximos no laboratório, não alteração dos investimentos: aprovados, sem erros de JavaScript.
- Regressões R63: seis categorias de testes aprovadas; o motor de combate e a árvore continuam funcionando.
- Estresse visual: 120 inimigos e 80 eventos de efeito na arena; mediana média de 20 chamadas render por modo (ver `TESTES_DESEMPENHO_R64.json`). Esses números são de teste local, não medição de FPS em PCs diferentes.
- Não validado em Windows físico ou em uma campanha inteira até a dificuldade V.

## Como testar
1. Exporte uma cópia do salvamento da R63.
2. Extraia todo o ZIP e execute `ABRIR_JOGO.bat` ou abra `VEILFALL.html`.
3. No Laboratório, equipe **Maldição do Véu + Ceifa do Véu**, depois **Coração de Brasas + Nova de Fogo**.
4. Observe primeiro a velocidade 1×, depois 3×/10×. Em 100×, a simulação pode saturar os efeitos e comprometer a legibilidade; a qualidade gráfica controla parte dessa carga.
