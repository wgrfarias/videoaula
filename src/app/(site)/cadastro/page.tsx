import Link from "next/link";
import { RegisterForm } from "@/components/site/register-form";

export const metadata = { title: "Criar conta | Rumo à TI com Wagner Farias" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16">
      <h1 className="font-display text-2xl font-bold text-ink-900">Criar sua conta</h1>
      <p className="mt-1 text-sm text-ink-500">
        Crie sua conta gratuita para comprar e assistir aos cursos.
      </p>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-ink-500">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-semibold text-brand-700 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
