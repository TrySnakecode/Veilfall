# VEILFALL R70 — Guardiões de Fase, Sobrevivência e Drops Únicos

## Escopo

Base R69. A R70 **não refaz** a Constelação R68 (210 nós/245 conexões), não restaura a compra de níveis das habilidades ativas e não altera os sistemas ou recursos de Clãs/Raids.

## 1. Chefe obrigatório em todas as fases

- Após o número habitual de abates da fase, um **Guardião da Fase** surge e bloqueia a passagem até sua derrota.
- O chefe utiliza os três arquétipos e sprites aprovados: Carrasco, Profanador e Arauto.
- A morte do guardião de fase é o único gatilho de avanço normal. Exceção intencional: o laboratório de hordas V ×24.000 continua sem chefes para testes de stress.
- No estágio 249/499/etc., o Guardião de Limiar existente ainda precisa ser derrotado **antes** do Guardião da Fase; eles não concedem avanço automático isoladamente.
- Chefes especiais de equipamentos/conhecimento/espectro mantêm seus eventos e recompensas únicas, mas agora devem ser vencidos antes de o guardião de fase permitir o avanço, se estiverem agendados.
- Mundos I–IV exigem derrotar também o Guardião da Fase 24.000 para liberar o Prestígio de Mundo. Saves antigos que já alcançaram 24.000 mantêm essa conquista.
- Recomeçar uma corrida após prestígio requer vencer novamente os guardiões de fase; a área de registro já conquistada continua disponível por viagem/retorno ao recorde.

## 2. Combate e dificuldade

- Vida dos inimigos cresce em quatro trechos suaves: 4,7% por fase até 55, 5,0% até 250, 4,6% até 2.000 e 3,7% dali em diante. Valores de projeto para esta revisão; exige novas simulações de longo prazo.
- A ameaça de dano não deixa de crescer arbitrariamente na fase 350; contatos continuam aumentando ao longo das fases, com teto de dano proporcional à vida do jogador para evitar mortes instantâneas indevidas.
- Chefes de fase possuem cerca de 6× a 16× a vida do inimigo comum; chefes convencionais e de Limiar continuam com a escala diferenciada.
- Os chefes recebem aumento moderado de ameaça conforme a duração do confronto.
- Roubo de vida do cavaleiro: cura por impacto limitada a 1,8% dos PV máximos; orçamento regenerado de 4,5% dos PV máximos por segundo, limitado a reserva de 9%. Isso impede que bilhões de dano curem toda a barra instantaneamente.
- Defesa e redução de dano existentes permanecem; dano individual ainda possui limites de segurança por golpe. O cavaleiro pode morrer por pressão sustentada.
- Enquanto houver Guardião de Fase, o ataque básico e o movimento automático o priorizam para não perder minutos caçando inimigos comuns infinitos.

## 3. Equipamentos e economia

- **Nenhum drop de equipamento** em fases antigas (fase inferior ao maior estágio registrado para aquela dificuldade).
- Mesmo na fase inédita, há no máximo **um equipamento obtido de monstros** por fase, permanentemente.
- A cada múltiplo de 15, o Guardião de Equipamentos concede **uma tentativa de sorteio** por fase inédita, mesmo quando o sorteio resulta sem item; sem rerolls.
- Removido o reaparecimento de guardiões de equipamento a cada 45 segundos.
- Retornar a uma fase antiga permite receber ouro e experiência, mas não novos equipamentos. Produção da Vila e forja continuam como sistemas separados e inalterados.
- Marcas `gearMonsterClaims` e `gearBossClaims` por dificuldade/fase são persistidas no save, evitando duplicatas após reiniciar ou prestigiar.
- Salvamentos R69: o maior estágio já registrado serve como fronteira histórica. Fases anteriores nunca concedem itens retroativos. Todo o restante do progresso é mantido.

## 4. Compatibilidade

- Mesmo namespace `veilfall_web_v1_` e mesmo formato principal de save; nova chave `balanceR70Version=1` com duas tabelas pequenas de recompensas e controle de chefe final dos quatro mundos.
- Arte existente, sprites, áudio, Raid e servidor copiados sem modificação.
- 210 nós multinível, 27 transformações, habilidades ativas sem compra de níveis, guildas e armas de heróis seguem intactos.
- Os laboratórios conservam saves isolados, e a simulação V 24.000 mantém seu modo horda sem gate obrigatório.

## 5. Validação

- Teste R70: 14 cenários de avanço, chefe, limite de drops, migração, dano, roubo de vida e conclusão de mundo passaram.
- Testes de regressão R69 10/10, R68 18/18, QoL R53 27/27 e Clãs/Raids 18/18 passaram.
- Compilação portátil: 18 scripts parseados, 16 PNG e 3 WAV incorporados.
- Três simulações de 20 minutos sem prestígio e com auto-compra de heróis: máximos entre 56 e 64, com 0–1 derrota. Isso é observação controlada de curta duração, NÃO prova de balanceamento do endgame ou de clientes reais.
- O ambiente automatizado bloqueou a abertura Chromium por política de navegação; portanto, não há validação manual de navegador ou Windows físico nesta revisão.

## Limitações conhecidas

- Os 5 mundos até 24k, todas as combinações de passivas e os retornos pós-prestígio ainda precisam de testes de progressão longos; a dificuldade pode exigir reajustes.
- O jogador ainda pode obter cédulas vendendo itens já existentes, usando a Forja ou a Vila. A medida anti-farm restringe exclusivamente **drops novos de combate**, conforme solicitado.
