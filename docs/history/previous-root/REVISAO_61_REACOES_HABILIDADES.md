# VEILFALL — Revisão 61: Reações de habilidades funcionais

**Base:** R60. A árvore contínua R60, os nove IDs originais de habilidades, os talentos, os salvamentos e as fórmulas dos sistemas não relacionados permanecem.

## Diagnóstico da R60
A implementação anterior criava efeitos de reação no array `effects` do combate. A camada visual substituta (`vEffects` R49) não desenhava esse array, portanto boa parte do encadeamento era invisível mesmo quando parte dos golpes era calculada. A Tormenta também aplicava sua rede completa imediatamente, sem mostrar progressão temporal.

## Correções
- **Lança da Aurora:** o abate causado pela habilidade enfileira uma lança adicional num inimigo próximo. Cada lança que mata pode continuar a corrente, com limite de até 18 alvos adicionais por conjuração, alcance local e redução gradual de dano. Apenas o golpe que matou determina a reação — não um acerto anterior da Lança.
- **Nova de Fogo:** explosão inicial e projéteis flamejantes reais que se movem até o alvo. Cada projétil explode em área pequena, pode ricochetear até três vezes e aplica dano via `hurt`. Até quatro projéteis gerados inicialmente; sem duplicação infinita.
- **Tormenta Elétrica:** dois arcos iniciais que saltam em sequência para até dois inimigos próximos por alvo, limitados a 16 alvos únicos inicialmente (até 24 com especializações). Cada salto aplica dano real e lentidão, com queda moderada de potência.
- **Graça Celestial:** mantém seus bônus e sinergias antigas, além de pulsos próprios de área a cada 1,15 s durante a duração e cura leve. Não depende do Golpe das Sombras.
- **Visuais:** o array de reações agora é desenhado realmente pelo renderizador: lanças, feixes de eletricidade, bolas de fogo em voo, explosões e pulsos. A duração visível usa tempo real, independente da velocidade da simulação. Limites de renderização evitam acúmulo excessivo.

## Testes
- Combate controlado de 26 inimigos, vida alta e baixa, para cada habilidade: 8 cenários no Chromium, sem erros de JavaScript.
- Lança: 17 alvos distintos com abates consecutivos no cenário de teste.
- Nova: 63 impactos, 20 alvos distintos e quatro bolas de fogo simultâneas com alvos resistentes.
- Tormenta: 16 inimigos distintos atingidos e danos escalonados no tempo.
- Graça: 20 impactos e 10 alvos distintos em aproximadamente 3,3 segundos de teste, sem Golpe das Sombras.
- Árvore da R60: três afinidades, 55 nós por aba, 12 abas do jogo e versões desktop e mobile, sem erros.
- Artefatos R56 11/11, descobertas R55 11/11, heróis R54 10/10, balanceamento R54 14/14.
- O teste histórico de QOL R53 26/27 possui a mesma falha herdada da R60, pois procura o botão de melhorar habilidade em uma posição antiga da interface, em vez da Lista/Equipar.
- 15 arquivos originais de assets idênticos aos da R60.

**Limites:** testes de combate sintéticos não são uma simulação completa até a dificuldade V. Não validado em Windows físico; teste no Chromium. Recomenda-se testar uma campanha nova e manter cópia de seu salvamento.
