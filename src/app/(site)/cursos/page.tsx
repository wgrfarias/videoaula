import { CourseCard } from "@/components/site/course-card";
import { getCategories, getPublishedCourses } from "@/lib/data/courses";
import { getSiteContent } from "@/lib/data/site-content";
import { getMaintenanceMessage } from "@/lib/maintenance";
import { MaintenanceScreen } from "@/components/site/maintenance-screen";

export const metadata = {
  title: "Cursos | Rumo à TI com Wagner Farias",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const maintenanceMessage = await getMaintenanceMessage();
  if (maintenanceMessage) return <MaintenanceScreen message={maintenanceMessage} />;

  const { q, categoria } = await searchParams;
  const [courses, categories, content] = await Promise.all([
    getPublishedCourses({ query: q, categorySlug: categoria }),
    getCategories(),
    getSiteContent(),
  ]);
  const promo = { promoActive: content.promoActive, promoGlobalDiscount: content.promoGlobalDiscount };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-ink-900 md:text-4xl">Cursos</h1>
        <p className="mt-2 text-ink-500">{courses.length} curso(s) encontrado(s)</p>
      </div>

      <form className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-[1fr_auto]" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Pesquisar por palavra-chave"
          className="w-full rounded-xl border border-ink-300/40 bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <select
          name="categoria"
          defaultValue={categoria ?? ""}
          className="w-full rounded-xl border border-ink-300/40 bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 sm:w-56"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 sm:col-span-2 sm:w-fit sm:justify-self-center"
        >
          Filtrar
        </button>
      </form>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} promo={promo} />
        ))}
      </div>

      {courses.length === 0 && (
        <p className="mt-12 text-center text-ink-500">
          Nenhum curso encontrado para esse filtro.
        </p>
      )}
    </div>
  );
}
