export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

/**
 * Validates a Brazilian CPF using its official check-digit algorithm
 * (not just a format/length check) — see e.g. Receita Federal's spec.
 */
export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  // Sequences like 00000000000 or 11111111111 pass the checksum math but
  // are never real CPFs.
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const digits = cpf.split("").map(Number);

  const checkDigit = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += digits[i] * (length + 1 - i);
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return checkDigit(9) === digits[9] && checkDigit(10) === digits[10];
}

export function formatCPF(value: string): string {
  const cpf = onlyDigits(value).slice(0, 11);
  return cpf
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
