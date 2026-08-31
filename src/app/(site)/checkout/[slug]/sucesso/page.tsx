import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getCourseBySlug } from "@/lib/data/courses";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { fulfillCheckoutSession } from "@/lib/checkout-fulfillment";
import { Card } from "@/components/ui/card";

async function safeRetrieveSession(sessionId: string) {
  try {
    return await getStripe().checkout.sessions.retrieve(sessionId);
  } catch {
    return null;
  }
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { slug } = await params;
  const { session_id: sessionId } = await searchParams;
  const user = await requireUser();
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  if (!sessionId || !isStripeConfigured()) {
    redirect(`/checkout/${slug}`);
  }

  const stripeSession = await safeRetrieveSession(sessionId);
  if (!stripeSession) {
    redirect(`/checkout/${slug}`);
  }

  // Confirm this Checkout Session is really the order we created for this
  // user and course before acting on it — session_id comes from the URL.
  const order = await prisma.order.findUnique({ where: { stripeSessionId: stripeSession.id } });
  if (!order || order.userId !== user.id || order.courseId !== course.id) {
    redirect(`/checkout/${slug}`);
  }

  if (stripeSession.payment_status === "paid") {
    // Fallback in case the webhook hasn't landed yet — fulfillCheckoutSession
    // is idempotent, so this is a no-op if it already ran.
    await fulfillCheckoutSession(stripeSession);
    redirect(`/aluno/cursos/${slug}`);
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-16 text-center">
      <Card className="p-8">
        <h1 className="font-display text-xl font-bold text-ink-900">Pagamento em processamento</h1>
        <p className="mt-2 text-sm text-ink-500">
          Ainda estamos aguardando a confirmação do pagamento (comum em boleto
          ou Pix). Assim que ela chegar, o acesso ao curso é liberado
          automaticamente — você também recebe um e-mail do Stripe.
        </p>
        <a
          href={`/aluno/cursos/${slug}`}
          className="mt-5 inline-block rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Ir para o curso
        </a>
      </Card>
    </div>
  );
}
