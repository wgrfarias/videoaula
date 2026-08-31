"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Option = { id: string; text: string };
type Question = { id: string; text: string; options: Option[] };
export type QuizData = { id: string; title: string; passingPercent: number; questions: Question[] };

export function ModuleQuiz({ quiz }: { quiz: QuizData }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ scorePercent: number; passed: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (Object.keys(answers).length < quiz.questions.length) {
      setError("Responda todas as perguntas antes de enviar.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const res = await fetch(`/api/quizzes/${quiz.id}/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Não foi possível enviar suas respostas.");
      return;
    }
    setResult(data);
    router.refresh();
  }

  if (result) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl bg-surface-alt p-6 text-center">
        {result.passed ? (
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        ) : (
          <XCircle className="h-12 w-12 text-accent-600" />
        )}
        <p className="font-display text-xl font-bold text-ink-900">
          {Math.round(result.scorePercent)}% de acerto
        </p>
        <p className="max-w-sm text-sm text-ink-500">
          {result.passed
            ? "Aprovado! O próximo módulo já está liberado."
            : `Reprovado — é preciso pelo menos ${quiz.passingPercent}% para avançar para o próximo módulo.`}
        </p>
        {!result.passed && (
          <Button
            type="button"
            onClick={() => {
              setResult(null);
              setAnswers({});
            }}
          >
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-ink-900/10 bg-surface p-6">
      <h2 className="font-display text-lg font-semibold text-ink-900">{quiz.title}</h2>
      <p className="mt-1 text-xs text-ink-500">Nota mínima para avançar: {quiz.passingPercent}%</p>

      <div className="mt-4 space-y-5">
        {quiz.questions.map((question, qi) => (
          <div key={question.id}>
            <p className="text-sm font-medium text-ink-900">
              {qi + 1}. {question.text}
            </p>
            <div className="mt-2 space-y-1.5">
              {question.options.map((option) => (
                <label key={option.id} className="flex items-center gap-2 text-sm text-ink-700">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answers[question.id] === option.id}
                    onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
                  />
                  {option.text}
                </label>
              ))}
            </div>
          </div>
        ))}
        {quiz.questions.length === 0 && (
          <p className="text-sm text-ink-500">Este questionário ainda não tem perguntas.</p>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-accent-600">{error}</p>}

      <Button type="submit" disabled={submitting || quiz.questions.length === 0} className="mt-5">
        {submitting ? "Enviando..." : "Enviar respostas"}
      </Button>
    </form>
  );
}
