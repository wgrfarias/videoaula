import { prisma } from "@/lib/prisma";
import { ORDER_STATUS } from "@/lib/constants";

// Average + total time visitors spend on each distinct path, from the
// PageView rows logged by PageViewTracker. Sorted by total time descending
// so the busiest pages surface first.
export async function getPageTimeStats(limit = 20) {
  const grouped = await prisma.pageView.groupBy({
    by: ["path"],
    _avg: { durationSec: true },
    _sum: { durationSec: true },
    _count: { _all: true },
  });

  return grouped
    .map((g) => ({
      path: g.path,
      views: g._count._all,
      avgSeconds: Math.round(g._avg.durationSec ?? 0),
      totalSeconds: g._sum.durationSec ?? 0,
    }))
    .sort((a, b) => b.totalSeconds - a.totalSeconds)
    .slice(0, limit);
}

// Per published course: how many people viewed the sales page, how many
// went on to view the checkout page, and how many actually paid.
export async function getConversionFunnel() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    select: { id: true, title: true, slug: true },
  });

  const [detailViews, checkoutViews, purchases] = await Promise.all([
    prisma.pageView.groupBy({
      by: ["courseId"],
      where: { path: { startsWith: "/cursos/" }, courseId: { not: null } },
      _count: { _all: true },
    }),
    prisma.pageView.groupBy({
      by: ["courseId"],
      where: { path: { startsWith: "/checkout/" }, courseId: { not: null } },
      _count: { _all: true },
    }),
    prisma.order.groupBy({
      by: ["courseId"],
      where: { status: ORDER_STATUS.PAID },
      _count: { _all: true },
    }),
  ]);

  const detailMap = new Map(detailViews.map((d) => [d.courseId, d._count._all]));
  const checkoutMap = new Map(checkoutViews.map((d) => [d.courseId, d._count._all]));
  const purchaseMap = new Map(purchases.map((d) => [d.courseId, d._count._all]));

  return courses
    .map((course) => {
      const views = detailMap.get(course.id) ?? 0;
      const checkouts = checkoutMap.get(course.id) ?? 0;
      const purchased = purchaseMap.get(course.id) ?? 0;
      return {
        ...course,
        views,
        checkouts,
        purchased,
        viewToCheckoutPct: views > 0 ? Math.round((checkouts / views) * 100) : 0,
        checkoutToPurchasePct: checkouts > 0 ? Math.round((purchased / checkouts) * 100) : 0,
      };
    })
    .sort((a, b) => b.views - a.views);
}

// Ranks lessons (and rolls up to courses) by total watched time, using the
// same LessonProgress rows the student player already reports into.
export async function getContentEngagement() {
  const progress = await prisma.lessonProgress.findMany({
    include: {
      lesson: {
        include: {
          module: { include: { course: { select: { id: true, title: true } } } },
          video: { select: { durationSec: true } },
        },
      },
    },
  });

  const lessonMap = new Map<
    string,
    { title: string; courseTitle: string; totalWatchedSeconds: number; viewers: number; completions: number }
  >();
  const courseMap = new Map<string, { title: string; totalWatchedSeconds: number; viewers: number }>();

  for (const p of progress) {
    const lessonId = p.lessonId;
    const course = p.lesson.module.course;
    if (!lessonMap.has(lessonId)) {
      lessonMap.set(lessonId, {
        title: p.lesson.title,
        courseTitle: course.title,
        totalWatchedSeconds: 0,
        viewers: 0,
        completions: 0,
      });
    }
    const lessonEntry = lessonMap.get(lessonId)!;
    lessonEntry.totalWatchedSeconds += p.watchedSeconds;
    lessonEntry.viewers += 1;
    if (p.completed) lessonEntry.completions += 1;

    if (!courseMap.has(course.id)) {
      courseMap.set(course.id, { title: course.title, totalWatchedSeconds: 0, viewers: 0 });
    }
    const courseEntry = courseMap.get(course.id)!;
    courseEntry.totalWatchedSeconds += p.watchedSeconds;
    courseEntry.viewers += 1;
  }

  const topLessons = [...lessonMap.values()]
    .sort((a, b) => b.totalWatchedSeconds - a.totalWatchedSeconds)
    .slice(0, 10);
  const topCourses = [...courseMap.values()]
    .sort((a, b) => b.totalWatchedSeconds - a.totalWatchedSeconds)
    .slice(0, 10);

  return { topLessons, topCourses };
}

// Buckets every LessonProgress row by how far through its video it got,
// giving a rough picture of where in a course's videos people tend to stop.
export async function getVideoAbandonment() {
  const progress = await prisma.lessonProgress.findMany({
    include: { lesson: { include: { video: { select: { durationSec: true } } } } },
  });

  const buckets = { "0-25%": 0, "25-50%": 0, "50-75%": 0, "75-100%": 0 };
  let counted = 0;

  for (const p of progress) {
    const duration = p.lesson.video?.durationSec;
    if (!duration || duration <= 0) continue;
    const pct = Math.min(100, (p.watchedSeconds / duration) * 100);
    counted += 1;
    if (pct < 25) buckets["0-25%"] += 1;
    else if (pct < 50) buckets["25-50%"] += 1;
    else if (pct < 75) buckets["50-75%"] += 1;
    else buckets["75-100%"] += 1;
  }

  return { buckets, totalCounted: counted };
}
