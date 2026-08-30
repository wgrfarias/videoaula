"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";

export function AvatarUpload({
  avatarUrl,
  name,
}: {
  avatarUrl: string | null;
  name: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(avatarUrl);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const formData = new FormData();
    formData.set("file", file);
    const res = await fetch("/api/uploads/avatar", { method: "POST", body: formData });
    const data = await res.json();

    setUploading(false);
    if (res.ok) {
      setPreview(data.url);
      router.refresh();
    }
  }

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-brand-100"
        title="Trocar foto"
      >
        {preview ? (
          <Image src={preview} alt={name} fill className="object-cover" unoptimized />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-xl font-bold text-brand-700">
            {initials}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="h-5 w-5 text-white" />
        </span>
      </button>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          {uploading ? "Enviando..." : "Trocar foto"}
        </button>
        <p className="text-xs text-ink-300">PNG, JPG ou WebP — até 5MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
