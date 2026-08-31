import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS } from "@/lib/constants";
import { getSiteContent } from "@/lib/data/site-content";
import { getEffectivePrice } from "@/lib/pricing";
import { findValidCoupon, computeCouponPrice } from "@/lib/coupons";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

const checkoutSchema = z.object({
  courseSlug: z.string().min(1),
  couponCode: z.string().optional(),
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

  let effectivePrice: number;
  let validCouponId: string | null = null;

  if (parsed.data.couponCode) {
    const result = await findValidCoupon(parsed.data.couponCode, course.id, session.user.id);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    effectivePrice = computeCouponPrice(course.price, result.coupon);
    validCouponId = result.coupon.id;
  } else {
    const content = await getSiteContent();
    effectivePrice = getEffectivePrice(course, {
      promoActive: content.promoActive,
      promoGlobalDiscount: content.promoGlobalDiscount,
    }).effectivePrice;
  }

  // Free course, or a coupon that brings the price to R$ 0: nothing to
  // charge, so grant access right away — never send a $0 order to Stripe.
  if (effectivePrice <= 0) {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          amount: 0,
          status: ORDER_STATUS.PAID,
          provider: "free",
          paidAt: new Date(),
          userId: session.user.id,
          courseId: course.id,
          couponId: validCouponId,
        },
      });
      await tx.enrollment.create({
        data: {
          userId: session.user.id,
          courseId: course.id,
          expiresAt: new Date(Date.now() + course.accessDays * 24 * 60 * 60 * 1000),
        },
      });
      if (validCouponId) {
        await tx.couponRedemption.update({
          where: {
            couponId_userId_courseId: { couponId: validCouponId, userId: session.user.id, courseId: course.id },
          },
          data: { convertedAt: new Date(), orderId: order.id },
        });
      }
    });
    return NextResponse.json({ ok: true, slug: course.slug });
  }

  // No Stripe keys configured: keep the old instant-approval demo flow so
  // the platform stays testable without a real payment gateway.
  if (!isStripeConfigured()) {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          amount: effectivePrice,
          status: ORDER_STATUS.PAID,
          provider: "demo",
          paidAt: new Date(),
          userId: session.user.id,
          courseId: course.id,
          couponId: validCouponId,
        },
      });
      await tx.enrollment.create({
        data: {
          userId: session.user.id,
          courseId: course.id,
          expiresAt: new Date(Date.now() + course.accessDays * 24 * 60 * 60 * 1000),
        },
      });
      if (validCouponId) {
        await tx.couponRedemption.update({
          where: {
            couponId_userId_courseId: { couponId: validCouponId, userId: session.user.id, courseId: course.id },
          },
          data: { convertedAt: new Date(), orderId: order.id },
        });
      }
    });
    return NextResponse.json({ ok: true, slug: course.slug });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const stripe = getStripe();

  let stripeSession;
  try {
    stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "brl",
            unit_amount: Math.round(effectivePrice * 100),
            product_data: { name: course.title },
          },
        },
      ],
      automatic_tax: { enabled: true },
      success_url: `${origin}/checkout/${course.slug}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/${course.slug}`,
      metadata: {
        userId: session.user.id,
        courseId: course.id,
        couponId: validCouponId ?? "",
      },
    });
  } catch (error) {
    // Common causes: invalid/test-vs-live key mismatch, or Stripe Tax
    // enabled here but not yet configured with an origin address in the
    // Stripe Dashboard (Settings > Tax) — see README "Pagamento com Stripe".
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Stripe checkout session error:", message);
    return NextResponse.json(
      { error: "Não foi possível iniciar o pagamento. Tente novamente em instantes." },
      { status: 502 }
    );
  }

  if (!stripeSession.url) {
    return NextResponse.json({ error: "Não foi possível iniciar o pagamento" }, { status: 502 });
  }

  await prisma.order.create({
    data: {
      amount: effectivePrice,
      status: ORDER_STATUS.PENDING,
      provider: "stripe",
      stripeSessionId: stripeSession.id,
      userId: session.user.id,
      courseId: course.id,
      couponId: validCouponId,
    },
  });

  return NextResponse.json({ ok: true, redirectUrl: stripeSession.url });
}
