# VEILFALL — R85 | Habilidades, builds e decisões de alvo

**Base:** R84, sem alterações de sprites, imagens, áudio, rede, clãs ou raids.  
**Escopo:** correções reais na execução de habilidades, não no laboratório.  
**Objetivo:** deixar as escolhas de build e de foco de ataque mais consistentes, sem facilitar artificialmente o jogo.

## 1. Foco em chefes agora funciona para habilidades em área

Na R84, a opção **Mundo → Prioridade de ataque → Priorizar chefes** influenciava a escolha do ataque básico, mas não a seleção de grupos das habilidades automáticas. Uma horda numerosa podia consumir todos os alvos de Ceifa do Véu, Nova de Fogo, Golpe da Sombra e outros efeitos agrupados, deixando o guardião sem ser atingido.

Na R85, se **Priorizar chefes** estiver selecionado, houver chefe ativo e ele estiver no **alcance real de aquisição**, o sistema reserva a **primeira entre as áreas que a habilidade já lançaria** para ele. As áreas restantes continuam selecionando os grupos mais densos. Não aumenta a quantidade de conjurações, raios, impactos ou multiplicadores. O modo **Alvo mais próximo** conserva a seleção anterior. O foco em chefes não ignora o alcance e não teleporta golpes.

## 2. Ira do Mártir não duplica o acerto principal

Na R84, durante a Ira, cada ataque básico tinha o impacto direto **e** a explosão de 40% de dano acertando novamente o próprio alvo, inclusive chefes. Na R85, o alvo principal recebe apenas o impacto direto, enquanto os demais inimigos próximos continuam recebendo o dano da explosão. O multiplicador de dano físico, a frequência de ataque e os efeitos de área existentes não foram ampliados. Isso corrige uma fonte de dano duplicado que favorecia especialmente lutas contra chefes.

## 3. Ceifa do Véu distingue alvos previamente amaldiçoados

Na R84, se qualquer inimigo dentro do círculo estivesse amaldiçoado, o bônus de **18%** era aplicado a todos os inimigos daquele círculo, inclusive aos que não tinham a marca. Agora o bônus vale **individualmente somente para os alvos que já estavam amaldiçoados no momento do impacto**. A habilidade continua marcando inimigos depois do impacto, preservando a sinergia com a Maldição do Véu e os próximos golpes. A quantidade de áreas, alcance e dano-base da Ceifa não aumentaram.

## O que NÃO mudou

- Nove habilidades disponíveis, árvore de 210 nós, pontos e regras de desbloqueio.
- Curvas-base de dano/HP de inimigos, fases, mundos, prestígio, relíquias, ouro, experiência, drops, equipamentos, pets, heróis e pergaminhos.
- Formato e campos do save; nenhuma migração exigida.
- Sprites, spritesheets, PNGs, áudio, assets da interface, servidor, clans/raids.
- Modo de teste/laboratório, sem novas ferramentas.

**Nota de balanceamento:** as duas correções de dano reduzem as ocorrências injustificadas de dano em contextos específicos (Ira contra o alvo principal e Ceifa contra alvos não amaldiçoados). A reserva de alvo para chefes melhora a consistência tática do foco manual, sem criar impactos adicionais. Não é uma calibração global de dificuldade.

## Testes realizados

- R85: **8/8** testes específicos de foco, alcance, impacto único de Ira, sinergia de maldição e preservação de assets.
- Regressões R84–R70 selecionadas no comando `npm run test:current`: **108/108** verificações (incluindo as 8 R85), com expectativas antigas de hashes ajustadas apenas para excluir o módulo de combate intencionalmente modificado. Os hashes dos arquivos restantes continuam verificados.
- Servidor: **18/18** testes.
- Build offline: **22 scripts válidos, 16 PNG e 3 WAV** embutidos, sem referências externas de recursos.
- Smoke test em runtime: campanha iniciada, quatro habilidades ativas, execução de 12 segundos simulados, avanço de fase e abates sem erro.
- Integridade: em comparação com R84, **251 arquivos herdados idênticos**, 14 arquivos modificados intencionalmente e nenhum arquivo herdado removido (antes da inclusão desta documentação). Assets e fontes de servidor preservados byte a byte.

**Limitações:** não foram executadas partidas longas com saves legítimos no Mundo V ou validação visual no navegador Windows físico. Portanto, esta revisão não demonstra equilíbrio final de todas as builds. Recomenda-se exportar o save antes de atualizar e experimentar as duas prioridades de alvo, a Ira contra guardiões e a sinergia Maldição + Ceifa.

## Como jogar

Extraia completamente o ZIP no Windows e abra `ABRIR_JOGO.bat` ou `VEILFALL.html`. Na aba Mundo, troque entre **Alvo mais próximo** e **Priorizar chefes**. A nova seleção também será usada pelas habilidades automáticas de busca de grupos.
