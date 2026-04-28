#!/usr/bin/env node
/**
 * import-linkedin.mjs
 *
 * Reads each LinkedIn article HTML export from
 *   apps/web/scripts/linkedin-import/articles/
 * and writes a corresponding MDX file into
 *   apps/web/src/content/insights/
 *
 * Zero external dependencies. The LinkedIn export HTML is a stable, narrow
 * subset of tags so we can parse it with disciplined string transforms rather
 * than pulling in a full DOM library.
 *
 * Re-runnable:
 *   - Computes a contentHash from the source body.
 *   - If a destination MDX file already exists with the same contentHash,
 *     it is left untouched.
 *   - Otherwise the file is regenerated. Hand edits to titles/topics/etc are
 *     preserved by reading the existing frontmatter and merging.
 *
 * Usage:  node apps/web/scripts/import-linkedin.mjs
 *         node apps/web/scripts/import-linkedin.mjs --force
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC_DIR = join(__dirname, 'linkedin-import', 'articles');
const OUT_DIR = join(ROOT, 'src', 'content', 'insights');
const FORCE = process.argv.includes('--force');

// ──────────────────────────────────────────────────────────────────────────
// Slug + topic inference
// ──────────────────────────────────────────────────────────────────────────

/** Strip leading export-date prefix, trailing -setati(-xxxxx)? hash, and .html. */
function deriveSlug(filename) {
  let s = filename.replace(/\.html$/i, '');
  // Drop LinkedIn timestamp prefix like "2026-03-20 15_05_20.0-"
  s = s.replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}_\d{2}_\d{2}\.\d-?/, '');
  // Drop trailing author + hash signature (-tsholo-setati, -setati-xxxxx, -tsholofelo-setati-xxxxx, etc.)
  s = s.replace(/-(?:tsholo(?:felo)?-)?setati(?:-[a-z0-9]{4,6})?$/i, '');
  // Lowercase, collapse whitespace, strip parentheticals/punctuation noise.
  s = s
    .toLowerCase()
    .replace(/copy[-_ ]of[-_ ]/g, '')
    .replace(/['’"`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  return s;
}

const TOPIC_RULES = [
  [/\bai\b|agentic|generative|llm|hallucinat/i, 'AI Strategy'],
  [/policy|governance|regulation|nist|eu-ai-act/i, 'AI Policy'],
  [/innovation|frontier|technolog/i, 'Innovation Economics'],
  [/economics|trade|deindustrial|brics|cash[- ]flow|balance[- ]sheet/i, 'Economics'],
  [/south[- ]africa|brics|africa|jse|sa\b/i, 'South Africa'],
  [/morocco|egypt|emea|brussels|africa/i, 'MEA'],
  [/cancer|health|heart|disability|zahavian/i, 'Personal'],
  [/youth|paris|johannesburg|reflect/i, 'Reflection'],
  [/cfo|dashboard|finance|irr|npv/i, 'CFO Toolkit'],
  [/operational|analysis|naming|conventions|method/i, 'Method'],
];

function inferTopics(slug, title) {
  const corpus = `${slug} ${title}`;
  const out = new Set();
  for (const [re, label] of TOPIC_RULES) if (re.test(corpus)) out.add(label);
  if (out.size === 0) out.add('Essay');
  return [...out];
}

// ──────────────────────────────────────────────────────────────────────────
// HTML extraction
// ──────────────────────────────────────────────────────────────────────────

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rdquo;/g, '\u201d')
    .replace(/&ldquo;/g, '\u201c')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&mdash;/g, ', ') // strip em dashes per house style
    .replace(/&ndash;/g, '-')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function stripTags(s) {
  return decodeEntities(s.replace(/<[^>]+>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

function extract(html) {
  const titleMatch = html.match(/<h1>\s*<a[^>]*>([\s\S]*?)<\/a>\s*<\/h1>/i)
    || html.match(/<h1>([\s\S]*?)<\/h1>/i)
    || html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]) : 'Untitled';

  const urlMatch = html.match(/<h1>\s*<a\s+href="([^"]+)"/i);
  const canonicalUrl = urlMatch ? urlMatch[1] : null;

  const publishedMatch = html.match(/<p[^>]*class="published"[^>]*>\s*Published on\s*([0-9-]+)\s*([0-9:]+)?\s*<\/p>/i);
  const createdMatch = html.match(/<p[^>]*class="created"[^>]*>\s*Created on\s*([0-9-]+)\s*([0-9:]+)?\s*<\/p>/i);
  const dateStr = (publishedMatch && publishedMatch[1])
    || (createdMatch && createdMatch[1])
    || null;
  const publishDate = dateStr ?? '2024-01-01'; // last-resort sentinel

  // Body lives in the final <div>...</div> after the .published paragraph.
  // Grab everything inside <body>, drop the leading <img>, <h1>, .created, .published.
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let bodyRaw = bodyMatch ? bodyMatch[1] : '';
  // Remove the lead image, h1, created/published lines.
  bodyRaw = bodyRaw
    .replace(/<img[^>]*\/?>/i, '') // first hero img only — rest are inline figures
    .replace(/<h1>[\s\S]*?<\/h1>/i, '')
    .replace(/<p[^>]*class="created"[^>]*>[\s\S]*?<\/p>/i, '')
    .replace(/<p[^>]*class="published"[^>]*>[\s\S]*?<\/p>/i, '')
    .trim();
  // Unwrap the outer body <div> if present.
  const unwrap = bodyRaw.match(/^<div[^>]*>([\s\S]*)<\/div>\s*$/i);
  if (unwrap) bodyRaw = unwrap[1];

  return { title, canonicalUrl, publishDate, bodyHtml: bodyRaw };
}

