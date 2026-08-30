import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGrantingCourseIds } from "@/lib/data/courses";
import { COMMENT_VISIBILITY, ROLES } from "@/lib/constants";

async function canAccessLesson(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) return null;
  if (lesson.freePreview) return lesson;

  if (lesson.module.course.instructorId === userId) return lesson;

  const grantingCourseIds = await getGrantingCourseIds(lesson.module.courseId);
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, courseId: { in: grantingCourseIds } },
  });
  return enrollment ? lesson : null;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");
  if (!lessonId) {
    return NextResponse.json({ error: "lessonId é obrigatório" }, { status: 400 });
  }

  const lesson = await canAccessLesson(session.user.id, lessonId);
  if (!lesson) {
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
  }

  const canModerate =
    session.user.role === ROLES.ADMIN ||
    (session.user.role === ROLES.INSTRUCTOR &&
      session.user.id === lesson.module.course.instructorId);

  const comments = await prisma.comment.findMany({
    where: canModerate
      ? { lessonId }
      : {
          lessonId,
          OR: [{ visibility: COMMENT_VISIBILITY.PUBLIC }, { authorId: session.user.id }],
        },
    include: { author: { select: { id: true, name: true, nickname: true, avatarUrl: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ comments, canModerate });
}

const createSchema = z.object({
  lessonId: z.string().min(1),
  body: z.string().trim().min(1, "Escreva algo antes de enviar").max(2000),
  visibility: z.enum([COMMENT_VISIBILITY.PUBLIC, COMMENT_VISIBILITY.PRIVATE]),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const { lessonId, body, visibility } = parsed.data;
  const lesson = await canAccessLesson(session.user.id, lessonId);
  if (!lesson) {
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
  }

  const comment = await prisma.comment.create({
    data: { lessonId, body, visibility, authorId: session.user.id },
    include: { author: { select: { id: true, name: true, nickname: true, avatarUrl: true, role: true } } },
  });

  return NextResponse.json({ comment });
}
