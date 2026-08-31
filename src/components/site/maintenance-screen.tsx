import { Wrench } from "lucide-react";

export function MaintenanceScreen({ message }: { message: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-200/20">
        <Wrench className="h-7 w-7" />
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold text-ink-900">
        Site em manutenção
      </h1>
      <p className="mt-3 text-ink-500">{message}</p>
    </div>
  );
}
