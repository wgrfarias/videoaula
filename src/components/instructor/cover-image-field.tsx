"use client";

import { useState } from "react";
import Image from "next/image";
import { Label, Input } from "@/components/ui/input";
import { COVER_THEMES } from "@/lib/covers";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function CoverImageField({
  defaultValue,
  defaultTheme,
  courseId,
}: {
  defaultValue: string;
  defaultTheme?: string;
  courseId?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [theme, setTheme] = useState(defaultTheme || COVER_THEMES[0].id);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    const res = await fetch("/api/uploads/cover", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (res.ok) setUrl(data.url);
  }

  return (
    <div>
      <Label htmlFor="coverImageUrl">Imagem de capa</Label>
      <input type="hidden" name="coverImageUrl" value={url} />
      <input type="hidden" name="coverTheme" value={theme} />

      {url ? (
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-brand-800">
            <Image src={url} alt="Capa" fill className="object-cover" unoptimized />
          </div>
          <button
            type="button"
            onClick={() => setUrl("")}
            className="flex items-center gap-1 text-xs font-medium text-accent-600 hover:underline"
          >
            <X className="h-3.5 w-3.5" /> Remover e usar capa gerada
          </button>
        </div>
      ) : (
        <div>
          <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-brand-800">
            {courseId ? (
              <Image
                key={theme}
                src={`/api/covers/${courseId}?theme=${theme}`}
                alt="Prévia da capa gerada"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  background: `linear-gradient(135deg, ${
                    COVER_THEMES.find((t) => t.id === theme)?.from
                  }, ${COVER_THEMES.find((t) => t.id === theme)?.to})`,
                }}
              />
            )}
          </div>
          <p className="mt-2 text-xs text-ink-500">
            Sem imagem enviada — a capa é gerada automaticamente com o título,
            categoria e subtítulo do curso. Escolha um tema:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {COVER_THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                title={t.label}
                className={cn(
                  "h-8 w-8 rounded-full ring-offset-2 ring-offset-surface transition",
                  theme === t.id ? "ring-2 ring-brand-600" : ""
                )}
                style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
              />
            ))}
          </div>
        </div>
      )}

      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleFile}
        className="mt-3 block w-full text-xs text-ink-500 file:mr-3 file:rounded-full file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
      />
      {uploading && <p className="mt-1 text-xs text-ink-300">Enviando imagem...</p>}
      {!url && (
        <Input
          className="mt-2"
          placeholder="ou cole a URL de uma imagem"
          onChange={(e) => setUrl(e.target.value)}
        />
      )}
    </div>
  );
}
