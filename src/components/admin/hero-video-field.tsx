"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Label, Input } from "@/components/ui/input";
import { extractYouTubeId, youtubeEmbedUrl } from "@/lib/youtube";

export function HeroVideoField({ defaultValue }: { defaultValue: string }) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const youtubeId = url ? extractYouTubeId(url) : null;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    const res = await fetch("/api/uploads/hero-video", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (res.ok) setUrl(data.url);
  }

  return (
    <div>
      <Label htmlFor="heroVideoUrl">Vídeo de destaque da home</Label>
      <input type="hidden" name="heroVideoUrl" value={url} />

      {url ? (
        <div className="flex items-center gap-3">
          {youtubeId ? (
            <iframe
              src={youtubeEmbedUrl(youtubeId)}
              className="h-20 w-32 rounded-lg bg-black"
              title="Prévia do vídeo de destaque"
            />
          ) : (
            <video src={url} muted className="h-20 w-32 rounded-lg bg-black object-cover" />
          )}
          <button
            type="button"
            onClick={() => setUrl("")}
            className="flex items-center gap-1 text-xs font-medium text-accent-600 hover:underline"
          >
            <X className="h-3.5 w-3.5" /> Remover e voltar ao placeholder
          </button>
        </div>
      ) : (
        <p className="text-xs text-ink-500">
          Sem vídeo enviado — a home mostra o placeholder animado padrão.
        </p>
      )}

      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="file"
          accept="video/mp4,video/webm,video/ogg"
          onChange={handleFile}
          className="block w-full text-xs text-ink-500 file:mr-3 file:rounded-full file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white sm:w-auto"
        />
        <span className="text-xs text-ink-300">ou</span>
        <Input
          placeholder="Colar link do YouTube"
          defaultValue={youtubeId ? url : ""}
          onBlur={(e) => {
            const value = e.target.value.trim();
            if (value) setUrl(value);
          }}
          className="sm:max-w-xs"
        />
      </div>
      {uploading && <p className="mt-1 text-xs text-ink-300">Enviando vídeo...</p>}
    </div>
  );
}
