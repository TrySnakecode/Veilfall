# VEILFALL R83 — Comparação reproduzível de estratégias de progressão

**Base:** R82. **Escopo:** somente ferramenta local de auditoria automatizada e identificação de versão. **Jogo normal:** nenhuma mudança de fórmula, recompensa, regra ou arte.

## Por que esta revisão

A R82 registrava o progresso e a economia de um save real, mas ainda faltava uma comparação controlada entre diferentes decisões de build. A R83 acrescenta um agente de QA que inicia campanhas novas no motor de combate existente e compara três políticas simplificadas com as mesmas sementes aleatórias.

**Perfis:** equilibrado (dano, vida e ouro); ofensivo (dano, magia, crítico e velocidade); defensivo (vida, defesa, regeneração e dano). Cada um escolhe habilidades liberadas por nível, equipa somente itens possuídos e investe talentos respeitando o orçamento. Heróis são comprados pela automação já existente. Artefatos são descobertos e melhorados mediante gasto real de relíquias após um prestígio elegível.

**Proibições verificadas:** sem teleporte para fase avançada; sem injeção de ouro, relíquias, XP, itens ou níveis; sem `trialPower`; sem ativar `testMode` ou `endgameTrial`; sem alterar os limites de poder, vida, dano, prestígio e preços.

## Como executar

A partir da pasta do jogo, com Node.js instalado:

```bash
node tools/auditar-campanha-r83.cjs --seconds=300 --seeds=17 --out=relatorios
```

Para comparar um período maior, aumente `--seconds` (máximo 14.400 segundos simulados) e adicione sementes em `--seeds=17,47`. A execução longa consome CPU e não possui uma opção de pausa/retomada; resultados somente são gravados quando todos os cenários solicitados terminam.

A saída compreende `auditoria-r83.json` e `auditoria-r83.md`, com checkpoints por período, marcos alcançados, número de mortes, prestígios e progresso relativo entre perfis. O arquivo de relatório **não modifica saves**.

## Validação concluída

- 6/6 testes novos da R83: parâmetros, perfis, não uso de laboratório artificial, execução de jogo novo, geração de relatório e hashes herdados.
- 85/85 testes herdados de campanha/QA da R82 e anteriores, totalizando **91/91 testes da suíte de campanha**.
- 18/18 testes do servidor/clãs/raids (executados nesta revisão).
- Build offline: 22 scripts, 16 PNGs e três WAVs embutidos, `npm run build` e `npm run check` aprovados.
- Integridade SHA-256 verificada contra o manifesto de 232 arquivos preservados da R79, excetuando o builder já alterado na R81. Comparação adicional com o pacote R82 identifica todas as diferenças por arquivo.

### Amostra reproduzida

Semente 17, 180 segundos simulados por perfil:

| Estratégia | Fase máxima | Mortes | Prestígios |
|---|---:|---:|---:|
| Equilibrada | 11 | 0 | 0 |
| Ofensiva | 11 | 0 | 0 |
| Defensiva | 11 | 0 | 0 |

Arquivos: `docs/r83-auditoria-amostra/auditoria-r83.md` e `.json`.

**Limite:** nenhum perfil chegou à fase 55 nesse ensaio. Os resultados não são suficientes para julgar a economia de prestígio ou o equilíbrio do endgame. Uma bateria com três perfis de 10 minutos cada ultrapassou o limite de execução deste ambiente; ela **não foi concluída** e não integra os resultados.

## O que permaneceu idêntico à R82

Lógica e números de combate, curva dos inimigos, escalas de vida/dano, prestígio, custos de relíquias, poder e preços de artefatos, heróis, equipamentos, chances de drop, habilidades, árvore de talentos, pets, pergaminhos, clãs, raids, formato de save, sprites, PNGs, áudio e módulos do servidor. A indicação de versão no título/menu foi atualizada para R83. O formato JSON do laboratório mantém o identificador R82 por compatibilidade.

## Próximos passos

Para realmente recalibrar a campanha, precisamos de um relatório de **TESTAR MINHA BUILD** feito com um save avançado legítimo ou de sessões automatizadas que alcancem diversos prestígios. Só depois deve-se considerar mudanças em vida dos inimigos, relíquias, dano ou poder de artefatos — **sempre analisando essas grandezas conjuntamente**.
