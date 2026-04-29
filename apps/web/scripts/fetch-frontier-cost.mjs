#!/usr/bin/env node
/**
 * fetch-frontier-cost.mjs
 *
 * Pulls live model pricing from OpenRouter, picks the cheapest model in
 * our frontier-tier allowlist, appends today's reading to history, prunes
 * older than 400 days. Output: apps/web/public/data/frontier-cost.json.
 *
 * No auth required for the read-only models endpoint.
 * No external deps. Node 20+ global fetch only.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FRONTIER_MODEL_PREFIXES } from './frontier-models.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '../public/data/frontier-cost.json');
const ENDPOINT = 'https://openrouter.ai/api/v1/models';
const UA = 'tsholosetati-bot/1.0 (+https://tsholosetati.com)';
const MAX_HISTORY_DAYS = 400;

async function main() {
  const res = await fetch(ENDPOINT, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}`);
  const body = await res.json();
  const models = Array.isArray(body?.data) ? body.data : [];

  // Match against allowlist, compute cents per 1M tokens (blended).
  const candidates = [];
  for (const m of models) {
    const id = String(m?.id ?? '');
    if (!FRONTIER_MODEL_PREFIXES.some((pre) => id.startsWith(pre))) continue;
    const promptUSD = Number(m?.pricing?.prompt);
    const completionUSD = Number(m?.pricing?.completion);
    if (!Number.isFinite(promptUSD) || !Number.isFinite(completionUSD)) continue;
    if (promptUSD <= 0 || completionUSD <= 0) continue;
    // OpenRouter prices are USD per token. Convert to cents per 1M tokens.
    const blendedCentsPer1M = ((promptUSD + completionUSD) / 2) * 1_000_000 * 100;
    candidates.push({ id, name: m?.name ?? id, cents: round(blendedCentsPer1M, 2) });
  }

  if (candidates.length === 0) throw new Error('No frontier models matched allowlist');
  candidates.sort((a, b) => a.cents - b.cents);
  const cheapest = candidates[0];

  // Load existing history (gracefully handle missing file).
  let prior = { history: [] };
  try {
    const raw = await readFile(OUT_PATH, 'utf8');
    prior = JSON.parse(raw);
  } catch {
    /* first run, no history */
  }

  const today = new Date().toISOString().slice(0, 10);
  const history = Array.isArray(prior.history) ? prior.history : [];

  // Replace today's entry if it already exists, else append.
  const existingIdx = history.findIndex((h) => h.date === today);
  const todayEntry = { date: today, cents: cheapest.cents, model: cheapest.id };
  if (existingIdx >= 0) {
    history[existingIdx] = todayEntry;
  } else {
    history.push(todayEntry);
  }

  // Prune older than MAX_HISTORY_DAYS.
  const cutoffMs = Date.now() - MAX_HISTORY_DAYS * 86_400_000;
  const pruned = history.filter((h) => new Date(h.date).getTime() >= cutoffMs);
  pruned.sort((a, b) => a.date.localeCompare(b.date));

  // Compute YoY delta if a year-ago snapshot exists (±14 day window).
  let yoyPct = null;
  const targetYearAgoMs = Date.now() - 365 * 86_400_000;
  let bestMatch = null;
  let bestDelta = Infinity;
  for (const h of pruned) {
    const delta = Math.abs(new Date(h.date).getTime() - targetYearAgoMs);
    if (delta < bestDelta && delta <= 14 * 86_400_000) {
      bestDelta = delta;
      bestMatch = h;
    }
  }
  if (bestMatch && bestMatch.cents > 0) {
    yoyPct = round(((cheapest.cents - bestMatch.cents) / bestMatch.cents) * 100, 1);
  }

  const payload = {
    updated: new Date().toISOString(),
    source: 'openrouter',
    currentCentsPer1M: cheapest.cents,
    model: cheapest.id,
    modelName: cheapest.name,
    yoyPct, // null when no year-ago snapshot
    candidatesConsidered: candidates.length,
    history: pruned,
  };

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  console.log(
    `Frontier cost: ${cheapest.cents}¢/1M (${cheapest.id}) · YoY ${yoyPct === null ? 'n/a' : yoyPct + '%'} · ${pruned.length} snapshots`
  );
}

function round(n, dp) {
  const m = 10 ** dp;
  return Math.round(n * m) / m;
}

main().catch((err) => {
  console.error('fetch-frontier-cost failed:', err.message);
  process.exit(1);
});
