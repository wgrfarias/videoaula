import Image from "next/image";
import Link from "next/link";
import { Clock, PlayCircle } from "lucide-react";
import { Card, Badge } from "@/components/ui/card";
import { formatCurrency, formatDuration, formatInstallments } from "@/lib/utils";
import { courseStats, getCoverSrc } from "@/lib/data/courses";
import { getEffectivePrice, type PromoSettings } from "@/lib/pricing";

type CourseCardData = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  coverImageUrl: string | null;
  price: number;
  discountPercent: number;
  installments: number;
  accessDays: number;
  category: { name: string } | null;
  modules: {
    id: string;
    title: string;
    lessons: { videoId: string | null; video: { durationSec: number | null } | null }[];
  }[];
  bundledCourses?: {
    title: string;
    modules: {
      id: string;
      title: string;
      lessons: { videoId: string | null; video: { durationSec: number | null } | null }[];
    }[];
  }[];
};

export function CourseCard({ course, promo }: { course: CourseCardData; promo: PromoSettings }) {
  const stats = courseStats(course);
  const isFree = course.price === 0;
  const { effectivePrice, percent, hasDiscount } = getEffectivePrice(course, promo);

  return (
    <Link href={`/cursos/${course.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-lg group-hover:shadow-brand-900/10">
        <div className="relative aspect-video w-full overflow-hidden bg-brand-800">
          <Image
            src={getCoverSrc(course)}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
          {course.category && (
            <span className="absolute left-3 top-3">
              <Badge tone="accent" className="bg-white/90">{course.category.name}</Badge>
            </span>
          )}
          {isFree ? (
            <span className="absolute right-3 top-3">
              <Badge tone="success">Grátis</Badge>
            </span>
          ) : (
            hasDiscount && (
              <span className="absolute right-3 top-3">
                <Badge tone="accent" className="bg-accent-500 text-white">-{percent}%</Badge>
              </span>
            )
          )}
        </div>

        <div className="p-5">
          <h3 className="font-display text-lg font-semibold leading-snug text-ink-900">
            {course.title}
          </h3>
          {course.subtitle && (
            <p className="mt-1 line-clamp-2 text-sm text-ink-500">{course.subtitle}</p>
          )}

          <div className="mt-4 flex items-center gap-4 text-xs text-ink-500">
            <span className="flex items-center gap-1">
              <PlayCircle className="h-3.5 w-3.5" /> {stats.lessonCount} aulas
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Acesso por {course.accessDays} dias
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-ink-900/5 pt-4">
            {isFree ? (
              <span className="font-display text-base font-bold text-brand-700">Grátis</span>
            ) : (
              <span className="flex flex-col">
                {hasDiscount && (
                  <span className="text-xs text-ink-300 line-through">
                    {formatCurrency(course.price)}
                  </span>
                )}
                <span className="font-display text-base font-bold text-brand-700">
                  {formatInstallments(effectivePrice, course.installments)}
                </span>
              </span>
            )}
            <span className="text-sm font-semibold text-accent-500 group-hover:underline">
              Ver curso →
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function formatCourseDuration(totalSeconds: number) {
  return formatDuration(totalSeconds);
}
