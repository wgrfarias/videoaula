"use client";

import { useState } from "react";
import Image from "next/image";
import { Label, Input } from "@/components/ui/input";

export function CoverImageField({ defaultValue }: { defaultValue: string }) {
  const [url, setUrl] = useState(defaultValue);
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
      <div className="flex items-center gap-3">
        {url && (
          <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-brand-800">
            <Image src={url} alt="Capa" fill className="object-cover" unoptimized />
          </div>
        )}
        <Input
          id="coverImageUrl"
          name="coverImageUrl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/uploads/covers/meu-curso.png"
        />
      </div>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleFile}
        className="mt-2 block w-full text-xs text-ink-500 file:mr-3 file:rounded-full file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
      />
      {uploading && <p className="mt-1 text-xs text-ink-300">Enviando imagem...</p>}
    </div>
  );
}
