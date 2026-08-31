"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireInstructor } from "@/lib/session";
import { ROLES } from "@/lib/constants";

async function assertOwnsModule(moduleId: string, userId: string, isAdmin: boolean) {
  const module_ = await prisma.module.findUnique({ where: { id: moduleId }, include: { course: true } });
  if (!module_) throw new Error("Módulo não encontrado");
  if (!isAdmin && module_.course.instructorId !== userId) {
    throw new Error("Você não tem permissão para editar este módulo");
  }
  return module_;
}

async function assertOwnsQuiz(quizId: string, userId: string, isAdmin: boolean) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { module: { include: { course: true } }, questions: true },
  });
  if (!quiz) throw new Error("Questionário não encontrado");
  if (!isAdmin && quiz.module.course.instructorId !== userId) {
    throw new Error("Você não tem permissão para editar este questionário");
  }
  return quiz;
}

export async function createQuiz(moduleId: string, formData: FormData) {
  const user = await requireInstructor();
  const module_ = await assertOwnsModule(moduleId, user.id, user.role === ROLES.ADMIN);

  const title = String(formData.get("title") ?? "").trim() || "Questionário do módulo";
  const passingPercent = Math.min(100, Math.max(0, Number(formData.get("passingPercent")) || 70));

  await prisma.quiz.create({ data: { moduleId, title, passingPercent } });
  revalidatePath(`/professor/cursos/${module_.courseId}`);
}

export async function updateQuiz(quizId: string, formData: FormData) {
  const user = await requireInstructor();
  const quiz = await assertOwnsQuiz(quizId, user.id, user.role === ROLES.ADMIN);

  const title = String(formData.get("title") ?? "").trim() || quiz.title;
  const passingPercent = Math.min(100, Math.max(0, Number(formData.get("passingPercent")) || quiz.passingPercent));

  await prisma.quiz.update({ where: { id: quizId }, data: { title, passingPercent } });
  revalidatePath(`/professor/cursos/${quiz.module.courseId}`);
}

export async function deleteQuiz(quizId: string) {
  const user = await requireInstructor();
  const quiz = await assertOwnsQuiz(quizId, user.id, user.role === ROLES.ADMIN);

  await prisma.quiz.delete({ where: { id: quizId } });
  revalidatePath(`/professor/cursos/${quiz.module.courseId}`);
}

export async function addQuestion(quizId: string, formData: FormData) {
  const user = await requireInstructor();
  const quiz = await assertOwnsQuiz(quizId, user.id, user.role === ROLES.ADMIN);

  const text = String(formData.get("text") ?? "").trim();
  if (!text) throw new Error("Escreva o enunciado da pergunta");

  const optionTexts = [1, 2, 3, 4]
    .map((i) => String(formData.get(`option${i}`) ?? "").trim())
    .filter(Boolean);
  if (optionTexts.length < 2) throw new Error("Informe pelo menos 2 alternativas");

  const correctIndex = Number(formData.get("correctOption")) - 1;
  if (correctIndex < 0 || correctIndex >= optionTexts.length) {
    throw new Error("Selecione qual alternativa é a correta");
  }

  const order = quiz.questions.length;
  await prisma.question.create({
    data: {
      quizId,
      text,
      order,
      options: {
        create: optionTexts.map((optionText, i) => ({
          text: optionText,
          isCorrect: i === correctIndex,
          order: i,
        })),
      },
    },
  });

  revalidatePath(`/professor/cursos/${quiz.module.courseId}`);
}

export async function deleteQuestion(questionId: string) {
  const user = await requireInstructor();
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { quiz: { include: { module: { include: { course: true } } } } },
  });
  if (!question) throw new Error("Pergunta não encontrada");
  if (user.role !== ROLES.ADMIN && question.quiz.module.course.instructorId !== user.id) {
    throw new Error("Você não tem permissão para editar esta pergunta");
  }

  await prisma.question.delete({ where: { id: questionId } });
  revalidatePath(`/professor/cursos/${question.quiz.module.courseId}`);
}
