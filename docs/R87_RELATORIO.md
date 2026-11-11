# VEILFALL R87 — Equipamentos, escolhas de build e recompensas

**Base:** R86 — Combate automático e sinergias.  
**Objetivo:** melhorar as decisões de equipamento dentro da campanha, sem ampliar o laboratório e sem facilitar o combate.

## 1. Comparação efetiva no inventário

A comparação antiga mostrava «MELHOR/PIOR» com base no atributo principal, sem considerar os demais efeitos da troca; em várias situações isso induzia escolhas erradas. Agora, na aba **Equipamentos**, uma peça candidata é comparada ao item atualmente equipado no mesmo slot, exibindo a variação de cada atributo efetivo.

- **GANHOS SEM PERDAS** quando ao menos um atributo calculado aumenta e nenhum diminui.
- **PERDAS SEM GANHOS** quando há apenas perdas.
- **TROCA DE ATRIBUTOS** quando há simultaneamente ganhos e perdas; não há «pontuação única» enganosa para build diferente.
- **SEM MUDANÇA EFETIVA** quando a troca não afeta os atributos após os limites do sistema.
- **INCONCLUSIVA** quando o valor de um atributo não pode ser calculado como número finito.

Inclui os efeitos principais, afixos secundários, limits de suporte, chance de crítico, multiplicadores de classe dos **heróis realmente desenvolvidos**, e o efeito da **Aura só sobre o atributo principal da peça-alvo**, nunca sobre seus afixos. A prévia **não equipa**, não salva, não compra e não vende nenhuma peça. Mostra atributos, não prevê automaticamente DPS global, sinergia de habilidades, economia futura ou resultados de combates.

Um bônus de Capacete não aparece como «ganho no combate» se não existir contribuição passiva real de heróis da classe correspondente. A classificação respeita a quantidade efetiva após as fontes e tetos de suporte.

## 2. Proteção opcional de ganhos na venda automática

Novo botão **PROTEGER GANHOS SEM PERDAS**, desligado inicialmente em todas as campanhas (inclusive saves anteriores):

- Só atua se o jogador também tiver marcado a raridade do item para **venda automática**.
- A primeira peça obtida em um slot que estava **vazio** é guardada e favoritada.
- Quando já existe um item equipado, guarda e favorita um candidato apenas se a prévia confirmar **ganhos efetivos sem perdas**.
- Trocas mistas, estatísticas iguais e itens sem melhoria clara continuam seguindo a regra anterior de venda automática.
- O favorito protege a peça também da venda em massa, como sempre. Para vendê-la manualmente, basta desfavoritar.
- A verificação ocorre **antes da rotina de inventário cheio (240 itens)**, impedindo que a nova peça protegida seja descartada por lotação.

Se o botão permanecer desligado, **a venda automática continua exatamente como na R86**. O estado é salvo no campo opcional booleano `autoSellProtectUpgrades`. Saves anteriores carregam com ele `false`; nenhuma migração destrutiva foi necessária.

## 3. Afixo legado sem efeito de combate

Encontramos o afixo de Aura **dos Selos**, que utiliza o atributo `gear` (Potência dos equipamentos). O motor expõe `mod('gear')`, porém não aplica esse multiplicador nas fórmulas efetivas de dano, vida ou poder de equipamentos. A R87 informa essa limitação ao exibir a peça e **não conta tal afixo como uma melhoria efetiva**. Não atribuímos força adicional a esse afixo nesta revisão para não desequilibrar a campanha inadvertidamente. A definição futura dessa propriedade precisa ser revisada com as dependências de balanceamento.

## 4. Proteções mantidas

Não houve alterações em: curvas de vida ou dano de inimigos, ataques de chefes, velocidade do combate, atributos reais do cavaleiro, fórmulas de afixos, chances de drop, raridades e qualidades, grau dos equipamentos, conjuntos, Ouro, XP, relíquias, prestígios, heróis, pets, pergaminhos, habilidades, níveis, progressão por mundos, rede/clãs/raids, sprites, animações, PNGs, áudio ou namespace de salvamento.

A nova preferência é **opcional e retrocompatível**. As versões anteriores e suas regras são mantidas quando ela está desligada.

## 5. Validação efetuada

- **R87: 15/15 testes** específicos: ganho/perda mistos, afixos, limites, Aura, heróis sem investimento, afixo `gear` inativo, ausência de mutação, venda padrão, opt-in, proteção na lotação, save antigo e painel de equipamentos.
- **Regressão geral: 131/131 verificações de jogo**, contando R87 e as suítes R86–R70 selecionadas.
- **Servidor: 18/18 testes Node**.
- HTML offline compilado por `npm run build` e verificado por `npm run check` (**22 scripts, 16 imagens PNG, 3 arquivos WAV incorporados**, sem recursos externos necessários ao jogo).
- Verificação de comparação byte a byte com o ZIP da R86: **257 arquivos originais idênticos, 14 arquivos alterados intencionalmente e nenhum removido** antes de adicionar este relatório. As **19 mídias PNG/WAV e os quatro arquivos de servidor/shared auditados permaneceram idênticos**.
- Teste funcional de interface por motor simulado: cinco categorias de inventário com 200 itens renderizaram em aproximadamente 116 ms no ambiente de desenvolvimento. É um resultado local, não uma promessa de desempenho no Windows.

**Limitações:** não foi realizado um teste manual em Windows físico nesta execução. As mudanças não comprovam balanceamento final dos cinco mundos ou do endgame; não foi produzida uma campanha legítima da fase 24.000 para validá-lo. As mudanças são na experiência cotidiana do inventário, não nas fórmulas de força.

## 6. Como utilizar

1. Exporte o save da versão anterior.
2. Extraia o ZIP e execute `ABRIR_JOGO.bat` ou `VEILFALL.html`.
3. Abra **Equipamentos** e compare uma peça à equipada no mesmo slot; trocas com ganhos e perdas são marcadas como **TROCA DE ATRIBUTOS**.
4. Se desejar, marque as raridades para vender e ative **PROTEGER GANHOS SEM PERDAS**. O padrão continua desligado, evitando mudanças inesperadas.
5. Mantenha os itens importantes favoritos e faça uma cópia de segurança do save antes de substituir arquivos de jogo.
