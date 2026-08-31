import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGrantingCourseIds } from "@/lib/data/courses";
import { ROLES } from "@/lib/constants";

export async function POST(request: Request, { params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "É preciso entrar na sua conta" }, { status: 401 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: { include: { options: true } },
      module: { include: { course: true } },
    },
  });
  if (!quiz) {
    return NextResponse.json({ error: "Questionário não encontrado" }, { status: 404 });
  }

  const course = quiz.module.course;
  const isOwnerOrAdmin = session.user.role === ROLES.ADMIN || course.instructorId === session.user.id;
  if (!isOwnerOrAdmin) {
    const grantingCourseIds = await getGrantingCourseIds(course.id);
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId: session.user.id, courseId: { in: grantingCourseIds } },
    });
    const active = enrollment && (!enrollment.expiresAt || enrollment.expiresAt.getTime() >= Date.now());
    if (!active) {
      return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
    }
  }

  const body = await request.json().catch(() => null);
  const answers: Record<string, string> =
    body?.answers && typeof body.answers === "object" ? body.answers : {};

  let correct = 0;
  for (const question of quiz.questions) {
    const chosenOptionId = answers[question.id];
    const correctOption = question.options.find((o) => o.isCorrect);
    if (chosenOptionId && correctOption && chosenOptionId === correctOption.id) correct += 1;
  }
  const scorePercent = quiz.questions.length > 0 ? (correct / quiz.questions.length) * 100 : 0;
  const passed = scorePercent >= quiz.passingPercent;

  await prisma.quizAttempt.create({
    data: { quizId: quiz.id, userId: session.user.id, scorePercent, passed },
  });

  return NextResponse.json({ scorePercent, passed, passingPercent: quiz.passingPercent });
}
