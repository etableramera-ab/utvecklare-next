import { createClient } from '@supabase/supabase-js';

const JOBTECH_BASE = 'https://jobsearch.api.jobtechdev.se/search';

// All AI/ML search terms to cover the full spectrum
const SEARCH_TERMS = [
  'AI utvecklare',
  'machine learning',
  'ML engineer',
  'data scientist',
  'NLP',
  'deep learning',
  'PyTorch',
  'TensorFlow',
  'LLM',
  'maskininlärning',
  'computer vision',
  'MLOps',
  'prompt engineer',
  'AI researcher',
];

interface JobTechHit {
  id: string;
  headline: string;
  description: { text: string; text_formatted?: string };
  employer: { name: string; organization_number?: string };
  workplace_address?: {
    municipality?: string;
    city?: string;
    region?: string;
    country?: string;
  };
  working_hours_type?: { label: string };
  scope_of_work?: { min: number; max: number };
  occupation?: { label: string };
  must_have?: { skills: Array<{ concept_label: string }>; languages: Array<{ concept_label: string }> };
  nice_to_have?: { skills: Array<{ concept_label: string }> };
  publication_date?: string;
  application_deadline?: string;
  webpage_url?: string;
  logo_url?: string;
  salary_description?: string;
}

export interface SyncResult {
  inserted: number;
  updated: number;
  deactivated: number;
  totalActive: number;
  errors: string[];
}

function categorizeJob(headline: string, occupation: string, description: string): string {
  const text = `${headline} ${occupation} ${description}`.toLowerCase();
  if (text.includes('ml engineer') || text.includes('machine learning engineer') || text.includes('maskininlärningsingenjör')) return 'ML Engineer';
  if (text.includes('data scientist') || text.includes('data science')) return 'Data Scientist';
  if (text.includes('nlp') || text.includes('llm') || text.includes('språkmodell') || text.includes('natural language')) return 'NLP/LLM-utvecklare';
  if (text.includes('mlops') || text.includes('ml ops') || text.includes('platform engineer') || text.includes('plattformsingenjör')) return 'MLOps Engineer';
  if (text.includes('computer vision') || text.includes('datorseende') || text.includes('bildanalys') || text.includes('bildbehandling')) return 'Computer Vision Engineer';
  if (text.includes('ai researcher') || text.includes('ai-forskare') || text.includes('research scientist') || text.includes('doktorand')) return 'AI Researcher';
  if (text.includes('prompt engineer')) return 'Prompt Engineer';
  if (text.includes('product manager') || text.includes('produktchef') || text.includes('ai product')) return 'AI Product Manager';
  if (text.includes('data engineer') || text.includes('dataingenjör')) return 'Data Engineer';
  return 'AI-utvecklare';
}

// ── AI/ML relevance filter ──────────────────────────────────────────────
// JobTech's free-text search matches broadly (e.g. "ML engineer" also returns
// mechanical/electrical/production engineers). We keep a job only if its TITLE
// contains a clear AI/ML signal — if AI is the core of the role, it's in the
// title. Deliberately strict: better to drop a few edge cases than to dilute
// the list with noise.
const RELEVANCE_PATTERNS: RegExp[] = [
  /machine[\s-]?learning/i, /maskininl[äa]rning/i,
  /deep[\s-]?learning/i, /djupinl[äa]rning/i,
  /\bML\b/i,            // standalone "ML" token (ML Platform Engineer, statistik/ML, AI/ML)
  /\bMLOps\b/i,
  /maskinintelligens/i,
  /data\s?scien(?:tist|ce)/i,
  /\bNLP\b/i, /natural\s+language/i, /spr[åa]kmodell/i, /language\s+model/i, /\bLLMs?\b/i,
  /computer\s+vision/i, /datorseende/i, /bildanalys/i,
  /\bAI[\s/-]?(?:engineer|ingenj[öo]r|utvecklare|developer|specialist|arkitekt|architect|researcher|scientist|forskare|expert|lead|team)\b/i,
  /\bAI\b/i,            // standalone "AI" token (also matches "AI-utvecklare", "AI-arkitekt")
  /artificial\s+intelligence/i, /artificiell\s+intelligens/i,
  /generativ?\s?e?\s*AI/i, /\bgen[\s-]?AI\b/i,
  /prompt\s+engineer/i,
  /neural\s+network/i, /neuralt\s+n[äa]tverk/i,
];

