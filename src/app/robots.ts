import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const appUrl = process.env.SERVICE_URL_FRONTEND || process.env.AUTH_URL || 'http://localhost:3000'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/sandbox/', '/api/', '/onboarding/', '/ide/', '/code-review/'],
        },
        sitemap: `${appUrl}/sitemap.xml`,
    }
}
