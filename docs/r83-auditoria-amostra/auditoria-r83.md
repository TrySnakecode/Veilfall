# VEILFALL — R83 | Auditoria automatizada de campanhas

**Tipo:** simulação heurística com o motor real, não uma campanha humana ou prova do endgame.

**Duração:** 3 minutos simulados por cenário. **Sementes:** 17.

| Semente | Perfil | Fase máxima | Mortes | Prestígios | Fase 55 (min) | Fase 100 (min) |
|---:|---|---:|---:|---:|---:|---:|
| 17 | equilibrado | 11 | 0 | 0 | não alcançada | não alcançada |
| 17 | ofensivo | 11 | 0 | 0 | não alcançada | não alcançada |
| 17 | defensivo | 11 | 0 | 0 | não alcançada | não alcançada |

## Comparação com o perfil equilibrado

| Semente | Outro perfil | Diferença de fases | Diferença de mortes |
|---:|---|---:|---:|
| 17 | ofensivo | 0 | 0 |
| 17 | defensivo | 0 | 0 |

As diferenças são descritivas: representam decisões do agente, não poder absoluto de cada build.

**Atenção:** nenhum agente prestigiou; não é possível avaliar a economia de prestígio nesta amostra.

## Limitações de interpretação

- Todas as campanhas começam novas, sem bônus de laboratório, equipamentos inventados ou recursos externos.
- O agente usa compras automáticas e políticas simples de talentos/equipamentos. Não representa um jogador especialista.
- Prestígio só é considerado após bloqueio de avanço e elegibilidade, com intervalo mínimo entre decisões.
- Esses testes **não validam** os cinco mundos nem a fase 24.000; para isso são necessários percursos longos ou saves legítimos.
- A diferença entre perfis pode ser causada por suas escolhas específicas, não necessariamente por desequilíbrio do jogo.
- Nenhuma constante de vida, dano, recompensa ou custo foi alterada.
