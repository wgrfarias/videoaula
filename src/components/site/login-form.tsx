"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Label, Input, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/site/google-icon";

export function LoginForm({
  callbackUrl,
  googleEnabled,
}: {
  callbackUrl?: string;
  googleEnabled?: boolean;
}) {
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
      const role = session?.user?.role;
      const destination = role === "ADMIN" ? "/admin" : role === "INSTRUCTOR" ? "/professor" : "/aluno";
      router.push(destination);
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      {googleEnabled && (
        <>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: callbackUrl || "/aluno" })}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-ink-300/40 bg-surface py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-surface-alt"
          >
            <GoogleIcon className="h-4 w-4" />
            Entrar com Google
          </button>
          <div className="flex items-center gap-3 text-xs text-ink-300">
            <span className="h-px flex-1 bg-ink-300/30" /> ou entre com e-mail
            <span className="h-px flex-1 bg-ink-300/30" />
          </div>
        </>
      )}

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

      <div className="rounded-xl bg-surface-alt/60 p-3 text-xs text-ink-500">
        <p className="font-semibold text-ink-700">Contas de demonstração</p>
        <p>Aluna: aluno@exemplo.com / senha123</p>
        <p>Admin (Wagner): wagner@rumoati.com.br / senha123</p>
      </div>
    </form>
  );
}
