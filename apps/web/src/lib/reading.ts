/**
 * Reading-time estimation for MDX/Markdown bodies.
 *
 * Strips frontmatter, code blocks, images, links and HTML/JSX tags so the
 * count reflects words a reader actually reads. Uses 220 wpm — a middle
 * ground for non-fiction prose with some technical vocabulary.
 */

const WORDS_PER_MINUTE = 220;

const STRIP_PATTERNS: ReadonlyArray<RegExp> = [
  /^---[\s\S]*?---/m,           // YAML frontmatter (defensive — Astro usually strips it)
  /```[\s\S]*?```/g,            // fenced code blocks
  /`[^`]*`/g,                   // inline code
  /!\[[^\]]*\]\([^)]*\)/g,      // images
  /\[([^\]]+)\]\([^)]+\)/g,     // markdown links → keep label
  /<\/?[a-zA-Z][^>]*>/g,        // HTML/JSX tags
  /[#>*_~`-]+/g,                // markdown punctuation
];

export function computeReadingMinutes(body: string, wpm: number = WORDS_PER_MINUTE): number {
  if (!body) return 1;
  let text = body;
  // Markdown links: replace with their label so the words still count.
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  for (const re of STRIP_PATTERNS) {
    text = text.replace(re, ' ');
  }
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wpm));
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
