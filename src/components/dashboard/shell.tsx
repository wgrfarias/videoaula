"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BookOpen, GraduationCap, LayoutDashboard, LogOut, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  dashboard: LayoutDashboard,
  book: BookOpen,
  video: Video,
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
    <div className="flex min-h-screen bg-cream-100">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-900/5 bg-white md:flex">
        <div className="flex items-center gap-2 border-b border-ink-900/5 px-6 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-sm font-bold text-ink-900">{title}</p>
            <p className="text-xs text-ink-500">{userName}</p>
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
                    : "text-ink-700 hover:bg-cream-200"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-ink-900/5 p-3">
          <Link
            href="/"
            className="mb-1 block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-cream-200"
          >
            Voltar ao site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-cream-200"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="border-b border-ink-900/5 bg-white px-5 py-4 md:hidden">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-display font-bold text-ink-900">
              <GraduationCap className="h-5 w-5 text-brand-600" /> {title}
            </span>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-ink-500">
              Sair
            </button>
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