// ──────────────────────────────────────────────────────────────────────────
// HTML → MDX conversion
// ──────────────────────────────────────────────────────────────────────────

function htmlToMdx(html) {
  let s = html;

  // Normalise self-closing breaks and strip script/style if any leaked in.
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '')
       .replace(/<style[\s\S]*?<\/style>/gi, '')
       .replace(/<br\s*\/?>/gi, '\n');

  // Figures / images → markdown image; keep external LinkedIn CDN URLs as-is.
  s = s.replace(
    /<figure[^>]*>\s*(?:<img[^>]*src="([^"]+)"[^>]*\/?>)?\s*(?:<figcaption[^>]*>([\s\S]*?)<\/figcaption>)?\s*<\/figure>/gi,
    (_, src, cap) => {
      if (!src) return '';
      const alt = cap ? stripTags(cap) : '';
      return `\n\n![${alt}](${src})\n\n`;
    },
  );
  s = s.replace(
    /<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
    (_, src, alt) => `\n\n![${alt}](${src})\n\n`,
  );
  s = s.replace(
    /<img[^>]*src="([^"]+)"[^>]*\/?>/gi,
    (_, src) => `\n\n![](${src})\n\n`,
  );

  // Block-level: headings.
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n\n## ${stripTags(t)}\n\n`);
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n\n### ${stripTags(t)}\n\n`);
  s = s.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `\n\n#### ${stripTags(t)}\n\n`);

  // Blockquote.
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) => {
    const text = inlineConvert(inner).trim();
    return `\n\n> ${text.split(/\n+/).join('\n> ')}\n\n`;
  });

  // Lists. Process innermost first to handle simple nesting.
  function convertList(tag, marker) {
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    s = s.replace(re, (_, inner) => {
      const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m, i) => {
        const text = inlineConvert(m[1]).trim().replace(/\n+/g, ' ');
        const m2 = typeof marker === 'function' ? marker(i) : marker;
        return `${m2} ${text}`;
      });
      return `\n\n${items.join('\n')}\n\n`;
    });
  }
  convertList('ul', '-');
  convertList('ol', (i) => `${i + 1}.`);

  // Paragraphs.
  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, inner) => `\n\n${inlineConvert(inner).trim()}\n\n`);

  // Strip any leftover unknown block tags but keep their content.
  s = s.replace(/<\/?(?:div|section|article|figure|figcaption|span)[^>]*>/gi, '');

  // Final inline pass for orphan inline tags.
  s = inlineConvert(s);

  // Whitespace normalisation.
  s = decodeEntities(s)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\u2014]/g, ', ') // em dash → comma per house style
    .trim();

  return s + '\n';
}

