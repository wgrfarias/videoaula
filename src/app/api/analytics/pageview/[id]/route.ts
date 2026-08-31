import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ANON_COOKIE = "va_anon";
const MAX_DURATION_SEC = 6 * 60 * 60;

// Accepts sendBeacon POSTs (no custom headers, no way to do a real PATCH) as
// well as regular fetch — both just overwrite durationSec with the latest
// accumulated total the client has tracked for this page view.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const durationSec = Math.round(Number(body?.durationSec));
  if (!Number.isFinite(durationSec) || durationSec <= 0) {
    return NextResponse.json({ ok: true });
  }

  const pageView = await prisma.pageView.findUnique({ where: { id } });
  if (!pageView) return NextResponse.json({ ok: true });

  const session = await auth();
  const cookieStore = await cookies();
  const anonId = cookieStore.get(ANON_COOKIE)?.value;

  const owns =
    (session?.user?.id && pageView.userId === session.user.id) ||
    (!pageView.userId && Boolean(anonId) && pageView.anonId === anonId);
  if (!owns) return NextResponse.json({ ok: true });

  await prisma.pageView.update({
    where: { id },
    data: { durationSec: Math.min(durationSec, MAX_DURATION_SEC) },
  });

  return NextResponse.json({ ok: true });
}
