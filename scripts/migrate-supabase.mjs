/**
 * migrate-supabase.mjs
 *
 * Migrates ALL data from the old Supabase (Lovable Cloud) to the new own
 * Supabase instance.
 *
 * Prerequisites:
 *   1. Run supabase/migrations/003_full_schema.sql in the NEW Supabase SQL
 *      editor FIRST to create all tables and functions.
 *   2. node scripts/migrate-supabase.mjs
 *
 * The script is idempotent – it uses upsert so it is safe to run multiple times.
 */

import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const OLD_URL = 'https://udapbxbsclbepcdgppuu.supabase.co'
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkYXBieGJzY2xiZXBjZGdwcHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MTc2MDgsImV4cCI6MjA4NTk5MzYwOH0.a8FzIXL5xFbVPZ-tRZvcrFvMfq2J8BP7gZBwQIhqdrY'

const NEW_URL = 'https://uzivlllaltblwqyykfup.supabase.co'
const NEW_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6aXZsbGxhbHRibHdxeXlrZnVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM0ODUyMCwiZXhwIjoyMDg4OTI0NTIwfQ.E9ZDUj81fxEzMJ_yqnGNr6qc3Dj7LUeC2NBji7wbL4E'

const old = createClient(OLD_URL, OLD_KEY)
const neo = createClient(NEW_URL, NEW_SERVICE_KEY)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fetch all rows from a table with pagination (1 000 rows per page).
 * Returns [] if the table doesn't exist on the source.
 */
async function fetchAll(client, table) {
  const rows = []
  let offset = 0
  const PAGE = 1000
  while (true) {
    const { data, error } = await client
      .from(table)
      .select('*')
      .range(offset, offset + PAGE - 1)

    if (error) {
      // Table may not exist on old DB for newer tables
      console.warn(`  ⚠  fetchAll ${table}: ${error.message}`)
      break
    }
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < PAGE) break
    offset += PAGE
  }
  return rows
}

/**
 * Upsert rows into the target table in chunks of 100.
 * @param {string} table  table name
 * @param {string} conflictCol  column to use for ON CONFLICT (default 'id')
 * @param {boolean} skipOnError  if true, log errors but keep going
 */
async function migrateTable(table, conflictCol = 'id', skipOnError = true) {
  process.stdout.write(`\nMigrating ${table}...`)
  const rows = await fetchAll(old, table)
  if (rows.length === 0) {
    console.log(` 0 rows (empty or table missing in old DB)`)
    return
  }
  console.log(` fetched ${rows.length} rows`)

  const CHUNK = 100
  let inserted = 0
  let errors = 0

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const { error } = await neo
      .from(table)
      .upsert(chunk, { onConflict: conflictCol, ignoreDuplicates: false })

    if (error) {
      errors++
      if (skipOnError) {
        console.error(`  SKIP chunk ${i}-${i + chunk.length} in ${table}: ${error.message}`)
        continue
      } else {
        console.error(`  FATAL in ${table}: ${error.message}`)
        return
      }
    }
    inserted += chunk.length
  }

  const status = errors > 0 ? `⚠  ${inserted}/${rows.length} (${errors} chunk errors)` : `✓  ${inserted}/${rows.length}`
  console.log(`  ${status}`)
}

/**
 * user_reputation uses user_id as PK (not id)
 */
async function migrateUserReputation() {
  await migrateTable('user_reputation', 'user_id')
}

// ---------------------------------------------------------------------------
// Main migration – tables in FK-dependency order
// ---------------------------------------------------------------------------

async function main() {
  console.log('='.repeat(60))
  console.log('Supabase migration: old → new')
  console.log(`  Old: ${OLD_URL}`)
  console.log(`  New: ${NEW_URL}`)
  console.log('='.repeat(60))
  console.log()
  console.log('NOTE: Make sure you have run 003_full_schema.sql in the new')
  console.log('      Supabase SQL editor before proceeding.')
  console.log()

  // Tier 0 – no FK deps
  await migrateTable('profiles')
  await migrateTable('user_roles')
  await migrateTable('companies')
  await migrateTable('affiliate_links')

  // Tier 1 – depends on tier 0
  await migrateTable('tools')          // FK: affiliate_links
  await migrateTable('jobs')           // FK: companies
  await migrateTable('articles')
  await migrateTable('events')         // FK: companies
  await migrateTable('salary_data')
  await migrateTable('salary_submissions')
  await migrateTable('ads')
  await migrateTable('newsletter_subscribers')
  await migrateTable('contact_messages')
  await migrateTable('subscriptions')  // FK: companies
  await migrateTable('revenue_log')
  await migrateTable('job_alerts')
  await migrateTable('pricing_plans')
  await migrateTable('company_inquiries')

  // Tier 2 – depends on tier 1
  await migrateTable('applications')        // FK: jobs
  await migrateTable('article_likes')       // FK: articles
  await migrateTable('comments')            // FK: articles (self-ref)
  await migrateTable('bookmarks')           // FK: articles
  await migrateTable('saved_jobs')          // FK: jobs
  await migrateTable('reading_history')     // FK: articles
  await migrateTable('tool_reviews')        // FK: tools
  await migrateTable('tool_comparisons')
  await migrateTable('company_follows')     // FK: companies
  await migrateTable('forum_posts')         // (no FK except self in solved_comment_id)
  await migrateTable('showcase_projects')

  // Tier 3 – depends on tier 2
  await migrateTable('review_helpful')      // FK: tool_reviews
  await migrateTable('forum_comments')      // FK: forum_posts (self-ref)
  await migrateTable('showcase_votes')      // FK: showcase_projects
  await migrateTable('showcase_comments')   // FK: showcase_projects
  await migrateUserReputation()             // PK = user_id

  // Tier 4 – depends on tier 3
  await migrateTable('forum_votes')         // FK: forum_posts, forum_comments

  // Events sub-tables
  await migrateTable('event_registrations') // FK: events
  await migrateTable('event_speakers')      // FK: events
  await migrateTable('event_sponsors')      // FK: events
  await migrateTable('event_agenda')        // FK: events, event_speakers

  // Ads sub-tables
  await migrateTable('ad_impressions')      // FK: ads
  await migrateTable('ad_clicks')           // FK: ads

  // Affiliate
  await migrateTable('affiliate_clicks')    // FK: affiliate_links, tools

  console.log()
  console.log('='.repeat(60))
  console.log('Migration complete.')
  console.log('='.repeat(60))
}

main().catch((err) => {
  console.error('Unhandled error:', err)
  process.exit(1)
})
