"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/session";
import { ROLES, TICKET_STATUS } from "@/lib/constants";

function revalidateTicketPaths() {
  revalidatePath("/aluno/suporte");
  revalidatePath("/professor/suporte");
  revalidatePath("/admin/chamados");
}

export async function createTicket(formData: FormData) {
  const user = await requireUser();

  const subject = String(formData.get("subject") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");

  if (!subject || !description) throw new Error("Preencha o assunto e a descrição");
  if (!categoryId) throw new Error("Selecione uma categoria");

  await prisma.ticket.create({
    data: { subject, description, categoryId, authorId: user.id },
  });

  revalidateTicketPaths();
}

export async function replyTicket(ticketId: string, formData: FormData) {
  const user = await requireUser();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) throw new Error("Escreva uma mensagem");

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error("Chamado não encontrado");

  const isAdmin = user.role === ROLES.ADMIN;
  if (!isAdmin && ticket.authorId !== user.id) {
    throw new Error("Você não tem permissão para responder este chamado");
  }

  await prisma.ticketMessage.create({ data: { ticketId, authorId: user.id, body } });

  if (isAdmin && ticket.status === TICKET_STATUS.OPEN) {
    await prisma.ticket.update({ where: { id: ticketId }, data: { status: TICKET_STATUS.IN_PROGRESS } });
  }

  revalidateTicketPaths();
}

export async function setTicketStatus(ticketId: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status") ?? "");
  if (!Object.values(TICKET_STATUS).includes(status as (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS])) {
    throw new Error("Status inválido");
  }

  await prisma.ticket.update({ where: { id: ticketId }, data: { status } });
  revalidateTicketPaths();
}

export async function createTicketCategory(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Informe um nome para a categoria");

  const existing = await prisma.ticketCategory.findUnique({ where: { name } });
  if (existing) throw new Error("Já existe uma categoria com esse nome");

  await prisma.ticketCategory.create({ data: { name } });
  revalidatePath("/admin/chamados");
}

export async function deleteTicketCategory(categoryId: string) {
  await requireAdmin();

  const ticketCount = await prisma.ticket.count({ where: { categoryId } });
  if (ticketCount > 0) {
    throw new Error("Essa categoria já tem chamados associados e não pode ser excluída.");
  }

  await prisma.ticketCategory.delete({ where: { id: categoryId } });
  revalidatePath("/admin/chamados");
}
