import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS } from "@/lib/constants";

// Called from both the Stripe webhook (checkout.session.completed /
// checkout.session.async_payment_succeeded) and, as a fallback in case the
// webhook hasn't landed yet, the checkout success page — so this must be
// idempotent. Looked up by Order.status rather than the Stripe event id
// because the two callers don't share an event log.
export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return;

  const order = await prisma.order.findUnique({ where: { stripeSessionId: session.id } });
  if (!order) return;
  if (order.status === ORDER_STATUS.PAID) return;

  const course = await prisma.course.findUnique({ where: { id: order.courseId } });
  if (!course) return;

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: ORDER_STATUS.PAID,
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntentId,
      },
    });

    await tx.enrollment.upsert({
      where: { userId_courseId: { userId: order.userId, courseId: order.courseId } },
      update: {},
      create: {
        userId: order.userId,
        courseId: order.courseId,
        expiresAt: new Date(Date.now() + course.accessDays * 24 * 60 * 60 * 1000),
      },
    });

    if (order.couponId) {
      await tx.couponRedemption.update({
        where: {
          couponId_userId_courseId: {
            couponId: order.couponId,
            userId: order.userId,
            courseId: order.courseId,
          },
        },
        data: { convertedAt: new Date(), orderId: order.id },
      });
    }
  });
}
