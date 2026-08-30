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

**Vídeos do YouTube**
- Ao enviar uma aula (biblioteca de vídeos ou direto no editor de curso) ou
  o vídeo de destaque da home, dá para colar um link do YouTube em vez de
  enviar um arquivo — o player incorpora o vídeo do YouTube diretamente
- Importante: isso não passa pela rota de streaming protegida da
  plataforma — quem tiver o link do YouTube consegue assistir por lá
  também, então vale usar vídeos "não listados" para manter algum controle
  de acesso. A marca d'água de CPF e a barra lateral de progresso continuam
  funcionando; a marcação automática de "aula concluída" ao terminar o
  vídeo não funciona para vídeos do YouTube (não há evento de término
  disponível sem a API do player do YouTube) — dá pra marcar manualmente

**Acesso manual e multi-professor**
- Na página de edição de um curso, o professor/admin pode conceder acesso a
  um aluno específico pelo e-mail, remover o acesso de qualquer aluno, ou
  conceder para todos os alunos de uma vez — sem passar pelo checkout
- Cada curso pertence a um professor (`Course.instructorId`); o painel
  `/professor` mostra o faturamento bruto e líquido só dos cursos daquele
  professor, já descontada a comissão da plataforma

## Rodando localmente

```bash
npm install
cp .env.example .env        # ajuste os valores se quiser
npm run db:migrate          # cria o banco SQLite e as tabelas
npm run db:seed             # popula com usuários e cursos de exemplo
npm run dev
```

Acesse http://localhost:3000.

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
próprio faturamento e comissão (20% para Wagner, 15% para Carla).

## Estrutura de dados (Prisma)

- `User` — papel `STUDENT`/`INSTRUCTOR`/`ADMIN`; `passwordHash` é opcional
  (fica `null` para contas criadas via Google); `cpf` (único, dígitos-only,
  validado matematicamente antes de salvar), `nickname`/`avatarUrl`/`bio`
  para o perfil, e `platformFeePercent` (comissão da plataforma sobre as
  vendas desse usuário quando ele é professor)
- `Course` → `Module` → `Lesson` — hierarquia do conteúdo; `Course` também
  tem `discountPercent` (desconto próprio, substitui a promoção geral) e
  `coverTheme` (tema usado pela capa gerada quando não há upload)
- `Video` — arquivo enviado uma vez (`provider = "upload"`) ou um link do
  YouTube (`provider = "youtube"`, `url` guarda o link); uma `Lesson` aponta
  para um `Video`, e o mesmo `Video` pode ser referenciado por `Lesson`s de
  cursos diferentes (é essa relação que permite reaproveitar aulas em novos
  produtos)
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
