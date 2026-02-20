import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const appUrl = process.env.AUTH_URL || 'https://interna.work'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/sandbox/', '/api/', '/onboarding/', '/ide/', '/code-review/'],
        },
        sitemap: `${appUrl}/sitemap.xml`,
    }
}
