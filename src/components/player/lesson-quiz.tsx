"use client";

import { useState } from "react";
import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { id: string; text: string; isCorrect: boolean };
type Question = { id: string; text: string; explanation: string | null; options: Option[] };

export function LessonQuiz({ questions }: { questions: Question[] }) {
  const [selected, setSelected] = useState<Record<string, string>>({});

  if (questions.length === 0) return null;

  return (
    <div className="mt-6 space-y-4">
      <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-ink-900">
        <HelpCircle className="h-4 w-4 text-brand-600" /> Teste seu conhecimento
      </h3>
      {questions.map((question, qi) => {
        const chosenId = selected[question.id];
        const chosenOption = question.options.find((o) => o.id === chosenId);
        const answered = Boolean(chosenId);

        return (
          <div key={question.id} className="rounded-2xl border border-ink-900/10 bg-surface p-4">
            <p className="text-sm font-medium text-ink-900">
              {qi + 1}. {question.text}
            </p>
            <div className="mt-2 space-y-1.5">
              {question.options.map((option) => {
                const isChosen = chosenId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={answered}
                    onClick={() => setSelected((prev) => ({ ...prev, [question.id]: option.id }))}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition",
                      answered && option.isCorrect
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                        : answered && isChosen && !option.isCorrect
                          ? "border-red-300 bg-red-50 text-red-700"
                          : answered
                            ? "border-ink-900/10 text-ink-300"
                            : "border-ink-900/10 text-ink-700 hover:bg-surface-alt",
                      answered && "cursor-default"
                    )}
                  >
                    {answered && option.isCorrect && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    )}
                    {answered && isChosen && !option.isCorrect && (
                      <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                    )}
                    {option.text}
                  </button>
                );
              })}
            </div>

            {answered && (
              <p
                className={cn(
                  "mt-3 rounded-xl p-3 text-sm",
                  chosenOption?.isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
                )}
              >
                <span className="font-semibold">
                  {chosenOption?.isCorrect ? "Parabéns, resposta certa!" : "Resposta errada."}
                </span>
                {question.explanation && <> {question.explanation}</>}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
