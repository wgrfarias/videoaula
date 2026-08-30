"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BookOpen, DollarSign, LayoutDashboard, LogOut, Settings, User, Users, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";

const ICONS = {
  dashboard: LayoutDashboard,
  book: BookOpen,
  video: Video,
  settings: Settings,
  users: Users,
  profile: User,
  revenue: DollarSign,
} as const;

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  exact?: boolean;
};

export function DashboardShell({
  navItems,
  title,
  userName,
  children,
}: {
  navItems: DashboardNavItem[];
  title: string;
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-900/5 bg-surface md:flex">
        <div className="flex items-center gap-2 border-b border-ink-900/5 px-6 py-5">
          <LogoMark className="h-9 w-9 shrink-0" />
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-ink-900">{title}</p>
            <p className="truncate text-xs text-ink-500">{userName}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = ICONS[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-600 text-white"
                    : "text-ink-700 hover:bg-surface-alt"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-ink-900/5 p-3">
          <div className="mb-1 flex items-center justify-between px-3 py-1">
            <span className="text-xs font-medium text-ink-500">Tema</span>
            <ThemeToggle className="text-ink-500 hover:bg-surface-alt hover:text-ink-900" />
          </div>
          <Link
            href="/"
            className="mb-1 block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-surface-alt"
          >
            Voltar ao site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-surface-alt"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="border-b border-ink-900/5 bg-surface px-5 py-4 md:hidden">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-display font-bold text-ink-900">
              <LogoMark className="h-7 w-7" /> {title}
            </span>
            <div className="flex items-center gap-1">
              <ThemeToggle className="text-ink-500 hover:bg-surface-alt hover:text-ink-900" />
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-ink-500">
                Sair
              </button>
            </div>
          </div>
          <nav className="mt-3 flex gap-4 overflow-x-auto text-sm font-medium text-ink-500">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap border-b-2 border-transparent pb-1",
                  (item.exact ? pathname === item.href : pathname.startsWith(item.href)) &&
                    "border-brand-600 text-brand-700"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
