import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { getGrantingCourseIds } from "@/lib/data/courses";

export async function canStreamVideo({
  userId,
  videoId,
  lessonId,
}: {
  userId?: string | null;
  videoId: string;
  lessonId?: string | null;
}) {
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) return false;

  if (userId) {
    if (video.ownerId === userId) {
      const owner = await prisma.user.findUnique({ where: { id: userId } });
      if (owner?.role === ROLES.INSTRUCTOR || owner?.role === ROLES.ADMIN) {
        return true;
      }
    }
  }

  if (!lessonId) return false;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: true },
  });
  if (!lesson || lesson.videoId !== videoId) return false;
  if (lesson.freePreview) return true;
  if (!userId) return false;

  const grantingCourseIds = await getGrantingCourseIds(lesson.module.courseId);
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, courseId: { in: grantingCourseIds } },
  });
  const now = Date.now();
  return enrollments.some((e) => !e.expiresAt || e.expiresAt.getTime() >= now);
}
