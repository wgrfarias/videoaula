import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGrantingCourseIds } from "@/lib/data/courses";

const progressSchema = z.object({
  lessonId: z.string().min(1),
  watchedSeconds: z.number().int().nonnegative(),
  completed: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { lessonId, watchedSeconds, completed } = parsed.data;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: true },
  });
  if (!lesson) {
    return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
  }

  if (!lesson.freePreview) {
    const grantingCourseIds = await getGrantingCourseIds(lesson.module.courseId);
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId: session.user.id, courseId: { in: grantingCourseIds } },
    });
    if (!enrollment) {
      return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
    }
  }

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: {
      watchedSeconds,
      ...(completed !== undefined ? { completed } : {}),
    },
    create: {
      userId: session.user.id,
      lessonId,
      watchedSeconds,
      completed: completed ?? false,
    },
  });

  return NextResponse.json({ progress });
}
