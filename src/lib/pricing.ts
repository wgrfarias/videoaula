export type PromoSettings = {
  promoActive: boolean;
  promoGlobalDiscount: number;
};

export type DiscountableCourse = {
  price: number;
  discountPercent: number;
};

/**
 * A course's own discountPercent (if set) overrides the site-wide promo
 * instead of stacking with it — one clear discount, never compounded.
 */
export function getEffectivePrice(course: DiscountableCourse, promo: PromoSettings) {
  const percent =
    course.discountPercent > 0
      ? course.discountPercent
      : promo.promoActive
        ? promo.promoGlobalDiscount
        : 0;

  const hasDiscount = percent > 0 && percent < 100;
  const effectivePrice = hasDiscount
    ? Math.round(course.price * (1 - percent / 100) * 100) / 100
    : course.price;

  return { effectivePrice, percent: hasDiscount ? percent : 0, hasDiscount };
}
