-- CreateTable
CREATE TABLE "SiteContent" (
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
    "aboutTitle" TEXT NOT NULL DEFAULT 'Quem é o Wagner Farias?',
    "aboutBody" TEXT NOT NULL DEFAULT 'Wagner Farias atua há mais de 10 anos na área de Tecnologia da Informação, passando por times de infraestrutura, projetos e desenvolvimento.

Hoje dedica seu tempo a ajudar quem quer migrar de carreira ou dar os primeiros passos rumo à TI, com uma didática direta e sem enrolação.',
    "navLinksJson" TEXT NOT NULL DEFAULT '[{"label":"Início","href":"/"},{"label":"Cursos","href":"/cursos"},{"label":"Quem é o Wagner?","href":"/sobre"},{"label":"FAQ","href":"/faq"}]',
    "socialLinksJson" TEXT NOT NULL DEFAULT '[{"label":"Instagram","href":"https://instagram.com"},{"label":"YouTube","href":"https://youtube.com"},{"label":"LinkedIn","href":"https://linkedin.com"}]',
    "faqItemsJson" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL
);
