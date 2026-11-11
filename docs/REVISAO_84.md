# VEILFALL — Revisão 84 | Padrões de chefes e combate

**Base:** VEILFALL R83. **Escopo:** jogabilidade real dos chefes. Nenhuma modificação no laboratório.

## Alterações visíveis na campanha

1. **Carrasco:** a partir da etapa II alterna a pancada circular tradicional com uma **varredura direcional**. A faixa se estende 1,65 vezes o raio do ataque e tem largura de 90% desse raio. O jogador pode se afastar ou sair pelas laterais antes de 1,25 s.
2. **Profanador:** na etapa III coloca três selos escalonados ao invés de dois, com resoluções em 1,28, 1,55 e 1,82 s. Os lacaios já existentes mantêm o limite de seis e continuam sem conceder XP/ouro.
3. **Arauto do Eclipse:** na etapa III alterna o ataque secundário circular com um **anel de eclipse** próximo ao chefe. O centro (até 42% do raio) e o espaço além do raio são seguros. O anel resolve em 1,62 s. A janela de vulnerabilidade existente (1,8 s, +40% de dano recebido) continua funcionando.
4. **Telegráficos fiéis:** os avisos circulares eram desenhados como elipses com 60% da altura do raio, enquanto a colisão usava círculos completos. Agora o contorno circular mostra a **exata área de colisão que já existia**. Varredura e anel possuem colisão própria correspondente ao desenho. Não há acertos fora da área sinalizada.
5. Os padrões novos reutilizam o motor Canvas de efeitos e as cores aprovadas; **nenhum sprite ou arte foi redesenhado**.

## O que permaneceu igual

- Vida e dano dos inimigos, fórmula de ameaça R78, resistência, defesa, invulnerabilidade de contato, enrage, cooldown base por fase e ataque comum.
- Prestígio, recompensas, custos, ouro, equipamentos, artefatos, talentos, pergaminhos, pets, heróis, mundos, limites de drops e estrutura de save.
- Modos de teste, exportação de JSON, telemetria, clãs e raids.
- Todos os arquivos em `assets/`, `server/` e `shared/` são idênticos à R83.

## Testes concluídos

- **9/9** testes novos R84: geometrias circulares e direcionais, anel com zona segura, alternância do Carrasco e Arauto, três selos do Profanador, aplicação real de dano apenas na área marcada, estabilidade da economia e hashes dos assets.
- **91/91** testes de regressão das versões R83, R82, R81, R80, R79, R78, R72, R71 e R70. (Total jogo: **100/100**.)
- **18/18** testes de servidor Node.
- `npm run build` e `npm run check`: HTML offline gerado, **22 scripts, 16 PNGs e três arquivos de áudio embutidos**; sem dependências runtime externas.
- Integridade comparada diretamente ao ZIP original R83: **249 arquivos herdados idênticos**, 12 modificados, **nenhum removido**. Um manifesto SHA-256 dos assets/código compartilhado preservado está em `docs/R84_IMMUTABLE_ASSETS.json`.

## Limitações importantes

- O teste automatizado da geometria e dos eventos dos chefes passou no motor real, mas a **verificação manual da interface em navegador Windows físico está pendente**. O Chromium deste ambiente retorna `ERR_BLOCKED_BY_ADMINISTRATOR` ao abrir arquivos locais.
- Não foi realizada uma campanha longa até a fase 24.000. A R84 **não** pretende recalibrar o endgame; muda os padrões de combate dos chefes.

## Uso

No Windows: descompactar o ZIP e executar `ABRIR_JOGO.bat` (ou abrir `VEILFALL.html`). Faça backup via **Exportar Save** antes de usar a nova versão. Durante chefes, mova-se com **WASD** para esquivar das áreas telegráficas. O combate automático, as habilidades e os sistemas de progressão continuam como antes.
