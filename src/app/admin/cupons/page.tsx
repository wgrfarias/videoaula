import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getCouponsWithStats } from "@/lib/data/coupons";
import { createCoupon, toggleCouponActive, deleteCoupon } from "@/lib/actions/coupons";
import { Card, Badge } from "@/components/ui/card";
import { CouponForm } from "@/components/admin/coupon-form";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Cupons | Admin" };

export default async function AdminCouponsPage() {
  await requireAdmin();
  const [coupons, courses] = await Promise.all([
    getCouponsWithStats(),
    prisma.course.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Cupons de desconto</h1>
      <p className="mt-1 text-sm text-ink-500">
        Crie códigos de desconto para campanhas. Um cupom válido substitui (não
        soma com) a promoção do site ou o desconto próprio do curso.
      </p>

      <Card className="mt-6 p-6">
        <h2 className="font-display font-semibold text-ink-900">Novo cupom</h2>
        <div className="mt-4">
          <CouponForm courses={courses} createCoupon={createCoupon} />
        </div>
      </Card>

      <div className="mt-8 space-y-4">
        {coupons.map((coupon) => {
          const conversionRate =
            coupon.appliedCount > 0 ? Math.round((coupon.convertedCount / coupon.appliedCount) * 100) : 0;
          return (
            <Card key={coupon.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-bold text-ink-900">{coupon.code}</p>
                    <Badge tone={coupon.active ? "success" : "neutral"}>
                      {coupon.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-500">
                    {coupon.discountType === "PERCENT"
                      ? `${coupon.discountValue}% de desconto`
                      : `${formatCurrency(coupon.discountValue)} de desconto`}
                    {" · "}
                    {coupon.scope === "SITEWIDE"
                      ? "qualquer curso/combo"
                      : coupon.courses.map((c) => c.title).join(", ") || "nenhum curso selecionado"}
                    {coupon.maxRedemptions != null && ` · limite de ${coupon.maxRedemptions} usos`}
                    {coupon.onePerCustomer && " · 1 por cliente"}
                    {coupon.expiresAt && ` · expira em ${coupon.expiresAt.toLocaleDateString("pt-BR")}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={toggleCouponActive.bind(null, coupon.id)}>
                    <button
                      type="submit"
                      className="rounded-lg border border-ink-300/40 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-surface-alt"
                    >
                      {coupon.active ? "Desativar" : "Ativar"}
                    </button>
                  </form>
                  <form action={deleteCoupon.bind(null, coupon.id)}>
                    <button
                      type="submit"
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-accent-600 hover:bg-accent-400/10"
                    >
                      Excluir
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-ink-900/5 pt-4 text-center">
                <div>
                  <p className="font-display text-lg font-bold text-ink-900">{coupon.appliedCount}</p>
                  <p className="text-xs text-ink-500">Aplicados</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-emerald-600">{coupon.convertedCount}</p>
                  <p className="text-xs text-ink-500">Convertidos em compra</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-accent-600">{coupon.abandonedCount}</p>
                  <p className="text-xs text-ink-500">Desistências</p>
                </div>
              </div>
              {coupon.appliedCount > 0 && (
                <p className="mt-2 text-center text-xs text-ink-300">
                  Taxa de conversão: {conversionRate}%
                </p>
              )}
            </Card>
          );
        })}

        {coupons.length === 0 && (
          <p className="text-sm text-ink-500">Nenhum cupom criado ainda.</p>
        )}
      </div>
    </div>
  );
}
