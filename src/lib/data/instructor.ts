import { prisma } from "@/lib/prisma";
import { ORDER_STATUS } from "@/lib/constants";

export async function getInstructorCourses(instructorId: string) {
  return prisma.course.findMany({
    where: { instructorId },
    include: {
      category: true,
      _count: { select: { enrollments: true } },
      modules: { include: { lessons: true } },
      bundledCourses: { include: { modules: { include: { lessons: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInstructorCourse(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      category: true,
      _count: { select: { enrollments: true, orders: true, includedInBundles: true } },
      enrollments: {
        include: { user: { select: { id: true, name: true, email: true, nickname: true } } },
        orderBy: { createdAt: "desc" },
      },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              video: true,
              quizQuestions: {
                orderBy: { order: "asc" },
                include: { options: { orderBy: { order: "asc" } } },
              },
            },
          },
          quiz: {
            include: {
              questions: {
                orderBy: { order: "asc" },
                include: { options: { orderBy: { order: "asc" } } },
              },
            },
          },
        },
      },
      bundledCourses: {
        include: { modules: { include: { lessons: true } } },
      },
    },
  });
}

// Other courses this instructor could add into a bundle: their own courses,
// excluding the bundle itself and anything that is already a bundle (no
// nesting combos inside combos).
export async function getEligibleBundleComponents(
  instructorId: string,
  excludeIds: string[]
) {
  return prisma.course.findMany({
    where: {
      instructorId,
      id: { notIn: excludeIds },
      bundledCourses: { none: {} },
    },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
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
  const [courses, instructor] = await Promise.all([
    prisma.course.findMany({
      where: { instructorId },
      select: { id: true, published: true },
    }),
    prisma.user.findUnique({
      where: { id: instructorId },
      select: { platformFeePercent: true },
    }),
  ]);
  const courseIds = courses.map((c) => c.id);

  const [enrollmentCount, revenue] = await Promise.all([
    prisma.enrollment.count({ where: { courseId: { in: courseIds } } }),
    prisma.order.aggregate({
      where: { courseId: { in: courseIds }, status: ORDER_STATUS.PAID },
      _sum: { amount: true },
    }),
  ]);

  const grossRevenue = revenue._sum.amount ?? 0;
  const platformFeePercent = instructor?.platformFeePercent ?? 20;
  const platformFee = Math.round(grossRevenue * (platformFeePercent / 100) * 100) / 100;
  const netRevenue = Math.round((grossRevenue - platformFee) * 100) / 100;

  return {
    totalCourses: courses.length,
    publishedCourses: courses.filter((c) => c.published).length,
    totalStudents: enrollmentCount,
    revenue: grossRevenue,
    platformFeePercent,
    platformFee,
    netRevenue,
  };
}

// Cross-instructor revenue breakdown for the admin's consolidated view.
export async function getAllInstructorRevenue() {
  const instructors = await prisma.user.findMany({
    where: { role: { in: ["INSTRUCTOR", "ADMIN"] } },
    select: { id: true, name: true, email: true, platformFeePercent: true },
    orderBy: { name: "asc" },
  });

  return Promise.all(
    instructors.map(async (instructor) => {
      const courseIds = (
        await prisma.course.findMany({
          where: { instructorId: instructor.id },
          select: { id: true },
        })
      ).map((c) => c.id);

      const revenue = await prisma.order.aggregate({
        where: { courseId: { in: courseIds }, status: ORDER_STATUS.PAID },
        _sum: { amount: true },
      });

      const grossRevenue = revenue._sum.amount ?? 0;
      const platformFee = Math.round(grossRevenue * (instructor.platformFeePercent / 100) * 100) / 100;
      const netRevenue = Math.round((grossRevenue - platformFee) * 100) / 100;

      return {
        id: instructor.id,
        name: instructor.name,
        email: instructor.email,
        platformFeePercent: instructor.platformFeePercent,
        courseCount: courseIds.length,
        grossRevenue,
        platformFee,
        netRevenue,
      };
    })
  );
}
