import Image from "next/image";
import Link from "next/link";
import { Clock, PlayCircle } from "lucide-react";
import { Card, Badge } from "@/components/ui/card";
import { formatDuration, formatInstallments } from "@/lib/utils";
import { courseStats } from "@/lib/data/courses";

type CourseCardData = {
  slug: string;
  title: string;
  subtitle: string | null;
  coverImageUrl: string | null;
  price: number;
  installments: number;
  accessDays: number;
  category: { name: string } | null;
  modules: {
    lessons: { videoId: string | null; video: { durationSec: number | null } | null }[];
  }[];
};

export function CourseCard({ course }: { course: CourseCardData }) {
  const stats = courseStats(course);

  return (
    <Link href={`/cursos/${course.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-lg group-hover:shadow-brand-900/10">
        <div className="relative aspect-video w-full overflow-hidden bg-brand-800">
          {course.coverImageUrl && (
            <Image
              src={course.coverImageUrl}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          )}
          {course.category && (
            <span className="absolute left-3 top-3">
              <Badge tone="accent" className="bg-white/90">{course.category.name}</Badge>
            </span>
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
            <span className="font-display text-base font-bold text-brand-700">
              {formatInstallments(course.price, course.installments)}
            </span>
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
