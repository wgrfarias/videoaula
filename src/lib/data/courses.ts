import { prisma } from "@/lib/prisma";

export async function getPublishedCourses(params?: {
  query?: string;
  categorySlug?: string;
}) {
  return prisma.course.findMany({
    where: {
      published: true,
      ...(params?.query
        ? { title: { contains: params.query } }
        : {}),
      ...(params?.categorySlug
        ? { category: { slug: params.categorySlug } }
        : {}),
    },
    include: {
      category: true,
      instructor: { select: { name: true } },
      modules: { include: { lessons: { include: { video: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCourseBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      category: true,
      instructor: true,
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { video: true },
          },
        },
      },
    },
  });
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export function courseStats(course: {
  modules: { lessons: { videoId: string | null; video: { durationSec: number | null } | null }[] }[];
}) {
  const lessons = course.modules.flatMap((m) => m.lessons);
  const totalSeconds = lessons.reduce(
    (sum, l) => sum + (l.video?.durationSec ?? 0),
    0
  );
  return {
    lessonCount: lessons.length,
    moduleCount: course.modules.length,
    totalSeconds,
  };
}
