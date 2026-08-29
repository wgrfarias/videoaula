import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CoursePlayer } from "@/components/player/course-player";

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser();

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
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
  if (!course) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });
  if (!enrollment) {
    redirect(`/cursos/${slug}`);
  }

  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const progress = await prisma.lessonProgress.findMany({
    where: { userId: user.id, lessonId: { in: lessonIds } },
  });

  return (
    <CoursePlayer
      course={course}
      progress={progress.map((p) => ({
        lessonId: p.lessonId,
        watchedSeconds: p.watchedSeconds,
        completed: p.completed,
      }))}
    />
  );
}
