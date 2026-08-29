import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "videos");
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2GB

export async function POST(request: Request) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== ROLES.INSTRUCTOR && session.user.role !== ROLES.ADMIN)
  ) {
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const title = formData.get("title");
  const durationRaw = formData.get("durationSec");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo de vídeo é obrigatório" }, { status: 400 });
  }
  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Informe um título para a aula" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato de vídeo não suportado. Use MP4, WebM, OGG ou MOV." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Arquivo maior que o limite de 2GB" }, { status: 400 });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name) || ".mp4";
  const filename = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  const durationSec = durationRaw ? Math.round(Number(durationRaw)) : null;

  const video = await prisma.video.create({
    data: {
      title: title.trim(),
      filename,
      url: `/uploads/videos/${filename}`,
      mimeType: file.type,
      sizeBytes: file.size,
      durationSec: Number.isFinite(durationSec) ? durationSec : null,
      ownerId: session.user.id,
    },
  });

  return NextResponse.json({ video });
}
