import { DashboardShell } from "@/components/dashboard/shell";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <DashboardShell
      title="Configurações do site"
      userName={user.name ?? user.email ?? ""}
      navItems={[
        { href: "/admin", label: "Conteúdo do site", icon: "settings", exact: true },
        { href: "/professor", label: "Painel de cursos", icon: "book" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
