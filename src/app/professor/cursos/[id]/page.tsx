import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowDown, ArrowUp, Lock, Package, Trash2, Unlock, UserPlus, Users, X } from "lucide-react";
import { requireInstructor } from "@/lib/session";
import {
  getInstructorCourse,
  getInstructorVideos,
  getEligibleBundleComponents,
} from "@/lib/data/instructor";
import { getCategories } from "@/lib/data/courses";
import { Card, Badge } from "@/components/ui/card";
import { Label, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddLessonForm } from "@/components/instructor/add-lesson-form";
import { ModuleQuizEditor } from "@/components/instructor/module-quiz-editor";
import { CoverImageField } from "@/components/instructor/cover-image-field";
import { CategorySelect } from "@/components/instructor/category-select";
import {
  updateCourse,
  togglePublish,
  deleteCourse,
  createModule,
  deleteModule,
  deleteLesson,
  toggleFreePreview,
  moveModule,
  moveLesson,
  addCourseToBundle,
  removeCourseFromBundle,
} from "@/lib/actions/courses";
import {
  grantEnrollmentByEmail,
  revokeEnrollment,
  grantEnrollmentToAllStudents,
} from "@/lib/actions/enrollments";
import { formatDuration } from "@/lib/utils";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireInstructor();

  const course = await getInstructorCourse(id);
  if (!course || course.instructorId !== user.id) notFound();

  const [categories, videos, eligibleComponents] = await Promise.all([
    getCategories(),
    getInstructorVideos(user.id),
    getEligibleBundleComponents(
      user.id,
      [course.id, ...course.bundledCourses.map((c) => c.id)]
    ),
  ]);

  const updateCourseWithId = updateCourse.bind(null, course.id);
  const createModuleWithId = createModule.bind(null, course.id);
  const addCourseToBundleWithId = addCourseToBundle.bind(null, course.id);
  const grantEnrollmentWithId = grantEnrollmentByEmail.bind(null, course.id);
  const grantAllWithId = grantEnrollmentToAllStudents.bind(null, course.id);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">{course.title}</h1>
          <Badge tone={course.published ? "success" : "neutral"} className="mt-2">
            {course.published ? "Publicado" : "Rascunho"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <form action={togglePublish.bind(null, course.id)}>
            <Button type="submit" variant={course.published ? "outline" : "primary"}>
              {course.published ? "Despublicar" : "Publicar curso"}
            </Button>
          </form>
          {course._count.enrollments === 0 &&
            course._count.orders === 0 &&
            course._count.includedInBundles === 0 && (
            <form action={deleteCourse.bind(null, course.id)}>
              <Button type="submit" variant="ghost" className="text-accent-600">
                Excluir
              </Button>
            </form>
          )}
        </div>
      </div>

      <Card className="p-6">
        <h2 className="font-display font-semibold text-ink-900">Informações do curso</h2>
        <form action={updateCourseWithId} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" defaultValue={course.title} required />
          </div>
          <div>
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input id="subtitle" name="subtitle" defaultValue={course.subtitle ?? ""} />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" defaultValue={course.description} required />
          </div>
          <CoverImageField
            defaultValue={course.coverImageUrl ?? ""}
            defaultTheme={course.coverTheme}
            courseId={course.id}
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={course.price} />
            </div>
            <div>
              <Label htmlFor="installments">Parcelas</Label>
              <Input id="installments" name="installments" type="number" min="1" defaultValue={course.installments} />
            </div>
            <div>
              <Label htmlFor="accessDays">Acesso (dias)</Label>
              <Input id="accessDays" name="accessDays" type="number" min="1" defaultValue={course.accessDays} />
            </div>
            <div>
              <Label htmlFor="discountPercent">Desconto próprio (%)</Label>
              <Input
                id="discountPercent"
                name="discountPercent"
                type="number"
                min="0"
                max="99"
                defaultValue={course.discountPercent}
              />
            </div>
          </div>
          <p className="text-xs text-ink-500">
            Deixe em 0 para preço cheio (ou seguir a promoção do site, se
            houver uma ativa). Um desconto aqui vale só para este curso e
            substitui a promoção geral.
          </p>
          <div>
            <Label htmlFor="categoryId">Categoria</Label>
            <CategorySelect categories={categories} defaultValue={course.categoryId ?? ""} />
          </div>
          <Button type="submit">Salvar alterações</Button>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-brand-600" />
          <h2 className="font-display font-semibold text-ink-900">
            Cursos incluídos (combo)
          </h2>
        </div>
        <p className="mt-1 text-sm text-ink-500">
          Monte um combo juntando cursos inteiros que você já criou — quem
          comprar este curso ganha acesso a todas as aulas de cada curso
          incluído aqui, sem precisar recriar módulos ou reenviar vídeos.
        </p>

        {course.bundledCourses.length > 0 && (
          <ul className="mt-4 space-y-2">
            {course.bundledCourses.map((included) => {
              const lessonCount = included.modules.reduce((sum, m) => sum + m.lessons.length, 0);
              return (
                <li
                  key={included.id}
                  className="flex items-center justify-between rounded-xl border border-ink-900/10 px-4 py-2.5"
                >
                  <div>
                    <Link
                      href={`/professor/cursos/${included.id}`}
                      className="text-sm font-medium text-ink-900 hover:underline"
                    >
                      {included.title}
                    </Link>
                    <p className="text-xs text-ink-500">
                      {included.modules.length} módulos · {lessonCount} aulas
                    </p>
                  </div>
                  <form action={removeCourseFromBundle.bind(null, course.id, included.id)}>
                    <button
                      type="submit"
                      title="Remover do combo"
                      className="rounded-lg p-1.5 text-accent-600 hover:bg-accent-400/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}

        {eligibleComponents.length > 0 ? (
          <form action={addCourseToBundleWithId} className="mt-4 flex gap-2">
            <select
              name="componentCourseId"
              defaultValue=""
              className="w-full rounded-xl border border-ink-300/40 bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="" disabled>
                Escolha um curso para incluir
              </option>
              {eligibleComponents.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <Button type="submit" className="shrink-0">
              Incluir no combo
            </Button>
          </form>
        ) : (
          course.bundledCourses.length === 0 && (
            <p className="mt-4 text-xs text-ink-300">
              Você ainda não tem outros cursos disponíveis para incluir aqui —
              crie outro curso primeiro.
            </p>
          )
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-brand-600" />
          <h2 className="font-display font-semibold text-ink-900">Acesso de alunos</h2>
        </div>
        <p className="mt-1 text-sm text-ink-500">
          Conceda ou remova acesso manualmente, sem passar pelo checkout —
          útil para cortesias, reposições ou parcerias.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <form action={grantEnrollmentWithId} className="flex flex-1 gap-2">
            <Input name="email" type="email" placeholder="email@aluno.com" required />
            <Button type="submit" className="shrink-0">
              <UserPlus className="mr-1.5 h-4 w-4" /> Conceder
            </Button>
          </form>
          <form action={grantAllWithId}>
            <Button type="submit" variant="outline" className="w-full sm:w-auto">
              Conceder para todos os alunos
            </Button>
          </form>
        </div>

        {course.enrollments.length > 0 ? (
          <ul className="mt-4 divide-y divide-ink-900/5">
            {course.enrollments.map((enrollment) => (
              <li key={enrollment.id} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-ink-900">
                    {enrollment.user.nickname || enrollment.user.name}
                  </p>
                  <p className="text-xs text-ink-500">{enrollment.user.email}</p>
                </div>
                <form action={revokeEnrollment.bind(null, course.id, enrollment.userId)}>
                  <button
                    type="submit"
                    title="Remover acesso"
                    className="rounded-lg p-1.5 text-accent-600 hover:bg-accent-400/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-xs text-ink-300">Nenhum aluno com acesso a este curso ainda.</p>
        )}
      </Card>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Módulos e aulas próprias
          </h2>
        </div>
        {course.bundledCourses.length > 0 && (
          <p className="mt-1 text-sm text-ink-500">
            Opcional para um combo — você pode deixar só com os cursos
            incluídos acima, ou complementar com módulos próprios.
          </p>
        )}

        <div className="mt-4 space-y-4">
          {course.modules.map((module, moduleIndex) => (
            <Card key={module.id} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display font-semibold text-ink-900">{module.title}</h3>
                <div className="flex items-center gap-1">
                  <form action={moveModule.bind(null, module.id, "up")}>
                    <button
                      type="submit"
                      disabled={moduleIndex === 0}
                      className="rounded-lg p-1.5 text-ink-500 hover:bg-surface-alt disabled:opacity-30"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </form>
                  <form action={moveModule.bind(null, module.id, "down")}>
                    <button
                      type="submit"
                      disabled={moduleIndex === course.modules.length - 1}
                      className="rounded-lg p-1.5 text-ink-500 hover:bg-surface-alt disabled:opacity-30"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </form>
                  <form action={deleteModule.bind(null, module.id)}>
                    <button type="submit" className="rounded-lg p-1.5 text-accent-600 hover:bg-accent-400/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>

              <ul className="mt-3 divide-y divide-ink-900/5">
                {module.lessons.map((lesson, lessonIndex) => (
                  <li key={lesson.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-2 text-sm text-ink-700">
                      <span>{lesson.title}</span>
                      {lesson.freePreview && <Badge tone="success">Grátis</Badge>}
                      <span className="text-xs text-ink-300">
                        {formatDuration(lesson.video?.durationSec)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <form action={moveLesson.bind(null, lesson.id, "up")}>
                        <button
                          type="submit"
                          disabled={lessonIndex === 0}
                          className="rounded-lg p-1.5 text-ink-500 hover:bg-surface-alt disabled:opacity-30"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                      </form>
                      <form action={moveLesson.bind(null, lesson.id, "down")}>
                        <button
                          type="submit"
                          disabled={lessonIndex === module.lessons.length - 1}
                          className="rounded-lg p-1.5 text-ink-500 hover:bg-surface-alt disabled:opacity-30"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </form>
                      <form action={toggleFreePreview.bind(null, lesson.id)}>
                        <button
                          type="submit"
                          title={lesson.freePreview ? "Tornar restrita" : "Tornar gratuita"}
                          className="rounded-lg p-1.5 text-ink-500 hover:bg-surface-alt"
                        >
                          {lesson.freePreview ? (
                            <Lock className="h-3.5 w-3.5" />
                          ) : (
                            <Unlock className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </form>
                      <form action={deleteLesson.bind(null, lesson.id)}>
                        <button type="submit" className="rounded-lg p-1.5 text-accent-600 hover:bg-accent-400/10">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 border-t border-ink-900/5 pt-4">
                <AddLessonForm moduleId={module.id} videos={videos} />
              </div>

              <ModuleQuizEditor moduleId={module.id} quiz={module.quiz} />
            </Card>
          ))}
        </div>

        <Card className="mt-4 p-5">
          <form action={createModuleWithId} className="flex gap-3">
            <Input name="title" placeholder="Nome do novo módulo (ex: Sintaxe)" required />
            <Button type="submit" className="shrink-0">
              Adicionar módulo
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
