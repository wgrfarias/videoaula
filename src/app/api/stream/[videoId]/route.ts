import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canStreamVideo } from "@/lib/entitlements";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;
  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lesson");

  const session = await auth();
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) {
    return NextResponse.json({ error: "Vídeo não encontrado" }, { status: 404 });
  }

  const allowed = await canStreamVideo({
    userId: session?.user?.id,
    videoId,
    lessonId,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
  }

  const filePath = path.join(process.cwd(), "public", video.url);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Arquivo de vídeo ausente" }, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const contentType = video.mimeType || "video/mp4";
  const range = request.headers.get("range");

  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    const start = match?.[1] ? parseInt(match[1], 10) : 0;
    const end = match?.[2] ? parseInt(match[2], 10) : fileSize - 1;
    const safeEnd = Math.min(end, fileSize - 1);
    const chunkSize = safeEnd - start + 1;

    const stream = fs.createReadStream(filePath, { start, end: safeEnd });
    return new NextResponse(Readable.toWeb(stream) as unknown as ReadableStream, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${safeEnd}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(chunkSize),
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=0",
      },
    });
  }

  const stream = fs.createReadStream(filePath);
  return new NextResponse(Readable.toWeb(stream) as unknown as ReadableStream, {
    status: 200,
    headers: {
      "Content-Length": String(fileSize),
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=0",
    },
  });
}
