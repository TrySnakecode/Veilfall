# VEILFALL — Revisão 51 (visual R49 sobre motor R50)

## Escopo estrito

Transposição de toda a camada visual enviada em `VEILFALL_WEB_R49_VISUAL_WINDOWS(1).zip` para a última versão de gameplay `VEILFALL_WEB_REVISAO_50_WINDOWS.zip`.

**Não alterar balanceamento ou sistemas da R50.** `src/game.js` e `src/data.js` foram extraídos do HTML distribuído da R50. Os três áudios foram referenciados como arquivos locais de byte idêntico e são reinseridos pelo empacotador, sem mudança de conteúdo.

## Camada visual da referência

- `src/base.css`, `src/visual.css`, `src/polish.css`: totalmente preservados da referência visual.
- `src/visual.js`, `src/polish.js`: preservados da referência visual.
- Arena, atlas atualizado do cavaleiro, sprites, ícones e áudio: preservados da referência visual.
- 48 quadros de animação do cavaleiro, limpeza de bordas durante renderização, VFX e melhorias de HUD.

O `VEILFALL.html` final foi gerado pelo script `tools/build-standalone.cjs` sobre essa combinação. O HTML pode ser aberto offline. O código de gameplay distribuído deve ser idêntico ao da R50, excluindo apenas espaço em branco e encapsulamento dos mesmos áudios.

## Integridade

Os bytes do código da R50 foram preservados no script principal, e os ativos visuais foram mantidos sem redimensionar, redesenhar ou gerar nenhum sprite adicional nesta revisão. O pacote de origem visual já contém um atlas do cavaleiro diferente do antigo; essa escolha corresponde exatamente ao pedido de transferir o design do pacote enviado.

## Resultado da validação

- **43/43 testes automatizados aprovados** no Chromium.
- Gameplay (`src/game.js`) e catálogo (`src/data.js`) byte-for-byte iguais à extração normalizada da R50.
- Todos os recursos sob `assets/` byte-for-byte iguais ao pacote visual enviado.
- Jogo abriu e iniciou nova campanha sem erros JavaScript; 12 abas verificadas.
- Não testado no Windows físico nem simulado até o fim da dificuldade V.
