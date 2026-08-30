import { prisma } from "@/lib/prisma";

export function getCoverSrc(course: { id: string; coverImageUrl: string | null }) {
  return course.coverImageUrl || `/api/covers/${course.id}`;
}

const BUNDLED_INCLUDE = {
  bundledCourses: {
    include: { modules: { include: { lessons: { include: { video: true } } } } },
  },
} as const;

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
      ...BUNDLED_INCLUDE,
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
      bundledCourses: {
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: { lessons: { orderBy: { order: "asc" }, include: { video: true } } },
          },
        },
      },
    },
  });
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

type ModuleWithLessons = {
  id: string;
  title: string;
  lessons: { videoId: string | null; video?: { durationSec: number | null } | null }[];
};

// A bundle ("combo") course has no modules of its own (usually) — its
// content is the union of every course listed in bundledCourses. This
// flattens that into one list so the rest of the app (stats, player,
// public preview) can treat any course uniformly.
export function getEffectiveModules<
  M extends ModuleWithLessons,
  B extends { title: string; modules: M[] },
>(course: { modules: M[]; bundledCourses?: B[] }): M[] {
  const fromBundles = (course.bundledCourses ?? []).flatMap((included) =>
    included.modules.map((m) => ({ ...m, title: `${included.title} — ${m.title}` }))
  );
  return [...course.modules, ...fromBundles];
}

export function courseStats(course: {
  modules: ModuleWithLessons[];
  bundledCourses?: { title: string; modules: ModuleWithLessons[] }[];
}) {
  const modules = getEffectiveModules(course);
  const lessons = modules.flatMap((m) => m.lessons);
  const totalSeconds = lessons.reduce(
    (sum, l) => sum + (l.video?.durationSec ?? 0),
    0
  );
  return {
    lessonCount: lessons.length,
    moduleCount: modules.length,
    totalSeconds,
  };
}

// Given the id of a course whose lesson a user wants to watch, returns every
// course id that — if the user is enrolled in it — should grant access:
// the course itself, plus any bundle course that includes it.
export async function getGrantingCourseIds(courseId: string) {
  const bundles = await prisma.course.findMany({
    where: { bundledCourses: { some: { id: courseId } } },
    select: { id: true },
  });
  return [courseId, ...bundles.map((b) => b.id)];
}
