"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LinkButton } from "@/components/ui/button";
import { LogoMark, LogoLockup } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";

const DEFAULT_NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/cursos", label: "Cursos" },
  { href: "/sobre", label: "Quem é o Wagner?" },
  { href: "/faq", label: "FAQ" },
];

export function Navbar({
  siteName,
  siteTagline,
  navLinks,
}: {
  siteName?: string;
  siteTagline?: string;
  navLinks?: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const links = navLinks && navLinks.length > 0 ? navLinks : DEFAULT_NAV_LINKS;

  const areaHref =
    session?.user?.role === "ADMIN"
      ? "/admin"
      : session?.user?.role === "INSTRUCTOR"
        ? "/professor"
        : "/aluno";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-hero-gradient text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark className="h-10 w-10 shrink-0" />
          <LogoLockup className="leading-tight text-white" name={siteName} tagline={siteTagline} />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-white/80 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-white",
                pathname === link.href && "text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle className="text-white/80 hover:bg-white/10 hover:text-white" />
          {status === "authenticated" ? (
            <>
              <LinkButton href={areaHref} variant="light" size="sm" className="ml-1">
                Minha área
              </LinkButton>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="ml-1 text-sm font-medium text-white/70 hover:text-white"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/entrar" className="ml-1 text-sm font-medium text-white/80 hover:text-white">
                Entrar
              </Link>
              <LinkButton href="/cadastro" variant="primary" size="sm">
                Criar conta
              </LinkButton>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle className="text-white/80 hover:bg-white/10 hover:text-white" />
          <button className="p-1 text-white" onClick={() => setOpen((v) => !v)} aria-label="Abrir menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-hero-gradient px-5 pb-5 md:hidden">
          <nav className="flex flex-col gap-4 pt-4 text-sm font-medium text-white/85">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <hr className="border-white/10" />
            {status === "authenticated" ? (
              <>
                <Link href={areaHref} onClick={() => setOpen(false)}>
                  Minha área
                </Link>
                <button
                  className="text-left text-white/70"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/entrar" onClick={() => setOpen(false)}>
                  Entrar
                </Link>
                <Link href="/cadastro" onClick={() => setOpen(false)}>
                  Criar conta
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
