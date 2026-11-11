# VEILFALL — Revisão 86 | Combate automático, foco e sinergias

**Base:** R85 (habilidades e builds).  
**Objetivo:** corrigir decisões de combate que reduziam a eficiência real das builds sem aumentar seu poder por multiplicadores ou facilitar a economia.

## Alterações na jogabilidade

### 1. Ataque básico e prioridade de chefes

Na R85, a opção **Priorizar chefes** fazia o ataque básico escolher um chefe mesmo quando ele estava longe demais para o golpe. Isso podia impedir o cavaleiro de atingir monstros que já estavam ao seu lado. Na R86, o ataque básico prioriza o chefe **somente quando estiver no alcance real** do golpe. Caso contrário, ataca o inimigo próximo que estiver ao alcance. Não aumenta a quantidade nem o dano dos ataques e não modifica a movimentação do cavaleiro.

### 2. Conjuração ofensiva automática com alvo alcançável

Na R85, habilidades automáticas podiam gastar mana e iniciar recarga quando existiam monstros na arena, mas nenhum estava no seu alcance de aquisição. Agora, **Graça Celestial, Golpe da Sombra, Maldição do Véu, Nova de Fogo, Coração de Brasas e Ceifa do Véu** aguardam existir ao menos um alvo vivo no alcance real da respectiva habilidade antes de serem conjuradas automaticamente. Os buffs **Ira do Mártir, LEGION e Foco Arcano** preservam a ativação anterior; a conjuração manual continua permitida. Nenhum cooldown, duração ou custo foi modificado.

### 3. Ceifa do Véu e áreas sobrepostas

Na R85, a Ceifa verificava corretamente a maldição antes de cada *impacto*, mas podia aplicar uma maldição no primeiro círculo e, ao acertar novamente o mesmo inimigo no segundo círculo da mesma conjuração, já receber o bônus de 18%. Agora o conjunto de alvos previamente amaldiçoados é registrado **antes de toda a conjuração**. Somente esses alvos recebem o bônus naquela conjuração. Marcas aplicadas durante o ataque continuam valendo para conjurações futuras. Limites de acerto e número de áreas inalterados.

## Sistemas preservados

Não foram alterados os dados de nove habilidades, árvore de passivas, fórmulas de dano-base, vida dos inimigos, ataques dos chefes, cooldowns, custos de mana, prestígios, relíquias, XP, economia, equipamento, drop, pets, heróis, pergaminhos, nível máximo, formato do save, clãs, raids ou laboratório. Nenhum sprite, imagem, som ou asset foi editado.

## Testes efetuados

- **R86:** 8/8 verificações novas (foco dentro/fora de alcance, foco no mais próximo, reserva de mana/cooldown, conjuração com alvos alcançáveis, buffs de suporte, sinergia de maldição por conjuração, integridade).
- **Regressões R85–R70:** 108/108 verificações; total dos testes de jogo **116/116**.
- **Servidor/clãs/raids:** 18/18 testes.
- `npm run build` e `npm run check`: HTML offline validado com **22 scripts, 16 PNGs e 3 WAVs** incorporados.
- Teste de execução do motor: 10 segundos simulados, quatro habilidades equipadas, 16 abates, cinco conjurações, avanço de fase 1 → 2, nenhuma exceção.
- Comparação byte a byte com ZIP R85: **256 arquivos originais idênticos**, 12 arquivos alterados intencionalmente (código, título, testes e documentação), **nenhum arquivo removido**, mais testes/documentação novos. Arte/áudio permanecem intactos.

## Limitações

Os testes automáticos e o teste breve do motor não substituem uma sessão manual de Windows físico, nem demonstram o equilíbrio das builds no endgame. Não foi realizado um teste visual no navegador Windows físico nesta execução. Nenhuma afirmação de equilíbrio global foi feita.

## Para jogar

Extraia o ZIP e abra `ABRIR_JOGO.bat` ou `VEILFALL.html`. Exporte uma cópia do save antes de atualizar. Experimente **Mundo → Priorizar chefes** quando houver hordas ao lado do cavaleiro e um chefe mais distante. A Ceifa funciona melhor com maldições já aplicadas **antes de sua conjuração**.
