import Link from "next/link";
import { LoginForm } from "@/components/site/login-form";

export const metadata = { title: "Entrar | Português com a Camila" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16">
      <h1 className="font-display text-2xl font-bold text-ink-900">Entrar na sua conta</h1>
      <p className="mt-1 text-sm text-ink-500">
        Acesse seus cursos ou o painel da professora.
      </p>

      <LoginForm callbackUrl={callbackUrl} />

      <p className="mt-6 text-center text-sm text-ink-500">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-brand-700 hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
