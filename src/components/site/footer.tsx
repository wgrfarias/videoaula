import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-ink-900/5 bg-cream-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white">
              <GraduationCap className="h-4 w-4" />
            </span>
            Português com a Camila
          </div>
          <p className="mt-3 text-sm text-ink-500">
            Cursos em vídeo para quem está se preparando para concursos públicos,
            com aulas gravadas, questões comentadas e acompanhamento de progresso.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="mb-3 font-semibold text-ink-900">Navegação</p>
            <ul className="space-y-2 text-ink-500">
              <li><Link href="/cursos" className="hover:text-brand-600">Cursos</Link></li>
              <li><Link href="/sobre" className="hover:text-brand-600">Quem é a Camila?</Link></li>
              <li><Link href="/faq" className="hover:text-brand-600">FAQ</Link></li>
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
            <p className="mb-3 font-semibold text-ink-900">Para professores</p>
            <ul className="space-y-2 text-ink-500">
              <li><Link href="/professor" className="hover:text-brand-600">Painel da professora</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-ink-900/5 py-5 text-center text-xs text-ink-300">
        © {new Date().getFullYear()} Português com a Camila. Todos os direitos reservados.
      </div>
    </footer>
  );
}
