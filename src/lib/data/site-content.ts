import { prisma } from "@/lib/prisma";

export type LinkItem = { label: string; href: string };
export type FaqItem = { q: string; a: string };

function parseLinks(json: string): LinkItem[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is LinkItem =>
        typeof item?.label === "string" && typeof item?.href === "string"
    );
  } catch {
    return [];
  }
}

function parseFaq(json: string): FaqItem[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is FaqItem => typeof item?.q === "string" && typeof item?.a === "string"
    );
  } catch {
    return [];
  }
}

export async function getSiteContentRaw() {
  return prisma.siteContent.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
}

export async function getSiteContent() {
  const raw = await getSiteContentRaw();
  return {
    ...raw,
    navLinks: parseLinks(raw.navLinksJson),
    socialLinks: parseLinks(raw.socialLinksJson),
    faqItems: parseFaq(raw.faqItemsJson),
    aboutParagraphs: raw.aboutBody.split(/\n{2,}/).filter(Boolean),
  };
}

export function linksToLines(links: LinkItem[]) {
  return links.map((l) => `${l.label} | ${l.href}`).join("\n");
}

export function linesToLinks(text: string): LinkItem[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|").map((part) => part.trim());
      return { label: label ?? "", href: href ?? "" };
    })
    .filter((l) => l.label && l.href);
}

export function faqToLines(items: FaqItem[]) {
  return items.map((item) => `${item.q}\n${item.a}`).join("\n\n");
}

export function linesToFaq(text: string): FaqItem[] {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [q, ...rest] = block.split("\n");
      return { q: (q ?? "").trim(), a: rest.join(" ").trim() };
    })
    .filter((item) => item.q && item.a);
}
