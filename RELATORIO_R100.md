# RELATÓRIO TÉCNICO — VEILFALL R100

**Data:** 11/11/2026  
**Base de desenvolvimento:** ZIP recebido `VEILFALL_R99_POLIMENTO_VISUAL_WINDOWS(1).zip`  
**Status de entrega:** **pré-lançamento técnico / homologação local**, NÃO uma versão final aprovada para receber uma comunidade pública.

## 1. Componentes modificados

- `server/service.cjs`: evolução do serviço SQLite original, salvamentos privados com revisões e restauração, rankings de clã e jogadores, contas com e-mail, tokens temporários de recuperação/confirmação.
- `server/server.cjs`: endpoints para novos serviços, controle de origem CORS, sessão compatível com frontend separado, gates de e-mail verificado, health check, limite maior de upload de saves.
- `server/mailer.cjs`: envio por API transacional (Resend), **sem nenhuma chave real no pacote**.
- `migrations/002-online.sql`: esquema e índices dos novos serviços, executado automaticamente pelo backend; a migração de colunas de e-mail usa detecção condicional.
- `src/r52-core.js`, `src/r52-ui.js`: API configurável, sessão entre origens, formulários de cadastro/recuperação e feedback de verificação.
- `src/r100-online.js` / `src/r100.css`: interface de nuvem para três espaços, revisões, backups, classificação individual provisória, clãs e perfis públicos.
- `index.html`, `src/config.js`: integração das telas e da URL configurável.
- `Dockerfile`, `.env.example`, `.dockerignore`, `.gitignore`: serviços e proteção de artefatos privados.
- `.github/workflows/pages.yml`, `tools/build-web.cjs`: publicação exclusiva de frontend estático.
- `tools/backup.cjs`: cópias transacionais do SQLite e da chave de assinatura.
- `tools/build-standalone.cjs`: atualização da versão offline com scripts e CSS novos.
- Novos testes em `tests/server/`, e adaptação explícita das verificações de hash legadas que exigiam que o backend R79–R99 nunca fosse alterado.

## 2. O que está realmente funcional no código

| Funcionalidade | Resultado |
|---|---|
| Jogar campanha local R99 | Mantido; comportamento verificado em testes históricos |
| Clãs compartilhados em um backend | Motor anterior preservado; testes do serviço aprovados |
| Raids de 30s, dano compartilhado e recompensas | Motor anterior preservado; testes de concorrência, autoridade e idempotência aprovados |
| Campanha em nuvem, 3 slots | Serviço, frontend e testes de leitura/escrita/conflito implementados |
| Revisões e recuperação de salvamento | Implementados; até 12 versões anteriores por slot |
| Conta por nome/e-mail e senha | Implementada; scrypt, e-mail exclusivo, login por e-mail ou nome |
| Confirmação/redefinição por e-mail | Implementadas e testadas com **mailer simulado**; envio real pendente de Resend e domínio verificado |
| Ranking de clãs | Baseado em raids concluídas no servidor, com temporada trimestral UTC |
| Ranking individual por maior fase | **Somente declarado/não validado**, sem proteção contra falsificação de saves |
| GitHub Pages | Build estático e workflow preparados; publicação real pendente do GitHub |
| Backend hospedável | Docker e configurações prontas; implantação real e disco persistente pendentes |
| Modo offline | Save local R99 preservado; não depende da API para a campanha |

## 3. Verificações executadas

- `npm test`: **25/25 testes** de backend e integração aprovados, incluindo contas, recuperação, sessões revogadas, CORS, salvamentos, conflitos, 3 jogadores, rankings, raids e controle de danos.
- `npm run test:current`: **aprovado** após adaptar os testes históricos de hashes. Os testes legados foram configurados para continuar conferindo os arquivos imutáveis de arte e de jogo, mas não exigir os hashes antigos de `server/server.cjs`, `server/service.cjs`, `src/r52-core.js` e `src/r52-ui.js`, alterados intencionalmente nesta evolução. **Os manifestos históricos originais NÃO foram modificados.**
- `npm run build`: gera `VEILFALL.html` com código e assets integrados.
- `npm run check`: confirma scripts válidos e arquivos incorporados na versão independente.
- `npm run build:web`: gera `dist-web/`, com frontend estático, sem backend nem dados privados.
- **Não foi realizado teste visual completo em navegador:** o ambiente de teste bloqueou navegação do Chromium para endereços locais e `file://` com `ERR_BLOCKED_BY_ADMINISTRATOR`. Não reportamos essa etapa como aprovada.
- **Não foi realizado teste com Resend real, banco em servidor externo ou site público em GitHub Pages.**

## 4. Definições de segurança adotadas

- Contas e salvamentos são privados por identidade de sessão; não existe endpoint de leitura de saves de outro jogador.
- Operações no banco usam CAS (`expectedRevision`) e transações de escrita.
- Ataques de raids continuam usando simulação do servidor; dano arbitrário informado por navegador não é aceito.
- Informação de ranking individual oriunda de saves é identificada como **NÃO VALIDADA**. Nenhum recurso competitivo é concedido com base nela.
- Email confirmável e redefinição de senha com tokens aleatórios, apenas seus hashes persistidos, uso único e prazo de expiração.
- Confirmação obrigatória para funções sociais ao ativar `VEIL_REQUIRE_EMAIL=1` em produção.
- Restrições de origem CORS, cookie `Secure` em HTTPS, session token alternativo por aba para cenário de terceiros, CSP para build estático.
- Chaves privadas e banco devem ficar no volume permanente; código de frontend é público.

## 5. Pendências críticas antes de lançar para usuários reais

1. Configurar infraestrutura HTTPS de produção com **disco persistente**, snapshots, backups externos e teste de restauração.
2. Configurar remetente transacional/domínio verificado e validar confirmação, redefinição e entrega de e-mails com o provedor real.
3. Definir modelo **autoritativo** de progressão individual antes de converter recordes declarados em ranking competitivo verificável.
4. Revisar segurança de toda a lógica de navegador (especialmente XSS, tokens em sessão), monitoramento, proteção contra bots e testes de carga.
5. Implementar gestão LGPD de consentimento, exclusão e retenção; publicar documentos jurídicos revisados.
6. Testar UI em navegadores reais, resoluções móveis e desktops, sessões múltiplas, retomada após falhas e clientes de versões diferentes.
7. Avaliar migração futura de SQLite para PostgreSQL com transações e preservação das raids para escala horizontal.
8. Criar painel administrativo protegido e observabilidade do serviço se for disponibilizado a público.

## 6. Resumo da entrega

Esta entrega **vai além de um prompt ou protótipo visual**: contém mudanças reais no código, serviços online testados localmente, frontend integrado e dois métodos de publicação. Entretanto, por depender de credenciais e infraestrutura externa, e pelas limitações do modelo de confiança do jogo em JavaScript, **não é tecnicamente correto apresentá-la como lançamento final seguro**. Consulte o `GUIA_PUBLICACAO.md` antes de colocar jogadores reais para criar contas.
