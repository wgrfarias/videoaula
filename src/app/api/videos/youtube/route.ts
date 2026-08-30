import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { extractYouTubeId } from "@/lib/youtube";

export async function POST(request: Request) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== ROLES.INSTRUCTOR && session.user.role !== ROLES.ADMIN)
  ) {
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const youtubeUrl = typeof body?.youtubeUrl === "string" ? body.youtubeUrl.trim() : "";
  const durationSecRaw = body?.durationSec;

  if (!title) {
    return NextResponse.json({ error: "Informe um título para a aula" }, { status: 400 });
  }
  const videoId = extractYouTubeId(youtubeUrl);
  if (!videoId) {
    return NextResponse.json({ error: "Link do YouTube inválido" }, { status: 400 });
  }

  const durationSec = Number.isFinite(Number(durationSecRaw)) ? Math.round(Number(durationSecRaw)) : null;

  const video = await prisma.video.create({
    data: {
      title,
      filename: videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      provider: "youtube",
      durationSec: durationSec && durationSec > 0 ? durationSec : null,
      ownerId: session.user.id,
    },
  });

  return NextResponse.json({ video });
}
