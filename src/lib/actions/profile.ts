"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { isValidCPF, onlyDigits } from "@/lib/cpf";

export async function updateProfile(formData: FormData) {
  const user = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const cpfInput = String(formData.get("cpf") ?? "").trim();

  if (!name) throw new Error("Informe seu nome");

  const current = await prisma.user.findUnique({ where: { id: user.id } });
  if (!current) throw new Error("Usuário não encontrado");

  const data: { name: string; nickname: string | null; bio: string | null; cpf?: string } = {
    name,
    nickname: nickname || null,
    bio: bio || null,
  };

  // CPF can only be set once — it's what identifies the account on the
  // video watermark, so it must not be editable afterwards.
  if (!current.cpf && cpfInput) {
    if (!isValidCPF(cpfInput)) throw new Error("CPF inválido");
    const cpfDigits = onlyDigits(cpfInput);
    const existing = await prisma.user.findUnique({ where: { cpf: cpfDigits } });
    if (existing && existing.id !== user.id) {
      throw new Error("Este CPF já está cadastrado em outra conta");
    }
    data.cpf = cpfDigits;
  }

  await prisma.user.update({ where: { id: user.id }, data });

  revalidatePath("/aluno/perfil");
}
