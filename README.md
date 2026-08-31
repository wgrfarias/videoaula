# Rumo à TI com Wagner Farias — Plataforma de venda de videoaulas

Plataforma completa para vender cursos em vídeo online: catálogo público com
checkout, área do aluno para assistir aos cursos comprados (com marca d'água
de CPF anti-pirataria, perfil e comentários por aula), painel de gestão de
cursos para criar produtos, enviar vídeos, reaproveitar aulas em novos
combos e conceder acesso manual, e um admin para editar textos/promoções do
site e acompanhar o faturamento de cada professor separadamente — sem mexer
em código.

## Stack

- **Next.js 16** (App Router, Server Actions) + TypeScript + Tailwind CSS v4
- **Prisma** + **Postgres**
- **NextAuth v5** (Credentials + Google OAuth opcional) com sessão JWT e
  controle de papéis (`STUDENT`, `INSTRUCTOR`, `ADMIN`)
- **next-themes** para o tema claro/escuro (persistido por navegador, com
  opção de seguir o tema do sistema)
- Vídeo de aula em três formatos por vídeo: upload em disco local (com
  streaming protegido e suporte a HTTP Range), link do YouTube, ou upload
  direto para uma **Video Library do Bunny.net** (recomendado para produção
  — ver "Vídeos no Bunny.net" abaixo)
- Deploy como container Docker (`Dockerfile` + `fly.toml` prontos para
  Fly.io — ver "Deploy no Fly.io" abaixo)

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
- `/aluno/compras`: histórico de todas as compras da conta (curso, data,
  valor pago, cupom usado se houver, status)
- `/aluno/suporte` (e `/professor/suporte` para instrutores): abrir um
  chamado de suporte com categoria e descrição, acompanhar as respostas em
  formato de conversa

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
- **Questionário por módulo**: cada módulo pode ter um questionário de
  múltipla escolha com uma nota mínima de aprovação definida pelo
  professor. Enquanto o aluno não atinge essa nota, o próximo módulo fica
  bloqueado no player (cadeado na sidebar) — ele pode tentar quantas vezes
  quiser, sempre vendo o resultado na hora. Instrutor/admin visualizando o
  próprio curso nunca fica bloqueado

**Segurança e conta do aluno**
- Cadastro exige CPF, validado matematicamente (dígitos verificadores reais,
  não só formato) — ver `src/lib/cpf.ts`. Uma vez definido, o CPF não pode
  mais ser trocado
- O player exibe o CPF do aluno como marca d'água (overlay na tela, sem
  reprocessar o vídeo) no canto inferior direito — se a pessoa gravar ou
  baixar a tela, o CPF de quem assistiu fica registrado na captura
- `/aluno/perfil`: foto, apelido, bio e o CPF (bloqueado após definido)
- Comentários por aula, públicos (todo aluno matriculado vê) ou privados
  (só o autor e o professor/admin veem) — professor e admin podem apagar
  qualquer comentário

**Admin (`/admin`, papel `ADMIN`)**
- "Conteúdo do site": nome/assinatura da marca, textos e botões do topo da
  home, **vídeo de destaque da home** (upload próprio ou placeholder),
  **promoção do site inteiro** (desconto percentual + banner), texto e
  título da página Sobre, perguntas frequentes, links do menu/rodapé e
  redes sociais — tudo editável sem precisar mexer em código e refletido
  nas páginas públicas assim que salvo
- "Usuários" (`/admin/usuarios`): lista todas as contas (criadas por e-mail
  ou por Google), permite trocar o papel de qualquer uma entre Aluno,
  Professor/gestor de cursos e Admin, e define a **comissão da plataforma
  (%)** de cada professor — é assim que o admin master decide quem tem
  acesso ao painel de cursos e qual fatia da venda fica com a plataforma
- "Faturamento" (`/admin/faturamento`): faturamento bruto, comissão retida e
  repasse líquido, consolidado por professor — cada um com sua própria
  porcentagem configurável
