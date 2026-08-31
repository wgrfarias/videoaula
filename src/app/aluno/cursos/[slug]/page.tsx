import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CoursePlayer } from "@/components/player/course-player";
import { getEffectiveModules } from "@/lib/data/courses";
import { computeModuleGating, getPassedQuizIds } from "@/lib/data/quizzes";
import { ROLES } from "@/lib/constants";

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser();

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { cpf: true } });
  if (!dbUser?.cpf) {
    redirect("/aluno/perfil?required=cpf");
  }

  const moduleWithLessons = {
    orderBy: { order: "asc" as const },
    include: {
      lessons: {
        orderBy: { order: "asc" as const },
        include: { video: true },
      },
      quiz: {
        include: {
          questions: {
            orderBy: { order: "asc" as const },
            include: { options: { orderBy: { order: "asc" as const } } },
          },
        },
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
  const isOwnerOrAdmin = user.role === ROLES.ADMIN || course.instructorId === user.id;
  if (!enrollment && !isOwnerOrAdmin) {
    redirect(`/cursos/${slug}`);
  }

  const rawModules = getEffectiveModules(course);
  const lessonIds = rawModules.flatMap((m) => m.lessons.map((l) => l.id));
  const [progress, passedQuizIds] = await Promise.all([
    prisma.lessonProgress.findMany({ where: { userId: user.id, lessonId: { in: lessonIds } } }),
    getPassedQuizIds(user.id),
  ]);

  // Never send option.isCorrect to the client — the quiz UI must not be
  // able to read the answer key out of its own props.
  const modules = rawModules.map((m) => ({
    ...m,
    quiz: m.quiz
      ? {
          ...m.quiz,
          questions: m.quiz.questions.map((q) => ({
            ...q,
            options: q.options.map((o) => ({ id: o.id, text: o.text })),
          })),
        }
      : null,
  }));

  const moduleGating: Record<string, boolean> = {};
  if (isOwnerOrAdmin) {
    for (const m of modules) moduleGating[m.id] = true;
  } else {
    for (const [id, unlocked] of computeModuleGating(course.modules, passedQuizIds)) {
      moduleGating[id] = unlocked;
    }
    for (const bundled of course.bundledCourses) {
      for (const [id, unlocked] of computeModuleGating(bundled.modules, passedQuizIds)) {
        moduleGating[id] = unlocked;
      }
    }
  }

  return (
    <CoursePlayer
      course={{ id: course.id, title: course.title, modules }}
      progress={progress.map((p) => ({
        lessonId: p.lessonId,
        watchedSeconds: p.watchedSeconds,
        completed: p.completed,
      }))}
      moduleGating={moduleGating}
      watermarkCpf={dbUser.cpf}
      viewerId={user.id}
    />
  );
}
