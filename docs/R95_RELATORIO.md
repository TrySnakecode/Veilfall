# VEILFALL R95 — Heróis, Pets, Pergaminhos e Potência dos Equipamentos

**Base:** R94, sem reconstruir sistemas nem alterar mídia original.  
**Escopo:** correção de uma propriedade existente que não tinha efeito, comparação de itens e leitura da tela de Pets.  
**Data:** 04/11/2026.

## Diagnóstico confirmado no código da R94

A propriedade `gear`, exibida como "Potência dos equipamentos", era fornecida pelo pet **Forgeling (p31)**, pelo pergaminho **Escritura de Talven (s23)**, pelos artefatos **Estandarte dos Ossos Silentes (a081)** e **Cinzel do Martirizado (a087)**. Ela também aparecia na especialidade de **Talven, o Ferreiro (h23)**, embora não recebesse contribuição própria dos seus marcos. O motor calculava `mod('gear')`, mas nenhuma fórmula de combate consumia esse valor para fortalecer peças equipadas. Assim, melhorar essas fontes não tornava os equipamentos mais fortes.

## Solução implementada na campanha

1. `equipmentPrimaryMultiplier()` converte as fontes `gear` em bônus sobre o atributo principal de **cada peça equipada**, com retorno decrescente e teto de **+6% no multiplicador**: `1 + min(0.06, 0.012 × ln(1 + max(0, totalStatSource('gear') − 1)))`.
2. O bônus se aplica ao valor principal efetivo das peças — incluindo o principal especializado do Capacete e os atributos principais progressivos dos Únicos — mas **nunca** aos afixos secundários, aos bônus próprios de heróis, pets, pergaminhos e conjuntos ou ao valor da Aura em si.
3. A amplificação existente da Aura só atua sobre o atributo principal de sua peça-alvo, como já era a regra; não amplifica a Potência dos Equipamentos nem seus afixos secundários.
4. Os marcos de Talven passam a contribuir modestamente para `gear` (marcos de atributo já existentes, sem compras ou níveis adicionais). Seu bônus passivo de classe continua intacto.
5. `mod('gear')` retorna a amplificação realmente aplicada (por exemplo, ×1,03), em vez de exibir um multiplicador bruto que não representava o ganho sobre o equipamento.
6. A comparação de equipamentos passa a examinar também os atributos principais que podem mudar quando um afixo legado `gear` é trocado, evitando uma classificação enganosa de peça igual.
7. A tela de Pets não altera `g.petSelected` durante a simples renderização. As opções já existentes de seleção, aquisição e carregamento continuam normalizando os slots quando necessário. As telas de Pets e Pergaminhos esclarecem o limite do novo efeito.

**Exemplo controlado:** com Arma de principal Físico +80%, pet Forgeling nível 100, Escritura de Talven nível 100, Talven nível 8.000 e artefato a081 nível 80, o multiplicador `gear` medido foi de aproximadamente **×1,0366**; a arma teve aumento apenas de sua contribuição principal, sem alterar os afixos. Este é um teste artificial de fórmula, não uma build de campanha validada.

## Balanceamento e salvamentos

- A correção **aumenta até 6% a contribuição dos atributos principais dos itens** para jogadores que desenvolvam as fontes de Potência dos Equipamentos; não é neutra em poder. O ganho de dano/vida total do cavaleiro depende da proporção de seus bônus que vem de equipamentos. O teto limita o risco de crescimento explosivo, mas não comprova equilíbrio nos cinco mundos.
- Permaneceram intactos: vida/dano e IA dos inimigos e chefes, chances de drop, moedas, recompensas de prestígio, custos, graus, raridades, conteúdo dos 32 heróis, 32 pets, 32 pergaminhos e 106 artefatos, níveis, calendários de produção, peças de conjunto, e o código do servidor.
- Saves antigos mantêm **namespace e esquema `version:1`**. Nenhum item é recortado, rerrolado ou migrado. Nenhum progresso é apagado.

## Validação executada

- **R95:** 9/9 verificações novas: fonte ausente, contribuição das cinco fontes, teto, independência dos afixos, principal do Capacete, prévia de troca, save/load, renderização pura e hashes de arte.
- **Regressão de jogo (R95–R70 selecionadas): 210/210 testes passaram**, com atualização de verificações legadas de título de R94 para R95, sem desativar testes funcionais.
- **Servidor/clãs/raids:** 18/18 testes passaram (`npm test`).
- **HTML offline:** `npm run build` e `npm run check` passaram; 22 scripts, 16 PNGs e três WAVs incorporados.
- **Runtime:** campanha de 25 segundos simulados com Arma, pet e pergaminho equipados; 8 abates, nenhuma exceção de execução.
- **Integridade:** em relação ao ZIP R94: 299 arquivos herdados, 286 idênticos, 13 alterados intencionalmente (código, textos, versionamento, testes, HTML recompilado), **0 removidos**. **42 arquivos de mídia preservados byte a byte** (confira `docs/R95_INTEGRIDADE.json`).

### Limitações

Ainda não foi concluída validação manual em Windows físico nem uma campanha legítima até o Mundo V; portanto, não afirmamos que o endgame esteja totalmente equilibrado. O teto de +6% é uma proteção técnica conservadora a ser acompanhada após testes reais. A verificação no navegador físico e a percepção visual da interface continuam pendentes.

## Uso

1. Exporte um backup do save anterior.
2. Extraia todo o ZIP e abra `ABRIR_JOGO.bat` ou `VEILFALL.html`.
3. No menu de Pets, veja Forgeling; em Pergaminhos, Escritura de Talven; em Heróis, Talven. Seus níveis antigos passam a ter efeito sobre as peças equipadas.
4. Consulte `Equipamentos` para comparar os atributos principais com e sem essas fontes; a ausência de equipamento não concede força adicional.
