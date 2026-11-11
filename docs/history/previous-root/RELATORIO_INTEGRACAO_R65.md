# VEILFALL — Revisão 65: integração sem alterar o pacote fornecido

## Bases
- Campanha e interface: Revisão 64.
- Clãs, Raids, Arsenal e visuais da expansão: `VEILFALL_R52_CORRIGIDO(1).zip`.
- O ZIP fornecido pelo usuário foi mantido intacto, e todos os 32 arquivos incorporados da expansão identificados na auditoria foram copiados byte por byte, sem edição.
- Os oito conjuntos de imagens da expansão (arena, três chefes, heráldica, técnicas e duas folhas de armas), além das imagens-fonte de raids, foram preservados.

## Compatibilidade
- **Nenhum arquivo pertencente à expansão copiada teve seu código ou arte modificados**. O adaptador `src/r65-bridge.js`, criado exclusivamente para esta integração, preserva a curva econômica original de rendimento passivo da R64 quando Armas de Heróis estão ativas. O título e o rodapé são identificados como R65.
- A R64 permanece a base da campanha; `src/game.js`, `src/polish.js`, habilidades Ceifa do Véu e Coração de Brasas, e seus efeitos não foram reescritos.
- O motor online usa as definições originais da expansão para danos de Raid, vida compartilhada e recompensas.
- O arquivo `VEILFALL.html` contém uma compilação portátil para treino offline; `index.html` e `INICIAR_SERVIDOR.bat` permitem executar o serviço real localmente.

## Testes realizados
- **18/18** testes automatizados do backend passaram, incluindo simultaneidade e persistência.
- Chromium: a compilação inline abriu sem erros; imagens da expansão foram carregadas; Clãs/Raids/Arsenal abriram; bônus de armas afetaram a contribuição dos heróis; alternar de volta à campanha funcionou.
- Não houve implantação em um servidor público nem validação em Windows físico. Os testes existentes da R64 foram preservados no pacote como histórico e não são contabilizados como testes novos da R65.

## Requisitos e limitações
- O serviço precisa de Node.js 24+ no Windows segundo o lançador original e funciona localmente; para clãs reais pela internet será preciso hospedar e proteger uma instância compartilhada.
- Salve uma cópia dos saves e dados do servidor antes de migrar.
- Para acessar via localhost, um save gerado sob `file://` pode precisar de exportação/importação manual por conta da separação de armazenamento dos navegadores.
