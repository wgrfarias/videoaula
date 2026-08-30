-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "body" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "coverTheme" TEXT NOT NULL DEFAULT 'tech-blue',
    "price" REAL NOT NULL,
    "discountPercent" REAL NOT NULL DEFAULT 0,
    "installments" INTEGER NOT NULL DEFAULT 1,
    "accessDays" INTEGER NOT NULL DEFAULT 365,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "instructorId" TEXT NOT NULL,
    "categoryId" TEXT,
    CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Course" ("accessDays", "categoryId", "coverImageUrl", "createdAt", "description", "id", "installments", "instructorId", "price", "published", "slug", "subtitle", "title", "updatedAt") SELECT "accessDays", "categoryId", "coverImageUrl", "createdAt", "description", "id", "installments", "instructorId", "price", "published", "slug", "subtitle", "title", "updatedAt" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");
CREATE TABLE "new_SiteContent" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "siteName" TEXT NOT NULL DEFAULT 'Rumo à TI',
    "siteTagline" TEXT NOT NULL DEFAULT 'com Wagner Farias',
    "heroBadgeText" TEXT NOT NULL DEFAULT 'Turma nova com vagas abertas',
    "heroTitle" TEXT NOT NULL DEFAULT 'Dê o próximo passo rumo à sua carreira em TI',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Aulas gravadas, direto ao ponto, para quem quer migrar de carreira ou evoluir em Tecnologia da Informação.',
    "heroPrimaryLabel" TEXT NOT NULL DEFAULT 'Ver cursos disponíveis',
    "heroPrimaryHref" TEXT NOT NULL DEFAULT '/cursos',
    "heroSecondaryLabel" TEXT NOT NULL DEFAULT 'Conhecer o Wagner',
    "heroSecondaryHref" TEXT NOT NULL DEFAULT '/sobre',
    "heroStatLine" TEXT NOT NULL DEFAULT '+1.200 alunos em transição de carreira',
    "footerTagline" TEXT NOT NULL DEFAULT 'Cursos em vídeo para quem quer trilhar carreira em Tecnologia da Informação, com aulas gravadas, exercícios práticos e acompanhamento de progresso.',
    "promoActive" BOOLEAN NOT NULL DEFAULT false,
    "promoGlobalDiscount" REAL NOT NULL DEFAULT 0,
    "promoBannerText" TEXT NOT NULL DEFAULT 'Promoção por tempo limitado!',
    "heroVideoUrl" TEXT,
    "aboutTitle" TEXT NOT NULL DEFAULT 'Quem é o Wagner Farias?',
    "aboutBody" TEXT NOT NULL DEFAULT 'Wagner Farias atua há mais de 10 anos na área de Tecnologia da Informação, passando por times de infraestrutura, projetos e desenvolvimento.

Hoje dedica seu tempo a ajudar quem quer migrar de carreira ou dar os primeiros passos rumo à TI, com uma didática direta e sem enrolação.',
    "navLinksJson" TEXT NOT NULL DEFAULT '[{"label":"Início","href":"/"},{"label":"Cursos","href":"/cursos"},{"label":"Quem é o Wagner?","href":"/sobre"},{"label":"FAQ","href":"/faq"}]',
    "socialLinksJson" TEXT NOT NULL DEFAULT '[{"label":"Instagram","href":"https://instagram.com"},{"label":"YouTube","href":"https://youtube.com"},{"label":"LinkedIn","href":"https://linkedin.com"}]',
    "faqItemsJson" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteContent" ("aboutBody", "aboutTitle", "faqItemsJson", "footerTagline", "heroBadgeText", "heroPrimaryHref", "heroPrimaryLabel", "heroSecondaryHref", "heroSecondaryLabel", "heroStatLine", "heroSubtitle", "heroTitle", "id", "navLinksJson", "siteName", "siteTagline", "socialLinksJson", "updatedAt") SELECT "aboutBody", "aboutTitle", "faqItemsJson", "footerTagline", "heroBadgeText", "heroPrimaryHref", "heroPrimaryLabel", "heroSecondaryHref", "heroSecondaryLabel", "heroStatLine", "heroSubtitle", "heroTitle", "id", "navLinksJson", "siteName", "siteTagline", "socialLinksJson", "updatedAt" FROM "SiteContent";
DROP TABLE "SiteContent";
ALTER TABLE "new_SiteContent" RENAME TO "SiteContent";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "avatarUrl" TEXT,
    "bio" TEXT,
    "cpf" TEXT,
    "platformFeePercent" REAL NOT NULL DEFAULT 20,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatarUrl", "bio", "createdAt", "email", "id", "name", "passwordHash", "role", "updatedAt") SELECT "avatarUrl", "bio", "createdAt", "email", "id", "name", "passwordHash", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Comment_lessonId_idx" ON "Comment"("lessonId");
