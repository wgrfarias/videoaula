"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireInstructor } from "@/lib/session";
import { slugify } from "@/lib/utils";

async function assertOwnsCourse(courseId: string, userId: string, isAdmin: boolean) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new Error("Curso não encontrado");
  if (!isAdmin && course.instructorId !== userId) {
    throw new Error("Você não tem permissão para editar este curso");
  }
  return course;
}

async function assertOwnsModule(moduleId: string, userId: string, isAdmin: boolean) {
  const module_ = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });
  if (!module_) throw new Error("Módulo não encontrado");
  if (!isAdmin && module_.course.instructorId !== userId) {
    throw new Error("Você não tem permissão para editar este módulo");
  }
  return module_;
}

async function assertOwnsLesson(lessonId: string, userId: string, isAdmin: boolean) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) throw new Error("Aula não encontrada");
  if (!isAdmin && lesson.module.course.instructorId !== userId) {
    throw new Error("Você não tem permissão para editar esta aula");
  }
  return lesson;
}

export async function createCourse(formData: FormData) {
  const user = await requireInstructor();

  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const installments = Number(formData.get("installments") ?? 1);
  const accessDays = Number(formData.get("accessDays") ?? 365);
  const categoryId = String(formData.get("categoryId") ?? "") || null;

  if (!title || !description) {
    throw new Error("Título e descrição são obrigatórios");
  }

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let n = 1;
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++n}`;
  }

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      subtitle: subtitle || null,
      description,
      price,
      installments: installments || 1,
      accessDays: accessDays || 365,
      categoryId,
      instructorId: user.id,
      published: false,
    },
  });

  revalidatePath("/professor/cursos");
  redirect(`/professor/cursos/${course.id}`);
}

export async function updateCourse(courseId: string, formData: FormData) {
  const user = await requireInstructor();
  await assertOwnsCourse(courseId, user.id, user.role === "ADMIN");

  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const installments = Number(formData.get("installments") ?? 1);
  const accessDays = Number(formData.get("accessDays") ?? 365);
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const coverImageUrl = String(formData.get("coverImageUrl") ?? "").trim();

  await prisma.course.update({
    where: { id: courseId },
    data: {
      title,
      subtitle: subtitle || null,
      description,
      price,
      installments: installments || 1,
      accessDays: accessDays || 365,
      categoryId,
      ...(coverImageUrl ? { coverImageUrl } : {}),
    },
  });

  revalidatePath(`/professor/cursos/${courseId}`);
  revalidatePath("/professor/cursos");
}

export async function togglePublish(courseId: string) {
  const user = await requireInstructor();
  const course = await assertOwnsCourse(courseId, user.id, user.role === "ADMIN");

  await prisma.course.update({
    where: { id: courseId },
    data: { published: !course.published },
  });

  revalidatePath(`/professor/cursos/${courseId}`);
  revalidatePath("/professor/cursos");
  revalidatePath("/cursos");
}

export async function deleteCourse(courseId: string) {
  const user = await requireInstructor();
  await assertOwnsCourse(courseId, user.id, user.role === "ADMIN");

  const [enrollmentCount, orderCount] = await Promise.all([
    prisma.enrollment.count({ where: { courseId } }),
    prisma.order.count({ where: { courseId } }),
  ]);

  if (enrollmentCount > 0 || orderCount > 0) {
    throw new Error(
      "Este curso já tem matrículas ou pedidos registrados e não pode ser excluído. Despublique-o em vez disso."
    );
  }

  await prisma.course.delete({ where: { id: courseId } });

  revalidatePath("/professor/cursos");
  redirect("/professor/cursos");
}

export async function createModule(courseId: string, formData: FormData) {
  const user = await requireInstructor();
  await assertOwnsCourse(courseId, user.id, user.role === "ADMIN");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Informe um título para o módulo");

  const count = await prisma.module.count({ where: { courseId } });
  await prisma.module.create({
    data: { courseId, title, order: count },
  });

  revalidatePath(`/professor/cursos/${courseId}`);
}

export async function deleteModule(moduleId: string) {
  const user = await requireInstructor();
  const module_ = await assertOwnsModule(moduleId, user.id, user.role === "ADMIN");

  await prisma.module.delete({ where: { id: moduleId } });

  revalidatePath(`/professor/cursos/${module_.courseId}`);
}

export async function createLesson(
  moduleId: string,
  data: { title: string; videoId: string; freePreview?: boolean }
) {
  const user = await requireInstructor();
  const module_ = await assertOwnsModule(moduleId, user.id, user.role === "ADMIN");

  const video = await prisma.video.findUnique({ where: { id: data.videoId } });
  if (!video || (video.ownerId !== user.id && user.role !== "ADMIN")) {
    throw new Error("Vídeo inválido");
  }

  const count = await prisma.lesson.count({ where: { moduleId } });
  await prisma.lesson.create({
    data: {
      moduleId,
      title: data.title,
      videoId: data.videoId,
      freePreview: data.freePreview ?? false,
      order: count,
    },
  });

  revalidatePath(`/professor/cursos/${module_.courseId}`);
}

export async function deleteLesson(lessonId: string) {
  const user = await requireInstructor();
  const lesson = await assertOwnsLesson(lessonId, user.id, user.role === "ADMIN");

  await prisma.lesson.delete({ where: { id: lessonId } });

  revalidatePath(`/professor/cursos/${lesson.module.courseId}`);
}

export async function toggleFreePreview(lessonId: string) {
  const user = await requireInstructor();
  const lesson = await assertOwnsLesson(lessonId, user.id, user.role === "ADMIN");

  await prisma.lesson.update({
    where: { id: lessonId },
    data: { freePreview: !lesson.freePreview },
  });

  revalidatePath(`/professor/cursos/${lesson.module.courseId}`);
}

async function moveItem<T extends { id: string; order: number }>(
  items: T[],
  itemId: string,
  direction: "up" | "down"
) {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((i) => i.id === itemId);
  if (index === -1) return [];
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= sorted.length) return [];

  const a = sorted[index];
  const b = sorted[swapWith];
  return [
    { id: a.id, order: b.order },
    { id: b.id, order: a.order },
  ];
}

export async function moveModule(moduleId: string, direction: "up" | "down") {
  const user = await requireInstructor();
  const module_ = await assertOwnsModule(moduleId, user.id, user.role === "ADMIN");

  const siblings = await prisma.module.findMany({ where: { courseId: module_.courseId } });
  const updates = await moveItem(siblings, moduleId, direction);
  await Promise.all(
    updates.map((u) => prisma.module.update({ where: { id: u.id }, data: { order: u.order } }))
  );

  revalidatePath(`/professor/cursos/${module_.courseId}`);
}

export async function moveLesson(lessonId: string, direction: "up" | "down") {
  const user = await requireInstructor();
  const lesson = await assertOwnsLesson(lessonId, user.id, user.role === "ADMIN");

  const siblings = await prisma.lesson.findMany({ where: { moduleId: lesson.moduleId } });
  const updates = await moveItem(siblings, lessonId, direction);
  await Promise.all(
    updates.map((u) => prisma.lesson.update({ where: { id: u.id }, data: { order: u.order } }))
  );

  revalidatePath(`/professor/cursos/${lesson.module.courseId}`);
}
