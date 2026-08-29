import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  return user;
}

export async function requireInstructor() {
  const user = await requireUser();
  if (user.role !== ROLES.INSTRUCTOR && user.role !== ROLES.ADMIN) {
    redirect("/aluno");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== ROLES.ADMIN) {
    redirect("/aluno");
  }
  return user;
}
