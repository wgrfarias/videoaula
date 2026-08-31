import { getSiteContent } from "@/lib/data/site-content";
import { getMaintenanceMessage } from "@/lib/maintenance";
import { MaintenanceScreen } from "@/components/site/maintenance-screen";

const DEFAULT_FAQS = [
  {
    q: "Por quanto tempo tenho acesso ao curso?",
    a: "O prazo de acesso é exibido na página de cada curso e começa a contar a partir da confirmação da compra.",
  },
  {
    q: "Posso assistir pelo celular?",
    a: "Sim, a plataforma funciona em qualquer navegador, tanto no computador quanto no celular.",
  },
  {
    q: "Como acesso as aulas depois de comprar?",
    a: "Basta entrar na sua conta e acessar a Área do aluno — todos os cursos comprados aparecem lá.",
  },
  {
    q: "As aulas ficam liberadas aos poucos?",
    a: "Não, assim que a compra é confirmada todas as aulas do curso ficam disponíveis.",
  },
];

export async function generateMetadata() {
  const content = await getSiteContent();
  return { title: `FAQ | ${content.siteName} ${content.siteTagline}` };
}

export default async function FaqPage() {
  const maintenanceMessage = await getMaintenanceMessage();
  if (maintenanceMessage) return <MaintenanceScreen message={maintenanceMessage} />;

  const content = await getSiteContent();
  const faqs = content.faqItems.length > 0 ? content.faqItems : DEFAULT_FAQS;

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-3xl font-bold text-ink-900">Perguntas frequentes</h1>
      <div className="mt-8 divide-y divide-ink-900/10">
        {faqs.map((item) => (
          <div key={item.q} className="py-5">
            <p className="font-semibold text-ink-900">{item.q}</p>
            <p className="mt-2 text-sm text-ink-500">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
