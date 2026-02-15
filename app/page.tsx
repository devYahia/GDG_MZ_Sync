"use client"

import { GradientButton } from "@/components/ui/gradient-button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Features } from "@/components/landing/Features"
import { HeroMonitor } from "@/components/landing/HeroMonitor"
import UnicornScene from "unicornstudio-react/next"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-purple-500/30">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-300">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="text-xl font-bold tracking-tighter text-white font-logo">
            Interna<span className="text-purple-500">.</span> Virtual
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-white/70">
            <a href="#features" className="px-4 py-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 hover:text-white transition-all backdrop-blur-md">Features</a>
            <a href="#about" className="px-4 py-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 hover:text-white transition-all backdrop-blur-md">About</a>
            <a href="#pricing" className="px-4 py-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 hover:text-white transition-all backdrop-blur-md">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <GradientButton variant="variant" className="h-9 px-4 text-xs font-semibold">Log in</GradientButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {mounted && (
            <UnicornScene
              projectId="O9x26UxHgTGLBz8EmFM3"
              width="100%"
              height="100%"
              sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.5/dist/unicornStudio.umd.js"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-50" />
        </div>

        <div className="container relative z-10 mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left Column: Text Content */}
            <div className="flex flex-col gap-8 text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-2xl leading-[1.1]"
              >
                Transforming Calculators into <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-400">
                  Battle-Ready Problem Solvers
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mx-auto lg:mx-0 max-w-xl text-lg md:text-xl text-white/60 leading-relaxed"
              >
                Bridge the academic-professional divide with a high-fidelity behavioral simulator. Escape the &quot;Notebook Trap&quot;, dismantle the &quot;Jargon Barrier&quot;, and navigate real-world friction with AI-driven stakeholders.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
              >
                <Link href="/signup" className="w-full sm:w-auto">
                  <GradientButton className="w-full sm:w-auto text-base px-8 py-6 group">
                    Get Started <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </GradientButton>
                </Link>
              </motion.div>
            </div>

            {/* Right Column: 3D Monitor / Creative Component */}
            <div className="relative w-full flex justify-center lg:justify-end">
              <HeroMonitor />
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 bg-black border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(88,28,135,0.15),transparent_50%)] pointer-events-none" />

        <div className="container mx-auto px-6 relative">
          <div className="mb-20 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Beyond Static Tutorials</h2>
            <p className="text-white/50 text-lg leading-relaxed">
              We replace the &quot;Correct Answer&quot; with satisfied stakeholders and deployed systems.
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <Features />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-black to-black pointer-events-none" />
        <div className="container mx-auto px-6 text-center relative max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">Ready to Transform?</h2>
          <p className="text-white/60 max-w-xl mx-auto mb-10 text-lg">
            Join thousands of developers building the future of web applications using our advanced toolkit.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <GradientButton className="w-full sm:w-auto h-14 px-10 text-lg">Start Building Now</GradientButton>
            <GradientButton variant="variant" className="w-full sm:w-auto h-14 px-10 text-lg">Contact Sales</GradientButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-white/30 text-sm">
          <p>© 2026 Interna Virtual. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
