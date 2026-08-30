import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateProfile } from "@/lib/actions/profile";
import { Card } from "@/components/ui/card";
import { Label, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AvatarUpload } from "@/components/aluno/avatar-upload";
import { CpfInput } from "@/components/aluno/cpf-input";
import { formatCPF } from "@/lib/cpf";

export const metadata = { title: "Meu perfil" };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string }>;
}) {
  const sessionUser = await requireUser();
  const { required } = await searchParams;
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-ink-900">Meu perfil</h1>
      <p className="mt-1 text-sm text-ink-500">
        Sua foto, apelido e CPF aparecem para você e (no caso do CPF) como
        identificação nos vídeos que você assiste.
      </p>

      {required === "cpf" && !user.cpf && (
        <Card className="mt-4 border-accent-400/40 bg-accent-400/10 p-4 text-sm text-accent-600">
          Preencha seu CPF abaixo para poder assistir às aulas — ele é exibido
          como marca d&apos;água no vídeo, como proteção contra cópia.
        </Card>
      )}

      <Card className="mt-6 p-6">
        <form action={updateProfile} className="space-y-4">
          <AvatarUpload avatarUrl={user.avatarUrl} name={user.name} />

          <div>
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" name="name" defaultValue={user.name} required />
          </div>
          <div>
            <Label htmlFor="nickname">Apelido (como prefere ser chamado)</Label>
            <Input id="nickname" name="nickname" defaultValue={user.nickname ?? ""} placeholder="Opcional" />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" defaultValue={user.bio ?? ""} placeholder="Opcional" />
          </div>
          <div>
            <Label htmlFor="cpf">CPF</Label>
            {user.cpf ? (
              <Input id="cpf" value={formatCPF(user.cpf)} disabled />
            ) : (
              <CpfInput defaultValue="" />
            )}
            <p className="mt-1 text-xs text-ink-300">
              {user.cpf
                ? "Não é possível alterar o CPF depois de cadastrado."
                : "Não pode ser alterado depois de salvo — confira antes de enviar."}
            </p>
          </div>

          <Button type="submit">Salvar alterações</Button>
        </form>
      </Card>
    </div>
  );
}
