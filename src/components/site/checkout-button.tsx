"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/input";

export function CheckoutButton({ courseSlug }: { courseSlug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlug }),
    });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Não foi possível concluir a compra.");
      return;
    }

    router.push(`/aluno/cursos/${data.slug}`);
    router.refresh();
  }

  return (
    <div className="mt-5">
      <Button onClick={handleCheckout} disabled={loading} className="w-full">
        {loading ? "Confirmando pagamento..." : "Confirmar compra"}
      </Button>
      <FieldError>{error}</FieldError>
    </div>
  );
}
