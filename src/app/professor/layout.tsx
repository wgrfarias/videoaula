import { DashboardShell } from "@/components/dashboard/shell";
import { requireInstructor } from "@/lib/session";

export default async function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireInstructor();

  return (
    <DashboardShell
      title="Painel de cursos"
      userName={user.name ?? user.email ?? ""}
      navItems={[
        { href: "/professor", label: "Visão geral", icon: "dashboard", exact: true },
        { href: "/professor/cursos", label: "Meus cursos", icon: "book" },
        { href: "/professor/videos", label: "Biblioteca de vídeos", icon: "video" },
        { href: "/aluno/perfil", label: "Meu perfil", icon: "profile" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
