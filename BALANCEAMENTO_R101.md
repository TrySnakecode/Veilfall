# VEILFALL R101 — Balanceamento da Vila e da Progressão

Data: 11 de novembro de 2026. Base: VEILFALL R100. Este documento descreve as regras implementadas, não uma promessa de que toda a curva do endgame foi homologada por uma comunidade.

## 1. Vila: produção e valor dos recursos

A produção depende exclusivamente do nível da construção, tal como antes. Foram alteradas as taxas-base **por segundo simulado** em jogo e em progresso offline (máximo de 24 horas, segundo a regra preexistente).

| Material | Antes: un./s/nível | R101: un./s/nível | Antes: un./h (nível 1) | R101: un./h (nível 1) | Venda R100 | Venda R101 |
|---|---:|---:|---:|---:|---:|---:|
| Madeira | 0,028 | 0,016 | 100,8 | 57,6 | 0,6 | 0,7 |
| Pedra | 0,028 | 0,010 | 100,8 | 36,0 | 1,9 | 2,2 |
| Ferro | 0,028 | 0,006 | 100,8 | 21,6 | 4,2 | 5,5 |

Valores de venda em cédulas **por unidade**. A produção equivalente em cédulas, caso todos os materiais sejam vendidos, cai de **675,36/h** para **238,32/h** por conjunto de construções nível 1 (**−64,7%**). O ferro é o material mais valioso e também o mais difícil de produzir. Não houve alteração dos preços dos baús.

## 2. Custos de construção

A regra de custo foi alterada de «30 unidades de cada recurso, crescendo com o nível» para uma cesta de materiais específica por construção. O valor de cada recurso em cada melhoria é `ceil(custo_base * 1,45^(nível_atual - 1))`.

| Construção | Madeira | Pedra | Ferro |
|---|---:|---:|---:|
| Serraria | 70 | 28 | 12 |
| Pedreira | 26 | 70 | 18 |
| Mina | 24 | 32 | 60 |
| Santuário de Feras | 30 | 30 | 30 |
| Igreja | 30 | 30 | 30 |
| Ferraria | 30 | 30 | 30 |

Os custos exibidos no painel e descontados da carteira são os mesmos. Se faltarem materiais, a compra é recusada. O escalonamento de nível, o tempo de produção de pets, de pergaminhos e de forja e seus limites anteriores permanecem inalterados.

## 3. Pets

Dois pets de suporte foram removidos do catálogo de sorteios e da interface:

- **Reliquary (p30)**: removido o efeito `relic` de pets. Seus níveis antigos são convertidos em **Aegis (p19)**, bônus de defesa.
- **Omen (p32)**: removido o efeito `drop` de pets. Seus níveis antigos são convertidos em **Eclipsebud (p28)**, bônus de dano contra chefes.

A conversão é idempotente: remove os IDs aposentados depois da transferência e não duplica os níveis em recarregamentos posteriores. A escolha de pet equipado também é migrada. O catálogo agora possui **30 pets**, com os 32 pergaminhos e as 32 armas de heróis preservados. Não foram removidos efeitos de relíquias de **outras** fontes do jogo.

**Fórmula anterior:** `base = 0,115 * nível^1,075`; passivo = `base * min(1, nível/100)`; equipado = `base * (1 + min(0,25, 0,04 + 0,002*nível))`.

**Fórmula R101:** `base = 0,165 * nível^1,085`; passivo = `base * min(1, 0,08 + 0,92*nível/85)`; equipado = `base * (1 + min(0,33, 0,08 + 0,0025*nível))`.

Os pets ganham importância mais cedo, com crescimento reforçado em níveis altos. Limites efetivos globais de atributos de suporte (como defesa e mana), assim como o teto de potência dos equipamentos, foram preservados deliberadamente: alcançar o limite impede ganhos adicionais naquela estatística específica.

## 4. Pergaminhos

**Fórmula R100:** `0,029 * nível * (1 + 0,021 * nível_mínimo_do_conjunto^0,85)`.

**Fórmula R101:** `0,041 * nível * (1 + 0,052 * nível_mínimo_do_conjunto^0,78)`.

O ganho inicial por cópia aumenta de 2,9% para 4,1% antes de caps, além de aumentar a influência do menor nível da coleção. O número de pergaminhos, o sistema de menor nível e a forma de obtê-los foram preservados.

## 5. Armas dos heróis

O bônus individual da arma que amplifica a contribuição passiva do herói mudou de `1 + 0,15*nível` para `1 + 0,23*nível^1,04`:

| Nível | Multiplicador individual R100 | Multiplicador individual R101 |
|---:|---:|---:|
| 0 | ×1,00 | ×1,00 |
| 1 | ×1,15 | ×1,23 |
| 10 | ×2,50 | ×3,52 |
| 100 | ×16,00 | ×28,65 |

A coleção completa segue com **×2 por conjunto de 32 armas**. As armas continuam não aumentando dano de raid; a regra é aplicada somente ao buff passivo do herói na campanha. Nenhuma alteração foi feita na validação de combate do servidor ou na distribuição de armas de raid.

## 6. Verificação integrada

Na simulação isolada com as mesmas condições de cenário no runtime real da R100 e R101 (Mundo I, estágio 350, nível do cavaleiro 350, pet físico p01, pergaminho físico s01, arma h01, um herói h01), observou-se:

| Pet p01 / Scroll s01 / Arma h01 / Herói h01 | Mudança no dano físico R101 × R100 |
|---|---:|
| 0 / 0 / 0 / 40 | ×1,00 |
| 2 / 2 / 1 / 100 | ×1,15 |
| 5 / 5 / 3 / 300 | ×1,35 |
| 20 / 20 / 10 / 1000 | ×1,85 |
| 100 / 100 / 30 / 3000 | ×2,44 |

Esses resultados são comparações controladas de atributos, **não** representam uma simulação completa de centenas de horas, nem garantem equilíbrio em todas as builds. A economia de artefatos, relíquias por prestígio, níveis dos inimigos, progressão por mundos, drops e loot de raid não foram alterados.

## 7. Validações

Executar na raiz do projeto:

```bash
node tests/r101-balance.cjs
npm run test:current
npm test
npm run build
npm run check
npm run build:web
```

Os testes R101 verificam a produção em jogo/offline, a hierarquia de preço, os custos e compras, a ausência dos dois pets removidos, migração idempotente dos saves, reforço dos buffs e invariância do motor das raids. Os testes históricos foram atualizados somente quando suas asserções verificavam fórmulas ou arquivos que mudaram explicitamente nesta revisão.

## 8. Limitações herdadas da R100

O jogo offline roda localmente, mas a publicação com contas reais ainda requer backend remoto com armazenamento persistente e configuração de e-mail. O ranking individual de fases declarado pelo cliente **não é validado competitivamente**. Esta revisão é uma atualização de balanceamento, não uma homologação de infraestrutura nem proteção antitrapaça absoluta.
