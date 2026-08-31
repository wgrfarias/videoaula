import { DashboardShell } from "@/components/dashboard/shell";
import { requireUser } from "@/lib/session";

export default async function AlunoLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <DashboardShell
      title="Área do aluno"
      userName={user.name ?? user.email ?? ""}
      navItems={[
        { href: "/aluno", label: "Meus cursos", icon: "dashboard", exact: true },
        { href: "/cursos", label: "Catálogo de cursos", icon: "book" },
        { href: "/aluno/compras", label: "Histórico de compras", icon: "receipt" },
        { href: "/aluno/suporte", label: "Central de ajuda", icon: "support" },
        { href: "/aluno/perfil", label: "Meu perfil", icon: "profile" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
