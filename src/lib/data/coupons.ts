import { prisma } from "@/lib/prisma";

export async function getCouponsWithStats() {
  const coupons = await prisma.coupon.findMany({
    include: {
      courses: { select: { id: true, title: true } },
      redemptions: { select: { convertedAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return coupons.map((coupon) => {
    const appliedCount = coupon.redemptions.length;
    const convertedCount = coupon.redemptions.filter((r) => r.convertedAt).length;
    return {
      ...coupon,
      appliedCount,
      convertedCount,
      abandonedCount: appliedCount - convertedCount,
    };
  });
}
