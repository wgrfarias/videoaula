# Português com a Camila — Plataforma de venda de videoaulas

Plataforma completa para vender cursos em vídeo online: catálogo público com
checkout, área do aluno para assistir aos cursos comprados e painel da
professora para criar cursos, enviar vídeos e reaproveitar aulas já gravadas
em novos produtos (combos).

## Stack

- **Next.js 16** (App Router, Server Actions) + TypeScript + Tailwind CSS v4
- **Prisma** + SQLite (fácil de trocar por Postgres em produção)
- **NextAuth v5** (Credentials) com sessão JWT e controle de papéis
  (`STUDENT`, `INSTRUCTOR`, `ADMIN`)
- Upload e streaming de vídeo em disco local, com checagem de matrícula e
  suporte a HTTP Range (permite avançar o vídeo sem baixar o arquivo todo)

## Funcionalidades

**Site público**
- Home e catálogo de cursos (`/cursos`) com busca e filtro por categoria
- Página de curso com conteúdo programático, aulas grátis de demonstração e
  compra
- Cadastro/login de aluno

**Área do aluno (`/aluno`)**
- Lista dos cursos comprados com barra de progresso
- Player do curso com sidebar de módulos/aulas, marcação de aula concluída e
  retomada de onde parou

**Painel da professora (`/professor`)**
- Visão geral (cursos publicados, alunos, faturamento)
- Biblioteca de vídeos: upload de aulas, com indicação de em quais cursos
  cada vídeo já é usado
- Criação/edição de cursos: informações, preço, capa, módulos e aulas
- Ao adicionar uma aula, é possível **enviar um vídeo novo ou reaproveitar
  qualquer vídeo já enviado** (inclusive de outro curso) — é assim que um
  "combo" reaproveita aulas de dois cursos existentes, como no curso de
  demonstração já incluído no seed

## Rodando localmente

```bash
npm install
cp .env.example .env        # ajuste os valores se quiser
npm run db:migrate          # cria o banco SQLite e as tabelas
npm run db:seed             # popula com professora, aluna e 3 cursos de exemplo
npm run dev
```

Acesse http://localhost:3000.

### Contas de demonstração (criadas pelo seed)

| Papel      | E-mail                     | Senha      |
|------------|-----------------------------|------------|
| Aluna      | `aluno@exemplo.com`         | `senha123` |
| Professora | `professora@exemplo.com`    | `senha123` |

A aluna já é matriculada em "Português do Zero" para você entrar direto no
player. Os três cursos do seed demonstram o reaproveitamento de vídeo: o
curso "Combo" usa exatamente os mesmos registros de vídeo das aulas de
"Português do Zero" e do "Curso 4.000 Questões", sem precisar reenviar
nenhum arquivo.

## Estrutura de dados (Prisma)

- `User` — papel `STUDENT`/`INSTRUCTOR`/`ADMIN`
- `Course` → `Module` → `Lesson` — hierarquia do conteúdo
- `Video` — arquivo enviado uma vez; uma `Lesson` aponta para um `Video`, e o
  mesmo `Video` pode ser referenciado por `Lesson`s de cursos diferentes
  (é essa relação que permite reaproveitar aulas em novos produtos)
- `Order` / `Enrollment` — compra e liberação de acesso (com expiração por
  `accessDays`)
- `LessonProgress` — progresso de cada aluno por aula

SQLite não tem enum nativo, então `role` e `status` são strings com os
valores definidos em `src/lib/constants.ts`.

## Upload e streaming de vídeo

- `POST /api/videos/upload` — só professora/admin; salva o arquivo em
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
- `npm run db:seed` — popula o banco com dados de demonstração
- `npm run db:studio` — abre o Prisma Studio para inspecionar o banco

## Observações para deploy

- Troque `DATABASE_URL` para Postgres/MySQL em produção e rode
  `npx prisma migrate deploy`.
- Gere um `AUTH_SECRET` forte (`openssl rand -base64 32`) e ajuste
  `NEXTAUTH_URL` para o domínio real.
- Uploads de vídeo em disco exigem um servidor Node.js persistente (não
  funciona em plataformas serverless com filesystem efêmero) — ou adapte as
  rotas de upload/streaming para um bucket de objetos.
