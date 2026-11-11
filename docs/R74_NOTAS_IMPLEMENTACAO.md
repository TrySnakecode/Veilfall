# VEILFALL R74 — Interface Reformulada (inclui menu R73)

## O que foi implementado
- Menu principal independente da campanha, em tela cheia, sem HUD ou arena funcional visível atrás.
- Identidade dark fantasy renovada com tipografia, vinheta, emblema e efeitos CSS discretos.
- Continuar Jornada (último espaço utilizado), Nova Jornada (com confirmação já existente), Laboratório (3 cenários), Clãs/Raids/Treinamento e utilitários Configurações, Exportar Backup (JSON), Importar Backup (JSON), Créditos.
- Botão de retorno ao menu dentro da campanha. O jogo salva e pausa ao retornar, sem resetar a sessão; Continuar carrega o progresso salvo.
- HUD: melhor hierarquia na barra superior, chefe, arena, comandos de habilidades, painel de progressão, navegação, inventário e heróis, via CSS isolado.
- Preservação da geometria do botão Avançar e das linhas dos 32 heróis da R72.

## Invariantes preservadas
- Nenhuma mudança em matemática ou lógica de combate, progressão, habilidades, itens, árvore, economia ou Raids.
- Fontes de servidor, assets de arte/áudio e código compartilhado copiados sem alterações.
- Comportamento do laboratório e salvamentos reaproveitados.

## Testes executados
- Chromium 1440×900 e 390×844: menu tela cheia e HUD oculta atrás, Clãs/Raids, laboratório, sair do laboratório, iniciar/continuar campanha, voltar ao menu, avançar com alerta (0px de deslocamento), 32 cartões de heróis imóveis.
- Nenhum erro JavaScript nos cenários verificados.
- `node tests/r68-core.cjs`, `node tests/r70-core.cjs`, `node tests/r71-core.cjs`, `node --test tests/server/*.test.cjs`, `node tools/check-build.cjs` aprovados.
- Importação/exportação oferecidas em menu; recomende sempre backup antes de migrar de pasta ou de versão.
- Sem teste em Windows físico, nem teste exaustivo de comportamento em todas as resoluções/abas.

## Arquivos editados no código modular
`index.html`, `package.json`, `tools/build-standalone.cjs`.
Novos: `src/r74-ui.css`, `src/r74-ui.js`, `LEIA_ME_R74.txt`.
Regerado: `VEILFALL.html`.
Nenhum arquivo original de arte, áudio, servidor ou Raid foi modificado.
