import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { adminDeleteComment } from "@/lib/actions/comments";
import { Card, Badge } from "@/components/ui/card";
import { COMMENT_VISIBILITY } from "@/lib/constants";
import { Trash2 } from "lucide-react";

export const metadata = { title: "Comentários | Admin" };

const RECENT_LIMIT = 200;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export default async function AdminCommentsPage() {
  await requireAdmin();

  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: RECENT_LIMIT,
    include: {
      author: { select: { name: true, nickname: true, email: true, role: true } },
      lesson: {
        select: {
          title: true,
          module: { select: { course: { select: { title: true, slug: true } } } },
        },
      },
    },
  });

  const totalCount = await prisma.comment.count();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Comentários</h1>
      <p className="mt-1 text-sm text-ink-500">
        Acompanhe os comentários que alunos e professores deixam em cada
        aula, de todos os cursos, num só lugar. Comentários privados também
        aparecem aqui — só o autor e o professor do curso os veem nas aulas.
      </p>

      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-900/10 bg-surface-alt/40 text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Autor</th>
                <th className="px-4 py-3 font-semibold">Curso / aula</th>
                <th className="px-4 py-3 font-semibold">Comentário</th>
                <th className="px-4 py-3 font-semibold">Visibilidade</th>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/5">
              {comments.map((comment) => (
                <tr key={comment.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">
                      {comment.author.nickname || comment.author.name}
                    </p>
                    <p className="text-xs text-ink-500">{comment.author.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    <p className="font-medium">{comment.lesson.module.course.title}</p>
                    <p className="text-xs text-ink-500">{comment.lesson.title}</p>
                  </td>
                  <td className="max-w-sm px-4 py-3 text-ink-700">{comment.body}</td>
                  <td className="px-4 py-3">
                    <Badge tone={comment.visibility === COMMENT_VISIBILITY.PUBLIC ? "success" : "neutral"}>
                      {comment.visibility === COMMENT_VISIBILITY.PUBLIC ? "Público" : "Privado"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">{formatDate(comment.createdAt)}</td>
                  <td className="px-4 py-3">
                    <form action={adminDeleteComment.bind(null, comment.id)}>
                      <button
                        type="submit"
                        title="Excluir comentário"
                        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {comments.length === 0 && (
        <p className="mt-6 text-sm text-ink-500">Nenhum comentário ainda.</p>
      )}
      {totalCount > RECENT_LIMIT && (
        <p className="mt-3 text-xs text-ink-300">
          Mostrando os {RECENT_LIMIT} comentários mais recentes de {totalCount} no total.
        </p>
      )}
    </div>
  );
}
