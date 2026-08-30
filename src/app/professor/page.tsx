import Link from "next/link";
import { BookOpen, DollarSign, Users, Video } from "lucide-react";
import { requireInstructor } from "@/lib/session";
import { getInstructorStats, getInstructorCourses } from "@/lib/data/instructor";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { courseStats } from "@/lib/data/courses";

export const metadata = { title: "Painel de cursos" };

export default async function ProfessorDashboardPage() {
  const user = await requireInstructor();
  const [stats, courses] = await Promise.all([
    getInstructorStats(user.id),
    getInstructorCourses(user.id),
  ]);

  const cards = [
    { label: "Cursos publicados", value: `${stats.publishedCourses}/${stats.totalCourses}`, icon: BookOpen },
    { label: "Alunos matriculados", value: stats.totalStudents, icon: Users },
    { label: "Faturamento bruto", value: formatCurrency(stats.revenue), icon: DollarSign },
    {
      label: `Sua parte (comissão ${stats.platformFeePercent}%)`,
      value: formatCurrency(stats.netRevenue),
      icon: DollarSign,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Visão geral</h1>
          <p className="mt-1 text-sm text-ink-500">Bem-vindo de volta, {user.name}.</p>
        </div>
        <div className="flex gap-3">
          <LinkButton href="/professor/videos" variant="outline">
            <Video className="h-4 w-4" /> Biblioteca de vídeos
          </LinkButton>
          <LinkButton href="/professor/cursos/novo">Novo curso</LinkButton>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-ink-500">{c.label}</p>
                <p className="font-display text-xl font-bold text-ink-900">{c.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink-900">Cursos recentes</h2>
        <div className="mt-4 space-y-3">
          {courses.slice(0, 5).map((course) => (
            <Link key={course.id} href={`/professor/cursos/${course.id}`}>
              <Card className="flex items-center justify-between p-4 transition hover:shadow-md">
                <div>
                  <p className="font-medium text-ink-900">{course.title}</p>
                  <p className="text-xs text-ink-500">
                    {courseStats(course).lessonCount} aulas ·{" "}
                    {course._count.enrollments} alunos
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    course.published ? "bg-emerald-100 text-emerald-700" : "bg-ink-900/5 text-ink-500"
                  }`}
                >
                  {course.published ? "Publicado" : "Rascunho"}
                </span>
              </Card>
            </Link>
          ))}
          {courses.length === 0 && (
            <p className="text-sm text-ink-500">Você ainda não criou nenhum curso.</p>
          )}
        </div>
      </div>
    </div>
  );
}
