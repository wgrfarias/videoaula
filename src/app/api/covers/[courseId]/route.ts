import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderCoverSvg } from "@/lib/covers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { title: true, subtitle: true, coverTheme: true, category: { select: { name: true } } },
  });

  if (!course) {
    return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });
  }

  // ?theme= lets the course editor preview a swatch before saving.
  const themeOverride = new URL(request.url).searchParams.get("theme");

  const svg = renderCoverSvg({
    title: course.title,
    subtitle: course.subtitle,
    categoryName: course.category?.name,
    themeId: themeOverride || course.coverTheme,
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
    },
  });
}
