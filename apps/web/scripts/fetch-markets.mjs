#!/usr/bin/env node
/**
 * fetch-markets.mjs, populate apps/web/public/data/markets.json.
 *
 * Strategy: Yahoo Finance is the primary source (proper prev-close based
 * change %). Stooq is a per-symbol fallback (lite OHLC endpoint, no API
 * key needed, but only intraday open→close change is available).
 *
 * Stooq's historical /q/d/l endpoint started requiring an apikey in 2025
 * so we deliberately use only the keyless /q/l lite quote endpoint.
 *
 * Output schema is unchanged so MarketTicker.astro keeps working:
 *   { updated: ISO8601, quotes: [{ symbol, label, price, changePct }, ...] }
 *
 * No external deps, Node 20+ global fetch only.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '../public/data/markets.json');

const UA = 'Mozilla/5.0 (compatible; tsholosetati-bot/1.0; +https://tsholosetati.com)';

/**
 * Symbol catalogue.
 *  - `stooq` : Stooq symbol (lowercase + suffix). Set to null to skip Stooq.
 *  - `yahoo` : Yahoo symbol used as fallback. Set to null to skip Yahoo.
 *  - `label` : short human label rendered in the ticker.
 *  - `group` : informational only (not rendered).
 */
const SYMBOLS = [
  // Indices
  { key: 'SPX',    label: 'S&P 500',    stooq: '^spx',    yahoo: '%5EGSPC',   group: 'index' },
  { key: 'NDQ',    label: 'NASDAQ',     stooq: '^ndq',    yahoo: '%5EIXIC',   group: 'index' },
  { key: 'J203',   label: 'JSE Top 40', stooq: null,      yahoo: '%5EJ203.JO', group: 'index' },

  // FX & commodities
  { key: 'USDZAR', label: 'USD/ZAR',    stooq: 'usdzar',  yahoo: 'USDZAR%3DX', group: 'fx' },
  { key: 'CL',     label: 'WTI Crude',  stooq: 'cl.f',    yahoo: 'CL%3DF',    group: 'commodity' },
  { key: 'HG',     label: 'Copper',     stooq: 'hg.f',    yahoo: 'HG%3DF',    group: 'commodity' },

  // Tech ETFs
  { key: 'QQQ',    label: 'QQQ',        stooq: 'qqq.us',  yahoo: 'QQQ',       group: 'etf' },
  { key: 'SMH',    label: 'SMH',        stooq: 'smh.us',  yahoo: 'SMH',       group: 'etf' },
  { key: 'SOXX',   label: 'SOXX',       stooq: 'soxx.us', yahoo: 'SOXX',      group: 'etf' },

  // Chip makers
  { key: 'NVDA',   label: 'NVDA',       stooq: 'nvda.us', yahoo: 'NVDA',      group: 'chip' },
  { key: 'AMD',    label: 'AMD',        stooq: 'amd.us',  yahoo: 'AMD',       group: 'chip' },
  { key: 'TSM',    label: 'TSM',        stooq: 'tsm.us',  yahoo: 'TSM',       group: 'chip' },
  { key: 'ASML',   label: 'ASML',       stooq: 'asml.us', yahoo: 'ASML',      group: 'chip' },

  // Frontier tech
  { key: 'PLTR',   label: 'PLTR',       stooq: 'pltr.us', yahoo: 'PLTR',      group: 'frontier' },
  { key: 'SNOW',   label: 'SNOW',       stooq: 'snow.us', yahoo: 'SNOW',      group: 'frontier' },
  { key: 'CRWD',   label: 'CRWD',       stooq: 'crwd.us', yahoo: 'CRWD',      group: 'frontier' },

  // JSE majors (Stooq coverage is patchy → Yahoo fallback does the work)
  { key: 'NPN',    label: 'Naspers',    stooq: null,      yahoo: 'NPN.JO',    group: 'jse' },
  { key: 'BHP',    label: 'BHP',        stooq: null,      yahoo: 'BHG.JO',    group: 'jse' },
  { key: 'SHP',    label: 'Shoprite',   stooq: null,      yahoo: 'SHP.JO',    group: 'jse' },
  { key: 'MTN',    label: 'MTN',        stooq: null,      yahoo: 'MTN.JO',    group: 'jse' },
  { key: 'CPI',    label: 'Capitec',    stooq: null,      yahoo: 'CPI.JO',    group: 'jse' },
];

/** Fetch with sensible timeout + UA. Returns body text on 2xx, else throws. */
async function get(url, { timeoutMs = 15_000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/csv,application/json,*/*' },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

/** Parse Stooq lite CSV → { price, prevClose }. Lite returns single row
 *  Symbol,Date,Time,Open,High,Low,Close,Volume, so prevClose is treated
 *  as the day's open (gives intraday change %). */
function parseStooqLite(csv) {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return null;
  const cols = lines[0].toLowerCase().split(',');
  const openIdx = cols.indexOf('open');
  const closeIdx = cols.indexOf('close');
  if (openIdx < 0 || closeIdx < 0) return null;
  const row = lines[1].split(',');
  const open = parseFloat(row[openIdx]);
  const close = parseFloat(row[closeIdx]);
  if (!Number.isFinite(open) || !Number.isFinite(close) || open === 0) return null;
  // Skip the "N/D" placeholder Stooq emits when a symbol exists but has no quote yet.
  if (row[closeIdx] === 'N/D' || row[openIdx] === 'N/D') return null;
  return { price: close, prevClose: open };
}

async function fetchStooq(symbol) {
  // Lite quote, keyless. Returns header + one CSV row per symbol.
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(symbol)}&f=sd2t2ohlcv&h&e=csv`;
  const csv = await get(url);
  return parseStooqLite(csv);
}

async function fetchYahoo(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;
  const text = await get(url);
  let json;
  try { json = JSON.parse(text); } catch { return null; }
  const meta = json?.chart?.result?.[0]?.meta;
  const price = Number(meta?.regularMarketPrice);
  const prevClose = Number(meta?.chartPreviousClose);
  if (!Number.isFinite(price) || !Number.isFinite(prevClose) || prevClose === 0) return null;
  return { price, prevClose };
}

async function quote(entry) {
  const sources = [];
  if (entry.yahoo) sources.push(['yahoo', () => fetchYahoo(entry.yahoo)]);
  if (entry.stooq) sources.push(['stooq', () => fetchStooq(entry.stooq)]);
  for (const [name, fn] of sources) {
    try {
      const r = await fn();
      if (r) {
        const changePct = ((r.price - r.prevClose) / r.prevClose) * 100;
        return {
          symbol: entry.key,
          label: entry.label,
          price: round(r.price, 4),
          changePct: round(changePct, 2),
          source: name,
        };
      }
    } catch (err) {
      console.warn(`  ${entry.key} via ${name}: ${err.message}`);
    }
  }
  console.warn(`  ${entry.key}: no source returned data`);
  return null;
}

function round(n, dp) {
  const m = 10 ** dp;
  return Math.round(n * m) / m;
}

/** Process symbols sequentially with a small delay to be a polite Stooq citizen. */
async function main() {
  const quotes = [];
  for (const entry of SYMBOLS) {
    const q = await quote(entry);
    if (q) quotes.push(q);
    await new Promise((r) => setTimeout(r, 250));
  }

  const payload = {
    updated: new Date().toISOString(),
    source: 'yahoo+stooq',
    quotes,
  };

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  console.log(`Wrote ${quotes.length}/${SYMBOLS.length} quotes → ${OUT_PATH}`);
  if (quotes.length === 0) {
    process.exitCode = 1; // signal CI failure if everything fell through
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
