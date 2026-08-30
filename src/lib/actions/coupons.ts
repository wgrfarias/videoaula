"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const DISCOUNT_TYPES = new Set(["PERCENT", "FIXED"]);

export async function createCoupon(formData: FormData) {
  await requireAdmin();

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const discountType = String(formData.get("discountType") ?? "");
  const discountValueRaw = Number(formData.get("discountValue") ?? 0);
  const scope = String(formData.get("scope") ?? "SITEWIDE");
  const courseIds = formData.getAll("courseIds").map(String).filter(Boolean);
  const maxRedemptionsRaw = String(formData.get("maxRedemptions") ?? "").trim();
  const onePerCustomer = formData.get("onePerCustomer") === "on";
  const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();

  if (!code) throw new Error("Informe um código para o cupom");
  if (!DISCOUNT_TYPES.has(discountType)) throw new Error("Tipo de desconto inválido");
  if (!Number.isFinite(discountValueRaw) || discountValueRaw <= 0) {
    throw new Error("Informe um valor de desconto válido");
  }
  if (discountType === "PERCENT" && discountValueRaw > 100) {
    throw new Error("Desconto percentual não pode passar de 100%");
  }
  if (scope === "COURSES" && courseIds.length === 0) {
    throw new Error("Selecione ao menos um curso para um cupom restrito");
  }

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) throw new Error("Já existe um cupom com esse código");

  await prisma.coupon.create({
    data: {
      code,
      discountType,
      discountValue: discountValueRaw,
      scope,
      maxRedemptions: maxRedemptionsRaw ? Math.max(1, Math.round(Number(maxRedemptionsRaw))) : null,
      onePerCustomer,
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
      ...(scope === "COURSES" ? { courses: { connect: courseIds.map((id) => ({ id })) } } : {}),
    },
  });

  revalidatePath("/admin/cupons");
}

export async function toggleCouponActive(couponId: string) {
  await requireAdmin();
  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!coupon) throw new Error("Cupom não encontrado");

  await prisma.coupon.update({ where: { id: couponId }, data: { active: !coupon.active } });
  revalidatePath("/admin/cupons");
}

export async function deleteCoupon(couponId: string) {
  await requireAdmin();

  const convertedCount = await prisma.couponRedemption.count({
    where: { couponId, convertedAt: { not: null } },
  });
  if (convertedCount > 0) {
    throw new Error(
      "Este cupom já gerou vendas e não pode ser excluído — desative-o em vez disso."
    );
  }

  await prisma.coupon.delete({ where: { id: couponId } });
  revalidatePath("/admin/cupons");
}
