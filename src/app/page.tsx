"use client"

import { GradientButton } from "@/components/ui/gradient-button"
import { ArrowRight } from "lucide-react"
import { motion, useScroll, useTransform } from "motion/react"
import { Features } from "@/components/landing/Features"
import { Pricing } from "@/components/landing/Pricing"
import { FAQ } from "@/components/landing/FAQ"
import { ContactCTA } from "@/components/landing/ContactCTA"
import { HeroMonitor } from "@/components/landing/HeroMonitor"
import UnicornScene from "unicornstudio-react/next"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const { scrollY } = useScroll()
  const navBg = useTransform(scrollY, [0, 80], ["rgba(0,0,0,0.4)", "rgba(0,0,0,0.85)"])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.15])
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.97])
  const heroY = useTransform(scrollY, [0, 400], [0, 60])

  useEffect(() => {
    setMounted(true)

    // Nuclear badge removal -- the SDK injects an element inside the scene container
    const removeBadge = () => {
      // Strategy 1: Find all elements in the page and hide badge-like ones
      document.querySelectorAll("*").forEach(el => {
        const htmlEl = el as HTMLElement
        const style = window.getComputedStyle(htmlEl)
        const text = (htmlEl.textContent || "").toLowerCase()
        const href = (htmlEl as HTMLAnchorElement).href?.toLowerCase() || ""

        // Match by text content
        const isTextMatch = text.includes("unicorn") || (text.includes("made with") && text.length < 80)
        // Match by href
        const isHrefMatch = href.includes("unicorn.studio") || href.includes("unicornstudio")
        // Match by position: fixed/absolute at bottom with small height (badge-like)
        const isBadgePosition = (style.position === "fixed" || style.position === "absolute") &&
          parseInt(style.bottom) >= 0 && parseInt(style.bottom) <= 40 &&
          htmlEl.offsetHeight > 0 && htmlEl.offsetHeight < 60 &&
          htmlEl.tagName !== "SECTION" && htmlEl.tagName !== "NAV" &&
          !htmlEl.closest("footer") &&
          !htmlEl.id?.includes("__next")

        if (isTextMatch || isHrefMatch || (isBadgePosition && htmlEl.querySelector("svg, img"))) {
          htmlEl.remove()
        }
      })

      // Strategy 2: Target elements inside any unicorn scene container specifically
      document.querySelectorAll("[id^='unicorn-']").forEach(container => {
        // The SDK adds canvas + badge. Keep canvas, remove everything else non-essential
        container.querySelectorAll("a, div:not([style*='position'])").forEach(child => {
          const text = (child.textContent || "").toLowerCase()
          if (text.includes("unicorn") || text.includes("made with")) {
            (child as HTMLElement).remove()
          }
        })
        // Also target any child with position absolute/fixed at bottom
        container.querySelectorAll("*").forEach(child => {
          const s = window.getComputedStyle(child as HTMLElement)
          if ((s.position === "absolute" || s.position === "fixed") && child.tagName !== "CANVAS") {
            const bottom = parseInt(s.bottom)
            if (!isNaN(bottom) && bottom >= 0 && bottom <= 30) {
              (child as HTMLElement).remove()
            }
          }
        })
      })
    }

    // Run at multiple intervals to catch late SDK injection
    const timers = [200, 500, 1000, 2000, 3000, 5000, 8001].map(ms => setTimeout(removeBadge, ms))

    // Watch for any DOM changes
    const observer = new MutationObserver(() => {
      requestAnimationFrame(removeBadge)
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      timers.forEach(clearTimeout)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-purple-500/30 overflow-x-hidden">

      {/* Navbar */}
      <motion.nav
        style={{ backgroundColor: navBg }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl transition-all duration-300"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl font-bold tracking-tighter text-white font-logo"
          >
            Interna<span className="text-purple-500">.</span> Virtual
          </motion.div>
          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-white/70">
            {["Features", "About", "Pricing"].map((label, i) => (
              <motion.a
                key={label}
                href={`#${label.toLowerCase()}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                className="px-4 py-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 hover:text-white transition-all duration-300"
              >
                {label}
              </motion.a>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/login">
              <GradientButton variant="variant" className="h-9 px-4 text-xs font-semibold">
                Log in
              </GradientButton>
            </Link>
          </motion.div>
        </div>
      </motion.nav>

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
          {/* Gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />
        </div>
        {/* Opaque cover for SDK watermark -- sits above everything at the bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-black z-[9999] pointer-events-none" />

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="container relative z-10 mx-auto px-6"
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Column */}
            <div className="flex flex-col gap-8 text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-2xl leading-[1.08]"
              >
                Transforming calculators into{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-400">
                  battle-ready problem solvers
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto lg:mx-0 max-w-xl text-lg md:text-xl text-white/60 leading-relaxed"
              >
                Bridge the academic–professional divide with a high-fidelity behavioral simulator. Escape the &quot;Notebook Trap&quot;, dismantle the &quot;Jargon Barrier&quot;, and navigate real-world friction with AI-driven stakeholders.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <Link href="/signup" className="w-full sm:w-auto">
                  <GradientButton className="w-full sm:w-auto text-base px-8 py-6 group rounded-xl">
                    Get started
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </GradientButton>
                </Link>
                <motion.a
                  href="#features"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-sm text-white/50 hover:text-white/80 transition-colors underline underline-offset-4"
                >
                  See how it works
                </motion.a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full flex justify-center lg:justify-end"
            >
              <HeroMonitor />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 bg-black border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(88,28,135,0.12),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,7,100,0.08),transparent_40%)] pointer-events-none" />

        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-20 text-center max-w-3xl mx-auto"
          >
            <p className="text-sm font-medium text-purple-400/90 uppercase tracking-widest mb-4">
              Why Interna
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Beyond static tutorials
            </h2>
            <p className="text-white/50 text-lg leading-relaxed">
              We replace the &quot;Correct Answer&quot; with satisfied stakeholders and deployed systems.
            </p>
          </motion.div>

          <div className="max-w-7xl mx-auto">
            <Features />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-32 bg-black border-t border-white/5">
        <Pricing />
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-32 bg-black border-t border-white/5">
        <FAQ />
      </section>

      {/* CTA + Social + Contact Section */}
      <section id="about" className="relative z-10 py-32 overflow-hidden border-t border-white/5">
        <ContactCTA />
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 border-t border-white/5 bg-black py-12"
      >
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-white/30 text-sm">
          <p>© 2026 Interna Virtual. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors duration-200">Privacy</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Terms</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Contact</a>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
