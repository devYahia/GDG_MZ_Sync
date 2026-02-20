import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const appUrl = process.env.SERVICE_URL_FRONTEND || process.env.AUTH_URL || 'http://localhost:3000'

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
