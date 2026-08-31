"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function adminDeleteComment(commentId: string) {
  await requireAdmin();
  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath("/admin/comentarios");
}
