import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { isValidCPF, onlyDigits } from "@/lib/cpf";

const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres"),
  cpf: z.string().refine(isValidCPF, "CPF inválido"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const { name, email, password, cpf } = parsed.data;
  const cpfDigits = onlyDigits(cpf);

  const [existingEmail, existingCpf] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { cpf: cpfDigits } }),
  ]);

  if (existingEmail) {
    return NextResponse.json(
      { error: "Já existe uma conta com este e-mail" },
      { status: 409 }
    );
  }
  if (existingCpf) {
    return NextResponse.json(
      { error: "Já existe uma conta com este CPF" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      cpf: cpfDigits,
      role: ROLES.STUDENT,
    },
  });

  return NextResponse.json({ ok: true });
}
