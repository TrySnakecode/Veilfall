# VEILFALL R100 — Guia de publicação passo a passo

> Esta é uma **base de publicação para homologação**. Não divulgue para uma comunidade aberta com dados pessoais antes de concluir os itens pendentes em `ARQUITETURA.md` e `RELATORIO_FINAL.md`.

## 1. Requisitos

- GitHub com repositório para o código.
- Domínio de e-mail verificado em um provedor de envio transacional (a implementação utiliza Resend).
- Node.js **24 ou superior** no desenvolvimento/servidor (usa `node:sqlite`).
- Um host para Node.js com HTTPS, **disco persistente** e backup (exemplo: serviço pago Render com Disk; serviço gratuito sem volume NÃO serve).
- Não é necessária instalação de bibliotecas npm externas: os serviços usam os módulos nativos do Node.js.

## 2. Teste local primeiro

No terminal, dentro de `VEILFALL_R100`:

```bash
node --version
npm test
npm run build:web
npm run build
npm run check
npm start
```

Abra `http://127.0.0.1:4173`. Faça dois cadastros diferentes, crie e entre em um clã, faça raid, vincule a campanha na aba **Conta** e abra **Ranking Global**. Sem `VEIL_API_URL`, `dist-web` suporta jogar offline (contas remotas não funcionarão). Fechar o navegador preserva o save local. O servidor local usa a pasta `var/`, que nunca deve ser enviada ao repositório.

## 3. Subir o projeto ao GitHub

Crie um repositório novo no GitHub. Dentro da pasta do projeto:

```bash
git init
git branch -M main
git add .
git commit -m "VEILFALL R100 online foundation"
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

**Importante:** `.gitignore` protege `var/`, `.env`, SQLite e caches; verifique `git status` antes de dar push. Não coloque o arquivo ZIP original no repositório desnecessariamente; `VEILFALL.html` é útil como versão offline, mas não é usado no GitHub Pages.

## 4. Hospedar backend Node.js

Crie um serviço web do tipo **Docker** a partir do repositório, utilizando o `Dockerfile` incluído. No host:

1. Escolha um serviço com suporte a volume persistente. No Render, recursos com disco persistente exigem plano pago, e a instância não pode ser escalada horizontalmente usando o mesmo disco.
2. Monte o disco persistente em **`/data`** (ou ajuste `VEIL_DATA_DIR` para a pasta durável disponível).
3. Adicione variáveis de ambiente, sem aspas extras:

```dotenv
VEIL_PUBLIC_ORIGIN=https://SEU_BACKEND.onrender.com
VEIL_FRONTEND_ORIGIN=https://SEU_USUARIO.github.io
VEIL_DATA_DIR=/data
PORT=4173
VEIL_BIND=0.0.0.0
VEIL_REQUIRE_EMAIL=1
VEIL_FRONTEND_URL=https://SEU_USUARIO.github.io/SEU_REPOSITORIO/
VEIL_EMAIL_FROM=Veilfall <contas@SEU_DOMINIO.com>
RESEND_API_KEY=CHAVE_PRIVADA_NO_AMBIENTE_DO_BACKEND
```

Configure **primeiro** uma conta no provedor de e-mail, verifique seu domínio de envio (DNS), crie a chave da API e guarde `RESEND_API_KEY` exclusivamente no cofre de segredos do serviço de backend. O endereço `VEIL_FRONTEND_URL` deve incluir o caminho do repositório para os links de confirmação e redefinição. Em produção, `VEIL_REQUIRE_EMAIL=1` bloqueia funções sociais até a confirmação do e-mail. Sem provedor de e-mail configurado, o serviço em modo de e-mail obrigatório se recusa a iniciar. **Não copie uma chave real para `.env.example`, `src/config.js` ou repositórios públicos.**

O host deverá fornecer HTTPS público. Os domínios acima são exemplos: substitua pelos endereços reais. Se você usa um domínio próprio para GitHub Pages, altere `VEIL_FRONTEND_ORIGIN` para a **origem** desse domínio. Não inclua o caminho `/seu-repositorio/` na origem.

O banco `veilfall.sqlite` e a chave `signing-private.pem` serão criados automaticamente no disco durável no primeiro boot. **Nunca apague a chave privada** ou substitua o volume sem migrá-la: isso invalidaria os perfis de raid assinados/caches offline existentes.

Configure o health check do serviço em `/api/health`. Ao abrir `https://SEU_BACKEND.onrender.com/api/health`, deverá responder um JSON com `ok: true`.

## 5. Publicar frontend no GitHub Pages

No repositório GitHub:

1. Vá a **Settings → Pages** e selecione **GitHub Actions** como fonte de publicação.
2. Vá a **Settings → Secrets and variables → Actions → Variables** e crie a variável pública `VEIL_API_URL` com o valor `https://SEU_BACKEND.onrender.com` (sem barra final). Isso **não é segredo**; a URL da API será visível no navegador.
3. Vá a **Actions**, execute o fluxo **Publish VEILFALL frontend**, ou faça push na branch `main`.
4. Verifique a publicação em `https://SEU_USUARIO.github.io/SEU_REPOSITORIO/`.

