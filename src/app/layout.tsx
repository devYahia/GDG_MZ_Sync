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

const appUrl = process.env.AUTH_URL || "https://interna.work"

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Interna Virtual | AI Internship Simulator",
    template: "%s | Interna Virtual"
  },
  description:
    "Interna Virtual is the premier AI-driven virtual internship simulator for software engineers. Bridge the gap between a 4.0 GPA and a deployed system by experiencing real-world engineering tasks.",
  keywords: [
    "interna",
    "interna virtual",
    "interna work",
    "virtual internship for software engineers",
    "software engineering internship",
    "internship simulator",
    "AI code review",
    "technical interview prep",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    title: "Interna Virtual | AI Internship Simulator for Software Engineers",
    description: "Interna Virtual bridges the academic-professional divide. Gain real-world software engineering experience through an AI-driven behavioral simulator.",
    siteName: "Interna Virtual",
    images: [
      {
        url: `${appUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Interna Virtual - Software Engineering Simulator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Interna Virtual | AI Internship Simulator",
    description: "Interna Virtual bridges the academic-professional divide. Gain real-world software engineering experience.",
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
