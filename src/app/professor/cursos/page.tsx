import Link from "next/link";
import { requireInstructor } from "@/lib/session";
import { getInstructorCourses } from "@/lib/data/instructor";
import { Card, Badge } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { formatInstallments } from "@/lib/utils";

export const metadata = { title: "Meus cursos | Painel da professora" };

export default async function InstructorCoursesPage() {
  const user = await requireInstructor();
  const courses = await getInstructorCourses(user.id);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-ink-900">Meus cursos</h1>
        <LinkButton href="/professor/cursos/novo">Novo curso</LinkButton>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link key={course.id} href={`/professor/cursos/${course.id}`}>
            <Card className="h-full p-5 transition hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-semibold text-ink-900">{course.title}</h3>
                <Badge tone={course.published ? "success" : "neutral"}>
                  {course.published ? "Publicado" : "Rascunho"}
                </Badge>
              </div>
              {course.category && (
                <p className="mt-1 text-xs text-ink-500">{course.category.name}</p>
              )}
              <p className="mt-3 text-sm text-ink-500">
                {course.modules.length} módulos ·{" "}
                {course.modules.reduce((sum, m) => sum + m.lessons.length, 0)} aulas ·{" "}
                {course._count.enrollments} alunos
              </p>
              <p className="mt-3 font-semibold text-brand-700">
                {formatInstallments(course.price, course.installments)}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      {courses.length === 0 && (
        <p className="mt-8 text-sm text-ink-500">Você ainda não criou nenhum curso.</p>
      )}
    </div>
  );
}
