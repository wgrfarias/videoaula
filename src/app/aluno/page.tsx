import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Meus cursos | Área do aluno" };

export default async function AlunoHomePage() {
  const user = await requireUser();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          modules: { include: { lessons: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const lessonIds = enrollments.flatMap((e) =>
    e.course.modules.flatMap((m) => m.lessons.map((l) => l.id))
  );

  const progress = await prisma.lessonProgress.findMany({
    where: { userId: user.id, lessonId: { in: lessonIds }, completed: true },
  });
  const completedSet = new Set(progress.map((p) => p.lessonId));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Meus cursos</h1>
      <p className="mt-1 text-sm text-ink-500">
        Continue de onde parou ou revise qualquer aula quando quiser.
      </p>

      {enrollments.length === 0 && (
        <Card className="mt-8 p-8 text-center">
          <p className="text-ink-700">Você ainda não comprou nenhum curso.</p>
          <Link href="/cursos" className="mt-3 inline-block font-semibold text-brand-700 hover:underline">
            Ver cursos disponíveis →
          </Link>
        </Card>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {enrollments.map((enrollment) => {
          const lessons = enrollment.course.modules.flatMap((m) => m.lessons);
          const completed = lessons.filter((l) => completedSet.has(l.id)).length;
          const pct = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;

          return (
            <Link key={enrollment.id} href={`/aluno/cursos/${enrollment.course.slug}`}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative aspect-video w-full bg-brand-800">
                  {enrollment.course.coverImageUrl && (
                    <Image
                      src={enrollment.course.coverImageUrl}
                      alt={enrollment.course.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                    <PlayCircle className="h-10 w-10 text-white" />
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-semibold text-ink-900">
                    {enrollment.course.title}
                  </h3>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-cream-200">
                    <div
                      className="h-full rounded-full bg-accent-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-ink-500">
                    {completed} de {lessons.length} aulas concluídas ({pct}%)
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
