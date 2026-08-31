"use client";

import { useMemo, useRef, useState } from "react";
import { CheckCircle2, Circle, Lock, PlayCircle, ClipboardCheck } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/card";
import { formatCPF } from "@/lib/cpf";
import { LessonComments } from "@/components/player/lesson-comments";
import { LessonQuiz } from "@/components/player/lesson-quiz";
import { youtubeEmbedUrl } from "@/lib/youtube";
import { ModuleQuiz, type QuizData } from "@/components/player/module-quiz";

type LessonQuizOption = { id: string; text: string; isCorrect: boolean };
type LessonQuizQuestion = {
  id: string;
  text: string;
  explanation: string | null;
  options: LessonQuizOption[];
};

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  freePreview: boolean;
  videoId: string | null;
  video: { id: string; durationSec: number | null; provider: string; url: string } | null;
  quizQuestions: LessonQuizQuestion[];
};

type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
  quiz: QuizData | null;
};

type Course = {
  id: string;
  title: string;
  modules: Module[];
};

type ProgressEntry = {
  lessonId: string;
  watchedSeconds: number;
  completed: boolean;
};

export function CoursePlayer({
  course,
  progress,
  moduleGating,
  watermarkCpf,
  viewerId,
}: {
  course: Course;
  progress: ProgressEntry[];
  moduleGating: Record<string, boolean>;
  watermarkCpf?: string | null;
  viewerId: string;
}) {
  const allLessons = useMemo(() => course.modules.flatMap((m) => m.lessons), [course]);
  const progressMap = useMemo(() => {
    const map = new Map<string, ProgressEntry>();
    progress.forEach((p) => map.set(p.lessonId, p));
    return map;
  }, [progress]);

  const firstIncomplete = allLessons.find((l) => !progressMap.get(l.id)?.completed);
  const [currentLessonId, setCurrentLessonId] = useState(
    firstIncomplete?.id ?? allLessons[0]?.id
  );
  const [activeQuizModuleId, setActiveQuizModuleId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(progress.filter((p) => p.completed).map((p) => p.lessonId))
  );

  const currentLesson = activeQuizModuleId
    ? undefined
    : allLessons.find((l) => l.id === currentLessonId);
  const activeQuizModule = activeQuizModuleId
    ? course.modules.find((m) => m.id === activeQuizModuleId)
    : undefined;
  const lastReportRef = useRef(0);

  function selectLesson(lessonId: string) {
    setActiveQuizModuleId(null);
    setCurrentLessonId(lessonId);
  }

  async function reportProgress(lessonId: string, watchedSeconds: number, completed?: boolean) {
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, watchedSeconds, completed }),
    }).catch(() => {});
  }

  function handleTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement>) {
    if (!currentLesson) return;
    const seconds = Math.floor(e.currentTarget.currentTime);
    if (seconds - lastReportRef.current >= 10) {
      lastReportRef.current = seconds;
      reportProgress(currentLesson.id, seconds);
    }
  }

  function handleEnded() {
    if (!currentLesson) return;
    setCompletedIds((prev) => new Set(prev).add(currentLesson.id));
    reportProgress(currentLesson.id, currentLesson.video?.durationSec ?? 0, true);
  }

  function toggleComplete(lessonId: string) {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      const nowCompleted = !next.has(lessonId);
      if (nowCompleted) next.add(lessonId);
      else next.delete(lessonId);
      reportProgress(lessonId, progressMap.get(lessonId)?.watchedSeconds ?? 0, nowCompleted);
      return next;
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="font-display text-xl font-bold text-ink-900">{course.title}</h1>

        {activeQuizModule?.quiz ? (
          <div className="mt-4">
            <ModuleQuiz key={activeQuizModule.quiz.id} quiz={activeQuizModule.quiz} />
          </div>
        ) : (
          <>
        <div className="relative mt-4 overflow-hidden rounded-2xl bg-black">
          {currentLesson?.video?.provider === "youtube" ? (
            <iframe
              key={currentLesson.id}
              className="aspect-video w-full"
              src={youtubeEmbedUrl(currentLesson.video.url)}
              title={currentLesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : currentLesson?.video?.provider === "bunny" ? (
            <iframe
              key={currentLesson.id}
              className="aspect-video w-full"
              src={currentLesson.video.url}
              title={currentLesson.title}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : currentLesson?.videoId ? (
            <video
              key={currentLesson.id}
              controls
              className="aspect-video w-full"
              src={`/api/stream/${currentLesson.videoId}?lesson=${currentLesson.id}`}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center text-white/60">
              Selecione uma aula
            </div>
          )}
          {watermarkCpf && currentLesson?.videoId && (
            <span className="pointer-events-none absolute bottom-3 right-3 rounded bg-black/40 px-2 py-1 font-mono text-[11px] font-medium tracking-wide text-white/70 backdrop-blur-sm">
              {formatCPF(watermarkCpf)}
            </span>
          )}
        </div>

        {currentLesson && (
          <div className="mt-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-lg font-semibold text-ink-900">
                {currentLesson.title}
              </h2>
              <button
                onClick={() => toggleComplete(currentLesson.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  completedIds.has(currentLesson.id)
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-surface-alt text-ink-700 hover:bg-surface-alt/70"
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {completedIds.has(currentLesson.id) ? "Aula concluída" : "Marcar como concluída"}
              </button>
            </div>
            {currentLesson.description && (
              <p className="mt-2 text-sm text-ink-500">{currentLesson.description}</p>
            )}

            <LessonQuiz questions={currentLesson.quizQuestions} />

            <LessonComments lessonId={currentLesson.id} viewerId={viewerId} />
          </div>
        )}
          </>
        )}
      </div>

      <aside className="rounded-2xl border border-ink-900/10 bg-surface p-4">
        <p className="mb-3 px-1 text-sm font-semibold text-ink-900">Conteúdo do curso</p>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          {course.modules.map((module) => {
            const unlocked = moduleGating[module.id] ?? true;
            return (
            <div key={module.id}>
              <p className="flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-ink-300">
                {!unlocked && <Lock className="h-3 w-3" />}
                {module.title}
              </p>
              <ul className="mt-2 space-y-1">
                {module.lessons.map((lesson) => {
                  const active = !activeQuizModuleId && lesson.id === currentLessonId;
                  const done = completedIds.has(lesson.id);
                  return (
                    <li key={lesson.id}>
                      <button
                        onClick={() => unlocked && selectLesson(lesson.id)}
                        disabled={!unlocked}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition",
                          !unlocked
                            ? "cursor-not-allowed text-ink-300 opacity-60"
                            : active
                              ? "bg-brand-50 text-brand-700"
                              : "text-ink-700 hover:bg-surface-alt"
                        )}
                      >
                        {!unlocked ? (
                          <Lock className="h-4 w-4 shrink-0" />
                        ) : done ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        ) : active ? (
                          <PlayCircle className="h-4 w-4 shrink-0 text-brand-600" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-ink-300" />
                        )}
                        <span className="flex-1 leading-snug">{lesson.title}</span>
                        {lesson.freePreview && <Badge tone="success">Grátis</Badge>}
                        <span className="shrink-0 text-xs text-ink-300">
                          {formatDuration(lesson.video?.durationSec)}
                        </span>
                      </button>
                    </li>
                  );
                })}
                {module.quiz && (
                  <li>
                    <button
                      onClick={() => unlocked && setActiveQuizModuleId(module.id)}
                      disabled={!unlocked}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition",
                        !unlocked
                          ? "cursor-not-allowed text-ink-300 opacity-60"
                          : activeQuizModuleId === module.id
                            ? "bg-brand-50 text-brand-700"
                            : "text-ink-700 hover:bg-surface-alt"
                      )}
                    >
                      {!unlocked ? (
                        <Lock className="h-4 w-4 shrink-0" />
                      ) : (
                        <ClipboardCheck className="h-4 w-4 shrink-0 text-brand-600" />
                      )}
                      <span className="flex-1 leading-snug">{module.quiz.title}</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
