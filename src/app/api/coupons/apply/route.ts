import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findValidCoupon, computeCouponPrice } from "@/lib/coupons";

const schema = z.object({
  code: z.string().min(1),
  courseSlug: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "É preciso entrar na sua conta" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { slug: parsed.data.courseSlug } });
  if (!course || !course.published) {
    return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });
  }

  const result = await findValidCoupon(parsed.data.code, course.id, session.user.id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const { coupon } = result;
  const effectivePrice = computeCouponPrice(course.price, coupon);

  // Recorded now, before the purchase — this is what lets /admin/cupons show
  // codes that were applied but never converted into a sale.
  await prisma.couponRedemption.upsert({
    where: { couponId_userId_courseId: { couponId: coupon.id, userId: session.user.id, courseId: course.id } },
    update: { appliedAt: new Date() },
    create: { couponId: coupon.id, userId: session.user.id, courseId: course.id },
  });

  return NextResponse.json({
    ok: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    effectivePrice,
  });
}