- "Métricas" (`/admin/metricas`): funil de conversão por curso (visita →
  checkout → compra), ranking de cursos/aulas mais assistidos, abandono de
  vídeo (em que % do vídeo os alunos param de assistir) e tempo médio/total
  por página — tudo calculado a partir dos próprios dados da plataforma,
  sem ferramenta externa (ver "Métricas e analytics" abaixo)
- "Chamados" (`/admin/chamados`): central de suporte — responde qualquer
  chamado aberto por aluno ou professor, muda o status (aberto/em
  andamento/encerrado) e cria/exclui as categorias que aparecem no formulário
  de abertura de chamado

**Preços, promoções e cursos grátis**
- Um curso com `price = 0` aparece como "Grátis" no catálogo, na página do
  curso e no checkout (sem cobrança)
- Cada curso/combo pode ter um desconto próprio (%), que **substitui** a
  promoção geral do site em vez de somar com ela
- A promoção geral (ativada em `/admin`) se aplica a todo curso que não
  tenha desconto próprio — o preço com desconto é o que fica registrado no
  pedido no momento da compra (`src/lib/pricing.ts`)

**Capas geradas automaticamente**
- Curso sem imagem de capa enviada usa uma capa em SVG gerada na hora
  (`/api/covers/[courseId]`) com título, categoria e subtítulo, em um dos
  temas visuais disponíveis (tecnologia, carreira, dados, segurança
  pública) — os temas são genéricos, sem qualquer brasão oficial ou
  identidade de corporação policial/estadual real

**Cupons de desconto**
- `/admin/cupons`: criação de cupons com código, tipo de desconto (percentual
  ou valor fixo em R$, escolhido por cupom), escopo (qualquer curso/combo ou
  uma lista específica), limite total de usos e/ou 1 uso por cliente, e data
  de expiração opcional
- Um cupom válido **substitui** (não soma com) a promoção do site ou o
  desconto próprio do curso — o cliente aplica o código na página de
  checkout e vê o preço recalculado antes de confirmar a compra
- Cada aplicação de cupom é registrada no momento em que o cliente digita o
  código (antes de comprar), e marcada como convertida só quando a compra é
  de fato concluída — isso permite ao admin ver, por cupom, quantos foram
  **aplicados**, quantos **converteram em venda** e quantos ficaram como
  **desistência** (cupom aplicado, sem compra), com a taxa de conversão

**Vídeos do YouTube e do Bunny.net**
- Ao enviar uma aula (biblioteca de vídeos ou direto no editor de curso), o
  professor escolhe entre 4 abas: reaproveitar um vídeo já enviado, enviar
  um arquivo para o disco da plataforma, colar um link do YouTube, ou
  enviar direto para o **Bunny.net** (ver seção própria abaixo). O vídeo de
  destaque da home aceita upload de arquivo ou link do YouTube
- YouTube: o player incorpora o vídeo diretamente. Importante — isso não
  passa pela rota de streaming protegida da plataforma, então quem tiver o
  link do YouTube consegue assistir por lá também; vale usar vídeos "não
  listados" para manter algum controle de acesso
- Em ambos os casos (YouTube e Bunny.net), a marca d'água de CPF e a barra
  lateral de progresso continuam funcionando; a marcação automática de
  "aula concluída" ao terminar o vídeo só funciona para uploads locais
  (não há evento de término disponível num `<iframe>` sem a API própria de
  cada player) — dá pra marcar manualmente nesses casos

**Métricas e analytics**
- `src/components/analytics/page-view-tracker.tsx`, montado uma vez no
  layout raiz, registra uma visita (`PageView`) a cada rota visitada e
  atualiza o tempo em página em tempo real (usando a Page Visibility API +
  `navigator.sendBeacon` ao sair da página) — funciona tanto para quem está
  logado quanto para visitantes anônimos (identificados por um cookie
  próprio, sem qualquer dado pessoal)
- Isso alimenta o funil de conversão e o "tempo por página" em
  `/admin/metricas`; o restante (cursos/aulas mais assistidos, abandono de
  vídeo) usa os dados de progresso que o player já reportava (`LessonProgress`)
- É um sistema próprio, dentro da plataforma — não substitui uma ferramenta
  como Google Analytics para métricas de tráfego (origem, dispositivo,
  geografia), mas cruza diretamente com dados de aluno/curso que uma
  ferramenta externa não teria acesso

