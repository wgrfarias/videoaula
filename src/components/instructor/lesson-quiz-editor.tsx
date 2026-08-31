import { HelpCircle, Trash2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addLessonQuestion, deleteLessonQuestion } from "@/lib/actions/lesson-quiz";

type Option = { id: string; text: string; isCorrect: boolean };
type Question = { id: string; text: string; explanation: string | null; options: Option[] };

const MAX_QUESTIONS = 5;

export function LessonQuizEditor({ lessonId, questions }: { lessonId: string; questions: Question[] }) {
  return (
    <details className="mt-2 rounded-xl border border-ink-900/10 p-3">
      <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-brand-600">
        <HelpCircle className="h-3.5 w-3.5" />
        Questões da aula ({questions.length}/{MAX_QUESTIONS})
      </summary>

      {questions.length > 0 && (
        <ul className="mt-3 space-y-2">
          {questions.map((question, qi) => (
            <li key={question.id} className="rounded-lg border border-ink-900/10 p-2.5 text-xs">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-ink-900">
                  {qi + 1}. {question.text}
                </p>
                <form action={deleteLessonQuestion.bind(null, question.id)}>
                  <button type="submit" className="shrink-0 rounded-lg p-1 text-red-600 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
              <ul className="mt-1 space-y-0.5 text-ink-500">
                {question.options.map((option) => (
                  <li key={option.id} className={option.isCorrect ? "font-semibold text-emerald-600" : ""}>
                    {option.isCorrect ? "✓ " : "• "}
                    {option.text}
                  </li>
                ))}
              </ul>
              {question.explanation && (
                <p className="mt-1 italic text-ink-300">Explicação: {question.explanation}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {questions.length < MAX_QUESTIONS && (
        <form action={addLessonQuestion.bind(null, lessonId)} className="mt-3 space-y-2 rounded-lg border border-ink-900/10 p-3">
          <Input name="text" placeholder="Enunciado da pergunta" required />
          <div className="grid gap-2 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input type="radio" name="correctOption" value={i} required={i === 1} className="shrink-0" />
                <Input name={`option${i}`} placeholder={`Alternativa ${i}${i > 2 ? " (opcional)" : ""}`} />
              </div>
            ))}
          </div>
          <Textarea name="explanation" placeholder="Explicação mostrada após responder (opcional)" className="min-h-16 text-xs" />
          <p className="text-xs text-ink-300">Marque a bolinha da alternativa correta.</p>
          <Button type="submit" size="sm">
            Adicionar pergunta
          </Button>
        </form>
      )}
    </details>
  );
}
