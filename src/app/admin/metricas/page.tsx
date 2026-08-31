import { requireAdmin } from "@/lib/session";
import {
  getPageTimeStats,
  getConversionFunnel,
  getContentEngagement,
  getVideoAbandonment,
} from "@/lib/data/analytics";
import { Card } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils";

export const metadata = { title: "Métricas | Admin" };

export default async function AdminMetricsPage() {
  await requireAdmin();

  const [pageStats, funnel, engagement, abandonment] = await Promise.all([
    getPageTimeStats(),
    getConversionFunnel(),
    getContentEngagement(),
    getVideoAbandonment(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Métricas</h1>
        <p className="mt-1 text-sm text-ink-500">
          Engajamento com o conteúdo e o site, calculado a partir do tempo em
          página e do progresso das aulas — sem depender de ferramenta externa.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="font-display font-semibold text-ink-900">Funil de conversão por curso</h2>
        <p className="mt-1 text-xs text-ink-500">
          Visitas na página do curso → visitas no checkout → compras confirmadas.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-900/10 text-xs uppercase text-ink-500">
              <tr>
                <th className="py-2 pr-4 font-semibold">Curso</th>
                <th className="py-2 pr-4 font-semibold">Visitas</th>
                <th className="py-2 pr-4 font-semibold">Checkout</th>
                <th className="py-2 pr-4 font-semibold">Compras</th>
                <th className="py-2 pr-4 font-semibold">Visita → Checkout</th>
                <th className="py-2 font-semibold">Checkout → Compra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/5">
              {funnel.map((row) => (
                <tr key={row.id}>
                  <td className="py-2 pr-4 font-medium text-ink-900">{row.title}</td>
                  <td className="py-2 pr-4 text-ink-700">{row.views}</td>
                  <td className="py-2 pr-4 text-ink-700">{row.checkouts}</td>
                  <td className="py-2 pr-4 text-ink-700">{row.purchased}</td>
                  <td className="py-2 pr-4 text-ink-700">{row.viewToCheckoutPct}%</td>
                  <td className="py-2 text-ink-700">{row.checkoutToPurchasePct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {funnel.length === 0 && (
            <p className="mt-3 text-sm text-ink-500">Ainda sem dados de navegação registrados.</p>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display font-semibold text-ink-900">Cursos mais assistidos</h2>
          <ul className="mt-4 space-y-3">
            {engagement.topCourses.map((course, i) => (
              <li key={course.title} className="flex items-center justify-between text-sm">
                <span className="text-ink-700">
                  {i + 1}. {course.title}
                </span>
                <span className="font-medium text-ink-900">{formatDuration(course.totalWatchedSeconds)}</span>
              </li>
            ))}
            {engagement.topCourses.length === 0 && (
              <p className="text-sm text-ink-500">Nenhum progresso registrado ainda.</p>
            )}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold text-ink-900">Aulas mais assistidas</h2>
          <ul className="mt-4 space-y-3">
            {engagement.topLessons.map((lesson, i) => (
              <li key={lesson.title + i} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ink-700">
                    {i + 1}. {lesson.title}
                  </span>
                  <span className="font-medium text-ink-900">{formatDuration(lesson.totalWatchedSeconds)}</span>
                </div>
                <p className="text-xs text-ink-300">{lesson.courseTitle}</p>
              </li>
            ))}
            {engagement.topLessons.length === 0 && (
              <p className="text-sm text-ink-500">Nenhum progresso registrado ainda.</p>
            )}
          </ul>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-display font-semibold text-ink-900">Abandono de vídeo</h2>
        <p className="mt-1 text-xs text-ink-500">
          Em que ponto das aulas os alunos costumam parar de assistir (com base
          em {abandonment.totalCounted} registros de progresso).
        </p>
        <div className="mt-4 grid grid-cols-4 gap-3 text-center">
          {Object.entries(abandonment.buckets).map(([range, count]) => {
            const pct = abandonment.totalCounted > 0 ? Math.round((count / abandonment.totalCounted) * 100) : 0;
            return (
              <div key={range}>
                <div className="mx-auto h-24 w-8 rounded-full bg-surface-alt">
                  <div
                    className="w-8 rounded-full bg-brand-600"
                    style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-semibold text-ink-900">{range}</p>
                <p className="text-xs text-ink-500">{count} ({pct}%)</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display font-semibold text-ink-900">Tempo por página</h2>
        <p className="mt-1 text-xs text-ink-500">
          Tempo médio e total que visitantes (logados ou não) passam em cada página.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-900/10 text-xs uppercase text-ink-500">
              <tr>
                <th className="py-2 pr-4 font-semibold">Página</th>
                <th className="py-2 pr-4 font-semibold">Visitas</th>
                <th className="py-2 pr-4 font-semibold">Tempo médio</th>
                <th className="py-2 font-semibold">Tempo total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/5">
              {pageStats.map((row) => (
                <tr key={row.path}>
                  <td className="py-2 pr-4 font-mono text-xs text-ink-900">{row.path}</td>
                  <td className="py-2 pr-4 text-ink-700">{row.views}</td>
                  <td className="py-2 pr-4 text-ink-700">{formatDuration(row.avgSeconds)}</td>
                  <td className="py-2 text-ink-700">{formatDuration(row.totalSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageStats.length === 0 && (
            <p className="mt-3 text-sm text-ink-500">Ainda sem visitas registradas.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
