import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Lock, PlayCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { getCourseBySlug, courseStats } from "@/lib/data/courses";
import { formatDuration, formatInstallments } from "@/lib/utils";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course || !course.published) notFound();

  const user = await getCurrentUser();
  const enrollment = user
    ? await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: course.id } },
      })
    : null;

  const stats = courseStats(course);

  return (
    <div>
      <section className="bg-hero-gradient text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.3fr_1fr] md:items-start">
          <div>
            {course.category && (
              <Badge tone="accent" className="bg-white/10 text-accent-300">
                {course.category.name}
              </Badge>
            )}
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-balance md:text-4xl">
              {course.title}
            </h1>
            {course.subtitle && (
              <p className="mt-3 text-lg text-white/75">{course.subtitle}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4" /> {stats.lessonCount} aulas
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {formatDuration(stats.totalSeconds)} de conteúdo
              </span>
              <span>Instrutor {course.instructor.name}</span>
            </div>

            <p className="mt-6 max-w-2xl text-white/80">{course.description}</p>
          </div>

          <Card className="overflow-hidden">
            <div className="relative aspect-video w-full bg-brand-800">
              {course.coverImageUrl && (
                <Image
                  src={course.coverImageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
            <div className="p-6">
              <p className="font-display text-2xl font-bold text-brand-700">
                {formatInstallments(course.price, course.installments)}
              </p>
              <p className="text-xs text-ink-500">ou à vista</p>

              <div className="mt-5">
                {enrollment ? (
                  <LinkButton href={`/aluno/cursos/${course.slug}`} className="w-full">
                    Continuar assistindo
                  </LinkButton>
                ) : (
                  <LinkButton href={`/checkout/${course.slug}`} className="w-full">
                    Comprar agora
                  </LinkButton>
                )}
              </div>

              <ul className="mt-5 space-y-2 text-sm text-ink-500">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-600" /> Acesso por {course.accessDays} dias
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-600" /> Assista quando e onde quiser
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-600" /> Suporte via fórum de dúvidas
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="font-display text-2xl font-bold text-ink-900">Conteúdo do curso</h2>
        <div className="mt-6 space-y-4">
          {course.modules.map((module) => (
            <Card key={module.id} className="p-5">
              <h3 className="font-display font-semibold text-ink-900">{module.title}</h3>
              <ul className="mt-3 divide-y divide-ink-900/5">
                {module.lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-center justify-between py-3 text-sm">
                    <span className="flex items-center gap-2 text-ink-700">
                      {lesson.freePreview || enrollment ? (
                        <PlayCircle className="h-4 w-4 text-brand-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-ink-300" />
                      )}
                      {lesson.title}
                      {lesson.freePreview && (
                        <Badge tone="success" className="ml-1">Grátis</Badge>
                      )}
                    </span>
                    <span className="text-ink-300">
                      {formatDuration(lesson.video?.durationSec)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
