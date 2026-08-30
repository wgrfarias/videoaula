import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CoursePlayer } from "@/components/player/course-player";
import { getEffectiveModules } from "@/lib/data/courses";

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser();

  const moduleWithLessons = {
    orderBy: { order: "asc" as const },
    include: {
      lessons: {
        orderBy: { order: "asc" as const },
        include: { video: true },
      },
    },
  };

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: moduleWithLessons,
      bundledCourses: { include: { modules: moduleWithLessons } },
    },
  });
  if (!course) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });
  if (!enrollment) {
    redirect(`/cursos/${slug}`);
  }

  const modules = getEffectiveModules(course);
  const lessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));
  const progress = await prisma.lessonProgress.findMany({
    where: { userId: user.id, lessonId: { in: lessonIds } },
  });

  return (
    <CoursePlayer
      course={{ id: course.id, title: course.title, modules }}
      progress={progress.map((p) => ({
        lessonId: p.lessonId,
        watchedSeconds: p.watchedSeconds,
        completed: p.completed,
      }))}
    />
  );
}
