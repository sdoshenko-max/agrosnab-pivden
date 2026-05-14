import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT_FILE = path.join(ROOT, "public", "currency-rates.json");
const MAX_REQUESTS_PER_MONTH = 10;
const DEFAULT_RATES = { USD: 44.0, EUR: 51.7, date: "2026-05-05" };

function monthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return null;
  }
}

async function readApiKey() {
  if (process.env.MINFIN_API_KEY?.trim()) return process.env.MINFIN_API_KEY.trim();

  const candidates = [
    process.env.MINFIN_API_KEY_FILE,
    path.join(ROOT, "секреты", "minfin-api-key.txt"),
    path.join(ROOT, "secrets", "minfin-api-key.txt"),
  ].filter(Boolean);

  for (const file of candidates) {
    try {
      const key = (await readFile(file, "utf8")).trim();
      if (key) return key;
    } catch {}
  }

  throw new Error("MINFIN_API_KEY is missing. Add it to env or секреты/minfin-api-key.txt.");
}

function parseNumber(value) {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function toTimestamp(row) {
  const raw = row.pointDate || row.date || "";
  const normalized = String(raw).replace(" ", "T");
  const ts = Date.parse(normalized);
  return Number.isFinite(ts) ? ts : 0;
}

function latestByCurrency(rows, currency) {
  const target = currency.toLowerCase();
  return rows
    .filter((row) => String(row.currency || "").toLowerCase() === target)
    .filter((row) => parseNumber(row.ask) && parseNumber(row.bid))
    .sort((a, b) => toTimestamp(b) - toTimestamp(a))[0];
}

function buildFallback(existing, requestCount, errorMessage) {
  const rates = existing?.rates?.USD && existing?.rates?.EUR ? existing.rates : DEFAULT_RATES;
  return {
    ...(existing || {}),
    source: existing?.source || "fallback",
    provider: existing?.provider || "Fallback",
    fetchedAt: existing?.fetchedAt || null,
    date: existing?.date || rates.date,
    rates,
    limit: {
      month: monthKey(),
      requestsThisMonth: requestCount,
      maxRequestsPerMonth: MAX_REQUESTS_PER_MONTH,
    },
    lastError: errorMessage,
  };
}

async function main() {
  const now = new Date();
  const currentMonth = monthKey(now);
  const existing = await readJson(OUT_FILE);
  const previousLimit = existing?.limit?.month === currentMonth ? existing.limit : null;
  const requestsThisMonth = Number(previousLimit?.requestsThisMonth || 0);

  if (requestsThisMonth >= MAX_REQUESTS_PER_MONTH) {
    console.log(`Minfin quota reached: ${requestsThisMonth}/${MAX_REQUESTS_PER_MONTH} for ${currentMonth}. Keeping existing rates.`);
    return;
  }

  const nextRequestCount = requestsThisMonth + 1;
  const key = await readApiKey();
  const url = `https://api.minfin.com.ua/mb/${key}/`;

  let payload;
  try {
    const response = await fetch(url, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`Minfin API returned ${response.status}`);
    payload = await response.json();
  } catch (error) {
    const fallback = buildFallback(existing, nextRequestCount, error instanceof Error ? error.message : String(error));
    await mkdir(path.dirname(OUT_FILE), { recursive: true });
    await writeFile(OUT_FILE, JSON.stringify(fallback, null, 2) + "\n", "utf8");
    throw error;
  }

  const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [payload?.data ?? payload];
  const usd = latestByCurrency(rows, "usd");
  const eur = latestByCurrency(rows, "eur");

  if (!usd || !eur) {
    const fallback = buildFallback(existing, nextRequestCount, "Minfin API response does not include USD/EUR interbank quotes.");
    await mkdir(path.dirname(OUT_FILE), { recursive: true });
    await writeFile(OUT_FILE, JSON.stringify(fallback, null, 2) + "\n", "utf8");
    throw new Error("Minfin API response does not include USD/EUR interbank quotes.");
  }

  const rates = {
    USD: parseNumber(usd.ask),
    EUR: parseNumber(eur.ask),
  };

  const result = {
    source: "minfin-interbank",
    provider: "Minfin.com.ua",
    fetchedAt: now.toISOString(),
    date: String(usd.pointDate || usd.date || now.toISOString()).slice(0, 10),
    rates,
    currencies: {
      USD: {
        bid: parseNumber(usd.bid),
        ask: rates.USD,
        date: usd.date || null,
        pointDate: usd.pointDate || null,
      },
      EUR: {
        bid: parseNumber(eur.bid),
        ask: rates.EUR,
        date: eur.date || null,
        pointDate: eur.pointDate || null,
      },
    },
    limit: {
      month: currentMonth,
      requestsThisMonth: nextRequestCount,
      maxRequestsPerMonth: MAX_REQUESTS_PER_MONTH,
    },
  };

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(result, null, 2) + "\n", "utf8");
  console.log(`Updated Minfin interbank rates. Requests this month: ${nextRequestCount}/${MAX_REQUESTS_PER_MONTH}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
