import type { Metadata } from "next"
import { Inter, JetBrains_Mono, MuseoModerno } from "next/font/google"
import { Toaster } from "sonner"
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

export const metadata: Metadata = {
  title: "Interna. | Building Senior Developers",
  description:
    "The AI-Driven Virtual Internship Simulator that bridges the gap between a 4.0 GPA and a deployed system. Stop calculating. Start solving.",
  keywords: [
    "internship simulator",
    "AI training",
    "developer skills",
    "virtual internship",
    "software engineering",
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrains.variable} ${museoModerno.variable} font-sans antialiased`}
      >
        {children}
        <Toaster theme="dark" position="top-center" richColors />
      </body>
    </html>
  )
}
