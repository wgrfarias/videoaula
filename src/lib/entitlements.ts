import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";

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

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId: lesson.module.courseId },
    },
  });
  if (!enrollment) return false;
  if (enrollment.expiresAt && enrollment.expiresAt.getTime() < Date.now()) return false;

  return true;
}
