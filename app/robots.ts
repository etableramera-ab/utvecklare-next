import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/profil/', '/dashboard/', '/checkout/'],
      },
    ],
    sitemap: 'https://utvecklare.ai/sitemap.xml',
  }
}
