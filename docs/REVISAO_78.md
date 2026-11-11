# VEILFALL — Revisão 78: Ameaça contínua, sem teto de dano

**Base:** R77 — Desafio e Prestígio. **Escopo:** dano recebido do contato de inimigos e ataques especiais dos chefes. **Nenhuma arte foi modificada.**

## Pedido atendido

O valor **104,40 PV** era **60% de 174 PV**, limite aplicado a um boss no cenário de teste com cavaleiro de nível 70 (e sujeito a outros fatores). Não era um valor constante para qualquer cavaleiro. Entretanto, o teto proporcional aos PV máximos fazia o crescimento real do dano parar ao atingir esse limite, inclusive em níveis avançados.

### Alterações

1. Removido o limite `maxHealth() × .33` usado para contato de inimigos normais e elites e `maxHealth() × .60` utilizado no contato de chefes.
2. Removido o segundo limite `maxHealth() × .60` aplicado aos golpes especiais sinalizados dos chefes.
3. Substituída a curva externa que aumentava brutalmente na fase 251 (`exp(250 × log(1.035))`) por uma curva contínua com início em 55, reforço até 250 e crescimento progressivo após 250, incluindo os cinco mundos.
4. O dano base cresce usando como **referência** a vida-base esperada de um cavaleiro, não a vida máxima efetiva do jogador. A vida do cavaleiro **não define um teto** para o ataque.
5. O crescimento de referência respeita o teto real de nível 60.000. Depois dele, a ameaça ainda cresce com um multiplicador logarítmico sem teto. Não se usa um nível fictício acima do limite para multiplicar o dano desproporcionalmente.
6. A passagem entre mundos é contínua no dano de ataque. O próximo mundo já é substancialmente mais difícil graças ao multiplicador de **100× de vida dos inimigos** que existia na R77; não adicionamos um salto extra de 2,65× no dano por mundo.
7. Defesa (`mod('defense')`), redução de dano (limite próprio de 75%), vida máxima, invulnerabilidade por acerto, telegráficos dos chefes, ataques enfurecidos e demais sistemas de combate continuam ativos e não foram reescritos.

## Dano de chefe em contato: Mundo I, sem defesa/redução, boss sem enrage

| Fase | R77 | R78 |
|---:|---:|---:|
| 55 | 43,82 | 43,82 |
| 56 | 44,87 | 44,86 |
| 75 | 68,34 | 67,37 |
| 100 | 94,18 | 92,42 |
| 150 | 104,40 (teto) | 137,70 |
| 200 | 104,40 (teto) | 184,00 |
| 250 | 104,40 (teto) | 235,51 |
| 251 | 104,40 (teto) | 235,93 |
| 500 | 104,40 (teto) | 551,58 |
| 1.000 | 104,40 (teto) | 1.475,54 |
| 5.000 | 104,40 (teto) | 24.910,69 |
| 12.000 | 104,40 (teto) | 142.682,78 |
| 24.000 | 104,40 (teto) | 594.277,02 |

> Comparação ilustrativa **com cavaleiro nível 70** e nenhum modificador de defesa, apenas para manter a referência fixa. A R77 limitava o contato com base nos PV do cavaleiro; os valores da R78 dependem da fase e do mundo, não do nível do cavaleiro. O dano real recebido ainda sofre modificações de defesa/redução. A referência de nível 70 não é uma build que consegue jogar normalmente na fase 24.000.

## Verificação de sobrevivência no endgame (cenário teórico)

| Referência | Vida-base do cavaleiro | Contato do chefe, sem reduções | Após 75% de redução (sem defesa extra) |
|---|---:|---:|---:|
| Mundo I, fase 24.000, cavaleiro nível 24.000 | 744.039 PV | 594.277 PV | 148.569 PV |
| Mundo V, fase 24.000, cavaleiro nível 60.000 | 4.559.949 PV | 11.936.941 PV | 2.984.235 PV |

Esses valores são **teóricos**, antes de bônus de vida, defesa de equipamentos e enrage. Indicam que sobreviver continua exigindo investir em defesa e PV, mas golpes sem proteção podem matar com um único acerto. Os ataques especiais também respeitam o dano crescente e aplicam seu multiplicador específico.

## Regressão, preservação e limitações

- **12 testes R78**: continuidade 55/56 e 250/251, monotonicidade até Mundo V e estágio 200.000, dados base, dano de chefes, defesa, vida, economia, saves e integridade dos assets.
- **40 testes de regressão**: R72, R71, R70.
- **18 testes de servidor e Raids**.
- Build offline e validação de **21 scripts, 16 imagens PNG, 3 áudios WAV**; abertura no Chromium e início de campanha sem erros.
- Todos os **52 arquivos** de assets, servidor, módulos e regras que não deveriam mudar conferidos por SHA-256 com a R77.
- Nenhuma mudança nos sistemas de prestígio, custos, chance de drop, HP de inimigos, ouro, XP, habilidades, sprites, servidor ou formato de salvamento.
- Uma tentativa de executar uma simulação estendida de campanha excedeu o tempo de execução, portanto **não há validação suficiente do ritmo de grinding até a fase 24.000** ou das cinco campanhas inteiras. O teste é uma calibração técnica, não uma garantia de progressão ideal em jogo real.

### Como jogar

No Windows, extraia o ZIP e abra `ABRIR_JOGO.bat` ou `VEILFALL.html` offline. Faça **Exportar Save** na versão anterior antes de substituir a pasta. O formato do save não mudou.
