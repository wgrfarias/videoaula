import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { bunnyEnabled, createBunnyVideo, getBunnyTusUploadParams, bunnyEmbedUrl } from "@/lib/bunny";

export async function POST(request: Request) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== ROLES.INSTRUCTOR && session.user.role !== ROLES.ADMIN)
  ) {
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
  }

  if (!bunnyEnabled) {
    return NextResponse.json({ error: "Bunny.net não está configurado no servidor" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Informe um título para a aula" }, { status: 400 });
  }
  const durationSec = Number.isFinite(Number(body?.durationSec)) ? Math.round(Number(body.durationSec)) : null;

  const bunnyGuid = await createBunnyVideo(title);

  const video = await prisma.video.create({
    data: {
      title,
      filename: bunnyGuid,
      url: bunnyEmbedUrl(bunnyGuid),
      provider: "bunny",
      durationSec: durationSec && durationSec > 0 ? durationSec : null,
      ownerId: session.user.id,
    },
  });

  return NextResponse.json({ video, tus: getBunnyTusUploadParams(bunnyGuid) });
}
