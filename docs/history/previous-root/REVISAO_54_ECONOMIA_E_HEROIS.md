# VEILFALL — Revisão 54: economia de Relíquias e transcendência em massa

**Base:** Revisão 53. Esta revisão substitui as fórmulas de Relíquias, Artefatos e Golpe das Sombras em caráter experimental e amplia a função do botão coletivo de Heróis.

## Problema reproduzido

Na R53, uma simulação de prestígio na fase 1.170 conseguia descobrir cerca de **103 artefatos** em uma única operação, com mais de um milhão de níveis somados, em razão da curva de Relíquias e da queda do custo relativo das descobertas. O resultado era incompatível com a intenção de repetir prestígios para progredir.

Na R54, usando a mesma referência de fase e a rotina de investimento de teste, foram descobertos **42 artefatos** e obtidos **92.987 níveis somados**. Esses números dependem da estratégia de investimento e NÃO são uma previsão de um jogador humano.

## Mudanças econômicas

| Fórmula / mecânica | R53 | R54 |
|---|---:|---:|
| Relíquias por fase avançada | ×1,052 | ×1,024 |
| Base da recompensa de prestígio | 5 | 9 |
| Descoberta de artefato | 12 × 1,73^n | 12 × 1,86^n |
| Bônus percentual de Todos os Artefatos | 0,095 × nível^0,72 | 0,070 × nível^0,60 |
| Inflação de custo após nível 250 | ×1,003 por nível adicional | ×1,0043 por nível adicional |
| Ressonância de Artefatos | Multiplicador independente pelo total investido | Desativada |
| HP inimigo após fase 2.000 | +2,73% por fase | +3,00% por fase |
| Golpe das Sombras: fator de dano base | 3× | 1,75× |
| Golpe das Sombras: gatilhos automáticos | 3,5/s + bônus | 0,8/s + bônus limitado |

O All Artifact Damage já era um bônus percentual **somado entre artefatos e aplicado uma única vez**; essa semântica foi mantida, mas sua curva foi suavizada. Não alterar para multiplicação de bônus individuais.

### Migração de salvamentos

- Coleção e níveis de artefatos já adquiridos são preservados; não apagamos recompensas de jogadores.
- O **saldo não gasto de Relíquias** de uma campanha R53 é convertido uma única vez pela relação entre as curvas antigas e novas, usando o pico registrado no último prestígio quando disponível.
- A conversão é idempotente e grava `relicEconomyVersion: 2`.
- Jogadores com artefatos excepcionalmente elevados na R53 continuarão proporcionalmente à frente de um salvamento novo; para comparar fielmente as curvas, utilize **um espaço de campanha novo**.
- Exporte o salvamento antigo antes de atualizar.

## Heróis: botão coletivo agora transcende

O botão passou a chamar **UPAR / TRANSCENDER TODOS · 100% DO OURO**.

Ao acioná-lo:
1. Transcende qualquer herói já no nível 8.000, sem cobrar ouro.
2. Compra o maior número de níveis possível conforme o custo marginal dos 32 heróis, gastando até 100% do ouro disponível.
3. Se algum herói alcançar 8.000 como resultado dessas compras, transcende esse herói na mesma operação.
4. Continua evoluindo heróis recém-transcendidos se sobrar ouro suficiente.
5. Preserva níveis pagos acumulados, preço de evolução, marcos e bônus já obtidos; não duplica transcendências ao clicar sem novas compras.

A compra **automática passiva** a cada 10 segundos simulados continua respeitando a reserva de ouro para habilidades, e não faz transcendências sozinha. O botão coletivo é a ação explícita que realiza o processo em massa.

## Testes executados

- `node tools/test-balance-r54.cjs`: 14/14 verificações.
- `node tools/test-heroes-r54.cjs`: 10/10 verificações de transcendência em massa, pós-transcendência, preservação e salvamentos.
- `node tools/test-qol-r53.cjs`: 27/27 verificações de regressão.
- `node tools/build-standalone.cjs` e `node tools/check-build.cjs`: HTML independente compilado e validado (6 scripts, 8 PNGs e 3 áudios WAV).
- `TESTE_NAVEGADOR_R54.json`: 6/6 verificações no Chromium, sem erros JavaScript; clique real no botão validado.

## Limitações importantes

Esta é uma correção direcionada ao abuso de Relíquias e ao excesso de ativação do Golpe das Sombras, não um certificado de balanceamento definitivo. **Não houve conclusão automatizada de 120.000 fases cobrindo as cinco dificuldades**. Serão necessários testes de jogo prolongados com salvamentos novos e antigos, diferentes builds, taxas reais de drops, múltiplos prestígios e todas as fontes de poder.

Nenhum recurso gráfico ou sonoro original foi modificado. A campanha permanece offline. Clãs e raids não foram implementados nesta revisão.
