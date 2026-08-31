import { prisma } from "@/lib/prisma";

export type ModuleWithQuiz = {
  id: string;
  order: number;
  quiz: { id: string } | null;
};

// A module is unlocked if it's the first one, or if the previous module has
// no quiz, or if the user has already passed that quiz. Operates on one
// course's own module list at a time — see the caller for how bundle
// components (each a course of their own) are gated independently.
export function computeModuleGating<M extends ModuleWithQuiz>(modules: M[], passedQuizIds: Set<string>) {
  const sorted = [...modules].sort((a, b) => a.order - b.order);
  const gating = new Map<string, boolean>();
  let unlocked = true;
  for (const module_ of sorted) {
    gating.set(module_.id, unlocked);
    if (module_.quiz) {
      unlocked = passedQuizIds.has(module_.quiz.id);
    }
  }
  return gating;
}

export async function getPassedQuizIds(userId: string) {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId, passed: true },
    select: { quizId: true },
  });
  return new Set(attempts.map((a) => a.quizId));
}
