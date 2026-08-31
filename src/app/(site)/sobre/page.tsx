import { getSiteContent } from "@/lib/data/site-content";
import { getMaintenanceMessage } from "@/lib/maintenance";
import { MaintenanceScreen } from "@/components/site/maintenance-screen";

export async function generateMetadata() {
  const content = await getSiteContent();
  return { title: `${content.aboutTitle} | ${content.siteName} ${content.siteTagline}` };
}

export default async function AboutPage() {
  const maintenanceMessage = await getMaintenanceMessage();
  if (maintenanceMessage) return <MaintenanceScreen message={maintenanceMessage} />;

  const content = await getSiteContent();

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-3xl font-bold text-ink-900">{content.aboutTitle}</h1>
      {content.aboutParagraphs.map((paragraph, i) => (
        <p key={i} className="mt-5 text-ink-700 first:mt-5">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
