# Revisão 56 — Apenas um Artefato de Relíquias

Base: Revisão 55, sem incorporar o sistema de especializações de ouro da revisão experimental anterior.

## Única alteração de mecânica
- **Memória do Retorno** (`a014`) continua como o único artefato de Relíquias por prestígio, garantido na quinta descoberta.
- **Fêmur do Voto Solene** (`a073`) mantém ID, níveis, custos e taxa de bônus, mas passa do efeito `relic` para `gold_boss` e do grupo Prestígio e Relíquias para Ouro e Descobertas.
- O bloqueio de descobertas até o 25º artefato, exclusivo do antigo bônus extra de Relíquias, foi removido para `a073`.
- Os textos da interface foram atualizados para refletir a mudança.

## O que não mudou
Sem seleção de fontes de ouro ou especializações. Sem alterações nos valores de prestígio, artefatos restantes, progressão, heróis, itens, salvamentos, sprites e áudio.

## Compatibilidade
Salvamentos existentes conservam o nível de `a073`; o mesmo nível passa a reforçar ouro de chefes. Não há migração destrutiva ou reembolso automático, pois a alteração é apenas de efeito.

## Testes
Ver `TESTES_REVISAO_56_ARTEFATO.json`, além dos testes de descoberta atualizados.
