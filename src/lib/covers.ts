export type CoverTheme = {
  id: string;
  label: string;
  from: string;
  to: string;
  accent: string;
  eyebrow: string;
};

// Generic theme presets — deliberately not tied to any official symbol,
// crest, or government insignia. "security-navy" evokes public-service /
// competitive-exam prep courses (a common niche in Brazil) without
// reproducing any state's actual coat of arms.
export const COVER_THEMES: CoverTheme[] = [
  { id: "tech-blue", label: "Tecnologia (azul)", from: "#1c6dd0", to: "#081f45", accent: "#34c777", eyebrow: "TECNOLOGIA" },
  { id: "tech-purple", label: "Tecnologia (roxo)", from: "#7c3aed", to: "#241141", accent: "#f472b6", eyebrow: "TECNOLOGIA" },
  { id: "security-navy", label: "Concursos / Segurança Pública", from: "#0f1720", to: "#1b2230", accent: "#ffd54a", eyebrow: "CONCURSO PÚBLICO" },
  { id: "career-teal", label: "Carreira (verde-água)", from: "#0e7c38", to: "#0b3269", accent: "#ffd54a", eyebrow: "CARREIRA" },
  { id: "data-orange", label: "Dados / Analytics (laranja)", from: "#ea580c", to: "#7c2d12", accent: "#fde047", eyebrow: "DADOS & IA" },
];

const DEFAULT_THEME = COVER_THEMES[0];

export function getCoverTheme(id?: string | null): CoverTheme {
  return COVER_THEMES.find((t) => t.id === id) ?? DEFAULT_THEME;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapLines(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

export function renderCoverSvg({
  title,
  subtitle,
  categoryName,
  themeId,
}: {
  title: string;
  subtitle?: string | null;
  categoryName?: string | null;
  themeId?: string | null;
}) {
  const theme = getCoverTheme(themeId);
  const titleLines = wrapLines(title, 16, 3);
  const startY = 210 - (titleLines.length - 1) * 22;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.from}"/>
      <stop offset="100%" stop-color="${theme.to}"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" fill="url(#g)"/>
  <circle cx="560" cy="60" r="120" fill="#ffffff" opacity="0.06"/>
  <circle cx="60" cy="360" r="160" fill="${theme.accent}" opacity="0.15"/>
  <text x="48" y="130" font-family="Arial, sans-serif" font-size="18" letter-spacing="2" fill="${theme.accent}" font-weight="700">${escapeXml(categoryName?.toUpperCase() || theme.eyebrow)}</text>
  ${titleLines
    .map(
      (line, i) =>
        `<text x="48" y="${startY + i * 44}" font-family="Georgia, serif" font-size="40" fill="#ffffff" font-weight="700">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
  <rect x="48" y="${startY + titleLines.length * 44 - 18}" width="150" height="6" rx="3" fill="${theme.accent}"/>
  ${
    subtitle
      ? `<text x="48" y="${startY + titleLines.length * 44 + 24}" font-family="Arial, sans-serif" font-size="17" fill="#e5e9f0">${escapeXml(
          wrapLines(subtitle, 48, 1)[0] ?? ""
        )}</text>`
      : ""
  }
</svg>`;
}
