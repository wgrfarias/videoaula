import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { setUserRole, setPlatformFee } from "@/lib/actions/users";
import { Card, Badge } from "@/components/ui/card";
import { GoogleIcon } from "@/components/site/google-icon";
import { ROLES } from "@/lib/constants";

export const metadata = { title: "Usuários | Admin" };

const ROLE_OPTIONS = [
  { value: "STUDENT", label: "Aluno" },
  { value: "INSTRUCTOR", label: "Professor / gestor de cursos" },
  { value: "ADMIN", label: "Admin" },
];

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      passwordHash: true,
      createdAt: true,
      platformFeePercent: true,
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Usuários</h1>
      <p className="mt-1 text-sm text-ink-500">
        Defina quem tem acesso ao painel de cursos (professor) ou ao admin do
        site. Qualquer pessoa que crie conta — por e-mail ou Google — começa
        como aluno.
      </p>

      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-900/10 bg-surface-alt/40 text-xs uppercase text-ink-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Usuário</th>
                <th className="px-4 py-3 font-semibold">Login</th>
                <th className="px-4 py-3 font-semibold">Papel</th>
                <th className="px-4 py-3 font-semibold">Comissão da plataforma</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/5">
              {users.map((user) => {
                const isSelf = user.id === admin.id;
                return (
                  <tr key={user.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">
                        {user.name} {isSelf && <span className="text-xs text-ink-300">(você)</span>}
                      </p>
                      <p className="text-xs text-ink-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {user.passwordHash ? (
                        <Badge tone="neutral">E-mail e senha</Badge>
                      ) : (
                        <Badge tone="brand" className="flex w-fit items-center gap-1">
                          <GoogleIcon className="h-3 w-3" /> Google
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isSelf ? (
                        <Badge tone="success">{ROLE_OPTIONS.find((r) => r.value === user.role)?.label}</Badge>
                      ) : (
                        <form action={setUserRole.bind(null, user.id)} className="flex items-center gap-2">
                          <select
                            key={user.role}
                            name="role"
                            defaultValue={user.role}
                            className="rounded-lg border border-ink-300/40 bg-surface px-2 py-1.5 text-xs outline-none focus:border-brand-500"
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                          >
                            Salvar
                          </button>
                        </form>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.role === ROLES.INSTRUCTOR || user.role === ROLES.ADMIN ? (
                        <form action={setPlatformFee.bind(null, user.id)} className="flex items-center gap-2">
                          <input
                            key={user.platformFeePercent}
                            name="platformFeePercent"
                            type="number"
                            min={0}
                            max={100}
                            defaultValue={user.platformFeePercent}
                            className="w-16 rounded-lg border border-ink-300/40 bg-surface px-2 py-1.5 text-xs outline-none focus:border-brand-500"
                          />
                          <span className="text-xs text-ink-500">%</span>
                          <button
                            type="submit"
                            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                          >
                            Salvar
                          </button>
                        </form>
                      ) : (
                        <span className="text-xs text-ink-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {users.length === 0 && <p className="mt-6 text-sm text-ink-500">Nenhum usuário encontrado.</p>}
    </div>
  );
}
