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
        { href: "/admin/usuarios", label: "Usuários", icon: "users" },
        { href: "/admin/faturamento", label: "Faturamento", icon: "revenue" },
        { href: "/admin/cupons", label: "Cupons", icon: "coupon" },
        { href: "/admin/metricas", label: "Métricas", icon: "metrics" },
        { href: "/admin/chamados", label: "Chamados", icon: "support" },
        { href: "/professor", label: "Painel de cursos", icon: "book" },
        { href: "/aluno/perfil", label: "Meu perfil", icon: "profile" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