function inlineConvert(s) {
  return s
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_, t) => `**${t}**`)
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, (_, t) => `**${t}**`)
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, (_, t) => `*${t}*`)
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, (_, t) => `*${t}*`)
    .replace(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, txt) => {
      const text = stripTags(txt) || href;
      return `[${text}](${href})`;
    })
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, t) => `\`${stripTags(t)}\``);
}

// ──────────────────────────────────────────────────────────────────────────
// Frontmatter helpers
// ──────────────────────────────────────────────────────────────────────────

function escapeYaml(s) {
  // Single-quote YAML; escape inner single quotes by doubling them.
  return `'${String(s).replace(/'/g, "''")}'`;
}

function buildDescription(mdxBody) {
  const firstPara = mdxBody.split(/\n\n+/).find((p) => /[a-z]/i.test(p) && !p.startsWith('#') && !p.startsWith('!'));
  if (!firstPara) return '';
  const text = firstPara.replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
  return text.length > 200 ? text.slice(0, 197).replace(/[,;:.\s]+$/, '') + '\u2026' : text;
}

function buildSummary(mdxBody) {
  const paras = mdxBody.split(/\n\n+/).filter((p) => /[a-z]/i.test(p) && !p.startsWith('#') && !p.startsWith('!') && !p.startsWith('-') && !/^\d+\./.test(p));
  if (paras.length === 0) return '';
  const text = paras[0].replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
  return text.length > 320 ? text.slice(0, 317).replace(/[,;:.\s]+$/, '') + '\u2026' : text;
}

function readExistingFrontmatter(path) {
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = {};
  const lines = m[1].split('\n');
  for (const line of lines) {
    const kv = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2];
  }
  return fm;
}

function buildMdx({ title, description, publishDate, topics, summary, contentHash, canonicalUrl, body }) {
  const lines = ['---'];
  lines.push(`title: ${escapeYaml(title)}`);
  lines.push(`description: ${escapeYaml(description)}`);
  lines.push(`publishDate: ${publishDate}`);
  lines.push(`topics: [${topics.map(escapeYaml).join(', ')}]`);
  if (summary) lines.push(`summary: ${escapeYaml(summary)}`);
  if (canonicalUrl) lines.push(`canonicalUrl: ${escapeYaml(canonicalUrl)}`);
  lines.push(`contentHash: ${escapeYaml(contentHash)}`);
  lines.push('draft: false');
  lines.push('---');
  lines.push('');
  lines.push(body);
  return lines.join('\n');
}

// ──────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────

function main() {
  if (!existsSync(SRC_DIR)) {
    console.error(`No input directory at ${SRC_DIR}`);
    process.exit(1);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const files = readdirSync(SRC_DIR).filter((f) => f.toLowerCase().endsWith('.html'));
  if (files.length === 0) {
    console.log('No HTML articles to import.');
    return;
  }

  const seen = new Set();
  const results = { written: 0, skipped: 0, collisions: 0 };

  for (const file of files) {
    const path = join(SRC_DIR, file);
    const html = readFileSync(path, 'utf8');
    const { title, canonicalUrl, publishDate, bodyHtml } = extract(html);

    let slug = deriveSlug(file);
    if (seen.has(slug)) {
      results.collisions += 1;
      slug = `${slug}-${publishDate.replace(/-/g, '')}`;
    }
    seen.add(slug);

    const mdxBody = htmlToMdx(bodyHtml);
    const contentHash = createHash('sha1').update(bodyHtml).digest('hex').slice(0, 12);

    const outPath = join(OUT_DIR, `${slug}.mdx`);
    const existing = readExistingFrontmatter(outPath);
    if (!FORCE && existing && existing.contentHash === `'${contentHash}'`) {
      results.skipped += 1;
      continue;
    }

    const description = buildDescription(mdxBody);
    const summary = buildSummary(mdxBody);
    const topics = inferTopics(slug, title);

    const out = buildMdx({
      title,
      description,
      publishDate,
      topics,
      summary,
      contentHash,
      canonicalUrl,
      body: mdxBody,
    });

    writeFileSync(outPath, out, 'utf8');
    results.written += 1;
    console.log(`  wrote ${slug}.mdx  (${publishDate}, ${topics.join(', ')})`);
  }

  console.log(`\nDone. Written: ${results.written}, skipped (unchanged): ${results.skipped}, slug collisions: ${results.collisions}`);
}

main();
