"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Label, Input, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    if (callbackUrl) {
      router.push(callbackUrl);
    } else {
      const session = await getSession();
      const isInstructor = session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMIN";
      router.push(isInstructor ? "/professor" : "/aluno");
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required placeholder="voce@email.com" />
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" required placeholder="••••••••" />
      </div>
      <FieldError>{error}</FieldError>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      <div className="rounded-xl bg-cream-200/60 p-3 text-xs text-ink-500">
        <p className="font-semibold text-ink-700">Contas de demonstração</p>
        <p>Aluna: aluno@exemplo.com / senha123</p>
        <p>Professora: professora@exemplo.com / senha123</p>
      </div>
    </form>
  );
}
