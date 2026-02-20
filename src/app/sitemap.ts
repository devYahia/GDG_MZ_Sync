import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://interna.work'

    return [
        {
            url: appUrl,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${appUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${appUrl}/signup`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${appUrl}/interview/setup`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
    ]
}