O workflow `.github/workflows/pages.yml` executa `node tools/build-web.cjs` e publica apenas `index.html`, `src/`, `shared/` e `assets/`. Não publica banco, servidor, contas, sessões nem chaves privadas.

## 6. Entrar em conta e sincronizar

Acesse o site publicado e vá à aba de **Clãs/Conta**. Faça cadastro com nome, e-mail e senha; confirme o e-mail recebido antes de acessar os serviços online. O link de recuperação redefine a senha e invalida sessões anteriores. Na conta, a área **Crônicas na nuvem** permite escolher um dos três espaços:

- **ENVIAR CÓPIA LOCAL:** começa a armazenar na nuvem o slot, com controle de revisões. Se já existe uma versão remota desconhecida, requer confirmação.
- **RESTAURAR NUVEM:** salva backup da cópia local e carrega a versão remota selecionada.
- **HISTÓRICO:** permite recuperar até 12 revisões antigas armazenadas no serviço.

Após vincular um espaço, a sincronização tenta atualizar esse slot periodicamente. Falhas deixam a campanha local acessível; HTTP 409 exige escolha manual. A sessão alternativa entre origens usa token em `sessionStorage`: **ao fechar totalmente a sessão do navegador pode ser necessário entrar novamente**, porém o salvamento remoto continua na conta.

## 7. Ranking e integridade

O ranking de clãs considera raids concluídas no servidor. O ranking de jogadores é explicitamente **não verificado**, pois o save pessoal da campanha é gerado no cliente. Não atribua prêmios, recompensas ou selos de verificação aos estágios exibidos enquanto não existir motor autoritativo de progressão.

## 8. Backups e restauração

Faça snapshot **diário** do volume e exporte cópias criptografadas para armazenamento externo com acesso restrito. Na máquina com acesso ao volume, por exemplo:

```bash
VEIL_DATA_DIR=/data npm run backup -- /data/backups
```

Isso copia uma versão consistente do banco e a chave privada de assinatura; mantenha backups fora do próprio volume para proteção contra falhas físicas ou exclusão. Para restaurar, **pare o servidor**, restaure os arquivos `veilfall.sqlite` e `signing-private.pem` sob `/data` com permissão de leitura restrita e reinicie. Teste a restauração primeiro em homologação. Cópias em aberto no sistema de arquivos não substituem snapshots transacionais.

## 9. Atualizações e rollback

Faça uma cópia de segurança antes de cada implantação. Atualize o backend primeiro em ambiente de teste e depois o frontend. A aplicação mantém o formato local R99 e a base de dados usa `CREATE TABLE IF NOT EXISTS`; atualizações futuras deverão usar migrações versionadas e backups testados antes de produção. Para rollback, restaure **código e banco compatíveis**, nunca apenas a interface. Evite executar duas instâncias Node no mesmo volume.

## 10. Problemas comuns

| Sintoma | Provável causa / ação |
|---|---|
| Jogo abre, mas conta não conecta | `VEIL_API_URL` não definida ou backend indisponível; abra `/api/health` |
| Erro de CORS | `VEIL_FRONTEND_ORIGIN` não é exatamente a origem da página (`https://SEU_USUARIO.github.io`) |
| 'Configure VEIL_DATA_DIR...' | Falta volume persistente; configurar antes de iniciar serviço público |
| Dados desaparecem após restart | O volume não foi montado na pasta configurada; não utilize filesystem temporário |
| Cookie não persiste | Navegador limita cookies cross-site; o cliente usa também sessão por token nesta aba |
| Nuvem apresenta conflito | Outro dispositivo gravou; examine o save remoto e a cópia local, escolha qual manter |
| Ranking não aparece | Backend não iniciado ou ninguém enviou campanha; rankings de fases são declarados, não verificados |
| Perfil de raid inválido após mudança de servidor | Chave `signing-private.pem` foi substituída; restaurar a chave antiga do backup |
| Erros 429 | Proteção contra solicitações excessivas; aguarde e investigue loops do cliente |

## 11. Checklist obrigatório antes de lançar publicamente

- [ ] Configurar e homologar envio real de e-mail, confirmação, recuperação e limites antiabuso com domínio verificado.
- [ ] Fazer revisão de XSS/CSP, privacidade, controle de sessão e abuso em produção.
- [ ] Decidir e implementar um ranking de progressão **realmente verificado**.
- [ ] Configurar, restaurar e testar backups do banco e da chave privada.
- [ ] Realizar teste funcional em pelo menos dois dispositivos e três contas reais.
- [ ] Publicar termos e política de privacidade próprios, avaliar obrigações LGPD e exclusão de conta.
- [ ] Configurar monitoramento/alertas e testar recuperação após falhas.
