import { prisma } from "@/lib/prisma";

export type CouponDiscount = { discountType: string; discountValue: number };

export function computeCouponPrice(price: number, coupon: CouponDiscount) {
  if (coupon.discountType === "FIXED") {
    return Math.max(0, Math.round((price - coupon.discountValue) * 100) / 100);
  }
  const percent = Math.min(100, Math.max(0, coupon.discountValue));
  return Math.round(price * (1 - percent / 100) * 100) / 100;
}

// Re-validated server-side both when the customer applies the code and again
// at the moment of purchase — never trust a client-sent discount amount.
export async function findValidCoupon(code: string, courseId: string, userId: string) {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: { courses: { select: { id: true } } },
  });
  if (!coupon) return { error: "Cupom não encontrado" } as const;
  if (!coupon.active) return { error: "Este cupom não está mais ativo" } as const;
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { error: "Este cupom expirou" } as const;
  }
  if (coupon.scope === "COURSES" && !coupon.courses.some((c) => c.id === courseId)) {
    return { error: "Este cupom não é válido para este curso" } as const;
  }

  const convertedCount = await prisma.couponRedemption.count({
    where: { couponId: coupon.id, convertedAt: { not: null } },
  });
  if (coupon.maxRedemptions != null && convertedCount >= coupon.maxRedemptions) {
    return { error: "Este cupom atingiu o limite de usos" } as const;
  }

  if (coupon.onePerCustomer) {
    const alreadyUsed = await prisma.couponRedemption.findFirst({
      where: { couponId: coupon.id, userId, convertedAt: { not: null } },
    });
    if (alreadyUsed) return { error: "Você já usou este cupom" } as const;
  }

  return { coupon } as const;
}
