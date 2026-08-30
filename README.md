# Rumo à TI com Wagner Farias — Plataforma de venda de videoaulas

Plataforma completa para vender cursos em vídeo online: catálogo público com
checkout, área do aluno para assistir aos cursos comprados, painel de
gestão de cursos para criar produtos, enviar vídeos e reaproveitar aulas já
gravadas em novos combos, e um admin para editar os textos e links do site
sem mexer em código.

## Stack

- **Next.js 16** (App Router, Server Actions) + TypeScript + Tailwind CSS v4
- **Prisma** + SQLite (fácil de trocar por Postgres em produção)
- **NextAuth v5** (Credentials + Google OAuth opcional) com sessão JWT e
  controle de papéis (`STUDENT`, `INSTRUCTOR`, `ADMIN`)
- **next-themes** para o tema claro/escuro (persistido por navegador, com
  opção de seguir o tema do sistema)
- Upload e streaming de vídeo em disco local, com checagem de matrícula e
  suporte a HTTP Range (permite avançar o vídeo sem baixar o arquivo todo)

## Funcionalidades

**Site público**
- Home e catálogo de cursos (`/cursos`) com busca e filtro por categoria
- Página de curso com conteúdo programático, aulas grátis de demonstração e
  compra
- Cadastro/login por e-mail e senha, ou por conta Google (se configurado)
- Alternância de tema claro/escuro (botão no menu)

**Área do aluno (`/aluno`)**
- Lista dos cursos comprados com barra de progresso
- Player do curso com sidebar de módulos/aulas, marcação de aula concluída e
  retomada de onde parou

**Painel de cursos (`/professor`, papéis `INSTRUCTOR`/`ADMIN`)**
- Visão geral (cursos publicados, alunos, faturamento)
- Biblioteca de vídeos: upload de aulas, com indicação de em quais cursos
  cada vídeo já é usado
- Criação/edição de cursos: informações, preço, capa, categoria, módulos e
  aulas — a categoria pode ser escolhida numa lista existente ou criada na
  hora, direto do formulário do curso
- Ao adicionar uma aula, é possível **enviar um vídeo novo ou reaproveitar
  qualquer vídeo já enviado** (inclusive de outro curso)
- **Combos**: na página de edição de qualquer curso há a seção "Cursos
  incluídos", onde dá pra juntar cursos inteiros que você já criou em um
  novo produto — quem compra o combo ganha acesso a todas as aulas de cada
  curso incluído, sem recriar módulos nem reenviar vídeo nenhum. Um combo
  não pode incluir outro combo (evita aninhamento), mas o mesmo curso pode
  entrar em quantos combos diferentes você quiser

**Admin (`/admin`, papel `ADMIN`)**
- "Conteúdo do site": nome/assinatura da marca, textos e botões do topo da
  home, texto e título da página Sobre, perguntas frequentes, links do
  menu/rodapé e redes sociais — tudo editável sem precisar mexer em código e
  refletido nas páginas públicas assim que salvo
- "Usuários" (`/admin/usuarios`): lista todas as contas (criadas por e-mail
  ou por Google) e permite trocar o papel de qualquer uma entre Aluno,
  Professor/gestor de cursos e Admin — é assim que o admin master decide
  quem tem acesso ao painel de cursos, sem precisar mexer no banco

## Rodando localmente

```bash
npm install
cp .env.example .env        # ajuste os valores se quiser
npm run db:migrate          # cria o banco SQLite e as tabelas
npm run db:seed             # popula com usuários e 3 cursos de exemplo
npm run dev
```

Acesse http://localhost:3000.

### Contas de demonstração (criadas pelo seed)

| Papel        | E-mail                    | Senha      |
|--------------|---------------------------|------------|
| Aluna        | `aluno@exemplo.com`       | `senha123` |
| Admin/Gestor | `wagner@rumoati.com.br`   | `senha123` |

A conta admin (Wagner) acumula os papéis de gestor de cursos e admin do
site — acessa tanto `/professor` quanto `/admin`. A aluna já é matriculada
em "Lógica de Programação do Zero" para você entrar direto no player. Os
três cursos do seed demonstram os dois jeitos de reaproveitar conteúdo: o
curso "Combo Iniciante em TI" não tem nenhuma aula própria — ele **inclui**
os cursos "Lógica de Programação do Zero" e "Fundamentos de Redes e Linux"
inteiros (a mesma mecânica da seção "Cursos incluídos" no editor de curso).

## Estrutura de dados (Prisma)

- `User` — papel `STUDENT`/`INSTRUCTOR`/`ADMIN`; `passwordHash` é opcional
  (fica `null` para contas criadas via Google)
