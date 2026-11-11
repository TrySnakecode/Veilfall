# VEILFALL R82 — Auditoria de prestígio e economia

**Base:** R81 — Diagnóstico de dificuldade.  
**Objetivo:** obter evidências quantitativas sobre o ritmo de grind e o retorno dos prestígios, com o **save real** isolado.  
**Dificuldade da campanha:** inalterada. **Nenhum asset foi editado.**

## Implementações

1. O laboratório **TESTAR MINHA BUILD · FASE ATUAL** registra agora cada prestígio efetivamente concluído (até 200 eventos detalhados), incluindo tempo simulado, mundo, fase máxima atingida, fase de retorno, requisito de próximo prestígio, número acumulado de prestígios e recompensa em notação log10.
2. Registra o total de relíquias recebidas em prestígios no laboratório e o total efetivamente gasto, ambos em log10 para suportar os valores enormes do jogo sem perda numérica. Números log10 não devem ser somados como quantidades lineares.
3. Acompanha **descobertas e níveis comprados de artefatos** e a quantidade de artefatos no início e no fim da sessão. As despesas ocorrem na cópia temporária do save.
4. Adiciona às amostras periódicas os dados de investimento em artefatos e relíquias, para observar como o poder e os custos evoluem durante o teste.
5. Amplia o diagnóstico no painel Mundo para exibir os principais dados de economia. O JSON exportado agora usa esquema `veilfall-lab-r82-v1` e filename `VEILFALL_R82_TESTE_M…_F….json`.
6. O analisador compartilhado calcula ganho de pico entre ciclos, mediana do tempo simulado entre prestígios, variação logarítmica de recompensa e sinais de estagnação. Alertas são **apenas indícios**, sem rebalanceamento automático.
7. Incluído `tools/analisar-relatorio-r82.cjs` para diagnóstico offline. Aceita relatórios de R80/R81/R82 e identifica corretamente ausência de dados econômicos nos anteriores.

## Como testar

- Abra `ABRIR_JOGO.bat` ou `VEILFALL.html`, entre em uma campanha e vá até **Mundo → TESTAR MINHA BUILD**.
- Faça uma sessão prolongada que inclua **dois ou mais prestígios**; compre artefatos e evolua-os durante o laboratório, como faria numa campanha normal. O jogador pode testar com velocidade ×100, lembrando que os tempos são **simulados**.
- Antes de sair, use **EXPORTAR RELATÓRIO · JSON**, e então **SAIR DO TESTE · RESTAURAR**.
- Para ler localmente: `node tools/analisar-relatorio-r82.cjs caminho-do-relatorio.json --output=auditoria.md`.
- Faça backup de seu save antes de atualizar o jogo. A R82 mantém o formato de save anterior.

## Validação

- R82: **8/8** testes novos, cobrindo esquemas R80-R82, rejeição de QA artificial, análise de ciclos, truncamento de eventos, execução real de prestígio e compra de níveis de artefatos, exportação JSON e restauração idêntica do save.
- Regressão do jogo: R81 **10/10**, R80 **9/9**, R79 **6/6**, R78 **12/12**, R72 **10/10**, R71 **16/16**, R70 **14/14**. Total de testes do jogo: **85/85**.
- Servidor, clãs e raids: **18/18** testes automatizados. Total geral: **103/103**.
- `npm run build` e `npm run check`: **22 scripts, 16 PNGs e 3 WAVs** incorporados ao HTML standalone, sem dependências externas de runtime.
- Auditoria contra ZIP R81: **250 arquivos originais, 240 idênticos, 10 alterados intencionalmente e nenhum ausente**. Todos os arquivos em `assets/` e `server/` foram preservados byte a byte.

### Arquivos herdados alterados intencionalmente

- `VEILFALL.html`
- `index.html`
- `package.json`
- `shared/telemetry-analysis.js`
- `src/game.js`
- `src/r75-ui.js`
- `tests/r78-core.cjs`
- `tests/r79-core.cjs`
- `tests/r80-core.cjs`
- `tests/r81-core.cjs`

### Limitações

- Não existe um conjunto suficiente de saves endgame **alcançados legitimamente** nem relatórios longos exportados por jogadores. Os testes de motor não provam se a dificuldade é ideal no Mundo V/fase 24.000.
- O código da campanha não foi rebalanceado: vida dos inimigos, dano, relíquias concedidas, custos, heróis, itens, pets, pergaminhos, habilidades, regras dos chefes, raids e saves permanecem intactos.
- A simulação automatizada da telemetria usou cenários controlados. O download final em navegador Windows físico **ainda necessita validação manual**; em revisões anteriores o Chromium do ambiente bloqueou a navegação local.
- O laboratório representa um recorte de uma campanha, não recria a aquisição natural de recursos desde o começo e não deve ser confundido com o botão sintético de poder máximo.

**Próximo objetivo:** receber ao menos uma exportação JSON da R82 obtida após alguns prestígios, avaliar tempos reais de luta, ritmo de relíquias e o ganho efetivo de força por ciclo. Só então decidir mudanças de balanceamento global, sem facilitar inimigos isoladamente.
