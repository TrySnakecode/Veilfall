# VEILFALL R81 — Diagnóstico de dificuldade com amostras reais

**Base:** R80 — telemetria do laboratório. **Escopo:** apresentar indicadores e analisar exportações; **sem rebalancear o combate**.

## Modificações

1. Adicionado o módulo compartilhado `shared/telemetry-analysis.js`, executável em navegador offline e Node, para análise determinística de relatórios `SAVE_REAL_SEM_BONUS`.
2. O painel **Mundo → Laboratório → TESTAR MINHA BUILD** exibe agora: chefes derrotados, fases vencidas, mortes, mediana da duração de chefes e fases por 10 minutos simulados. Também mostra até dois avisos de amostra insuficiente ou anomalia observada.
3. O relatório **VEILFALL_R81_TESTE_M…_F….json** mantém os campos da R80, acrescentando `analysis` com indicadores, qualificações de amostra e sinais de investigação. O novo esquema é `veilfall-lab-r81-v1`; o analisador continua aceitando relatórios R80.
4. Adicionado o analisador portátil `node tools/analisar-relatorio-r81.cjs arquivo.json --output=diagnostico.md`. Não é necessário enviar o save, apenas o JSON exportado pelo laboratório.
5. Os testes sintéticos de poder máximo continuam separados e não são aceitos pelo analisador como dados legítimos.

## Critérios do diagnóstico

- **Menos de 5 minutos simulados:** insuficiente para julgamento geral.
- **Menos de 5 chefes derrotados:** insuficiente para caracterizar os confrontos.
- **Mediana de chefes ≤3 segundos (com ≥5 chefes):** possível limpeza de chefes rápida.
- **Mediana de chefes ≥120 segundos:** possível gargalo de dano ou desafio intencional.
- **≥10 minutos, nenhuma fase e ≥2 mortes:** possível estagnação.
- **≥10 minutos e ≥5 mortes:** derrotas frequentes.
- **≥10 minutos, ≥30 fases, zero mortes e mediana de chefes ≤6 s:** possível trecho com pouca resistência para a build testada.

Os limiares são **sinais para investigação**, não metas oficiais de balanceamento nem prova de que o jogo está fácil ou difícil. Com mais de 500 chefes, o log detalhado pode ficar truncado; o diagnóstico avisa disso. A progressão completa de artefatos, gotas, prestígios e builds ainda precisa de dados legítimos.

## Verificações realizadas

- **R81: 10/10** testes novos (esquemas R80/R81, QA sintético rejeitado, amostra insuficiente, chefes rápidos/lentos, estagnação, eventos truncados, pureza, integração ao motor e exportação JSON simulada).
- **Regressão anterior: R80 9/9, R79 6/6, R78 12/12, R72 10/10, R71 16/16, R70 14/14.**
- **Servidor: 18/18** testes.
- **Build offline:** `npm run build` e `npm run check` — 22 scripts, 16 PNGs e três WAVs embutidos e íntegros.
- **Integridade da R80:** 235/245 arquivos idênticos; dez arquivos de código, testes, identificação ou documentação foram alterados intencionalmente. Os PNGs, áudios, sprites, arquivos do servidor e mecânicas não relacionadas foram mantidos byte a byte.
- O analisador de linha de comando foi executado sobre um relatório JSON válido produzido pelo motor de testes, e gerou um Markdown.
- **Teste Chromium:** não concluído. Este ambiente retorna `ERR_BLOCKED_BY_ADMINISTRATOR` tanto para `file://` quanto para servidor `http://127.0.0.1`. O download foi validado em execução simulada de APIs do navegador, **não** em Windows físico.

## Preservação e limitações

Nenhuma mudança em: HP dos inimigos, dano dos chefes, DPS do cavaleiro, economia, relíquias, prestígio, heróis, talentos, pets, pergaminhos, drop, equipamentos, sprites, arte, áudio, clãs, raids ou formato do salvamento. O módulo novo analisa dados do teste **sem gravar no save**.

A R81 não demonstra o equilíbrio dos mundos I–V ou da fase 24.000. Para validar o endgame, precisamos de um JSON exportado durante o modo **TESTAR MINHA BUILD** em um save que tenha chegado naturalmente à fase de interesse.

## Uso no Windows

1. Exporte um backup do seu save na versão anterior.
2. Extraia completamente o ZIP e execute `ABRIR_JOGO.bat`.
3. No menu **Mundo**, abra o laboratório **TESTAR MINHA BUILD**.
4. Teste com seu save; consulte o diagnóstico, exporte o JSON e clique **SAIR DO TESTE · RESTAURAR**.
5. Compartilhe o JSON para análise comparativa; evite o botão **PODER MÁXIMO** quando o objetivo for validar a campanha.
