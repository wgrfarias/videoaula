"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { ROLES } from "@/lib/constants";

const VALID_ROLES = new Set(Object.values(ROLES));

export async function setUserRole(userId: string, formData: FormData) {
  const admin = await requireAdmin();

  if (userId === admin.id) {
    throw new Error("Você não pode alterar o próprio papel.");
  }

  const role = String(formData.get("role") ?? "");
  if (!VALID_ROLES.has(role as (typeof ROLES)[keyof typeof ROLES])) {
    throw new Error("Papel inválido.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/usuarios");
}
