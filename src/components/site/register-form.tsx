"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Label, Input, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/site/google-icon";

export function RegisterForm({ googleEnabled }: { googleEnabled?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Não foi possível criar a conta.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      router.push("/entrar");
      return;
    }

    router.push("/aluno");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      {googleEnabled && (
        <>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/aluno" })}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-ink-300/40 bg-surface py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-surface-alt"
          >
            <GoogleIcon className="h-4 w-4" />
            Criar conta com Google
          </button>
          <div className="flex items-center gap-3 text-xs text-ink-300">
            <span className="h-px flex-1 bg-ink-300/30" /> ou use seu e-mail
            <span className="h-px flex-1 bg-ink-300/30" />
          </div>
        </>
      )}

      <div>
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" name="name" required placeholder="Seu nome" />
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required placeholder="voce@email.com" />
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Mínimo 6 caracteres"
        />
      </div>
      <FieldError>{error}</FieldError>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}
