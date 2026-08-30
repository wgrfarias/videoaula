import Link from "next/link";
import { CheckCircle2, PlayCircle, Sparkles } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { CourseCard } from "@/components/site/course-card";
import { getPublishedCourses } from "@/lib/data/courses";
import { getSiteContent } from "@/lib/data/site-content";

export default async function HomePage() {
  const [courses, content] = await Promise.all([getPublishedCourses(), getSiteContent()]);
  const featured = courses.slice(0, 3);
  const promo = { promoActive: content.promoActive, promoGlobalDiscount: content.promoGlobalDiscount };

  return (
    <>
      {content.promoActive && (
        <div className="bg-accent-500 px-5 py-2.5 text-center text-sm font-semibold text-white">
          {content.promoBannerText}
        </div>
      )}

      <section className="bg-hero-gradient text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-accent-300">
              <Sparkles className="h-3.5 w-3.5" /> {content.heroBadgeText}
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-balance md:text-5xl">
              {content.heroTitle}
            </h1>
            <p className="mt-5 max-w-lg text-white/75">{content.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href={content.heroPrimaryHref} size="lg">
                {content.heroPrimaryLabel}
              </LinkButton>
              <LinkButton
                href={content.heroSecondaryHref}
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
              >
                {content.heroSecondaryLabel}
              </LinkButton>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-white/70">
              <span>{content.heroStatLine}</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl bg-white/5 p-6 backdrop-blur-sm">
              {content.heroVideoUrl ? (
                <video
                  src={content.heroVideoUrl}
                  className="aspect-video w-full rounded-2xl bg-black object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800">
                  <PlayCircle className="h-16 w-16 text-white/90" />
                </div>
              )}
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Aulas gravadas em vídeo, no seu tempo",
                  "Exercícios práticos guiados",
                  "Acompanhamento do seu progresso",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-white/85">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent-500">
              Cursos em destaque
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink-900 md:text-3xl">
              Escolha o curso ideal para sua trilha em TI
            </h2>
          </div>
          <Link href="/cursos" className="hidden shrink-0 text-sm font-semibold text-brand-700 hover:underline md:block">
            Ver todos os cursos →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((course) => (
            <CourseCard key={course.id} course={course} promo={promo} />
          ))}
        </div>

        {featured.length === 0 && (
          <p className="mt-8 text-ink-500">Nenhum curso publicado ainda.</p>
        )}
      </section>

      <section className="bg-surface-alt/60">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Estude no seu ritmo",
                desc: "Acesso liberado assim que a compra é confirmada, direto na área do aluno.",
              },
              {
                title: "Conteúdo direto ao ponto",
                desc: "Teoria aplicada ao dia a dia, seguida de exercícios práticos guiados.",
              },
              {
                title: "Acompanhe seu progresso",
                desc: "Veja quais aulas você já concluiu e retome de onde parou.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-surface p-6 shadow-sm">
                <h3 className="font-display text-lg font-semibold text-ink-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-ink-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
