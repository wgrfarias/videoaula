import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ANON_COOKIE = "va_anon";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const path = typeof body?.path === "string" ? body.path.slice(0, 500) : null;
  if (!path) {
    return NextResponse.json({ error: "path é obrigatório" }, { status: 400 });
  }

  const session = await auth();
  const cookieStore = await cookies();
  const existingAnonId = session?.user ? null : cookieStore.get(ANON_COOKIE)?.value ?? null;
  const anonId = session?.user ? null : existingAnonId ?? crypto.randomUUID();

  let courseId: string | undefined;
  if (typeof body?.courseSlug === "string" && body.courseSlug) {
    const course = await prisma.course.findUnique({
      where: { slug: body.courseSlug },
      select: { id: true },
    });
    courseId = course?.id;
  }

  const pageView = await prisma.pageView.create({
    data: {
      path,
      userId: session?.user?.id,
      anonId,
      courseId,
    },
  });

  const res = NextResponse.json({ id: pageView.id });
  if (!session?.user && !existingAnonId && anonId) {
    res.cookies.set(ANON_COOKIE, anonId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return res;
}
