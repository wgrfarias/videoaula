import { requireAdmin } from "@/lib/session";
import { getTicketCategories, getAllTickets } from "@/lib/data/tickets";
import {
  createTicketCategory,
  deleteTicketCategory,
  replyTicket,
  setTicketStatus,
} from "@/lib/actions/tickets";
import { Card, Badge } from "@/components/ui/card";
import { Label, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TICKET_STATUS } from "@/lib/constants";
import { X, MessageCircle } from "lucide-react";

export const metadata = { title: "Chamados | Admin" };

const STATUS_LABEL: Record<string, { label: string; tone: "neutral" | "brand" | "success" }> = {
  [TICKET_STATUS.OPEN]: { label: "Aberto", tone: "brand" },
  [TICKET_STATUS.IN_PROGRESS]: { label: "Em andamento", tone: "neutral" },
  [TICKET_STATUS.CLOSED]: { label: "Encerrado", tone: "success" },
};

export default async function AdminTicketsPage() {
  await requireAdmin();
  const [categories, tickets] = await Promise.all([getTicketCategories(), getAllTickets()]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Chamados</h1>
      <p className="mt-1 text-sm text-ink-500">
        Acompanhe e responda os chamados abertos por alunos e professores.
      </p>

      <Card className="mt-6 p-6">
        <h2 className="font-display font-semibold text-ink-900">Categorias</h2>
        <p className="mt-1 text-xs text-ink-500">
          As categorias aparecem para o usuário escolher ao abrir um chamado.
        </p>
        <form action={createTicketCategory} className="mt-4 flex gap-2">
          <div className="flex-1">
            <Label htmlFor="name">Nova categoria</Label>
            <Input id="name" name="name" placeholder="Ex: Pagamento" required />
          </div>
          <Button type="submit" className="mt-6 shrink-0">
            Adicionar
          </Button>
        </form>
        {categories.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <form action={deleteTicketCategory.bind(null, category.id)} className="flex items-center gap-1.5 rounded-full bg-surface-alt px-3 py-1.5 text-xs font-medium text-ink-700">
                  {category.name}
                  <button type="submit" title="Excluir categoria" className="text-ink-300 hover:text-accent-600">
                    <X className="h-3 w-3" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="mt-8 space-y-4">
        {tickets.map((ticket) => {
          const status = STATUS_LABEL[ticket.status] ?? { label: ticket.status, tone: "neutral" as const };
          return (
            <Card key={ticket.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink-900">{ticket.subject}</p>
                  <p className="text-xs text-ink-500">
                    {ticket.author.name} ({ticket.author.email}) · {ticket.category.name} ·{" "}
                    {ticket.createdAt.toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={status.tone}>{status.label}</Badge>
                  <form action={setTicketStatus.bind(null, ticket.id)} className="flex items-center gap-1.5">
                    <select
                      name="status"
                      defaultValue={ticket.status}
                      className="rounded-lg border border-ink-300/40 bg-surface px-2 py-1.5 text-xs outline-none focus:border-brand-500"
                    >
                      <option value={TICKET_STATUS.OPEN}>Aberto</option>
                      <option value={TICKET_STATUS.IN_PROGRESS}>Em andamento</option>
                      <option value={TICKET_STATUS.CLOSED}>Encerrado</option>
                    </select>
                    <button
                      type="submit"
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                    >
                      Salvar
                    </button>
                  </form>
                </div>
              </div>

              <p className="mt-3 text-sm text-ink-700">{ticket.description}</p>

              {ticket.messages.length > 0 && (
                <ul className="mt-4 space-y-3 border-t border-ink-900/5 pt-4">
                  {ticket.messages.map((message) => (
                    <li key={message.id} className="flex gap-2 text-sm">
                      <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" />
                      <div>
                        <p className="text-xs font-semibold text-ink-900">
                          {message.author.name}
                          {message.author.role === "ADMIN" && (
                            <span className="ml-1.5 font-normal text-brand-600">(suporte)</span>
                          )}
                        </p>
                        <p className="text-ink-700">{message.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {ticket.status !== TICKET_STATUS.CLOSED && (
                <form action={replyTicket.bind(null, ticket.id)} className="mt-4 flex gap-2">
                  <Input name="body" placeholder="Responder ao chamado..." required />
                  <Button type="submit" size="sm" className="shrink-0">
                    Enviar
                  </Button>
                </form>
              )}
            </Card>
          );
        })}

        {tickets.length === 0 && (
          <p className="text-sm text-ink-500">Nenhum chamado aberto ainda.</p>
        )}
      </div>
    </div>
  );
}