- `Course` → `Module` → `Lesson` — hierarquia do conteúdo
- `Video` — arquivo enviado uma vez; uma `Lesson` aponta para um `Video`, e o
  mesmo `Video` pode ser referenciado por `Lesson`s de cursos diferentes
  (é essa relação que permite reaproveitar aulas em novos produtos)
- `Course.bundledCourses` — auto-relação muitos-para-muitos: um curso
  "combo" lista os cursos inteiros que ele inclui. O acesso é resolvido em
  tempo de leitura (`getGrantingCourseIds`/`getEffectiveModules` em
  `src/lib/data/courses.ts`) — matricular alguém no combo não duplica
  nenhuma aula, só soma o conteúdo dos cursos incluídos na hora de exibir
  e de checar permissão de streaming
- `Order` / `Enrollment` — compra e liberação de acesso (com expiração por
  `accessDays`)
- `LessonProgress` — progresso de cada aluno por aula
- `SiteContent` — linha única com os textos/links editáveis pelo `/admin`
  (listas como links de menu, redes sociais e FAQ ficam como JSON em texto)

SQLite não tem enum nativo, então `role` e `status` são strings com os
valores definidos em `src/lib/constants.ts`.

## Tema claro/escuro

Implementado com `next-themes` (`attribute="class"`, padrão "sistema"). As
cores são todas variáveis CSS (`src/app/globals.css`) com um bloco de
valores para `:root` (claro) e outro para `:root.dark` (escuro) — os
componentes usam só os nomes dos tokens (`bg-surface`, `text-ink-900`,
`bg-background`, etc.), então não precisam de classes `dark:` espalhadas
pelo código. O botão de alternância fica no menu (site) e na barra lateral
dos painéis internos.

## Login com Google (opcional)

Por padrão só o login por e-mail/senha fica ativo. Para habilitar "Entrar com
Google" em `/entrar` e `/cadastro`:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   e crie um projeto (ou use um existente).
2. Configure a "OAuth consent screen" (tipo Externo está ok para testes).
3. Crie uma credencial do tipo **OAuth client ID** → **Web application**.
4. Em "Authorized redirect URIs", adicione:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Produção: `https://SEU-DOMINIO/api/auth/callback/google`
5. Copie o Client ID e o Client Secret gerados para o `.env`:
   ```bash
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   ```
6. Reinicie `npm run dev`.

Toda conta criada via Google entra automaticamente como `STUDENT` — para dar
acesso ao painel de cursos, promova a conta em `/admin/usuarios` depois que
a pessoa fizer login pela primeira vez (é só assim que ela aparece na lista).

## Upload e streaming de vídeo

- `POST /api/videos/upload` — só instrutor/admin; salva o arquivo em
  `public/uploads/videos` e cria o registro `Video`
- `GET /api/stream/[videoId]?lesson=<lessonId>` — verifica se o usuário pode
  assistir (aula grátis, dono do vídeo, ou matrícula ativa no curso da aula)
  antes de servir o arquivo, com suporte a `Range` para o player de vídeo

Em produção, o ideal é trocar o armazenamento em disco por um bucket
(S3/R2/GCS) — a interface de `Video.url` já foi pensada para isso, bastando
trocar a implementação das duas rotas acima.

## Pagamento

O checkout (`/api/checkout`) já cria `Order` + `Enrollment` de forma
imediata para fins de demonstração ("pagamento" sempre aprovado). Para
produção, troque o corpo dessa rota por uma Checkout Session de um gateway
real (Stripe, Mercado Pago, etc.) que confirme o pagamento via webhook antes
de liberar a matrícula — o modelo de dados já suporta o fluxo
`PENDING -> PAID`.

## Scripts

- `npm run dev` — ambiente de desenvolvimento
- `npm run build` / `npm start` — build e execução de produção
- `npm run lint` — ESLint
- `npm run db:migrate` — aplica migrations do Prisma
- `npm run db:seed` — popula o banco com dados de demonstração (idempotente)
- `npm run db:studio` — abre o Prisma Studio para inspecionar o banco

## Observações para deploy

- Troque `DATABASE_URL` para Postgres/MySQL em produção e rode
  `npx prisma migrate deploy`.
- Gere um `AUTH_SECRET` forte (`openssl rand -base64 32`) e ajuste
  `NEXTAUTH_URL` para o domínio real.
- Uploads de vídeo em disco exigem um servidor Node.js persistente (não
  funciona em plataformas serverless com filesystem efêmero) — ou adapte as
  rotas de upload/streaming para um bucket de objetos.