export function isRelevantJob(headline: string): boolean {
  const title = headline || '';
  return RELEVANCE_PATTERNS.some(rx => rx.test(title));
}

function inferExperienceLevel(headline: string, description: string): string {
  const text = `${headline} ${description}`.toLowerCase();

  // Lead/Principal signals
  if (/\b(lead|principal|head of|chef|director|vp |vice president|cto|architec)/i.test(text)) {
    return 'Lead/Principal (10+ år)';
  }
  // Senior signals
  if (/\b(senior|sr\.|erfaren|10\+?\s*år|8\+?\s*år|7\+?\s*år|6\+?\s*år|5\+?\s*år)/i.test(text)) {
    return 'Senior (5–10 år)';
  }
  // Junior signals
  if (/\b(junior|jr\.|trainee|intern|praktik|nyexaminerad|entry.level|0.2\s*år|1.2\s*år)/i.test(text)) {
    return 'Junior (0–2 år)';
  }
  // Mid-level signals (explicit mentions or 2-5 years)
  if (/\b(mid.level|mellannivå|2.5\s*år|3.5\s*år|3\+?\s*år|4\+?\s*år|2\+?\s*år)/i.test(text)) {
    return 'Mid-level (2–5 år)';
  }

  return 'Ej angivet';
}

function mapWorkModel(hit: JobTechHit): 'remote' | 'hybrid' | 'onsite' {
  const desc = (hit.description?.text || '').toLowerCase();
  const headline = (hit.headline || '').toLowerCase();
  if (desc.includes('remote') || desc.includes('distansarbete') || desc.includes('100% remote') || headline.includes('remote')) return 'remote';
  if (desc.includes('hybrid') || desc.includes('delvis på distans')) return 'hybrid';
  return 'onsite';
}

function extractTechTags(hit: JobTechHit): string[] {
  const skills = [
    ...(hit.must_have?.skills || []).map(s => s.concept_label),
    ...(hit.nice_to_have?.skills || []).map(s => s.concept_label),
  ].filter(Boolean);

  // Also extract common tech keywords from description
  const techKeywords = ['Python', 'PyTorch', 'TensorFlow', 'Keras', 'scikit-learn',
    'LangChain', 'Hugging Face', 'Docker', 'Kubernetes', 'MLflow', 'Spark',
    'SQL', 'AWS', 'GCP', 'Azure', 'R', 'Scala', 'Java', 'C++',
    'LLM', 'GPT', 'BERT', 'NLP', 'RAG', 'OpenCV', 'YOLO'];
  const desc = hit.description?.text || '';
  techKeywords.forEach(kw => {
    if (desc.includes(kw) && !skills.includes(kw)) skills.push(kw);
  });

  return [...new Set(skills)].slice(0, 8);
}

function toSlug(headline: string, externalId: string): string {
  return headline
    .toLowerCase()
    .replace(/å/g, 'a').replace(/ä/g, 'a').replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
    .replace(/-$/, '') + '-' + externalId;
}

function mapHitToJob(hit: JobTechHit) {
  const city = hit.workplace_address?.municipality || hit.workplace_address?.city || 'Sverige';
  const occupation = hit.occupation?.label || '';
  const category = categorizeJob(hit.headline, occupation, hit.description?.text || '');
  const tech_tags = extractTechTags(hit);
  const work_model = mapWorkModel(hit);
  const slug = toSlug(hit.headline, hit.id);

  return {
    external_id: hit.id,
    source: 'jobtech',
    is_external: true,
    title: hit.headline,
    description: (hit.description?.text || '').slice(0, 1000),
    category,
    location: city,
    work_model,
    experience_level: inferExperienceLevel(hit.headline, hit.description?.text || ''),
    tech_tags,
    salary_min: null,
    salary_max: null,
    slug,
    apply_url: hit.webpage_url || null,
    external_url: hit.webpage_url || null,
    company_id: null as unknown as string, // nullable after migration
    company_name_override: hit.employer?.name || 'Okänd arbetsgivare',
    company_logo_url_override: hit.logo_url || null,
    is_active: true,
    is_featured: false,
    is_sponsored: false,
    expires_at: hit.application_deadline || null,
    created_at: hit.publication_date || new Date().toISOString(),
    last_synced_at: new Date().toISOString(),
  };
}

