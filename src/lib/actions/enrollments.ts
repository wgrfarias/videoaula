"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireInstructor } from "@/lib/session";
import { ROLES } from "@/lib/constants";

async function assertOwnsCourse(courseId: string, userId: string, isAdmin: boolean) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new Error("Curso não encontrado");
  if (!isAdmin && course.instructorId !== userId) {
    throw new Error("Você não tem permissão para editar este curso");
  }
  return course;
}

function expiresAtFor(accessDays: number) {
  return new Date(Date.now() + accessDays * 24 * 60 * 60 * 1000);
}

export async function grantEnrollmentByEmail(courseId: string, formData: FormData) {
  const user = await requireInstructor();
  const course = await assertOwnsCourse(courseId, user.id, user.role === ROLES.ADMIN);

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) throw new Error("Informe o e-mail do aluno");

  const student = await prisma.user.findUnique({ where: { email } });
  if (!student) throw new Error("Nenhum usuário encontrado com esse e-mail");

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId } },
    update: { expiresAt: expiresAtFor(course.accessDays) },
    create: { userId: student.id, courseId, expiresAt: expiresAtFor(course.accessDays) },
  });

  revalidatePath(`/professor/cursos/${courseId}`);
}

export async function revokeEnrollment(courseId: string, userId: string) {
  const user = await requireInstructor();
  await assertOwnsCourse(courseId, user.id, user.role === ROLES.ADMIN);

  await prisma.enrollment.deleteMany({ where: { userId, courseId } });

  revalidatePath(`/professor/cursos/${courseId}`);
}

export async function grantEnrollmentToAllStudents(courseId: string) {
  const user = await requireInstructor();
  const course = await assertOwnsCourse(courseId, user.id, user.role === ROLES.ADMIN);

  const students = await prisma.user.findMany({
    where: { role: ROLES.STUDENT },
    select: { id: true },
  });
  const existing = await prisma.enrollment.findMany({
    where: { courseId },
    select: { userId: true },
  });
  const existingIds = new Set(existing.map((e) => e.userId));
  const toCreate = students.filter((s) => !existingIds.has(s.id));

  if (toCreate.length > 0) {
    await prisma.enrollment.createMany({
      data: toCreate.map((s) => ({
        userId: s.id,
        courseId,
        expiresAt: expiresAtFor(course.accessDays),
      })),
    });
  }

  revalidatePath(`/professor/cursos/${courseId}`);
}
