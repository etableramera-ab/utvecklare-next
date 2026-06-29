// One-time cleanup: deactivate already-imported jobs whose title does NOT
// signal an AI/ML role. Uses the SAME relevance logic as lib/jobtech/sync-jobs.ts
// so the cleaned list matches what the daily sync will keep going forward.
//
// Usage:
//   DRY_RUN=1 node scripts/cleanup-irrelevant-jobs.mjs   # preview only, no changes
//   node scripts/cleanup-irrelevant-jobs.mjs             # apply (sets is_active=false)
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load env from .env.local
const env = {};
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}

const DRY_RUN = !!process.env.DRY_RUN;

// ── Same AI/ML relevance filter as lib/jobtech/sync-jobs.ts ──
const RELEVANCE_PATTERNS = [
  /machine[\s-]?learning/i, /maskininl[äa]rning/i,
  /deep[\s-]?learning/i, /djupinl[äa]rning/i,
  /\bML\b/i,
  /\bMLOps\b/i,
  /maskinintelligens/i,
  /data\s?scien(?:tist|ce)/i,
  /\bNLP\b/i, /natural\s+language/i, /spr[åa]kmodell/i, /language\s+model/i, /\bLLMs?\b/i,
  /computer\s+vision/i, /datorseende/i, /bildanalys/i,
  /\bAI[\s/-]?(?:engineer|ingenj[öo]r|utvecklare|developer|specialist|arkitekt|architect|researcher|scientist|forskare|expert|lead|team)\b/i,
  /\bAI\b/i,
  /artificial\s+intelligence/i, /artificiell\s+intelligens/i,
  /generativ?\s?e?\s*AI/i, /\bgen[\s-]?AI\b/i,
  /prompt\s+engineer/i,
  /neural\s+network/i, /neuralt\s+n[äa]tverk/i,
];
const isRelevantJob = (headline) => RELEVANCE_PATTERNS.some((rx) => rx.test(headline || ''));

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Fetch all active jobs (paginate)
let all = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase
    .from('jobs')
    .select('id, title')
    .eq('is_active', true)
    .range(from, from + 999);
  if (error) throw error;
  all = all.concat(data);
  if (data.length < 1000) break;
}

const irrelevant = all.filter((j) => !isRelevantJob(j.title));
const kept = all.length - irrelevant.length;

console.log(`Aktiva jobb totalt:   ${all.length}`);
console.log(`Kvar (relevanta):     ${kept}`);
console.log(`Rensas (inaktiveras): ${irrelevant.length}`);

if (DRY_RUN) {
  console.log('\n[DRY_RUN] Inga ändringar gjorda.');
  process.exit(0);
}

// Deactivate in batches of 200
let done = 0;
for (let i = 0; i < irrelevant.length; i += 200) {
  const ids = irrelevant.slice(i, i + 200).map((j) => j.id);
  const { error } = await supabase.from('jobs').update({ is_active: false }).in('id', ids);
  if (error) throw error;
  done += ids.length;
  console.log(`  inaktiverade ${done}/${irrelevant.length}`);
}
console.log('\nKlart. Listan innehåller nu endast relevanta AI/ML-jobb.');
