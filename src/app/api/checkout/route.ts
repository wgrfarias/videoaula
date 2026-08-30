import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS } from "@/lib/constants";
import { getSiteContent } from "@/lib/data/site-content";
import { getEffectivePrice } from "@/lib/pricing";

// Demo/instant-paid checkout: creates a PAID order and grants enrollment
// immediately. Swap the body of this handler for a real gateway (e.g. Stripe
// Checkout Session) later — the Order/Enrollment data model already supports
// a PENDING -> PAID transition driven by a webhook.
const checkoutSchema = z.object({
  courseSlug: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "É preciso entrar na sua conta" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({
    where: { slug: parsed.data.courseSlug },
  });
  if (!course || !course.published) {
    return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });
  }

  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
  });
  if (existingEnrollment) {
    return NextResponse.json({ ok: true, alreadyEnrolled: true, slug: course.slug });
  }

  const content = await getSiteContent();
  const { effectivePrice } = getEffectivePrice(course, {
    promoActive: content.promoActive,
    promoGlobalDiscount: content.promoGlobalDiscount,
  });

  await prisma.$transaction([
    prisma.order.create({
      data: {
        amount: effectivePrice,
        status: ORDER_STATUS.PAID,
        provider: "demo",
        paidAt: new Date(),
        userId: session.user.id,
        courseId: course.id,
      },
    }),
    prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId: course.id,
        expiresAt: new Date(Date.now() + course.accessDays * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  return NextResponse.json({ ok: true, slug: course.slug });
}
