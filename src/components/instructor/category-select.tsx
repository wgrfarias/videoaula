"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Input, FieldError } from "@/components/ui/input";
import { createCategory } from "@/lib/actions/courses";

type Category = { id: string; name: string };

export function CategorySelect({
  categories,
  defaultValue,
}: {
  categories: Category[];
  defaultValue?: string;
}) {
  const router = useRouter();
  const [list, setList] = useState(categories);
  const [selected, setSelected] = useState(defaultValue ?? "");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleCreate() {
    if (!newName.trim()) {
      setError("Informe um nome para a categoria");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const category = await createCategory(newName.trim());
      setList((prev) =>
        prev.some((c) => c.id === category.id) ? prev : [...prev, category].sort((a, b) => a.name.localeCompare(b.name))
      );
      setSelected(category.id);
      setNewName("");
      setCreating(false);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar categoria");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <input type="hidden" name="categoryId" value={selected} />
      <div className="flex gap-2">
        <select
          aria-label="Categoria"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full rounded-xl border border-ink-300/40 bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">Sem categoria</option>
          {list.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="flex shrink-0 items-center gap-1 rounded-xl border border-ink-300/40 px-3 text-sm font-medium text-ink-700 hover:bg-surface-alt"
        >
          {creating ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          Nova
        </button>
      </div>

      {creating && (
        <div className="mt-2 flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome da nova categoria"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={loading}
            className="shrink-0 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar"}
          </button>
        </div>
      )}
      <FieldError>{error}</FieldError>
    </div>
  );
}
