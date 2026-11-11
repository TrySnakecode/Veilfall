# VEILFALL — Revisão 80 | Telemetria real de dificuldade

**Base:** R79 — laboratório de dificuldade.  
**Objetivo:** medir confrontos na campanha real sem confundi-los com o QA artificial. **Não há alteração de balanceamento da campanha.**

## Descobertas e correções do laboratório

A auditoria do código encontrou duas interferências remanescentes no modo `TESTAR MINHA BUILD` da R79:

1. O limite artificial de **2,5% do HP por acerto contra guardiões de limiar** era aplicado a todos os modos `endgameTrial`, incluindo a build real. Agora ele é aplicado **somente** aos modos de poder máximo artificiais. A campanha normal nunca teve esse limite.
2. `stageGearAvailable()` bloqueava algumas oportunidades normais de equipamento sempre que `testMode=true`; agora o teste com save real permite essas oportunidades *dentro da cópia temporária*, enquanto o QA artificial continua excluído. Nada se acumula após sair do teste.

Esses ajustes **não modificam** as fórmulas do jogo normal; tornam a amostra do laboratório mais fiel.

## Telemetria R80: TESTAR MINHA BUILD · FASE ATUAL

O novo botão **EXPORTAR RELATÓRIO · JSON**, na aba Mundo durante o teste real, registra:

- Mundo/fase/nível iniciais e finais; ataque físico, Fé, Magia, HP próprio e HP comum em escala log10.
- Duração simulada, fases vencidas, recuos, abates, mortes, prestígios e abates por minuto.
- Tipos e duração de cada chefe derrotado; média de duração de chefes.
- Eventos de mudança de fase/mundo e amostras de atributos a cada 15 s (depois a cada 60 s), com limite de tamanho.
- Recursos agregados como logaritmos, **sem exportar o save**, o inventário completo, identificação pessoal nem carteiras completas.

A sessão é uma cópia volátil do save. O arquivo JSON só é exportado por clique explícito; use **SAIR DO TESTE · RESTAURAR** depois de baixá-lo. O tempo é **simulado**, de modo que velocidade ×100 não significa tempo real equivalente.

## Verificações automatizadas

- **R80: 9/9** testes novos, incluindo isolamento da campanha, eventos de chefes, contagem de fases, ausência de dados brutos do save, download JSON via APIs simuladas e integridade de arquivos.
- **R79: 6/6** testes do laboratório anterior.
- **R78: 12/12** de dano, economia e compatibilidade.
- **R72: 10/10**, **R71: 16/16**, **R70: 14/14**.
- **Servidor/clãs/raids: 18/18** testes.
- Build standalone: **21 scripts, 16 PNGs e 3 WAVs**; verificação estática do HTML realizada.
- Integridade **SHA-256 de todos os 232 arquivos que deveriam permanecer inalterados em relação à R79**, verificada pelo teste portátil `tests/r80-core.cjs`. O manifesto está em `docs/R80_HASHES_BASE_R79.json`.

**Limitação:** nesta execução automatizada, a verificação do download pelo navegador Chromium não foi concluída: o ambiente bloqueou a navegação local e a alternativa por servidor excedeu o limite de execução. O caminho de geração do JSON foi testado com APIs de navegador simuladas. A validação manual do download em Windows ainda é necessária.

## Simulações de campanha, sem poderes de laboratório

Executado `tools/prestige-r76.cjs --seconds=1200 17 47` na R80, com decisões automáticas simples, compras pagas conforme as regras e prestígio **somente após morte/parada do avanço**, sem injeção de build de endgame:

| Seed | Tempo simulado | Recorde | Mortes | Prestígios |
|---:|---:|---:|---:|---:|
| 17 | 20 min | 62 | 1 | 0 |
| 47 | 20 min | 63 | 0 | 0 |

Agentes simplificados, sementes limitadas e duração curta. **Esses dados não avaliam o prestígio de longo prazo nem o endgame dos cinco mundos**. Eles tampouco demonstram que o jogo está fácil ou difícil em campanhas reais: a estratégia do agente difere da humana.

## O que deliberadamente NÃO mudou

- HP dos inimigos; dano de contato/especial; velocidade; chefes e requisitos das fases; recompensas e custos de prestígio; artefatos; habilidades; heróis; pets; pergaminhos; economia; equipamento da campanha; chances de drop; servidor; rede; formato do save; sprites; imagens e áudio.

## Próxima etapa concreta

1. Iniciar uma sessão **TESTAR MINHA BUILD** numa campanha alcançada normalmente, preferencialmente em um gargalo real.
2. Jogar por alguns minutos contra hordas e chefes, mantendo seu padrão normal de jogo.
3. Clicar **EXPORTAR RELATÓRIO · JSON** antes de sair e compartilhar esse arquivo para comparar dificuldade, mortes, chefes e velocidade de progressão.
4. Para auditar o Mundo V/fase 24.000 é necessário um save que tenha alcançado naturalmente esse estágio. O botão **PODER MÁXIMO V** permanece um teste sintético e **não prova a dificuldade normal**.

### Uso e salvamento

Extraia o ZIP no Windows e abra `ABRIR_JOGO.bat` ou `VEILFALL.html`. Faça **Exportar Save** antes de atualizar. O modo real não guarda ganhos; após sair tudo é restaurado ao estado anterior. O arquivo de diagnóstico é separado do save.
