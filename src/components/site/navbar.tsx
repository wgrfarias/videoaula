"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { GraduationCap, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LinkButton } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/cursos", label: "Cursos" },
  { href: "/sobre", label: "Quem é a Camila?" },
  { href: "/faq", label: "FAQ" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const areaHref =
    session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMIN"
      ? "/professor"
      : "/aluno";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-hero-gradient text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-500">
            <GraduationCap className="h-5 w-5" />
          </span>
          Português com a
          <span className="text-accent-400">Camila</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-white/80 md:flex">
          {NAV_LINKS.map((link) => (
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

        <div className="hidden items-center gap-3 md:flex">
          {status === "authenticated" ? (
            <>
              <LinkButton href={areaHref} variant="light" size="sm">
                Área do aluno
              </LinkButton>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm font-medium text-white/70 hover:text-white"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/entrar" className="text-sm font-medium text-white/80 hover:text-white">
                Entrar
              </Link>
              <LinkButton href="/cadastro" variant="primary" size="sm">
                Criar conta
              </LinkButton>
            </>
          )}
        </div>

        <button
          className="text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-hero-gradient px-5 pb-5 md:hidden">
          <nav className="flex flex-col gap-4 pt-4 text-sm font-medium text-white/85">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <hr className="border-white/10" />
            {status === "authenticated" ? (
              <>
                <Link href={areaHref} onClick={() => setOpen(false)}>
                  Área do aluno
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
