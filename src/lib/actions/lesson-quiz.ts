"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireInstructor } from "@/lib/session";
import { ROLES } from "@/lib/constants";

const MAX_QUESTIONS_PER_LESSON = 5;

async function assertOwnsLesson(lessonId: string, userId: string, isAdmin: boolean) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } }, quizQuestions: true },
  });
  if (!lesson) throw new Error("Aula não encontrada");
  if (!isAdmin && lesson.module.course.instructorId !== userId) {
    throw new Error("Você não tem permissão para editar esta aula");
  }
  return lesson;
}

export async function addLessonQuestion(lessonId: string, formData: FormData) {
  const user = await requireInstructor();
  const lesson = await assertOwnsLesson(lessonId, user.id, user.role === ROLES.ADMIN);

  if (lesson.quizQuestions.length >= MAX_QUESTIONS_PER_LESSON) {
    throw new Error(`Cada aula pode ter no máximo ${MAX_QUESTIONS_PER_LESSON} perguntas`);
  }

  const text = String(formData.get("text") ?? "").trim();
  if (!text) throw new Error("Escreva o enunciado da pergunta");

  const explanation = String(formData.get("explanation") ?? "").trim();

  const optionTexts = [1, 2, 3, 4]
    .map((i) => String(formData.get(`option${i}`) ?? "").trim())
    .filter(Boolean);
  if (optionTexts.length < 2) throw new Error("Informe pelo menos 2 alternativas");

  const correctIndex = Number(formData.get("correctOption")) - 1;
  if (correctIndex < 0 || correctIndex >= optionTexts.length) {
    throw new Error("Selecione qual alternativa é a correta");
  }

  await prisma.lessonQuizQuestion.create({
    data: {
      lessonId,
      text,
      explanation: explanation || null,
      order: lesson.quizQuestions.length,
      options: {
        create: optionTexts.map((optionText, i) => ({
          text: optionText,
          isCorrect: i === correctIndex,
          order: i,
        })),
      },
    },
  });

  revalidatePath(`/professor/cursos/${lesson.module.courseId}`);
}

export async function deleteLessonQuestion(questionId: string) {
  const user = await requireInstructor();
  const question = await prisma.lessonQuizQuestion.findUnique({
    where: { id: questionId },
    include: { lesson: { include: { module: { include: { course: true } } } } },
  });
  if (!question) throw new Error("Pergunta não encontrada");
  if (user.role !== ROLES.ADMIN && question.lesson.module.course.instructorId !== user.id) {
    throw new Error("Você não tem permissão para editar esta pergunta");
  }

  await prisma.lessonQuizQuestion.delete({ where: { id: questionId } });
  revalidatePath(`/professor/cursos/${question.lesson.module.courseId}`);
}
