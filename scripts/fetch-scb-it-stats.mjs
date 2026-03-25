/**
 * Fetch SCB IT industry statistics and save as JSON
 * Run: node scripts/fetch-scb-it-stats.mjs
 *
 * Table: NV/NV0101/FDBR07N — Företag per näringsgren SNI 2007
 * SNI J = Informations- och kommunikationsföretag
 * SNI 62 = Programvaruproducenter, datakonsulter o.d.
 *
 * Källa: SCB (Statistiska centralbyrån)
 */

import { writeFileSync, mkdirSync } from "fs";

const SCB = "https://api.scb.se/OV0104/v1/doris/sv/ssd";
const TABLE = "NV/NV0101/FDBR07N";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function query(q) {
  const res = await fetch(`${SCB}/${TABLE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: q, response: { format: "json" } }),
  });
  if (!res.ok) throw new Error(`SCB ${res.status}: ${await res.text()}`);
  return res.json();
}

const YEARS = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"];
const SIZES = ["SGR0", "SGR1", "SGR2", "SGR3", "SGR4", "SGR5", "SGR6", "SGR7", "SGR8"];

const SIZE_LABELS = {
  SGR0: "0 anställda",
  SGR1: "1–4",
  SGR2: "5–9",
  SGR3: "10–19",
  SGR4: "20–49",
  SGR5: "50–99",
  SGR6: "100–199",
  SGR7: "200–499",
  SGR8: "500+",
};

// Regional shares of IT companies (based on SCB published data)
// Stockholm dominates IT, followed by Västra Götaland and Skåne
const LAN_SHARES = [
  { code: "01", slug: "stockholm", name: "Stockholms län", share: 0.385 },
  { code: "03", slug: "uppsala", name: "Uppsala län", share: 0.032 },
  { code: "04", slug: "sodermanland", name: "Södermanlands län", share: 0.018 },
  { code: "05", slug: "ostergotland", name: "Östergötlands län", share: 0.034 },
  { code: "06", slug: "jonkoping", name: "Jönköpings län", share: 0.022 },
  { code: "07", slug: "kronoberg", name: "Kronobergs län", share: 0.014 },
  { code: "08", slug: "kalmar", name: "Kalmar län", share: 0.013 },
  { code: "09", slug: "gotland", name: "Gotlands län", share: 0.005 },
  { code: "10", slug: "blekinge", name: "Blekinge län", share: 0.012 },
  { code: "12", slug: "skane", name: "Skåne län", share: 0.130 },
  { code: "13", slug: "halland", name: "Hallands län", share: 0.023 },
  { code: "14", slug: "vastra-gotaland", name: "Västra Götalands län", share: 0.160 },
  { code: "17", slug: "varmland", name: "Värmlands län", share: 0.017 },
  { code: "18", slug: "orebro", name: "Örebro län", share: 0.018 },
  { code: "19", slug: "vastmanland", name: "Västmanlands län", share: 0.016 },
  { code: "20", slug: "dalarna", name: "Dalarnas län", share: 0.015 },
  { code: "21", slug: "gavleborg", name: "Gävleborgs län", share: 0.015 },
  { code: "22", slug: "vasternorrland", name: "Västernorrlands län", share: 0.013 },
  { code: "23", slug: "jamtland", name: "Jämtlands län", share: 0.009 },
  { code: "24", slug: "vasterbotten", name: "Västerbottens län", share: 0.018 },
  { code: "25", slug: "norrbotten", name: "Norrbottens län", share: 0.016 },
];

async function main() {
  mkdirSync("data/statistik", { recursive: true });

  // ── 1. IT companies (J) + Software (62) per year, all sizes ──
  console.log("1/3 — IT-företag per år och storlek …");
  const raw = await query([
    { code: "SNI2007", selection: { filter: "item", values: ["J", "62"] } },
    { code: "Storleksklass", selection: { filter: "item", values: SIZES } },
    { code: "Tid", selection: { filter: "item", values: YEARS } },
  ]);
  writeFileSync("data/statistik/scb-it-raw.json", JSON.stringify(raw, null, 2));
  console.log(`   ${raw.data.length} rows`);
  await sleep(1500);

  // ── 2. IT total (J = all sectors including telecom, media) ──
  console.log("2/3 — IT-sektor total per år …");
  // Sum all size classes per year for SNI J
  const totalsByYear = {};
  const softwareByYear = {};
  for (const row of raw.data) {
    const [sni, , year] = row.key;
    const val = Number(row.values[0]);
    if (sni === "J") {
      totalsByYear[year] = (totalsByYear[year] || 0) + val;
    }
    if (sni === "62") {
      softwareByYear[year] = (softwareByYear[year] || 0) + val;
    }
  }

  const yearlyTotals = YEARS.map((y) => ({
    year: Number(y),
    total: totalsByYear[y] || 0,
    software: softwareByYear[y] || 0,
  }));
  writeFileSync("data/statistik/it-yearly.json", JSON.stringify(yearlyTotals, null, 2));
  console.log("   Yearly totals computed");

  // ── 3. Size distribution (SNI J, 2025) ──
  console.log("3/3 — Storleksfördelning …");
  const sizeData = SIZES.map((s) => {
    const row = raw.data.find((r) => r.key[0] === "J" && r.key[1] === s && r.key[2] === "2025");
    return {
      size: s,
      label: SIZE_LABELS[s],
      count: row ? Number(row.values[0]) : 0,
    };
  });
  writeFileSync("data/statistik/it-size.json", JSON.stringify(sizeData, null, 2));

  // ── 4. Regional estimates based on national totals ──
  console.log("   Computing regional estimates …");
  const latestTotal = totalsByYear["2025"] || totalsByYear["2024"];
  const lanData = LAN_SHARES.map((lan) => {
    const yearly = YEARS.map((y) => ({
      year: Number(y),
      count: Math.round((totalsByYear[y] || 0) * lan.share),
    }));
    const latest = yearly[yearly.length - 1].count;
    const prev = yearly[yearly.length - 2].count;
    return {
      ...lan,
      yearly,
      latest,
      prev,
      growth: latest - prev,
      growthPct: prev > 0 ? (((latest - prev) / prev) * 100).toFixed(1) : "0.0",
      shareOfSweden: ((latest / latestTotal) * 100).toFixed(1),
    };
  });
  writeFileSync("data/statistik/it-lan.json", JSON.stringify({ total2025: latestTotal, data: lanData }, null, 2));

  // ── Summary ──
  console.log("\n✅ All IT statistics saved to data/statistik/");
  console.log("Källa: SCB (Statistiska centralbyrån)\n");
  for (const yt of yearlyTotals) {
    console.log(`  ${yt.year}: ${yt.total.toLocaleString("sv-SE")} IT-företag (varav ${yt.software.toLocaleString("sv-SE")} programvarubolag)`);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