**Acesso manual e multi-professor**
- Na página de edição de um curso, o professor/admin pode conceder acesso a
  um aluno específico pelo e-mail, remover o acesso de qualquer aluno, ou
  conceder para todos os alunos de uma vez — sem passar pelo checkout
- Cada curso pertence a um professor (`Course.instructorId`); o painel
  `/professor` mostra o faturamento bruto e líquido só dos cursos daquele
  professor, já descontada a comissão da plataforma

## Rodando localmente

Requer um Postgres rodando — o jeito mais rápido é com Docker:

```bash
docker compose up -d        # sobe um Postgres local em localhost:5432
npm install
cp .env.example .env        # já aponta para o Postgres do docker-compose
npm run db:migrate          # aplica as migrations do Prisma
npm run db:seed             # popula com usuários e cursos de exemplo
npm run dev
```

Acesse http://localhost:3000.

Sem Docker, aponte `DATABASE_URL` no `.env` para qualquer Postgres seu
(local ou um gratuito na nuvem, como [Neon](https://neon.tech) ou
[Supabase](https://supabase.com)) antes de rodar os mesmos comandos.

### Contas de demonstração (criadas pelo seed)

| Papel        | E-mail                    | Senha      |
|--------------|---------------------------|------------|
| Aluna        | `aluno@exemplo.com`       | `senha123` |
| Admin/Gestor | `wagner@rumoati.com.br`   | `senha123` |
| Professora   | `carla@rumoati.com.br`    | `senha123` |

A conta admin (Wagner) acumula os papéis de gestor de cursos e admin do
site — acessa tanto `/professor` quanto `/admin`. A aluna já é matriculada
em alguns cursos para você entrar direto no player. O seed cria cinco
cursos para demonstrar as funcionalidades: "Combo Iniciante em TI" **inclui**
os cursos "Lógica de Programação do Zero" e "Fundamentos de Redes e Linux"
inteiros (a mesma mecânica da seção "Cursos incluídos" no editor de curso);
"Introdução à Segurança da Informação" é **grátis** e pertence à segunda
professora (Carla), assim como "Hardening de Servidores Linux" (pago) — o
que dá para conferir em `/admin/faturamento` que cada professor tem seu
próprio faturamento e comissão (20% para Wagner, 15% para Carla). O
primeiro módulo de "Lógica de Programação do Zero" já vem com um
questionário de exemplo (nota mínima 70%) para testar o bloqueio do
próximo módulo, e quatro categorias de chamado já estão cadastradas em
`/admin/chamados` para testar a central de suporte.

## Estrutura de dados (Prisma)

- `User` — papel `STUDENT`/`INSTRUCTOR`/`ADMIN`; `passwordHash` é opcional
  (fica `null` para contas criadas via Google); `cpf` (único, dígitos-only,
  validado matematicamente antes de salvar), `nickname`/`avatarUrl`/`bio`
  para o perfil, e `platformFeePercent` (comissão da plataforma sobre as
  vendas desse usuário quando ele é professor)
- `Course` → `Module` → `Lesson` — hierarquia do conteúdo; `Course` também
  tem `discountPercent` (desconto próprio, substitui a promoção geral) e
  `coverTheme` (tema usado pela capa gerada quando não há upload)
- `Video` — três proveniências possíveis: arquivo em disco
  (`provider = "upload"`), link do YouTube (`provider = "youtube"`, `url`
  guarda o link) ou vídeo no Bunny.net (`provider = "bunny"`, `filename`
  guarda o GUID do vídeo na Video Library, `url` guarda a URL de embed já
  pronta). Uma `Lesson` aponta para um `Video`, e o mesmo `Video` pode ser
  referenciado por `Lesson`s de cursos diferentes (é essa relação que
  permite reaproveitar aulas em novos produtos)
- `Course.bundledCourses` — auto-relação muitos-para-muitos: um curso
  "combo" lista os cursos inteiros que ele inclui. O acesso é resolvido em
  tempo de leitura (`getGrantingCourseIds`/`getEffectiveModules` em
  `src/lib/data/courses.ts`) — matricular alguém no combo não duplica
  nenhuma aula, só soma o conteúdo dos cursos incluídos na hora de exibir
  e de checar permissão de streaming
- `Comment` — comentário de um aluno em uma `Lesson`, com `visibility`
  `PUBLIC` ou `PRIVATE`; professor/admin sempre veem todos, aluno vê os
  públicos mais os seus próprios
- `Order` / `Enrollment` — compra e liberação de acesso (com expiração por
  `accessDays`); `Enrollment` também é criada/removida manualmente pelo
  professor/admin (concessão de acesso sem checkout)
- `Coupon` — código de desconto (`discountType` `PERCENT`/`FIXED`, `scope`
  `SITEWIDE`/`COURSES`, `maxRedemptions`, `onePerCustomer`, `expiresAt`)
- `CouponRedemption` — uma linha por (cupom, aluno, curso); criada com
  `convertedAt = null` no instante em que o cupom é aplicado no checkout, e
  preenchida com `convertedAt`/`orderId` só quando a compra é concluída —
  é essa diferença que dá o número de desistências em `/admin/cupons`
- `LessonProgress` — progresso de cada aluno por aula
- `SiteContent` — linha única com os textos/links editáveis pelo `/admin`
  (listas como links de menu, redes sociais e FAQ ficam como JSON em texto),
  incluindo `heroVideoUrl` e os campos de promoção geral (`promoActive`,
  `promoGlobalDiscount`, `promoBannerText`)
- `PageView` — uma linha por visita de página, com `durationSec` atualizado
  enquanto a aba fica visível; `userId` para quem está logado ou `anonId`
  (cookie) para visitante anônimo
- `TicketCategory` / `Ticket` / `TicketMessage` — categorias de chamado
  configuráveis pelo admin, o chamado em si (`status` `OPEN`/`IN_PROGRESS`/
  `CLOSED`) e a conversa de respostas entre o autor e o suporte
- `Quiz` (um por `Module`, opcional) → `Question` → `QuestionOption` —
  banco de perguntas de múltipla escolha; `QuizAttempt` guarda cada
  tentativa de um aluno (`scorePercent`, `passed`). `computeModuleGating()`
  em `src/lib/data/quizzes.ts` decide, a partir dos `QuizAttempt`s com
  `passed = true`, quais módulos aparecem destrancados no player

`role` e `status` são strings simples (não enums do Postgres), com os
valores válidos definidos em `src/lib/constants.ts` — assim herdado de
quando o projeto começou em SQLite, que não tem enum nativo.

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

Isso funciona bem para poucos vídeos pequenos, mas em produção o
recomendado é hospedar as aulas no Bunny.net (próxima seção) — os uploads
locais ficam melhor reservados para avatar, capa e vídeo de destaque da
home, que já usam esse mesmo mecanismo de disco.

## Vídeos no Bunny.net

Bunny Stream faz o upload resumível (arquivos grandes não recomeçam do
zero se a conexão cair), a conversão para HLS e a entrega via CDN — o
arquivo vai direto do navegador do professor para o Bunny.net
(`src/lib/bunny-client.ts`, protocolo TUS via `tus-js-client`), sem passar
pelo servidor da plataforma.

**Configurar:**
1. Crie uma conta em [bunny.net](https://bunny.net) e, no painel, vá em
   **Stream** → **Add Video Library**.
2. Dentro da Video Library criada, anote o **Library ID** (aparece no topo)
   e, em **API** → **Video Library API Key**, copie a chave.
3. Adicione ao `.env` (local) ou como secret do Fly.io (produção):
   ```bash
   BUNNY_LIBRARY_ID="123456"
   BUNNY_API_KEY="sua-chave-aqui"
   ```
4. Reinicie o servidor. A aba "Bunny.net" passa a funcionar na biblioteca
   de vídeos e no editor de curso.

**Como funciona:** o servidor cria o registro do vídeo na Video Library via
API (`src/lib/bunny.ts`) e devolve ao navegador uma assinatura temporária
para o upload TUS; o player reproduz o vídeo através do embed do Bunny
(`https://iframe.mediadelivery.net/embed/{library}/{video}`), guardado
pronto em `Video.url`. Por padrão o embed não exige token — se quiser
restringir onde ele pode ser incorporado, ative **Allowed Referrers** nas
configurações da Video Library e liste o domínio da sua plataforma; isso
evita que alguém reaproveite o link do vídeo em outro site, sem precisar
mexer em código.

> A assinatura do upload TUS foi implementada a partir da documentação
> pública mais difundida do Bunny Stream, mas este ambiente de
> desenvolvimento não teve acesso à internet para conferir contra a
> documentação ao vivo no momento da implementação — se o upload falhar
> com 401, vale conferir os nomes exatos dos campos de metadata TUS em
> https://docs.bunny.net contra `src/lib/bunny-client.ts`.

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
- `npm run db:migrate` — cria/atualiza migrations do Prisma em desenvolvimento
- `npm run db:migrate:deploy` — aplica migrations existentes sem gerar novas
  (o que roda em produção, via `release_command` no `fly.toml`)
- `npm run db:seed` — popula o banco com dados de demonstração (idempotente)
- `npm run db:studio` — abre o Prisma Studio para inspecionar o banco

## Deploy no Fly.io

O projeto já inclui `Dockerfile` e `fly.toml`. Pressupõe que você já tem
conta no Fly.io e o `flyctl` instalado e logado (`fly auth login`).

1. **Banco de dados** — crie um Postgres gerenciado pelo Fly (ou use um
   externo, tipo Neon/Supabase):
   ```bash
   fly postgres create --name videoaula-db
   ```
   Anote a connection string que o comando mostra no final.

2. **Criar o app** — o `fly.toml` já existe, então só falta registrar o
   nome do app no Fly (troque `troque-pelo-nome-do-seu-app` no `fly.toml`
   por um nome único antes):
   ```bash
   fly apps create <nome-do-seu-app>
   ```

3. **Volume para uploads locais** (avatar, capa enviada, vídeo de destaque
   da home — não os vídeos de aula, que vão para o Bunny.net):
   ```bash
   fly volumes create videoaula_uploads --region gru --size 1
   ```
   (troque `gru` se usar outra região — mantenha igual ao `primary_region`
   do `fly.toml`)

4. **Secrets** — nunca vão no `fly.toml`, só como secret:
   ```bash
   fly secrets set \
     DATABASE_URL="postgres://...?sslmode=require" \
     AUTH_SECRET="$(openssl rand -base64 32)" \
     NEXTAUTH_URL="https://<nome-do-seu-app>.fly.dev" \
     BUNNY_LIBRARY_ID="..." \
     BUNNY_API_KEY="..." \
     GOOGLE_CLIENT_ID="..." \
     GOOGLE_CLIENT_SECRET="..."
   ```
   (as três últimas são opcionais — omita se não for usar Bunny.net/Google
   ainda)

5. **Deploy**:
   ```bash
   fly deploy
   ```
   O `release_command` do `fly.toml` roda `prisma migrate deploy` numa
   máquina temporária antes de trocar o tráfego para a nova versão — o
   banco nunca fica desatualizado em relação ao código publicado.

6. **Popular o banco de produção** (opcional, só se quiser os dados de
   demonstração lá também):
   ```bash
   fly ssh console -C "npm run db:seed"
   ```

**Sobre o volume de uploads:** ele existe numa única máquina física, então
mantenha `min_machines_running = 1` (já configurado no `fly.toml`) e não
escale para mais de uma máquina sem antes mover esses uploads para um
storage externo (Bunny Storage, S3, Cloudflare R2 etc.) — o Postgres em si
escala normalmente, essa limitação é só do disco local.

## Observações gerais de deploy

- Sempre use HTTPS em produção — `NEXTAUTH_URL` deve refletir o domínio
  real e `AUTH_SECRET` deve ser um valor forte e único (nunca reaproveite o
  do `.env.example`).
- Uploads de vídeo em disco (fora do Bunny.net) exigem um servidor Node.js
  persistente com armazenamento igualmente persistente — não funciona em
  plataformas serverless com filesystem efêmero.
