// Accepts any common YouTube URL shape (watch?v=, youtu.be/, embed/, shorts/)
// and returns just the 11-character video id, or null if it doesn't match.
export function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtube\.com\/embed\/|youtu\.be\/)([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

export function youtubeEmbedUrl(idOrUrl: string) {
  const id = extractYouTubeId(idOrUrl) ?? idOrUrl;
  return `https://www.youtube.com/embed/${id}`;
}

export function youtubeThumbnailUrl(idOrUrl: string) {
  const id = extractYouTubeId(idOrUrl) ?? idOrUrl;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
