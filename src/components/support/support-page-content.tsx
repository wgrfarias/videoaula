import { LifeBuoy, MessageCircle } from "lucide-react";
import { Card, Badge } from "@/components/ui/card";
import { Label, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getTicketCategories, getUserTickets } from "@/lib/data/tickets";
import { createTicket, replyTicket } from "@/lib/actions/tickets";
import { TICKET_STATUS } from "@/lib/constants";

const STATUS_LABEL: Record<string, { label: string; tone: "neutral" | "brand" | "success" }> = {
  [TICKET_STATUS.OPEN]: { label: "Aberto", tone: "brand" },
  [TICKET_STATUS.IN_PROGRESS]: { label: "Em andamento", tone: "neutral" },
  [TICKET_STATUS.CLOSED]: { label: "Encerrado", tone: "success" },
};

export async function SupportPageContent({ userId }: { userId: string }) {
  const [categories, tickets] = await Promise.all([getTicketCategories(), getUserTickets(userId)]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <LifeBuoy className="h-6 w-6 text-brand-600" />
        <h1 className="font-display text-2xl font-bold text-ink-900">Central de ajuda</h1>
      </div>
      <p className="mt-1 text-sm text-ink-500">
        Abra um chamado se tiver algum problema — nossa equipe responde por aqui mesmo.
      </p>

      <Card className="mt-6 p-6">
        <h2 className="font-display font-semibold text-ink-900">Abrir novo chamado</h2>
        <form action={createTicket} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="subject">Assunto</Label>
            <Input id="subject" name="subject" placeholder="Resumo do problema" required />
          </div>
          <div>
            <Label htmlFor="categoryId">Categoria</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue=""
              required
              className="w-full rounded-xl border border-ink-300/40 bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="" disabled>
                Escolha uma categoria
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="mt-1 text-xs text-ink-300">
                Nenhuma categoria cadastrada ainda — peça ao admin para criar uma.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Descreva o problema</Label>
            <Textarea id="description" name="description" required className="min-h-28" />
          </div>
          <Button type="submit" disabled={categories.length === 0}>
            Abrir chamado
          </Button>
        </form>
      </Card>

      <div className="mt-8 space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink-900">Meus chamados</h2>
        {tickets.map((ticket) => {
          const status = STATUS_LABEL[ticket.status] ?? { label: ticket.status, tone: "neutral" as const };
          return (
            <Card key={ticket.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink-900">{ticket.subject}</p>
                  <p className="text-xs text-ink-500">
                    {ticket.category.name} · {ticket.createdAt.toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Badge tone={status.tone}>{status.label}</Badge>
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
                  <Input name="body" placeholder="Escreva uma mensagem..." required />
                  <Button type="submit" size="sm" className="shrink-0">
                    Enviar
                  </Button>
                </form>
              )}
            </Card>
          );
        })}

        {tickets.length === 0 && (
          <p className="text-sm text-ink-500">Você ainda não abriu nenhum chamado.</p>
        )}
      </div>
    </div>
  );
}
