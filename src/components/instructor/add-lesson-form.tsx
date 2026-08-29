"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Library, UploadCloud } from "lucide-react";
import { Input, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, formatDuration } from "@/lib/utils";
import { createLesson } from "@/lib/actions/courses";

type InstructorVideo = {
  id: string;
  title: string;
  durationSec: number | null;
};

function readVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(Number.isFinite(video.duration) ? Math.round(video.duration) : null);
    };
    video.onerror = () => resolve(null);
    video.src = URL.createObjectURL(file);
  });
}

export function AddLessonForm({
  moduleId,
  videos,
}: {
  moduleId: string;
  videos: InstructorVideo[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"existing" | "upload">(
    videos.length > 0 ? "existing" : "upload"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleExistingSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const videoId = (form.elements.namedItem("videoId") as HTMLSelectElement).value;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value.trim();

    if (!videoId) {
      setError("Selecione um vídeo da biblioteca");
      return;
    }
    const video = videos.find((v) => v.id === videoId);

    setLoading(true);
    try {
      await createLesson(moduleId, {
        title: title || video?.title || "Nova aula",
        videoId,
      });
      form.reset();
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar aula");
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const titleInput = form.elements.namedItem("title") as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      setError("Selecione um arquivo de vídeo");
      return;
    }

    setLoading(true);
    try {
      const durationSec = await readVideoDuration(file);
      const formData = new FormData();
      formData.set("file", file);
      formData.set("title", titleInput.value || file.name);
      if (durationSec) formData.set("durationSec", String(durationSec));

      const res = await fetch("/api/videos/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao enviar vídeo");

      await createLesson(moduleId, {
        title: titleInput.value || file.name,
        videoId: data.video.id,
      });

      form.reset();
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar aula");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setTab("existing")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5",
            tab === "existing" ? "bg-brand-600 text-white" : "bg-cream-200 text-ink-500"
          )}
        >
          <Library className="h-3.5 w-3.5" /> Reaproveitar vídeo
        </button>
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5",
            tab === "upload" ? "bg-brand-600 text-white" : "bg-cream-200 text-ink-500"
          )}
        >
          <UploadCloud className="h-3.5 w-3.5" /> Enviar novo vídeo
        </button>
      </div>

      {tab === "existing" ? (
        <form onSubmit={handleExistingSubmit} className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <select
            name="videoId"
            className="w-full rounded-xl border border-ink-300/40 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            defaultValue=""
          >
            <option value="" disabled>
              Escolha um vídeo da biblioteca
            </option>
            {videos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title} ({formatDuration(v.durationSec)})
              </option>
            ))}
          </select>
          <Input name="title" placeholder="Título da aula (opcional)" />
          <Button type="submit" disabled={loading} size="sm" className="shrink-0">
            {loading ? "Adicionando..." : "Adicionar"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleUploadSubmit} className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="title" placeholder="Título da aula" />
            <input
              name="file"
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              className="block w-full rounded-xl border border-dashed border-ink-300/50 bg-cream-50 px-3 py-2 text-xs text-ink-500 file:mr-3 file:rounded-full file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            />
          </div>
          <Button type="submit" disabled={loading} size="sm">
            {loading ? "Enviando..." : "Enviar e adicionar aula"}
          </Button>
        </form>
      )}

      <FieldError>{error}</FieldError>
    </div>
  );
}
