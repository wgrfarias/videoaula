import { requireAdmin } from "@/lib/session";
import { getAllInstructorRevenue } from "@/lib/data/instructor";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Faturamento | Admin" };

export default async function AdminRevenuePage() {
  await requireAdmin();
  const instructors = await getAllInstructorRevenue();

  const totals = instructors.reduce(
    (acc, i) => ({
      gross: acc.gross + i.grossRevenue,
      platform: acc.platform + i.platformFee,
      net: acc.net + i.netRevenue,
    }),
    { gross: 0, platform: 0, net: 0 }
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Faturamento</h1>
      <p className="mt-1 text-sm text-ink-500">
        Faturamento consolidado por professor, já separando a comissão da
        plataforma (configurável em Usuários) do que cabe a cada um.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs text-ink-500">Faturamento bruto (todos)</p>
          <p className="font-display text-xl font-bold text-ink-900">{formatCurrency(totals.gross)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-ink-500">Comissão da plataforma</p>
          <p className="font-display text-xl font-bold text-brand-700">{formatCurrency(totals.platform)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-ink-500">Repasse aos professores</p>
          <p className="font-display text-xl font-bold text-ink-900">{formatCurrency(totals.net)}</p>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-900/10 bg-surface-alt/40 text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Professor</th>
                <th className="px-4 py-3 font-semibold">Cursos</th>
                <th className="px-4 py-3 font-semibold">Comissão</th>
                <th className="px-4 py-3 font-semibold">Bruto</th>
                <th className="px-4 py-3 font-semibold">Plataforma</th>
                <th className="px-4 py-3 font-semibold">Líquido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/5">
              {instructors.map((instructor) => (
                <tr key={instructor.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{instructor.name}</p>
                    <p className="text-xs text-ink-500">{instructor.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{instructor.courseCount}</td>
                  <td className="px-4 py-3 text-ink-700">{instructor.platformFeePercent}%</td>
                  <td className="px-4 py-3 text-ink-700">{formatCurrency(instructor.grossRevenue)}</td>
                  <td className="px-4 py-3 text-ink-700">{formatCurrency(instructor.platformFee)}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">
                    {formatCurrency(instructor.netRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {instructors.length === 0 && (
        <p className="mt-6 text-sm text-ink-500">Nenhum professor cadastrado ainda.</p>
      )}
    </div>
  );
}
