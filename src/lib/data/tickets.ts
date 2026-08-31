import { prisma } from "@/lib/prisma";

export async function getTicketCategories() {
  return prisma.ticketCategory.findMany({ orderBy: { name: "asc" } });
}

export async function getUserTickets(userId: string) {
  return prisma.ticket.findMany({
    where: { authorId: userId },
    include: {
      category: true,
      messages: {
        include: { author: { select: { name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllTickets() {
  return prisma.ticket.findMany({
    include: {
      category: true,
      author: { select: { name: true, email: true } },
      messages: {
        include: { author: { select: { name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