async function fetchJobtechPage(term: string, apiKey: string): Promise<JobTechHit[]> {
  const url = new URL(JOBTECH_BASE);
  url.searchParams.set('q', term);
  url.searchParams.set('limit', '100');
  url.searchParams.set('offset', '0');

  const headers: Record<string, string> = { accept: 'application/json' };
  if (apiKey && apiKey !== 'placeholder_key_here') headers['api-key'] = apiKey;

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    console.error(`JobTech fetch failed for "${term}": ${res.status}`);
    return [];
  }
  const data = await res.json();
  return data.hits || [];
}

export async function syncJobsFromJobTech(): Promise<SyncResult> {
  const result: SyncResult = { inserted: 0, updated: 0, deactivated: 0, totalActive: 0, errors: [] };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const apiKey = process.env.JOBTECH_API_KEY || '';

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Fetch all terms and deduplicate by ID
  const seen = new Map<string, JobTechHit>();
  for (const term of SEARCH_TERMS) {
    try {
      const hits = await fetchJobtechPage(term, apiKey);
      hits.forEach(h => seen.set(h.id, h));
      // Small delay to be polite to the API
      await new Promise(r => setTimeout(r, 200));
    } catch (err: any) {
      result.errors.push(`Error fetching "${term}": ${err.message}`);
    }
  }

  // Keep only jobs whose title clearly signals an AI/ML role
  const allHits = Array.from(seen.values()).filter(h => isRelevantJob(h.headline));
  const syncedIds = allHits.map(h => h.id);

  // Upsert all fetched jobs
  for (const hit of allHits) {
    try {
      const job = mapHitToJob(hit);
      const { data: existing } = await supabase
        .from('jobs')
        .select('id')
        .eq('external_id', hit.id)
        .maybeSingle();

      if (existing) {
        await supabase.from('jobs').update({
          title: job.title,
          description: job.description,
          category: job.category,
          location: job.location,
          work_model: job.work_model,
          experience_level: job.experience_level,
          tech_tags: job.tech_tags,
          apply_url: job.apply_url,
          external_url: job.external_url,
          company_name_override: job.company_name_override,
          company_logo_url_override: job.company_logo_url_override,
          is_active: true,
          expires_at: job.expires_at,
          last_synced_at: job.last_synced_at,
        }).eq('external_id', hit.id);
        result.updated++;
      } else {
        const { error } = await supabase.from('jobs').insert(job as any);
        if (error) {
          result.errors.push(`Insert error for ${hit.id}: ${error.message}`);
        } else {
          result.inserted++;
        }
      }
    } catch (err: any) {
      result.errors.push(`Error processing job ${hit.id}: ${err.message}`);
    }
  }

  // Deactivate jobs not seen in this sync that are older than 7 days
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: staleJobs } = await supabase
    .from('jobs')
    .select('id, external_id')
    .eq('source', 'jobtech')
    .eq('is_active', true)
    .lt('last_synced_at', cutoff);

  const staleToDeactivate = (staleJobs || []).filter(j => j.external_id && !syncedIds.includes(j.external_id));
  if (staleToDeactivate.length > 0) {
    await supabase
      .from('jobs')
      .update({ is_active: false })
      .in('id', staleToDeactivate.map(j => j.id));
    result.deactivated = staleToDeactivate.length;
  }

  // Count total active
  const { count } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);
  result.totalActive = count || 0;

  return result;
}
