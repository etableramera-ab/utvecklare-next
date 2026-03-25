/**
 * IT industry statistics — parsed from SCB data
 * Källa: SCB (Statistiska centralbyrån)
 */

import yearlyRaw from "../data/statistik/it-yearly.json";
import sizeRaw from "../data/statistik/it-size.json";
import lanRaw from "../data/statistik/it-lan.json";

// ── Yearly totals ──
export interface YearlyIT {
  year: number;
  total: number;
  software: number;
}
export const YEARLY_IT: YearlyIT[] = yearlyRaw as YearlyIT[];

// ── Size distribution ──
export interface SizeRow {
  size: string;
  label: string;
  count: number;
}
export const SIZE_DISTRIBUTION: SizeRow[] = sizeRaw as SizeRow[];

// ── Regional data ──
export interface LanInfo {
  code: string;
  slug: string;
  name: string;
  share: number;
  yearly: { year: number; count: number }[];
  latest: number;
  prev: number;
  growth: number;
  growthPct: string;
  shareOfSweden: string;
}

const lanParsed = lanRaw as { total2025: number; data: LanInfo[] };
export const NATIONAL_TOTAL_2025 = lanParsed.total2025;
export const LAN_LIST: LanInfo[] = lanParsed.data;
export const LAN_MAP: Record<string, LanInfo> = Object.fromEntries(
  LAN_LIST.map((l) => [l.slug, l]),
);
export const LAN_SLUGS = LAN_LIST.map((l) => l.slug);

// ── Key stats ──
const latest = YEARLY_IT[YEARLY_IT.length - 1];
const prev = YEARLY_IT[YEARLY_IT.length - 2];
export const KEY_STATS = {
  totalIT: latest.total,
  totalSoftware: latest.software,
  latestYear: latest.year,
  yoyGrowth: latest.total - prev.total,
  yoyPct: (((latest.total - prev.total) / prev.total) * 100).toFixed(1),
  softwareShare: ((latest.software / latest.total) * 100).toFixed(0),
  topLan: LAN_LIST[0].name, // Stockholm
  topLanCount: LAN_LIST[0].latest,
};
