"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { linesToLinks, linesToFaq } from "@/lib/data/site-content";

export async function updateSiteContent(formData: FormData) {
  await requireAdmin();

  const field = (name: string) => String(formData.get(name) ?? "").trim();

  const navLinks = linesToLinks(field("navLinksText"));
  const socialLinks = linesToLinks(field("socialLinksText"));
  const faqItems = linesToFaq(field("faqItemsText"));

  await prisma.siteContent.upsert({
    where: { id: "singleton" },
    update: {
      siteName: field("siteName"),
      siteTagline: field("siteTagline"),
      heroBadgeText: field("heroBadgeText"),
      heroTitle: field("heroTitle"),
      heroSubtitle: field("heroSubtitle"),
      heroPrimaryLabel: field("heroPrimaryLabel"),
      heroPrimaryHref: field("heroPrimaryHref"),
      heroSecondaryLabel: field("heroSecondaryLabel"),
      heroSecondaryHref: field("heroSecondaryHref"),
      heroStatLine: field("heroStatLine"),
      footerTagline: field("footerTagline"),
      aboutTitle: field("aboutTitle"),
      aboutBody: field("aboutBody"),
      navLinksJson: JSON.stringify(navLinks),
      socialLinksJson: JSON.stringify(socialLinks),
      faqItemsJson: JSON.stringify(faqItems),
    },
    create: {
      id: "singleton",
      siteName: field("siteName"),
      siteTagline: field("siteTagline"),
      heroBadgeText: field("heroBadgeText"),
      heroTitle: field("heroTitle"),
      heroSubtitle: field("heroSubtitle"),
      heroPrimaryLabel: field("heroPrimaryLabel"),
      heroPrimaryHref: field("heroPrimaryHref"),
      heroSecondaryLabel: field("heroSecondaryLabel"),
      heroSecondaryHref: field("heroSecondaryHref"),
      heroStatLine: field("heroStatLine"),
      footerTagline: field("footerTagline"),
      aboutTitle: field("aboutTitle"),
      aboutBody: field("aboutBody"),
      navLinksJson: JSON.stringify(navLinks),
      socialLinksJson: JSON.stringify(socialLinks),
      faqItemsJson: JSON.stringify(faqItems),
    },
  });

  revalidatePath("/", "layout");
}
