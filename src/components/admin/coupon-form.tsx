"use client";

import { useState } from "react";
import { Label, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type CourseOption = { id: string; title: string };

export function CouponForm({
  courses,
  createCoupon,
}: {
  courses: CourseOption[];
  createCoupon: (formData: FormData) => void;
}) {
  const [scope, setScope] = useState<"SITEWIDE" | "COURSES">("SITEWIDE");
  const [discountType, setDiscountType] = useState<"PERCENT" | "FIXED">("PERCENT");

  return (
    <form action={createCoupon} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="code">Código do cupom</Label>
          <Input id="code" name="code" placeholder="Ex: BLACKFRIDAY10" className="uppercase" required />
        </div>
        <div>
          <Label htmlFor="expiresAt">Expira em (opcional)</Label>
          <Input id="expiresAt" name="expiresAt" type="date" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="discountType">Tipo de desconto</Label>
          <select
            id="discountType"
            name="discountType"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as "PERCENT" | "FIXED")}
            className="w-full rounded-xl border border-ink-300/40 bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="PERCENT">Percentual (%)</option>
            <option value="FIXED">Valor fixo (R$)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="discountValue">
            {discountType === "PERCENT" ? "Desconto (%)" : "Desconto (R$)"}
          </Label>
          <Input
            id="discountValue"
            name="discountValue"
            type="number"
            step="0.01"
            min="0"
            max={discountType === "PERCENT" ? 100 : undefined}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="scope">Vale para</Label>
        <select
          id="scope"
          name="scope"
          value={scope}
          onChange={(e) => setScope(e.target.value as "SITEWIDE" | "COURSES")}
          className="w-full rounded-xl border border-ink-300/40 bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="SITEWIDE">Qualquer curso ou combo</option>
          <option value="COURSES">Cursos/combos específicos</option>
        </select>
      </div>

      {scope === "COURSES" && (
        <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-ink-300/40 p-3">
          {courses.map((course) => (
            <label key={course.id} className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" name="courseIds" value={course.id} className="h-4 w-4 rounded border-ink-300" />
              {course.title}
            </label>
          ))}
          {courses.length === 0 && <p className="text-xs text-ink-300">Nenhum curso cadastrado ainda.</p>}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="maxRedemptions">Limite total de usos (opcional)</Label>
          <Input id="maxRedemptions" name="maxRedemptions" type="number" min="1" placeholder="Sem limite" />
        </div>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm font-medium text-ink-700">
          <input type="checkbox" name="onePerCustomer" className="h-4 w-4 rounded border-ink-300" />
          1 uso por cliente
        </label>
      </div>

      <Button type="submit">Criar cupom</Button>
    </form>
  );
}
