import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { lesson: { include: { module: { include: { course: true } } } } },
  });
  if (!comment) {
    return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 });
  }

  const isAuthor = comment.authorId === session.user.id;
  const isAdmin = session.user.role === ROLES.ADMIN;
  const isOwningInstructor =
    session.user.role === ROLES.INSTRUCTOR &&
    session.user.id === comment.lesson.module.course.instructorId;

  if (!isAuthor && !isAdmin && !isOwningInstructor) {
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
