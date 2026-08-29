"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { Label, Input, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const [loading, setLoading] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  );
}
