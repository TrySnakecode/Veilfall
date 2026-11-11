# VEILFALL · Revisão 57 — Códice das Habilidades

## Base
Derivada EXCLUSIVAMENTE da `VEILFALL_WEB_REVISAO_56_ARTEFATO_WINDOWS.zip` (R56 aprovada, sem a especialização de ouro não aprovada da outra R56). Sprites, efeitos, mapas, áudio e spritesheets existentes preservados byte a byte.

## Interface de Habilidades
- Códice unificado com três abas: Físico, Magia e Fé.
- Cada aba possui três ramificações reais ligadas ao tronco da afinidade: habilidade ofensiva esquerda, especialização de ouro + habilidade de suporte ao centro, habilidade ofensiva direita.
- Cada último nó de cada ramificação mantém o talento especial da habilidade existente (18º talento). Não foram apagados IDs, níveis ou efeitos antigos.
- Nós com estados distintos (bloqueado, disponível, investido, maximizado), detalhes e custo de próximo rank, pré-requisitos de progresso e reembolso por um ponto ou por afinidade.
- A ficha do talento selecionado é fixa no topo do painel quando se rola a árvore, facilitando o investimento.
- O catálogo de habilidades e equipamento das quatro habilidades continua disponível pelo botão `LISTA DE HABILIDADES / EQUIPAR`.

## Ramificações
| Afinidade | Esquerda | Centro | Direita |
|---|---|---|---|
| Físico | Graça Celestial | Ouro de Monstros/Chefes + Ira do Mártir | Golpe da Sombra |
| Fé | Maldição do Véu | Ouro das Fadas + LEGION | Lança da Aurora |
| Magia | Nova de Fogo | Ouro Chesterson + Foco Arcano | Tormenta Elétrica |

## Bônus de Ouro
- Um novo talento específico (5 ranks) no topo da trilha central de cada classe.
- Cada rank aumenta EXCLUSIVAMENTE a fonte correspondente em ×1,34 composto. No rank 5, ×4,32 aproximadamente.
- Físico: ouro de monstros comuns e chefes.
- Fé: ouro das fadas.
- Magia: Chesterson, um pequeno tesouro concedido com 2,8% de chance ao eliminar inimigos comuns, que equivale ao ouro-base ×30 antes das melhorias; não substitui Mimics nem altera seus drops.
- As fontes não são desativadas: investir pontos, Artefatos, pets e equipamentos determina a especialização da build. Não existe seletor forçado de ouro.
- O talento de ouro torna-se elegível no nível da primeira habilidade da afinidade; demais talentos continuam obedecendo ao nível da habilidade associada.

## Compatibilidade
- `TREE_SP_VERSION` permanece 3. Todos os 162 talentos existentes permanecem válidos, com os mesmos IDs; novos nós são opcionais para a especialização final de quem já tinha saves antigos.
- Inclusão de três novos talentos na árvore, sem redefinir as árvores nem remover os investimentos anteriores.
- Auto-evolução de heróis, artefatos R56 e sistema geral da campanha permanecem intactos.

## Testes
- `TESTES_REVISAO_57.json`: 20 verificações de interface, 3 abas, ligações finais, fontes de ouro isoladas, restabelecimento de pontos e importação de estado R56.
- `tools/test-artifact-r56.cjs`: 11/11.
- `tools/test-artifact-discovery-r55.cjs`: 11/11 + 900 sequências.
- `tools/test-balance-r54.cjs`: 14/14.
- Validação de build: 6 scripts, 8 PNGs embutidos e 3 WAVs, sem dependências online.
- Teste histórico `tools/test-balance-r52.cjs`: 395/396, falha somente no caso de Ressonância de Artefatos, removida propositalmente em R54.
- Não foi efetuada simulação completa da progressão até a dificuldade V nem teste em Windows físico.

## Como jogar
1. Extraia o ZIP por completo.
2. Execute `ABRIR_JOGO.bat` ou abra `VEILFALL.html`.
3. Entre na aba **Habilidades**, escolha Físico, Magia ou Fé e clique em um talento para consultar efeito, requisito e investir pontos.
4. Para comprar níveis/equipar habilidades ativas, clique em **LISTA DE HABILIDADES / EQUIPAR**.
5. Faça backup do salvamento da R56 antes de atualizar.
