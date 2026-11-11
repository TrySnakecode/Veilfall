# VEILFALL — R79 | Laboratório com save real e auditoria de dificuldade

**Base:** R78 — ameaça contínua e dano sem teto.  
**Prioridade:** separar QA de poder máximo/estresse de medição válida de dificuldade.  
**Status:** ferramentas de diagnóstico implementadas; **sem alteração de balanceamento** da campanha.

## Por que foi necessário

O modo antigo `TESTAR V · FASE 24.000` não simula uma campanha legítima:
- entrega nível 24.000 e maximiza passivas;
- oferece 32 heróis em nível 8.000 e transcendência 120;
- maximiza artefatos, pets e pergaminhos, preenche conjuntos e concede recursos artificiais;
- recalibra separadamente ataque físico, Fé e Magia para **90% da vida de um inimigo comum** na fase 24.000 do Mundo V (Mundo I: 80%);
- omite guardiões da fase e de limiar no cenário do Mundo V, permitindo avanço por hordas.

O relato de endgame fácil ocorreu com **esse botão**, portanto não prova que a campanha normal esteja fácil ou difícil.

## R79 — novo modo `TESTAR MINHA BUILD · SAVE ATUAL`

Disponível no menu principal e no painel `Mundo` durante a campanha.

1. Carrega a campanha existente no espaço 1 pelo fluxo normal quando iniciado no menu; se o jogo já está carregado, usa o estado ativo.
2. Antes do teste, copia todo o estado do save e as cinco carteiras do jogo **para a memória**.
3. Mantém o nível atual do cavaleiro, fase, mundo, habilidades, talentos, heróis, transcendências, equipamentos, itens, relíquias, artefatos, pets, pergaminhos e construções **sem criar recompensas nem aumentar força**.
4. Desativa apenas o `farm fixo` temporariamente para permitir observar a progressão dos guardiões; o estado original é restaurado na saída.
5. **Não teleporta** o jogador para uma fase que ele não alcançou. O teste genuíno da fase 24.000 exige usar/importar um save que tenha chegado naturalmente àquela fase.
6. Mantém obrigatórias as condições normais de avanço, incluindo chefe de fase e guardião dos marcos a cada 250 fases; não usa `trialPower` além de multiplicadores unitários (`×1`).
7. Bloqueia gravações de progresso durante o laboratório; ao sair, restaura os dados anteriores e reinicializa o encontro de combate. Nenhum drop, XP, relíquia, equipamento ou avanço do teste fica no save.
8. Exibe no painel `Mundo` métricas da sessão: fase inicial/fase atual, abates, mortes, prestígios e segundos simulados.

**Detalhes:** ao clicar no laboratório pelo menu, carregar o save pode atualizar normalmente a produção offline (a mesma ação do botão Continuar Jornada); *depois de entrar no laboratório* nada é persistido. A batalha em andamento, posições dos inimigos e recargas são reiniciadas ao entrar/sair, enquanto o progresso de campanha é restaurado.

## Poder máximo / estresse (preservado)

- `PODER MÁXIMO I · 23.999`: cenário antigo com força e coleções artificiais, guardião de limiar.
- `PODER MÁXIMO V · 24.000 (SEM CHEFES)`: cenário antigo de limpeza de hordas, sem o ciclo de guardiões, com o dano calibrado.
- `CONFRONTAR OS TRÊS CHEFES`: prévia visual mantida.

Esses cenários agora estão rotulados explicitamente como **não representativos da dificuldade real**. O motor antigo permanece inalterado para QA visual e testes de desempenho.

## Testes efetuados

- R79: **6/6** testes de uso do save real, multiplicadores `×1`, guardião obrigatório, restauração sem gravação, preservação do antigo laboratório e hashes de assets.
- R78: **12/12** testes de dano, continuidade das fases, economia, saves, integridade de sistemas e gráficos (apenas a asserção do rótulo da versão foi atualizada para R79).
- R72: **10/10** testes; R71: **16/16** testes; R70: **14/14** testes.
- Servidor/clãs/Raids: **18/18** testes Node.
- Compilação standalone: 21 scripts, 16 PNGs e 3 WAVs incorporados, sem referências externas de recursos.
- Navegador Chromium headless: abertura do menu, início de campanha, entrada/saída de build real e laboratório V, sem erros de página, save original inalterado após alterações feitas somente no teste.

## Arquivos de código alterados

- `src/game.js` — modo de diagnóstico com save real, restauração, métricas e rótulos.
- `index.html` — seleção de modos no menu e número da versão.
- `src/r75-ui.js` — título e rodapé da R79.
- `tests/r78-core.cjs` — somente asserções de versionamento atualizadas.
- `tests/r79-core.cjs` e `tools/smoke-r79-browser.py` — novos testes.
- `package.json` — versão e inclusão dos testes R79.
- `VEILFALL.html` — gerado do código modular, mantendo todas as imagens e áudios originais.

**Não foram alterados:** fórmulas de vida dos monstros, dano recebido, dano-base do cavaleiro, economia, prestígios, artefatos, itens, heróis, habilidades, drops, salvamentos, sprites, PNGs, sons e código de rede.

## Limite da auditoria

O modo novo fornece um teste fiel **ao save em que foi iniciado**, e não uma simulação de aquisição natural de recursos desde o começo. Não foi executado um percurso validado de milhares de prestígios até o Mundo V; não seria correto concluir a partir deste pacote se o endgame normal está fácil ou difícil.

**Próxima etapa de balanceamento:** realizar testes com saves avançados conquistados normalmente, ou agentes de campanha que obedeçam a custos, tempo, drops e regras de prestígio, e registrar morte, abates, tempo para matar inimigos/chefes, relíquias por ciclo e tempo para avançar fases. Somente então aplicar mudanças conjuntas de progressão, sem enfraquecer os inimigos isoladamente.

## Uso

No Windows, extraia o ZIP inteiro e abra `ABRIR_JOGO.bat` ou `VEILFALL.html`. Faça `EXPORTAR SAVE` para manter uma cópia de segurança antes da atualização. No menu, clique em **LABORATÓRIO DE COMBATE → TESTAR MINHA BUILD · SAVE ATUAL**; ou abra a aba `Mundo` e use o mesmo teste. Escolha **SAIR DO TESTE** para restaurar sua jornada.
