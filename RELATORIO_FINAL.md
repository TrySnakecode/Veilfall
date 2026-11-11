# RELATÓRIO FINAL — VEILFALL R101

**Base:** R100 com contas, clãs, raids, salvamento em nuvem e interface online preparados para homologação.

**Escopo entregue:** redução da produção da Vila, diferenciação do valor de madeira/pedra/ferro, custos especializados das construções, reforço do escalonamento de pets, pergaminhos e armas de heróis, remoção e migração segura de dois pets indesejados.

Consulte `BALANCEAMENTO_R101.md` para tabelas completas, fórmulas, cenários numéricos e regras de migração.

## Arquivos de jogo alterados

- `src/game.js`: novas taxas e preços, novos custos de construção, fórmula de pets, fórmula de scrolls e migração automática dos pets antigos.
- `src/data.js`: remoção de Reliquary (`p30`) e Omen (`p32`).
- `src/r52-core.js` e `src/r52-ui.js`: novo escalonamento das armas dos heróis, com painéis atualizados.
- `index.html` e `src/r75-ui.js`: indicação da revisão R101.
- `tests/r101-balance.cjs`: novos testes de balanceamento, economia, migração e integração.
- Testes legados ajustados nas asserções intencionalmente afetadas pelo novo balanceamento; checksums de artes e motor de raid continuam preservados.

## Qualidade e situação pública

Esta atualização preserva intencionalmente as regras do combate, os valores de HP e ouro dos inimigos, as relíquias por prestígio, o motor autoritativo de raid e o fator ×2 das coleções de armas. A atualização também preserva o armazenamento de campanhas da R100. A instalação pública, o e-mail transacional real e a validação antitrapaça de rankings individuais continuam pendentes, conforme `RELATORIO_R100.md` e `GUIA_PUBLICACAO.md`.

### Testes

Resultados de execução atualizados ao gerar o pacote: consultar também `BALANCEAMENTO_R101.md`.

## Resultados verificados em 11/11/2026

| Comando | Resultado |
|---|---|
| `node tests/r101-balance.cjs` | **10/10 PASS** |
| `npm run test:current` | **PASS** (todas as revisões históricas incluídas no script) |
| `npm test` | **25/25 PASS** (backend) |
| `npm run build` | **PASS** (HTML independente, 32,92 MiB) |
| `npm run check` | **PASS** (27 scripts, 19 PNGs e 3 WAVs) |
| `npm run build:web` | **PASS** (frontend estático, API não configurada no build local) |

Os comandos acima foram executados realmente neste ambiente. Teste público de envio de e-mail e hospedagem remota não foi realizado, porque dependem de infraestrutura e credenciais externas.
