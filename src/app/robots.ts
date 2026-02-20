import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://interna.dev'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/sandbox/', '/api/', '/onboarding/', '/ide/', '/code-review/'],
        },
        sitemap: `${appUrl}/sitemap.xml`,
    }
}
