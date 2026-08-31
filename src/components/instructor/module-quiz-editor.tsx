import { ClipboardCheck, Trash2 } from "lucide-react";
import { Label, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createQuiz, updateQuiz, deleteQuiz, addQuestion, deleteQuestion } from "@/lib/actions/quizzes";

type Option = { id: string; text: string; isCorrect: boolean };
type Question = { id: string; text: string; options: Option[] };
type Quiz = { id: string; title: string; passingPercent: number; questions: Question[] };

export function ModuleQuizEditor({ moduleId, quiz }: { moduleId: string; quiz: Quiz | null }) {
  if (!quiz) {
    return (
      <div className="mt-4 border-t border-ink-900/5 pt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <ClipboardCheck className="h-4 w-4 text-brand-600" /> Questionário do módulo
        </div>
        <p className="mt-1 text-xs text-ink-500">
          Crie um questionário para exigir uma nota mínima antes de liberar o
          próximo módulo para o aluno.
        </p>
        <form action={createQuiz.bind(null, moduleId)} className="mt-3 flex flex-wrap gap-2">
          <Input name="title" placeholder="Título (opcional)" className="flex-1" />
          <Input
            name="passingPercent"
            type="number"
            min="0"
            max="100"
            defaultValue="70"
            placeholder="Nota mínima %"
            className="w-32"
          />
          <Button type="submit" size="sm" className="shrink-0">
            Criar questionário
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-ink-900/5 pt-4">
      <div className="flex items-center gap-2 text-sm font-medium text-ink-700">
        <ClipboardCheck className="h-4 w-4 text-brand-600" /> Questionário do módulo
      </div>

      <form action={updateQuiz.bind(null, quiz.id)} className="mt-3 flex flex-wrap items-end gap-2">
        <div className="flex-1">
          <Label htmlFor={`quiz-title-${quiz.id}`}>Título</Label>
          <Input id={`quiz-title-${quiz.id}`} name="title" defaultValue={quiz.title} />
        </div>
        <div>
          <Label htmlFor={`quiz-passing-${quiz.id}`}>Nota mínima %</Label>
          <Input
            id={`quiz-passing-${quiz.id}`}
            name="passingPercent"
            type="number"
            min="0"
            max="100"
            defaultValue={quiz.passingPercent}
            className="w-28"
          />
        </div>
        <Button type="submit" size="sm" variant="outline" className="shrink-0">
          Salvar
        </Button>
        <form action={deleteQuiz.bind(null, quiz.id)}>
          <button
            type="submit"
            title="Excluir questionário"
            className="rounded-lg p-2 text-accent-600 hover:bg-accent-400/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </form>
      </form>

      {quiz.questions.length > 0 && (
        <ul className="mt-3 space-y-2">
          {quiz.questions.map((question, qi) => (
            <li key={question.id} className="rounded-xl border border-ink-900/10 p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-ink-900">
                  {qi + 1}. {question.text}
                </p>
                <form action={deleteQuestion.bind(null, question.id)}>
                  <button type="submit" className="shrink-0 rounded-lg p-1 text-accent-600 hover:bg-accent-400/10">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
              <ul className="mt-1.5 space-y-0.5 text-xs text-ink-500">
                {question.options.map((option) => (
                  <li key={option.id} className={option.isCorrect ? "font-semibold text-emerald-600" : ""}>
                    {option.isCorrect ? "✓ " : "• "}
                    {option.text}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-semibold text-brand-600">
          + Adicionar pergunta
        </summary>
        <form action={addQuestion.bind(null, quiz.id)} className="mt-2 space-y-2 rounded-xl border border-ink-900/10 p-3">
          <Input name="text" placeholder="Enunciado da pergunta" required />
          <div className="grid gap-2 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input type="radio" name="correctOption" value={i} required={i === 1} className="shrink-0" />
                <Input name={`option${i}`} placeholder={`Alternativa ${i}${i > 2 ? " (opcional)" : ""}`} />
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-300">Marque a bolinha da alternativa correta.</p>
          <Button type="submit" size="sm">
            Adicionar pergunta
          </Button>
        </form>
      </details>
    </div>
  );
}
