import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ROLES, ORDER_STATUS } from "../src/lib/constants";
import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  // Makes the script safe to re-run: wipe previously seeded course data
  // (but keep users/categories, which are upserted below) before recreating it.
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.video.deleteMany();

  const passwordHash = await bcrypt.hash("senha123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "wagner@rumoati.com.br" },
    update: {},
    create: {
      name: "Wagner Farias",
      email: "wagner@rumoati.com.br",
      passwordHash,
      role: ROLES.ADMIN,
      bio: "Mais de 10 anos em Tecnologia da Informação, ajudando quem quer migrar de carreira ou dar os primeiros passos rumo à TI.",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "aluno@exemplo.com" },
    update: {},
    create: {
      name: "Ana Estudante",
      email: "aluno@exemplo.com",
      passwordHash,
      role: ROLES.STUDENT,
    },
  });

  const categories = await Promise.all(
    ["Carreira em TI", "Programação", "Infraestrutura"].map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name, slug: slugify(name) },
      })
    )
  );

  await prisma.siteContent.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      faqItemsJson: JSON.stringify([
        {
          q: "Preciso saber programar para começar?",
          a: "Não. O curso de Lógica de Programação parte do zero absoluto, sem pré-requisitos.",
        },
        {
          q: "Por quanto tempo tenho acesso ao curso?",
          a: "O prazo de acesso é exibido na página de cada curso e começa a contar a partir da confirmação da compra.",
        },
        {
          q: "Como acesso as aulas depois de comprar?",
          a: "Basta entrar na sua conta e acessar a Área do aluno — todos os cursos comprados aparecem lá.",
        },
        {
          q: "As aulas ficam liberadas aos poucos?",
          a: "Não, assim que a compra é confirmada todas as aulas do curso ficam disponíveis.",
        },
      ]),
    },
  });

  // Reusable video pool — the same recording can back lessons in multiple courses.
  const videoDefs = [
    { title: "Aula 01 - O que é lógica de programação", durationSec: 1320 },
    { title: "Aula 02 - Variáveis, tipos de dados e operadores", durationSec: 1740 },
    { title: "Aula 03 - Entrada e saída de dados", durationSec: 1280 },
    { title: "Aula 04 - Estruturas condicionais (se/senão)", durationSec: 1610 },
    { title: "Aula 05 - Estruturas de repetição (laços)", durationSec: 1890 },
    { title: "Aula 06 - Vetores e listas", durationSec: 1720 },
    { title: "Aula 07 - Funções e modularização", durationSec: 1980 },
    { title: "Aula 08 - Introdução a algoritmos de ordenação", durationSec: 2100 },
    { title: "Aula 09 - Recursão na prática", durationSec: 1650 },
    { title: "Aula 10 - Boas práticas e legibilidade de código", durationSec: 1400 },
  ];

  const videos = [];
  for (const v of videoDefs) {
    const filename = `${slugify(v.title)}.mp4`;
    const video = await prisma.video.create({
      data: {
        title: v.title,
        filename,
        url: `/uploads/videos/sample.mp4`,
        mimeType: "video/mp4",
        durationSec: v.durationSec,
        ownerId: admin.id,
      },
    });
    videos.push(video);
  }

  // Course 1: "Lógica de Programação do Zero" — full theory course
  const course1 = await prisma.course.create({
    data: {
      title: "Lógica de Programação do Zero",
      slug: slugify("Lógica de Programação do Zero"),
      subtitle: "O primeiro passo de quem quer migrar de carreira para TI",
      description:
        "Curso completo de lógica de programação para quem está começando do zero. Teoria direto ao ponto, com muitos exercícios práticos guiados, sem depender de nenhuma linguagem específica.",
      coverImageUrl: "/uploads/covers/curso-logica.svg",
      price: 250,
      installments: 10,
      accessDays: 180,
      published: true,
      instructorId: admin.id,
      categoryId: categories[1].id,
      modules: {
        create: [
          {
            title: "Fundamentos de Lógica",
            order: 0,
            lessons: {
              create: [
                { title: videos[0].title, order: 0, videoId: videos[0].id, freePreview: true },
                { title: videos[1].title, order: 1, videoId: videos[1].id },
                { title: videos[2].title, order: 2, videoId: videos[2].id },
              ],
            },
          },
          {
            title: "Estruturas de Controle",
            order: 1,
            lessons: {
              create: [
                { title: videos[3].title, order: 0, videoId: videos[3].id },
                { title: videos[4].title, order: 1, videoId: videos[4].id },
              ],
            },
          },
          {
            title: "Estruturas de Dados e Algoritmos",
            order: 2,
            lessons: {
              create: [
                { title: videos[5].title, order: 0, videoId: videos[5].id },
                { title: videos[6].title, order: 1, videoId: videos[6].id },
                { title: videos[7].title, order: 2, videoId: videos[7].id },
                { title: videos[8].title, order: 3, videoId: videos[8].id },
                { title: videos[9].title, order: 4, videoId: videos[9].id },
              ],
            },
          },
        ],
      },
    },
  });

  // Course 2: "Fundamentos de Redes e Linux" — hands-on labs, own videos
  const labVideos = [];
  for (const title of [
    "Laboratório 01 - Comandos essenciais do Linux",
    "Laboratório 02 - Configurando uma rede local",
    "Laboratório 03 - Introdução ao Docker",
  ]) {
    const video = await prisma.video.create({
      data: {
        title,
        filename: `${slugify(title)}.mp4`,
        url: `/uploads/videos/sample.mp4`,
        mimeType: "video/mp4",
        durationSec: 2100,
        ownerId: admin.id,
      },
    });
    labVideos.push(video);
  }

  const course2 = await prisma.course.create({
    data: {
      title: "Fundamentos de Redes e Linux",
      slug: slugify("Fundamentos de Redes e Linux"),
      subtitle: "Laboratórios práticos para quem quer trabalhar com infraestrutura",
      description:
        "Aulas 100% práticas: comandos essenciais do Linux, configuração de rede local e primeiros passos com Docker. Ideal para quem quer se preparar para vagas de suporte e infraestrutura.",
      coverImageUrl: "/uploads/covers/curso-redes.svg",
      price: 250,
      installments: 10,
      accessDays: 180,
      published: true,
      instructorId: admin.id,
      categoryId: categories[2].id,
      modules: {
        create: [
          {
            title: "Laboratórios práticos",
            order: 0,
            lessons: {
              create: labVideos.map((v, i) => ({
                title: v.title,
                order: i,
                videoId: v.id,
                freePreview: i === 0,
              })),
            },
          },
        ],
      },
    },
  });

  // Course 3: "Combo" — reuses the exact same Video rows from course1 + course2
  // to demonstrate cross-course video reuse when bundling a new product.
  const course3 = await prisma.course.create({
    data: {
      title: "Combo Iniciante em TI",
      slug: slugify("Combo Iniciante em TI"),
      subtitle: "1 ano de acesso — lógica de programação + redes e Linux",
      description:
        "O combo definitivo para quem está começando: todas as aulas de Lógica de Programação somadas aos laboratórios de Redes e Linux, com um ano de acesso.",
      coverImageUrl: "/uploads/covers/curso-combo.svg",
      price: 500,
      installments: 10,
      accessDays: 365,
      published: true,
      instructorId: admin.id,
      categoryId: categories[0].id,
      modules: {
        create: [
          {
            title: "Lógica de Programação",
            order: 0,
            lessons: {
              create: videos.slice(0, 6).map((v, i) => ({
                title: v.title,
                order: i,
                videoId: v.id, // same Video row reused from course1
                freePreview: i === 0,
              })),
            },
          },
          {
            title: "Redes e Linux na prática",
            order: 1,
            lessons: {
              create: labVideos.map((v, i) => ({
                title: v.title,
                order: i,
                videoId: v.id, // same Video row reused from course2
              })),
            },
          },
        ],
      },
    },
  });

  // Enroll the demo student in course 1 so /aluno has content on first login.
  await prisma.order.create({
    data: {
      amount: course1.price,
      status: ORDER_STATUS.PAID,
      provider: "demo",
      paidAt: new Date(),
      userId: student.id,
      courseId: course1.id,
    },
  });
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course1.id } },
    update: {},
    create: {
      userId: student.id,
      courseId: course1.id,
      expiresAt: new Date(Date.now() + course1.accessDays * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Seed concluído:");
  console.log(`- Admin (Wagner Farias): wagner@rumoati.com.br / senha123`);
  console.log(`- Aluna: aluno@exemplo.com / senha123`);
  console.log(`- Cursos: ${course1.title}, ${course2.title}, ${course3.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
