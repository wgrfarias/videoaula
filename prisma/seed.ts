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

  const teacher = await prisma.user.upsert({
    where: { email: "professora@exemplo.com" },
    update: {},
    create: {
      name: "Prof. Camila Rocha",
      email: "professora@exemplo.com",
      passwordHash,
      role: ROLES.INSTRUCTOR,
      bio: "Professora de Português com mais de 10 anos preparando alunos para concursos públicos.",
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
    ["Concursos Públicos", "Gramática", "Redação"].map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name, slug: slugify(name) },
      })
    )
  );

  // Reusable video pool — the same recording can back lessons in multiple courses.
  const videoDefs = [
    { title: "Aula 01 - Fonética e Fonologia", durationSec: 1820 },
    { title: "Aula 02 - Ortografia oficial", durationSec: 1540 },
    { title: "Aula 03 - Acentuação gráfica", durationSec: 1690 },
    { title: "Aula 04 - Classes de palavras: substantivo e adjetivo", durationSec: 2010 },
    { title: "Aula 05 - Classes de palavras: verbo", durationSec: 2230 },
    { title: "Aula 06 - Concordância verbal", durationSec: 1955 },
    { title: "Aula 07 - Concordância nominal", durationSec: 1710 },
    { title: "Aula 08 - Regência verbal e nominal", durationSec: 1888 },
    { title: "Aula 09 - Crase: teoria e prática", durationSec: 1620 },
    { title: "Aula 10 - Pontuação", durationSec: 1740 },
    { title: "Aula 11 - Interpretação de texto I", durationSec: 2100 },
    { title: "Aula 12 - Interpretação de texto II", durationSec: 2050 },
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
        ownerId: teacher.id,
      },
    });
    videos.push(video);
  }

  // Course 1: "Português do Zero" — full grammar course
  const course1 = await prisma.course.create({
    data: {
      title: 'Português do Zero',
      slug: slugify("Português do Zero"),
      subtitle: 'Baseado no livro "A Gramática para Concursos Públicos"',
      description:
        "Curso completo de português para quem está começando do zero rumo à aprovação em concursos públicos. Teoria direto ao ponto, com muitos exercícios comentados.",
      coverImageUrl: "/uploads/covers/curso-zero.svg",
      price: 250,
      installments: 10,
      accessDays: 180,
      published: true,
      instructorId: teacher.id,
      categoryId: categories[1].id,
      modules: {
        create: [
          {
            title: "Fonética, Ortografia e Acentuação",
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
            title: "Morfologia",
            order: 1,
            lessons: {
              create: [
                { title: videos[3].title, order: 0, videoId: videos[3].id },
                { title: videos[4].title, order: 1, videoId: videos[4].id },
              ],
            },
          },
          {
            title: "Sintaxe",
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

  // Course 2: "4.000 Questões Comentadas" — reuses none of the above, own videos
  const questionVideos = [];
  for (const title of [
    "Bloco 01 - Questões de Ortografia comentadas",
    "Bloco 02 - Questões de Sintaxe comentadas",
    "Bloco 03 - Questões de Interpretação comentadas",
  ]) {
    const video = await prisma.video.create({
      data: {
        title,
        filename: `${slugify(title)}.mp4`,
        url: `/uploads/videos/sample.mp4`,
        mimeType: "video/mp4",
        durationSec: 2400,
        ownerId: teacher.id,
      },
    });
    questionVideos.push(video);
  }

  const course2 = await prisma.course.create({
    data: {
      title: "Curso 4.000 Questões Comentadas",
      slug: slugify("Curso 4.000 Questões Comentadas"),
      subtitle: "Questões das principais bancas de concursos do Brasil",
      description:
        "Resolução comentada de mais de 4.000 questões de português cobradas pelas principais bancas do país. Ideal para treino intensivo antes da prova.",
      coverImageUrl: "/uploads/covers/curso-questoes.svg",
      price: 250,
      installments: 10,
      accessDays: 180,
      published: true,
      instructorId: teacher.id,
      categoryId: categories[0].id,
      modules: {
        create: [
          {
            title: "Questões comentadas",
            order: 0,
            lessons: {
              create: questionVideos.map((v, i) => ({
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
      title: "Combo Português do Zero + 4.000 Questões",
      slug: slugify("Combo Português do Zero + 4.000 Questões"),
      subtitle: "1 ano de acesso — teoria completa + treino de questões",
      description:
        "O combo definitivo: todas as aulas teóricas de Português do Zero somadas às 4.000 questões comentadas, com um ano de acesso.",
      coverImageUrl: "/uploads/covers/curso-combo.svg",
      price: 500,
      installments: 10,
      accessDays: 365,
      published: true,
      instructorId: teacher.id,
      categoryId: categories[0].id,
      modules: {
        create: [
          {
            title: "Teoria completa",
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
            title: "Prática de questões",
            order: 1,
            lessons: {
              create: questionVideos.map((v, i) => ({
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
  console.log(`- Professora: professora@exemplo.com / senha123`);
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
