"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, SquarePlay } from "lucide-react";
import { Label, Input, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export function VideoUploadForm({ onUploaded }: { onUploaded?: (videoId: string) => void }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const youtubeFormRef = useRef<HTMLFormElement>(null);
  const [tab, setTab] = useState<"upload" | "youtube">("upload");
  const [loading, setLoading] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleYoutubeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value.trim();
    const youtubeUrl = (form.elements.namedItem("youtubeUrl") as HTMLInputElement).value.trim();
    const durationInput = (form.elements.namedItem("durationSec") as HTMLInputElement).value;

    if (!title || !youtubeUrl) {
      setError("Preencha o título e o link do YouTube");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/videos/youtube", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, youtubeUrl, durationSec: durationInput || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Falha ao vincular o vídeo do YouTube");
      return;
    }

    form.reset();
    onUploaded?.(data.video.id);
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    setProgressLabel("Lendo metadados do vídeo...");
    const durationSec = await readVideoDuration(file);

    const formData = new FormData();
    formData.set("file", file);
    formData.set("title", titleInput.value || file.name);
    if (durationSec) formData.set("durationSec", String(durationSec));

    setProgressLabel("Enviando vídeo...");
    const res = await fetch("/api/videos/upload", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));

    setLoading(false);
    setProgressLabel(null);

    if (!res.ok) {
      setError(data.error ?? "Falha ao enviar o vídeo");
      return;
    }

    formRef.current?.reset();
    onUploaded?.(data.video.id);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-3 flex gap-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5",
            tab === "upload" ? "bg-brand-600 text-white" : "bg-surface-alt text-ink-500"
          )}
        >
          <UploadCloud className="h-3.5 w-3.5" /> Enviar arquivo
        </button>
        <button
          type="button"
          onClick={() => setTab("youtube")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5",
            tab === "youtube" ? "bg-brand-600 text-white" : "bg-surface-alt text-ink-500"
          )}
        >
          <SquarePlay className="h-3.5 w-3.5" /> Link do YouTube
        </button>
      </div>

      {tab === "upload" ? (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="video-title">Título da aula</Label>
            <Input id="video-title" name="title" placeholder="Ex: Aula 01 - Introdução" />
          </div>
          <div>
            <Label htmlFor="video-file">Arquivo de vídeo</Label>
            <input
              id="video-file"
              name="file"
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              required
              className="block w-full rounded-xl border border-dashed border-ink-300/50 bg-surface px-4 py-6 text-sm text-ink-500 file:mr-4 file:rounded-full file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
          </div>
          <FieldError>{error}</FieldError>
          <Button type="submit" disabled={loading} className="w-full">
            <UploadCloud className="h-4 w-4" />
            {loading ? progressLabel ?? "Enviando..." : "Enviar vídeo"}
          </Button>
        </form>
      ) : (
        <form ref={youtubeFormRef} onSubmit={handleYoutubeSubmit} className="space-y-3">
          <div>
            <Label htmlFor="yt-title">Título da aula</Label>
            <Input id="yt-title" name="title" placeholder="Ex: Aula 01 - Introdução" />
          </div>
          <div>
            <Label htmlFor="yt-url">Link do vídeo no YouTube</Label>
            <Input id="yt-url" name="youtubeUrl" placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div>
            <Label htmlFor="yt-duration">Duração em segundos (opcional)</Label>
            <Input id="yt-duration" name="durationSec" type="number" min="0" placeholder="Ex: 1200" />
          </div>
          <p className="text-xs text-ink-300">
            O player do curso incorpora o vídeo do YouTube diretamente — a
            proteção de acesso da plataforma continua valendo para a página
            do curso, mas quem tiver o link do YouTube consegue assistir por
            lá também. Prefira deixar o vídeo como &ldquo;não listado&rdquo; no YouTube.
          </p>
          <FieldError>{error}</FieldError>
          <Button type="submit" disabled={loading} className="w-full">
            <SquarePlay className="h-4 w-4" />
            {loading ? "Vinculando..." : "Vincular vídeo"}
          </Button>
        </form>
      )}
    </div>
  );
}
