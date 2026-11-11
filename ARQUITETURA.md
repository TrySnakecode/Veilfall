# VEILFALL R100 — Arquitetura e limites técnicos

## Fonte de código

Esta entrega é uma evolução da **R99**. O combate, builds, prestígios, economia, layout da R99 e motor de raids (`shared/raid-engine.js`) foram preservados. A principal alteração está em `server/service.cjs`, `server/server.cjs` e `src/r100-online.js`. Não houve reequilíbrio de jogo.

## Solução implementada (um backend único)

- **Site estático:** `dist-web/`, adequado ao GitHub Pages inclusive em `/nome-do-repositorio/`.
- **Serviço:** Node.js 24+, `server/server.cjs`, responsável por autenticação, clãs, raids e salvamentos.
- **Dados:** SQLite no diretório `VEIL_DATA_DIR` em um **volume persistente dedicado e com backup**. A autenticação e as assinaturas de raid/arsenal existentes continuam compatíveis.
- **HTTPS:** terminado no provedor de hospedagem/proxy; `VEIL_PUBLIC_ORIGIN` é a origem pública do backend e `VEIL_FRONTEND_ORIGIN` a origem exata do Pages (sem caminho).
- **Autenticação por e-mail (R100):** e-mail exclusivo, confirmação com token aleatório de uso único, redefinição de senha com revogação de sessões e entrega por API Resend configurável apenas no servidor. Em implantação pública, definir `VEIL_REQUIRE_EMAIL=1`; contas legadas sem e-mail exigem migração assistida.
- **Sessões:** cookie HttpOnly Secure SameSite=None em implantação entre sites e um token de sessão alternativo em `sessionStorage` somente na página configurada. O token alternativo evita depender de cookies de terceiros, mas amplia o impacto de qualquer XSS; fazer revisão de segurança antes de produção.

Não migrou para PostgreSQL/Supabase: o serviço R99 original depende de consultas síncronas do SQLite e transações `BEGIN IMMEDIATE` que protegem o estado de raids. Portar para PostgreSQL exige adaptar cuidadosamente a camada de dados e revalidar todo o combate simultâneo. O banco atual tem persistência **somente** se um volume durável estiver provisionado. Não é adequado a múltiplas instâncias do backend.

## Persistência de campanha

- `player_saves`: estado completo **privado** por jogador e espaço 1–3.
- `save_revisions`: até 12 cópias anteriores de cada espaço.
- Migração SQL efetiva em `migrations/002-online.sql`, executada por `server/service.cjs` no início; adição das colunas de e-mail condicionada à estrutura real do banco.
- `revision` crescente e controle otimista: um dispositivo envia `expectedRevision`; o servidor devolve HTTP 409 se a versão mudou.
- O frontend mantém o salvamento legado `veilfall_web_v1_` e exige vínculo explícito ao colocar o espaço na nuvem pela primeira vez.
- A partir do vínculo, o salvamento periódico envia alterações e usa um intervalo de rede, sem requisição por frame de combate.
- A restauração cria uma cópia local `..._backup_TIMESTAMP` antes de sobrescrever o espaço local.
- Um dispositivo que esteja offline continua jogando localmente; falhas de sync não impedem o combate.
- Limite do POST: aproximadamente 2 MiB por espaço; revisar se a estrutura futura exceder esse teto.

**Limitação importante:** conflitos de dados não são mesclados automaticamente, pois podem envolver inventário, recursos, recompensas e prestígios. A ação manual de restaurar o cloud ou enviar a cópia local é intencional. O banco guarda versões remotas anteriores, mas o usuário deve escolher a campanha correta.

## Rankings

- **Clãs:** baseado na conclusão real de raids no banco, com nível de raid concluído na temporada trimestral UTC e recorde vitalício. O estado da raid e dano não vêm de números arbitrários enviados pelo cliente.
- **Jogadores:** `progression_reports` é derivado de `highest[]` dos saves da R99, com base de 24.000 estágios por mundo. O maior resultado declarado não diminui com prestígio.
- **Classificação de jogadores é NÃO VERIFICADA:** navegadores podem alterar saves e JavaScript. Nenhuma marca vinda de saves pessoais é rotulada como verificada, e essas marcas não concedem recompensas competitivas. Implementar recordes verificáveis requer mudança mais ampla: checkpoints autoritativos da campanha no servidor ou simulação/reprodução de eventos determinísticos com recursos confiáveis.
- Os laboratórios não gravam enquanto `testMode` está ativo na interface, e payloads identificados como laboratório são rejeitados; isso NÃO impede um usuário malicioso de forjar outro payload de campanha. O aviso no ranking é deliberado.

## Proteções e operações

- Assinaturas Ed25519 dos perfis de raid, senha com scrypt, sessões aleatórias com hash no SQLite e limites de requisição no servidor já eram parte da R99.
- Sessões, banco e chave privada são mantidos no volume, jamais dentro de `dist-web`.
- Origem permitida estrita para navegador, preflight CORS, cookie Secure em produção e fronteira entre dados pessoais e dados públicos.
- Backup com `npm run backup -- /CAMINHO/SEGURO` e snapshots externos.
- A aplicação não contém painel administrativo público.

## Lacunas que impedem chamar a entrega de versão final segura

1. Confirmação de e-mail e recuperação de senha foram implementadas via provedor Resend, mas o envio real **não foi validado** neste ambiente e exige domínio verificado, API key segura, monitoramento e proteção contra abuso em produção.
2. Ranking de fases não tem validação autoritativa, portanto é apenas comunitário/provisório.
3. Banco SQLite limita escalabilidade horizontal; backups e monitoramento do provedor precisam ser configurados e testados.
4. Não há testes de estresse ou auditoria profissional de segurança, acessibilidade e LGPD.
5. Não foi possível conectar um domínio/conta GitHub ou um servidor hospedado reais neste ambiente de desenvolvimento; testes públicos de múltiplos navegadores permanecem pendentes.
6. O modo convidado continua como a campanha offline original, não uma identidade migrada integralmente de um backend.
7. Código R99 contém fluxo próprio de treino/laboratórios e ampla lógica no navegador; a separação competitiva integral ainda necessita trabalho.

**Status:** base online funcional em testes locais, não homologada para lançamento público com competição de prêmios ou dados pessoais de usuários reais.
