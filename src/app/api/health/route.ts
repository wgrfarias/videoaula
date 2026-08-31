import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Used by Fly.io's health check — confirms the app process is up AND the
// database connection actually works, not just that Next.js is serving.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
