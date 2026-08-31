import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";

export const metadata = { title: "Histórico de compras | Área do aluno" };

const STATUS_LABEL: Record<string, { label: string; tone: "success" | "neutral" | "accent" }> = {
  [ORDER_STATUS.PAID]: { label: "Pago", tone: "success" },
  [ORDER_STATUS.PENDING]: { label: "Pendente", tone: "neutral" },
  [ORDER_STATUS.CANCELED]: { label: "Cancelado", tone: "accent" },
  [ORDER_STATUS.REFUNDED]: { label: "Reembolsado", tone: "accent" },
};

export default async function PurchaseHistoryPage() {
  const user = await requireUser();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      course: { select: { title: true, slug: true } },
      couponRedemption: { include: { coupon: { select: { code: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Histórico de compras</h1>
      <p className="mt-1 text-sm text-ink-500">
        Todos os pedidos feitos com esta conta, do mais recente para o mais antigo.
      </p>

      {orders.length === 0 ? (
        <Card className="mt-8 p-8 text-center">
          <p className="text-ink-700">Você ainda não fez nenhuma compra.</p>
        </Card>
      ) : (
        <Card className="mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-900/10 bg-surface-alt/40 text-xs uppercase text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Curso</th>
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Valor</th>
                  <th className="px-4 py-3 font-semibold">Cupom</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/5">
                {orders.map((order) => {
                  const status = STATUS_LABEL[order.status] ?? { label: order.status, tone: "neutral" as const };
                  return (
                    <tr key={order.id}>
                      <td className="px-4 py-3 font-medium text-ink-900">{order.course.title}</td>
                      <td className="px-4 py-3 text-ink-500">
                        {order.createdAt.toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-ink-700">{formatCurrency(order.amount)}</td>
                      <td className="px-4 py-3 text-ink-500">
                        {order.couponRedemption?.coupon.code ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
