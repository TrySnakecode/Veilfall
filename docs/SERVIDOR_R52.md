# Servidor local e hospedagem

## Executar no Windows

Extraia o ZIP inteiro. Instale Node.js 24 ou superior e execute `INICIAR_SERVIDOR.bat`. Não é necessário `npm install`: HTTP, SQLite e criptografia vêm do Node. O navegador abre em `http://localhost:4173/`. Mantenha a janela aberta. A campanha e o treinamento também funcionam ao abrir `VEILFALL.html`, sem Node.

Em Linux/macOS: `node server/server.cjs`, depois `http://localhost:4173/`. Os scripts BAT não foram executados em Windows nesta entrega; o backend foi executado e testado em Linux com Node 24.22.1.

O serviço entregue é local. Não há servidor público, domínio ou conta Steam configurados. Computadores executando cópias separadas têm bancos independentes. Para jogar juntos à distância, todos precisam acessar **a mesma instância hospedada**.

## Dados e cópias de segurança

`var/veilfall.sqlite` guarda contas, perfis, clãs, solicitações, raids, ataques e recompensas. `var/signing-private.pem` mantém a identidade criptográfica do serviço. O banco usa WAL, chaves estrangeiras e transações `BEGIN IMMEDIATE`.

Faça backup de toda a pasta `var/` com o servidor parado. Não publique essa pasta nem a inclua em ZIPs de distribuição. A chave privada deve permanecer com o operador; perdê-la invalida caches antigos. O ZIP entregue não inclui contas de QA, banco ou chave privada.

A campanha usa os três espaços locais da R51. O serviço online usa uma conta separada. Prestigiar a campanha não altera o perfil de Raid nem a coleção. Trocar de conta troca os bônus de armas vinculados àquela conta.

Ao mudar de um HTML `file://` para `localhost`, o navegador usa outra origem e pode não mostrar o save antigo. Exporte a campanha pelo menu Configurações da R51 e importe no mesmo menu da R52. Nunca substitua a pasta antiga antes de guardar esse backup. Os bônus online sincronizados são mantidos em cache separado na origem usada para jogar; abrir outro arquivo ou domínio não transfere esse cache.

## Hospedar a implementação

Use um processo Node 24+, volume persistente para `VEIL_DATA_DIR` e proxy reverso com HTTPS. Defina:

```text
VEIL_PUBLIC_ORIGIN=https://seu-dominio
VEIL_BIND=127.0.0.1
PORT=4173
VEIL_DATA_DIR=/caminho/persistente/veilfall
```

O proxy deve preservar o `Host` do domínio configurado e encaminhar à porta local. `VEIL_BIND=0.0.0.0` só é necessário quando a rede do ambiente exige escuta externa; configure isso conscientemente junto ao proxy/firewall. O padrão permanece restrito à máquina local. A interface e a API são servidas pela mesma origem; não habilite CORS amplo.

`VEIL_PUBLIC_ORIGIN` ativa cookie Secure em HTTPS e valida Host/Origin. A sessão usa cookie HttpOnly, SameSite=Strict e expiração de 14 dias. O limitador simples em memória usa o IP da conexão; atrás de um proxy vários jogadores podem compartilhar esse orçamento. Para um serviço público, configure limitação por identidade/IP no proxy confiável e ajuste a política com testes de carga. O código não confia em `X-Forwarded-For` enviado por clientes.

Esta entrega não inclui recuperação de senha por email, MFA, moderação operacional, proteção contra criação massiva de contas, telemetria, SLA, backups automatizados ou operação comercial em escala. Controles locais e testes de concorrência não equivalem a auditoria de segurança independente. Remova as páginas `qa-*.html` da distribuição pública se não desejar ferramentas de teste visíveis.

## Relógio, integridade e desconexão

Cada ataque consome uma das três tentativas do dia UTC no início. A duração registrada é 30000 ms. Comandos recebem timestamp do servidor e recargas validadas; o cliente nunca escolhe o dano, o Poder ou o perfil usado. O snapshot do perfil e do chefe é imutável para a tentativa.

A cada segundo e antes de responder à API, ataques vencidos são liquidados. Se a página fechar, os ataques básicos continuam sendo calculados pelos 30 segundos; apenas técnicas efetivamente recebidas entram no resultado. Ao voltar, uma tentativa ainda ativa é retomada. Se já terminou, consta nas Crônicas. Falhas de comunicação deixam o resultado pendente, com opção de sincronização. O servidor requer um relógio confiável do operador.

Ataques simultâneos são aplicados em transação e limitados à vida/armadura restante por região. Dano excedente não cria vida negativa nem recompensa duplicada. A soma pessoal simulada pode superar a contribuição efetiva por sobreposição de alvos. Uma tentativa legítima iniciada antes da vitória continua elegível quando termina, mesmo que outro integrante dê o golpe final.

Recompensas têm chave única `(raid_id,user_id)`. Repetir finalização ou reiniciar o processo não entrega novas armas. Novos integrantes só atacam raids iniciadas depois de sua entrada. Expulsar alguém não apaga participações anteriores. Abandonar o último clã arquiva-o e encerra seu cerco, mantendo o histórico.

Perfis são assinados com Ed25519. HTTPS/localhost/arquivo compatível usam WebCrypto; em contexto HTTP sem WebCrypto a assinatura é validada pela API autenticada e o cache offline não é restaurado. Isso protege contra alterações acidentais no cache e importação comum de campos falsos. Um usuário que controla o próprio JavaScript pode mudar a apresentação da campanha offline; isso não concede armas, recursos ou dano no servidor. O operador que controla o banco local também controla sua própria instância.

## API resumida

Todas as mutações são POST com JSON e sessão, salvo registro/login. O servidor não aceita comandos de administrador ou edição de inventário pela API.

| Rota | Uso |
|---|---|
| GET `/api/bootstrap` | Versão, relógio e chave pública |
| POST `/api/auth/register`, `/login`, `/logout` | Conta e sessão |
| GET `/api/me` | Perfil assinado, clã, tentativas e histórico |
| GET/POST `/api/clans` | Procurar/ranking ou criar clã |
| GET `/api/clans/:id` | Integrantes, contribuições, eventos e raids |
| POST `/api/clans/:id/apply` | Solicitar ingresso |
| POST `/api/clans/:id/members` | Aceitar, rejeitar, promover, rebaixar, transferir, expulsar, sair |
| POST `/api/clans/:id/raids` | Líder/oficial inicia nível desbloqueado |
| POST `/api/raids/:id/attacks` | Snapshot, nonce idempotente e início do relógio |
| POST `/api/attacks/:id/action` | Seleção de alvo/conjuração |
| GET `/api/attacks/:id` | Estado da tentativa própria |
| POST `/api/attacks/:id/finish` | Finalização após 30 s |
| POST `/api/profile/upgrade` | Compra de técnica/Potência/Precisão |
| POST `/api/profile/verify` | Verifica assinatura própria; não altera inventário |

## Caminho para Steam

A tabela `external_identities(provider,subject,user_id)` reserva a associação a um provedor. A autenticação atual é local por nome/senha; a tabela não representa uma integração já funcional.

Uma versão Steam futura deve trocar um ticket de autenticação validado no backend por uma sessão interna, vincular o SteamID somente após confirmação de posse, preservar IDs de contas e recompensas e manter todas as regras de Raid no servidor. Não aceitar SteamID ou resultados enviados pelo cliente como prova de identidade. Tickets, credenciais de parceiro, appID e validação real dependem da configuração oficial da aplicação e não foram implementados ou testados nesta revisão.
