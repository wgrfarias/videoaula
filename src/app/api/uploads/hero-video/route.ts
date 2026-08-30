import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "videos");
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/ogg"];
const MAX_SIZE_BYTES = 200 * 1024 * 1024; // 200MB — short muted hero clip

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== ROLES.ADMIN) {
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo de vídeo é obrigatório" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Use MP4, WebM ou OGG" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Arquivo maior que o limite de 200MB" }, { status: 400 });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name) || ".mp4";
  const filename = `hero-${crypto.randomUUID()}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return NextResponse.json({ url: `/uploads/videos/${filename}` });
}
