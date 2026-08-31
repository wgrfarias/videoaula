"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag, X } from "lucide-react";
import { Input, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatInstallments } from "@/lib/utils";

export function CouponCheckout({
  courseSlug,
  price,
  installments,
  effectivePrice,
  hasDiscount,
  isFree,
}: {
  courseSlug: string;
  price: number;
  installments: number;
  effectivePrice: number;
  hasDiscount: boolean;
  isFree: boolean;
}) {
  const router = useRouter();
  const [couponInput, setCouponInput] = useState("");
  const [applying, setApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; effectivePrice: number } | null>(
    null
  );
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const shownPrice = appliedCoupon ? appliedCoupon.effectivePrice : effectivePrice;
  const shownHasDiscount = Boolean(appliedCoupon) || hasDiscount;

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setApplying(true);
    setCouponError(null);
    const res = await fetch("/api/coupons/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput.trim(), courseSlug }),
    });
    const data = await res.json().catch(() => ({}));
    setApplying(false);

    if (!res.ok) {
      setCouponError(data.error ?? "Não foi possível aplicar o cupom.");
      return;
    }
    setAppliedCoupon({ code: data.code, effectivePrice: data.effectivePrice });
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  }

  async function handleCheckout() {
    setPurchasing(true);
    setPurchaseError(null);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlug, couponCode: appliedCoupon?.code }),
    });
    const data = await res.json();

    if (!res.ok) {
      setPurchasing(false);
      setPurchaseError(data.error ?? "Não foi possível concluir a compra.");
      return;
    }

    if (data.redirectUrl) {
      // Off to Stripe's hosted checkout page — stay in "purchasing" state,
      // there's nothing left to do locally until the browser navigates away.
      window.location.href = data.redirectUrl;
      return;
    }

    setPurchasing(false);
    router.push(`/aluno/cursos/${data.slug}`);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between border-t border-ink-900/5 pt-4">
        <span className="text-sm text-ink-500">Total</span>
        <span className="flex items-center gap-2">
          {shownHasDiscount && (
            <span className="text-sm text-ink-300 line-through">{formatCurrency(price)}</span>
          )}
          <span className="font-display text-xl font-bold text-brand-700">
            {isFree ? "Grátis" : formatInstallments(shownPrice, installments)}
          </span>
        </span>
      </div>

      {!isFree && (
        <div className="mt-4">
          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <span className="flex items-center gap-1.5 font-medium">
                <Tag className="h-3.5 w-3.5" /> Cupom {appliedCoupon.code} aplicado
              </span>
              <button type="button" onClick={handleRemoveCoupon} className="text-emerald-600 hover:underline">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Cupom de desconto"
                className="uppercase"
              />
              <Button type="button" variant="outline" disabled={applying} onClick={handleApplyCoupon}>
                {applying ? "Aplicando..." : "Aplicar"}
              </Button>
            </div>
          )}
          <FieldError>{couponError}</FieldError>
        </div>
      )}

      <div className="mt-5">
        <Button onClick={handleCheckout} disabled={purchasing} className="w-full">
          {purchasing ? "Confirmando pagamento..." : "Confirmar compra"}
        </Button>
        <FieldError>{purchaseError}</FieldError>
      </div>
    </div>
  );
}
