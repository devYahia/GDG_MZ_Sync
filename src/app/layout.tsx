import type { Metadata } from "next"
import { Inter, JetBrains_Mono, MuseoModerno } from "next/font/google"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { ThemeToaster } from "@/components/providers/ThemeToaster"
import { auth } from "@/infrastructure/auth/auth"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const museoModerno = MuseoModerno({
  subsets: ["latin"],
  variable: "--font-logo",
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://interna.work"

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Interna. | Virtual Internship for Software Engineers",
  description:
    "The AI-Driven Virtual Internship Simulator that bridges the gap between a 4.0 GPA and a deployed system. Experience real software engineering tasks, prep for technical interviews, and build your portfolio.",
  keywords: [
    "virtual internship for software engineers",
    "software engineering internship",
    "internship simulator",
    "AI code review",
    "technical interview prep",
    "Forage alternative",
    "developer portfolio builder"
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    title: "Interna. | Virtual Internship for Software Engineers",
    description: "The AI-Driven Virtual Internship Simulator that bridges the gap between a 4.0 GPA and a deployed system.",
    siteName: "Interna",
    images: [
      {
        url: `${appUrl}/og-image.png`, // Placeholder for future OG Image
        width: 1200,
        height: 630,
        alt: "Interna - Building Senior Developers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Interna. | Virtual Internship for Software Engineers",
    description: "The AI-Driven Virtual Internship Simulator that bridges the gap between a 4.0 GPA and a deployed system.",
    images: [`${appUrl}/og-image.png`],
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrains.variable} ${museoModerno.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <AuthProvider session={session}>
            {children}
            <ThemeToaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
