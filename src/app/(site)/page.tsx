import Link from "next/link";
import { CheckCircle2, PlayCircle, Sparkles, Star } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { CourseCard } from "@/components/site/course-card";
import { getPublishedCourses } from "@/lib/data/courses";

export default async function HomePage() {
  const courses = await getPublishedCourses();
  const featured = courses.slice(0, 3);

  return (
    <>
      <section className="bg-hero-gradient text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-accent-300">
              <Sparkles className="h-3.5 w-3.5" /> Turma nova com vagas abertas
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-balance md:text-5xl">
              Português descomplicado para você passar em concursos públicos
            </h1>
            <p className="mt-5 max-w-lg text-white/75">
              Aulas gravadas, direto ao ponto, com exercícios comentados das
              principais bancas do Brasil. Estude no seu ritmo, de onde estiver.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/cursos" size="lg">
                Ver cursos disponíveis
              </LinkButton>
              <LinkButton href="/sobre" variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                Conhecer a professora
              </LinkButton>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-white/70">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent-400 text-accent-400" />
                <Star className="h-4 w-4 fill-accent-400 text-accent-400" />
                <Star className="h-4 w-4 fill-accent-400 text-accent-400" />
                <Star className="h-4 w-4 fill-accent-400 text-accent-400" />
                <Star className="h-4 w-4 fill-accent-400 text-accent-400" />
                <span className="ml-1 font-semibold text-white">4.9/5</span>
              </div>
              <span>+12.000 alunos aprovados</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800">
                <PlayCircle className="h-16 w-16 text-white/90" />
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Aulas gravadas em vídeo, no seu tempo",
                  "Questões comentadas de concursos reais",
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
              Escolha o curso ideal para sua preparação
            </h2>
          </div>
          <Link href="/cursos" className="hidden shrink-0 text-sm font-semibold text-brand-700 hover:underline md:block">
            Ver todos os cursos →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {featured.length === 0 && (
          <p className="mt-8 text-ink-500">Nenhum curso publicado ainda.</p>
        )}
      </section>

      <section className="bg-cream-200/60">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Estude no seu ritmo",
                desc: "Acesso liberado assim que a compra é confirmada, direto na área do aluno.",
              },
              {
                title: "Conteúdo direto ao ponto",
                desc: "Teoria objetiva seguida de questões comentadas das principais bancas.",
              },
              {
                title: "Acompanhe seu progresso",
                desc: "Veja quais aulas você já concluiu e retome de onde parou.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-white p-6 shadow-sm">
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
