import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getCourseBySlug } from "@/lib/data/courses";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { formatInstallments } from "@/lib/utils";
import { CheckoutButton } from "@/components/site/checkout-button";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course || !course.published) notFound();

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/entrar?callbackUrl=/checkout/${slug}`);
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });
  if (enrollment) {
    redirect(`/aluno/cursos/${course.slug}`);
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-16">
      <h1 className="font-display text-2xl font-bold text-ink-900">Finalizar compra</h1>
      <p className="mt-1 text-sm text-ink-500">
        Confira os dados do curso antes de confirmar o pagamento.
      </p>

      <Card className="mt-8 overflow-hidden">
        <div className="relative aspect-video w-full bg-brand-800">
          {course.coverImageUrl && (
            <Image
              src={course.coverImageUrl}
              alt={course.title}
              fill
              className="object-cover"
              unoptimized
            />
          )}
        </div>
        <div className="p-6">
          <h2 className="font-display font-semibold text-ink-900">{course.title}</h2>
          <p className="mt-1 text-sm text-ink-500">Acesso por {course.accessDays} dias</p>

          <div className="mt-5 flex items-center justify-between border-t border-ink-900/5 pt-4">
            <span className="text-sm text-ink-500">Total</span>
            <span className="font-display text-xl font-bold text-brand-700">
              {formatInstallments(course.price, course.installments)}
            </span>
          </div>

          <CheckoutButton courseSlug={course.slug} />

          <p className="mt-3 text-center text-xs text-ink-300">
            Ambiente de demonstração — o pagamento é confirmado automaticamente.
          </p>
        </div>
      </Card>
    </div>
  );
}
