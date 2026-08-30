"use client";

import { useEffect, useState } from "react";
import { Lock, MessageCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { COMMENT_VISIBILITY } from "@/lib/constants";

type CommentAuthor = {
  id: string;
  name: string;
  nickname: string | null;
  avatarUrl: string | null;
  role: string;
};

type CommentItem = {
  id: string;
  body: string;
  visibility: string;
  createdAt: string;
  authorId: string;
  author: CommentAuthor;
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h atrás`;
  const days = Math.floor(hours / 24);
  return `${days} d atrás`;
}

export function LessonComments({ lessonId, viewerId }: { lessonId: string; viewerId: string }) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [canModerate, setCanModerate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<string>(COMMENT_VISIBILITY.PUBLIC);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Deliberate: reset to a loading state whenever the lesson changes,
    // before the fetch below resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/comments?lessonId=${lessonId}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setComments(data.comments ?? []);
        setCanModerate(Boolean(data.canModerate));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    setError(null);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, body, visibility }),
    });
    const data = await res.json();
    setPosting(false);

    if (!res.ok) {
      setError(data.error ?? "Não foi possível publicar o comentário");
      return;
    }

    setComments((prev) => [...prev, data.comment]);
    setBody("");
  }

  async function handleDelete(commentId: string) {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (!res.ok) {
      // Re-fetch to restore state if the delete was rejected server-side.
      const refreshed = await fetch(`/api/comments?lessonId=${lessonId}`).then((r) => r.json());
      setComments(refreshed.comments ?? []);
    }
  }

  return (
    <div className="mt-8">
      <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
        <MessageCircle className="h-5 w-5 text-brand-600" /> Comentários
      </h3>

      <form onSubmit={handleSubmit} className="mt-4 space-y-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escreva uma dúvida ou comentário sobre esta aula..."
          className="min-h-20"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1 text-xs">
            <button
              type="button"
              onClick={() => setVisibility(COMMENT_VISIBILITY.PUBLIC)}
              className={cn(
                "rounded-full px-3 py-1.5 font-semibold",
                visibility === COMMENT_VISIBILITY.PUBLIC
                  ? "bg-brand-600 text-white"
                  : "bg-surface-alt text-ink-500"
              )}
            >
              Público
            </button>
            <button
              type="button"
              onClick={() => setVisibility(COMMENT_VISIBILITY.PRIVATE)}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1.5 font-semibold",
                visibility === COMMENT_VISIBILITY.PRIVATE
                  ? "bg-brand-600 text-white"
                  : "bg-surface-alt text-ink-500"
              )}
            >
              <Lock className="h-3 w-3" /> Só para o professor
            </button>
          </div>
          <Button type="submit" size="sm" disabled={posting || !body.trim()}>
            {posting ? "Enviando..." : "Comentar"}
          </Button>
        </div>
        {error && <p className="text-xs font-medium text-accent-600">{error}</p>}
      </form>

      <div className="mt-6 space-y-4">
        {loading && <p className="text-sm text-ink-300">Carregando comentários...</p>}
        {!loading && comments.length === 0 && (
          <p className="text-sm text-ink-300">Nenhum comentário ainda — seja o primeiro.</p>
        )}
        {comments.map((comment) => {
          const canDelete = canModerate || comment.authorId === viewerId;
          const displayName = comment.author.nickname || comment.author.name;
          return (
            <div key={comment.id} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {displayName.slice(0, 2).toUpperCase()}
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-ink-900">{displayName}</span>
                  {(comment.author.role === "INSTRUCTOR" || comment.author.role === "ADMIN") && (
                    <Badge tone="brand">Professor</Badge>
                  )}
                  {comment.visibility === COMMENT_VISIBILITY.PRIVATE && (
                    <Badge tone="neutral" className="flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Privado
                    </Badge>
                  )}
                  <span className="text-xs text-ink-300">{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-ink-700">{comment.body}</p>
              </div>
              {canDelete && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  title="Excluir comentário"
                  className="h-fit shrink-0 rounded-lg p-1.5 text-ink-300 hover:bg-accent-400/10 hover:text-accent-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
