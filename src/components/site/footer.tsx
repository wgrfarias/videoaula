import Link from "next/link";
import { LogoMark, LogoLockup } from "@/components/site/logo";
import type { LinkItem } from "@/lib/data/site-content";

export function Footer({
  siteName,
  siteTagline,
  tagline,
  navLinks,
  socialLinks,
}: {
  siteName?: string;
  siteTagline?: string;
  tagline?: string;
  navLinks?: LinkItem[];
  socialLinks?: LinkItem[];
}) {
  return (
    <footer className="border-t border-ink-900/5 bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9 shrink-0" />
            <LogoLockup className="leading-tight text-ink-900" name={siteName} tagline={siteTagline} />
          </div>
          <p className="mt-3 text-sm text-ink-500">{tagline}</p>
          {socialLinks && socialLinks.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-4 text-sm">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-brand-600 hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="mb-3 font-semibold text-ink-900">Navegação</p>
            <ul className="space-y-2 text-ink-500">
              {(navLinks ?? []).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 font-semibold text-ink-900">Conta</p>
            <ul className="space-y-2 text-ink-500">
              <li><Link href="/entrar" className="hover:text-brand-600">Entrar</Link></li>
              <li><Link href="/cadastro" className="hover:text-brand-600">Criar conta</Link></li>
              <li><Link href="/aluno" className="hover:text-brand-600">Área do aluno</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-semibold text-ink-900">Gestão</p>
            <ul className="space-y-2 text-ink-500">
              <li><Link href="/professor" className="hover:text-brand-600">Painel de cursos</Link></li>
              <li><Link href="/admin" className="hover:text-brand-600">Configurações do site</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-ink-900/5 py-5 text-center text-xs text-ink-300">
        © {new Date().getFullYear()} {siteName} {siteTagline}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
