import { getCategories } from "@/lib/data/courses";
import { createCourse } from "@/lib/actions/courses";
import { Label, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CategorySelect } from "@/components/instructor/category-select";
import { CoverImageField } from "@/components/instructor/cover-image-field";

export const metadata = { title: "Novo curso | Painel de cursos" };

export default async function NewCoursePage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-ink-900">Novo curso</h1>
      <p className="mt-1 text-sm text-ink-500">
        Depois de criar, você poderá adicionar módulos e aulas — reaproveitando vídeos
        já enviados em outros cursos, se quiser.
      </p>

      <Card className="mt-6 p-6">
        <form action={createCourse} className="space-y-4">
          <div>
            <Label htmlFor="title">Título do curso</Label>
            <Input id="title" name="title" required placeholder="Ex: Lógica de Programação do Zero" />
          </div>
          <div>
            <Label htmlFor="subtitle">Subtítulo (opcional)</Label>
            <Input id="subtitle" name="subtitle" placeholder="Uma linha de destaque" />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" required placeholder="Do que se trata o curso?" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" required defaultValue="197" />
            </div>
            <div>
              <Label htmlFor="installments">Parcelas</Label>
              <Input id="installments" name="installments" type="number" min="1" defaultValue="10" />
            </div>
            <div>
              <Label htmlFor="accessDays">Acesso (dias)</Label>
              <Input id="accessDays" name="accessDays" type="number" min="1" defaultValue="365" />
            </div>
          </div>

          <div>
            <Label htmlFor="categoryId">Categoria</Label>
            <CategorySelect categories={categories} />
          </div>

          <CoverImageField defaultValue="" />

          <Button type="submit" className="w-full">
            Criar curso
          </Button>
        </form>
      </Card>
    </div>
  );
}
