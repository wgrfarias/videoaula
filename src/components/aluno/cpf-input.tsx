"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { formatCPF } from "@/lib/cpf";

export function CpfInput({ defaultValue }: { defaultValue: string }) {
  const [cpf, setCpf] = useState(defaultValue);

  return (
    <Input
      id="cpf"
      name="cpf"
      inputMode="numeric"
      placeholder="000.000.000-00"
      value={formatCPF(cpf)}
      onChange={(e) => setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))}
    />
  );
}
