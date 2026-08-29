import { prisma } from "@/lib/prisma";
import { ORDER_STATUS } from "@/lib/constants";

export async function getInstructorCourses(instructorId: string) {
  return prisma.course.findMany({
    where: { instructorId },
    include: {
      category: true,
      _count: { select: { enrollments: true } },
      modules: { include: { lessons: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInstructorCourse(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      category: true,
      _count: { select: { enrollments: true, orders: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { video: true },
          },
        },
      },
    },
  });
}

export async function getInstructorVideos(instructorId: string) {
  return prisma.video.findMany({
    where: { ownerId: instructorId },
    include: {
      lessons: {
        include: { module: { include: { course: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInstructorStats(instructorId: string) {
  const courses = await prisma.course.findMany({
    where: { instructorId },
    select: { id: true, published: true },
  });
  const courseIds = courses.map((c) => c.id);

  const [enrollmentCount, revenue] = await Promise.all([
    prisma.enrollment.count({ where: { courseId: { in: courseIds } } }),
    prisma.order.aggregate({
      where: { courseId: { in: courseIds }, status: ORDER_STATUS.PAID },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalCourses: courses.length,
    publishedCourses: courses.filter((c) => c.published).length,
    totalStudents: enrollmentCount,
    revenue: revenue._sum.amount ?? 0,
  };
}
