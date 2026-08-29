import { notFound } from "next/navigation";
import { ArrowDown, ArrowUp, Lock, Trash2, Unlock } from "lucide-react";
import { requireInstructor } from "@/lib/session";
import { getInstructorCourse, getInstructorVideos } from "@/lib/data/instructor";
import { getCategories } from "@/lib/data/courses";
import { Card, Badge } from "@/components/ui/card";
import { Label, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddLessonForm } from "@/components/instructor/add-lesson-form";
import { CoverImageField } from "@/components/instructor/cover-image-field";
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
} from "@/lib/actions/courses";
import { formatDuration } from "@/lib/utils";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireInstructor();

  const [course, categories, videos] = await Promise.all([
    getInstructorCourse(id),
    getCategories(),
    getInstructorVideos(user.id),
  ]);

  if (!course || course.instructorId !== user.id) notFound();

  const updateCourseWithId = updateCourse.bind(null, course.id);
  const createModuleWithId = createModule.bind(null, course.id);

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
          <form action={deleteCourse.bind(null, course.id)}>
            <Button type="submit" variant="ghost" className="text-accent-600">
              Excluir
            </Button>
          </form>
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
          <CoverImageField defaultValue={course.coverImageUrl ?? ""} />
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
          </div>
          <div>
            <Label htmlFor="categoryId">Categoria</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={course.categoryId ?? ""}
              className="w-full rounded-xl border border-ink-300/40 bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit">Salvar alterações</Button>
        </form>
      </Card>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Módulos e aulas
          </h2>
        </div>

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
