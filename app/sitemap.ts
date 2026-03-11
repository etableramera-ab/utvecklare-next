import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase/client'

const BASE_URL = 'https://utvecklare.ai'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/om-oss`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/integritetspolicy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/villkor`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/cookies`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/kontakt`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/jobb`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/foretag`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/foretag/priser`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/kunskapshubb`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/verktyg`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/community`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE_URL}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/lonestatistik`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ]

  try {
    const [{ data: jobs }, { data: articles }, { data: tools }, { data: events }] = await Promise.all([
      supabase.from('jobs').select('slug, created_at').eq('is_active', true),
      supabase.from('articles').select('category, slug, updated_at').eq('is_published', true),
      supabase.from('tools').select('category, slug, updated_at'),
      supabase.from('events').select('slug, created_at').eq('is_published', true),
    ])

    const jobRoutes: MetadataRoute.Sitemap = (jobs ?? []).map(j => ({
      url: `${BASE_URL}/jobb/${j.slug}`,
      lastModified: j.created_at ? new Date(j.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

    const articleRoutes: MetadataRoute.Sitemap = (articles ?? []).map(a => ({
      url: `${BASE_URL}/kunskapshubb/${a.category}/${a.slug}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

    const toolRoutes: MetadataRoute.Sitemap = (tools ?? []).map(t => ({
      url: `${BASE_URL}/verktyg/${t.category}/${t.slug}`,
      lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

    const eventRoutes: MetadataRoute.Sitemap = (events ?? []).map(e => ({
      url: `${BASE_URL}/events/${e.slug}`,
      lastModified: e.created_at ? new Date(e.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

    return [...staticRoutes, ...jobRoutes, ...articleRoutes, ...toolRoutes, ...eventRoutes]
  } catch {
    return staticRoutes
  }
}
