import { clsx, type ClassValue } from "clsx";
import slugifyLib from "slugify";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatInstallments(price: number, installments: number) {
  if (installments <= 1) return formatCurrency(price);
  const installmentValue = price / installments;
  return `${installments}x de ${formatCurrency(installmentValue)}`;
}

export function slugify(input: string) {
  return slugifyLib(input, { lower: true, strict: true, trim: true });
}

export function formatDuration(totalSeconds?: number | null) {
  if (!totalSeconds || totalSeconds <= 0) return "--:--";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const mm = String(m).padStart(h > 0 ? 2 : 1, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${mm}:${ss}`;
}
