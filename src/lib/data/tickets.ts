import { prisma } from "@/lib/prisma";
import { TICKET_STATUS } from "@/lib/constants";

export async function getTicketCategories() {
  return prisma.ticketCategory.findMany({ orderBy: { name: "asc" } });
}

// Drives the red notification badge on the admin "Chamados" nav item —
// chamados still marked OPEN haven't had a first reply from the admin yet.
export async function getOpenTicketCount() {
  return prisma.ticket.count({ where: { status: TICKET_STATUS.OPEN } });
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
