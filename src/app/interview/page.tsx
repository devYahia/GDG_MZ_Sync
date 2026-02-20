"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Loader2, Send, Clock, Mic, MicOff, MessageSquare, Phone, Volume2, StopCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { FeedbackDashboard } from "@/components/interview/FeedbackDashboard"
import { Suspense } from "react"

type Message = {
    id: string
    role: "user" | "ai" | "system"
    content: string
    timestamp: Date
}

// Global declaration for TypeScript Web Speech API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export default function InterviewPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <InterviewSessionClient />
        </Suspense>
    )
}

function InterviewSessionClient() {
    const router = useRouter()

    // Core State
    const [mode, setMode] = useState<"chat" | "voice">("voice")
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isThinking, setIsThinking] = useState(false)
    const [isFinished, setIsFinished] = useState(false)
    const [finalScore, setFinalScore] = useState(0)
    const [finalReport, setFinalReport] = useState("")
    const [timeElapsed, setTimeElapsed] = useState(0)
    const [sessionId, setSessionId] = useState<string>("")
    const searchParams = useSearchParams()

    const role = searchParams.get("role") || "Software Engineer"
    const difficulty = searchParams.get("difficulty") || "mid"

    // Voice State
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const recognitionRef = useRef<any>(null)
    const synthesisRef = useRef<SpeechSynthesis | null>(null)
    const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Setup Speech Recognition and Synthesis
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Setup Synthesis
            synthesisRef.current = window.speechSynthesis
            const loadVoices = () => {
                const voices = synthesisRef.current?.getVoices() || []
                // Try to find a good English voice (Google US English or similar)
                voiceRef.current = voices.find(v => v.lang === "en-US" && v.name.includes("Google")) ||
                    voices.find(v => v.lang.startsWith("en")) ||
                    voices[0] || null
            }
            loadVoices()
            if (synthesisRef.current.onvoiceschanged !== undefined) {
                synthesisRef.current.onvoiceschanged = loadVoices
            }

            // Setup Recognition
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition()
                recognitionRef.current.continuous = false
                recognitionRef.current.interimResults = false
                recognitionRef.current.lang = "en-US"

                recognitionRef.current.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript
                    handleSendVoiceMsg(transcript)
                }

                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error)
                    setIsListening(false)
                }

                recognitionRef.current.onend = () => {
                    setIsListening(false)
                }
            }
        }

        return () => {
            if (synthesisRef.current) {
                synthesisRef.current.cancel()
            }
            if (recognitionRef.current) {
                recognitionRef.current.abort()
            }
        }
    }, [])

    // Timer and Init logic
    useEffect(() => {
        const timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000)

        // Init Session
        fetch("/api/interview/init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: role, difficulty: difficulty })
        })
            .then(res => res.json())
            .then(data => {
                if (data.sessionId) setSessionId(data.sessionId)
                if (data.aiGreeting) {
                    setMessages([{ id: "msg-1", role: "ai", content: data.aiGreeting, timestamp: new Date() }])
                    // Speak the greeting if we start in voice mode
                    if (mode === "voice") {
                        speakText(data.aiGreeting)
                    }
                }
            })
            .catch(console.error)

        return () => {
            clearInterval(timer)
        }
    }, [])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0")
        const s = (seconds % 60).toString().padStart(2, "0")
        return `${m}:${s}`
    }

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isThinking])

    const speakText = async (text: string) => {
        // Clean markdown from text before speaking
        const cleanText = text.replace(/[*_#`]/g, "")

        try {
            // Attempt to use Premium Gemini Audio Output first!
            const res = await fetch("/api/interview/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: cleanText, voice: "Aoede" }) // Aoede is professional, calm and authoritative
            })

            if (res.ok) {
                const data = await res.json()
                if (data.audioBase64) {
                    setIsSpeaking(true)
                    const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`)
                    audio.onended = () => setIsSpeaking(false)
                    audio.play()
                    return // Success! Do not fallback
                }
            }
        } catch (e) {
            console.error("Failed Gemini TTS, falling back to browser.", e)
        }

        // Fallback to Native Browser TTS if Gemini fails
        if (!synthesisRef.current) return

        synthesisRef.current.cancel() // Stop any current speech
        const utterance = new SpeechSynthesisUtterance(cleanText)
        if (voiceRef.current) {
            utterance.voice = voiceRef.current
        }
        utterance.rate = 1.05

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)

        synthesisRef.current.speak(utterance)
    }

    const stopSpeaking = () => {
        if (synthesisRef.current) {
            synthesisRef.current.cancel()
            setIsSpeaking(false)
        }
    }

    const toggleListening = () => {
        if (isSpeaking) {
            stopSpeaking()
        }

        if (isListening) {
            recognitionRef.current?.stop()
            setIsListening(false)
        } else {
            try {
                recognitionRef.current?.start()
                setIsListening(true)
            } catch (e) {
                console.error("Microphone access failed", e)
            }
        }
    }

    const processBackendChat = async (newUserMsg: Message) => {
        setIsThinking(true)

        const apiMessages = [...messages, newUserMsg].map(m => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.content
        })).filter(Math => Math.role !== "system")

        try {
            const res = await fetch("/api/interview/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: sessionId || "temp-uuid",
                    messages: apiMessages,
                    jobDescription: role,
                    language: "en"
                })
            })

            const data = await res.json()

            if (data.reply) {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: "ai",
                    content: data.reply,
                    timestamp: new Date()
                }])
                if (mode === "voice") {
                    speakText(data.reply)
                }
            } else if (data.error) {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: "ai",
                    content: `Error: ${data.error}`,
                    timestamp: new Date()
                }])
            }
        } catch {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "ai",
                content: "Error: Could not reach the AI service.",
                timestamp: new Date()
            }])
        } finally {
            setIsThinking(false)
        }
    }

    const handleSendMessage = () => {
        if (!input.trim()) return

        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, newUserMsg])
        setInput("")

        processBackendChat(newUserMsg)
    }

    const handleSendVoiceMsg = (transcript: string) => {
        if (!transcript.trim()) return

        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: transcript.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, newUserMsg])
        processBackendChat(newUserMsg)
    }

    const handleEndInterview = () => {
        if (synthesisRef.current) synthesisRef.current.cancel()
        if (recognitionRef.current) recognitionRef.current.abort()

        if (!sessionId) {
            router.push("/dashboard")
            return
        }

        setIsFinished(true) // Show the loading skeleton immediately

        const apiMessages = messages.map(m => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.content
        })).filter(Math => Math.role !== "system");

        fetch("/api/interview/finish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionId,
                trigger: "user_completed",
                messages: apiMessages,
                jobDescription: role,
                language: "en"
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.overallScore !== undefined) {
                    setFinalScore(data.overallScore)
                    setFinalReport(data.report || "No detailed report generated.")
                } else {
                    setFinalReport("Error generating report.")
                }
            })
            .catch(() => {
                setFinalReport("Network error while generating report.")
            })
    }

    if (isFinished) {
        return <FeedbackDashboard score={finalScore} reportMarkdown={finalReport} />
    }

    return (
        <div className="flex h-screen w-full flex-col bg-background text-foreground font-sans selection:bg-primary/30">
            {/* Animated Background */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

            {/* Top Navigation Bar */}
            <header className="relative z-10 flex h-20 shrink-0 items-center justify-between border-b border-border/50 bg-background/50 backdrop-blur-xl px-8">
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/dashboard")}
                        className="text-muted-foreground hover:text-foreground transition-colors h-10 px-4 rounded-xl"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Dashboard
                    </Button>
                    <div className="h-6 w-px bg-border text-xs" />
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                            {role} Assessment
                        </h1>
                        <div className="flex items-center gap-2 text-primary font-medium text-xs">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Live Interview
                        </div>
                    </div>
                </div>

                {/* Mode Toggles */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-muted/50 p-1 rounded-2xl border border-border/50 backdrop-blur-md">
                    <button
                        onClick={() => setMode("voice")}
                        className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${mode === "voice" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        {mode === "voice" && (
                            <motion.div layoutId="activeTab" className="absolute inset-0 bg-background rounded-xl shadow-md border border-border/50" />
                        )}
                        <span className="relative z-10 flex items-center gap-2"><Phone className="h-4 w-4" /> Voice</span>
                    </button>
                    <button
                        onClick={() => { setMode("chat"); stopSpeaking() }}
                        className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${mode === "chat" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        {mode === "chat" && (
                            <motion.div layoutId="activeTab" className="absolute inset-0 bg-background rounded-xl shadow-md border border-border/50" />
                        )}
                        <span className="relative z-10 flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Chat</span>
                    </button>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-foreground font-mono bg-card/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-border/50 shadow-sm">
                        <Clock className="h-4 w-4 text-primary" />
                        {formatTime(timeElapsed)}
                    </div>
                    <Button
                        size="lg"
                        variant="destructive"
                        onClick={handleEndInterview}
                        className="rounded-xl px-6 font-semibold shadow-lg shadow-destructive/20"
                    >
                        End Interview
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 flex flex-col overflow-hidden items-center justify-center p-6">

                {/* Voice Mode */}
                <AnimatePresence mode="wait">
                    {mode === "voice" && (
                        <motion.div
                            key="voice"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center justify-center w-full max-w-4xl h-full gap-16"
                        >
                            {/* AI Avatar / Status */}
                            <div className="flex flex-col items-center justify-center gap-8 relative">
                                <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full" />

                                <div className="relative">
                                    {/* Pulsing rings when speaking */}
                                    <AnimatePresence>
                                        {(isSpeaking || isThinking) && (
                                            <>
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1.5 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                                    className="absolute inset-0 rounded-full border border-primary/30"
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 2 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeInOut" }}
                                                    className="absolute inset-0 rounded-full border border-primary/10"
                                                />
                                            </>
                                        )}
                                    </AnimatePresence>

                                    {/* Core Avatar */}
                                    <motion.div
                                        animate={{
                                            scale: isSpeaking ? [1, 1.05, 1] : 1,
                                            boxShadow: isSpeaking
                                                ? ["0 0 40px rgba(var(--primary), 0.2)", "0 0 80px rgba(var(--primary), 0.4)", "0 0 40px rgba(var(--primary), 0.2)"]
                                                : "0 0 40px rgba(var(--primary), 0.1)"
                                        }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                        className="relative flex items-center justify-center w-48 h-48 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 border border-primary/20 backdrop-blur-xl z-10"
                                    >
                                        {isThinking ? (
                                            <Loader2 className="h-16 w-16 text-primary animate-spin" />
                                        ) : isSpeaking ? (
                                            <Volume2 className="h-16 w-16 text-primary" />
                                        ) : (
                                            <MessageSquare className="h-16 w-16 text-primary/50" />
                                        )}
                                    </motion.div>
                                </div>

                                <div className="text-center z-10 space-y-2">
                                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                                        {isThinking ? "Thinking..." : isSpeaking ? "Interviewer is speaking" : "AI Interviewer"}
                                    </h2>
                                    <p className="text-muted-foreground text-lg h-8">
                                        {isListening ? "Listening to you..." : isSpeaking || isThinking ? "" : "Tap the mic to respond"}
                                    </p>
                                </div>
                            </div>

                            {/* Voice Controls */}
                            <div className="flex items-center gap-6 z-10">
                                {isSpeaking && (
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={stopSpeaking}
                                        className="h-16 w-16 rounded-full border-border bg-card/50 hover:bg-card hover:text-foreground backdrop-blur-lg"
                                    >
                                        <StopCircle className="h-6 w-6" />
                                    </Button>
                                )}
                                <Button
                                    onClick={toggleListening}
                                    disabled={isThinking || isSpeaking}
                                    className={`relative flex items-center justify-center h-24 w-24 rounded-full transition-all duration-300 shadow-2xl overflow-hidden
                                        ${isListening
                                            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                                            : 'bg-primary hover:bg-primary/90 shadow-primary/30'}
                                    `}
                                >
                                    {isListening ? (
                                        <>
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                                className="absolute inset-0 bg-red-400 rounded-full blur-md"
                                            />
                                            <MicOff className="h-8 w-8 text-white relative z-10" />
                                        </>
                                    ) : (
                                        <Mic className="h-8 w-8 text-white relative z-10" />
                                    )}
                                </Button>
                            </div>

                            {/* Live Transcript Snippet */}
                            {messages.length > 0 && !isListening && !isSpeaking && !isThinking && (
                                <div className="max-w-2xl text-center z-10">
                                    <p className="text-muted-foreground line-clamp-2">
                                        "{messages[messages.length - 1].content}"
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Chat Mode */}
                    {mode === "chat" && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col w-full max-w-4xl h-full bg-card/30 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden"
                        >
                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                                        >
                                            <div className="flex items-center gap-2 mb-2 px-1">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    {msg.role === "ai" ? "Interviewer" : msg.role === "system" ? "System" : "You"}
                                                </span>
                                            </div>
                                            <div className={`rounded-2xl px-6 py-4 text-[15px] leading-relaxed shadow-sm ${msg.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                : msg.role === "system"
                                                    ? "bg-muted text-muted-foreground border border-border font-mono text-sm w-full"
                                                    : "bg-muted/50 text-foreground border border-border/50 rounded-tl-sm"
                                                }`}>
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {isThinking && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mr-auto items-start flex flex-col max-w-[80%]"
                                        >
                                            <div className="flex items-center gap-2 mb-2 px-1">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interviewer</span>
                                            </div>
                                            <div className="rounded-2xl px-6 py-5 bg-muted/50 border border-border/50 rounded-tl-sm w-24 flex justify-between items-center">
                                                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </div>
                                        </motion.div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </AnimatePresence>
                            </div>

                            {/* Chat Input */}
                            <div className="p-6 bg-background/50 border-t border-border/50 backdrop-blur-lg">
                                <div className="relative flex items-end gap-3 max-w-4xl mx-auto">
                                    <div className="relative flex-1 rounded-2xl bg-card border border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
                                        <textarea
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault()
                                                    handleSendMessage()
                                                }
                                            }}
                                            placeholder="Type your response..."
                                            className="w-full bg-transparent px-5 py-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none resize-none min-h-[56px] max-h-[160px] scrollbar-thin scrollbar-thumb-border"
                                            rows={1}
                                        />
                                    </div>
                                    <Button
                                        size="icon"
                                        onClick={handleSendMessage}
                                        disabled={!input.trim() || isThinking}
                                        className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all shrink-0"
                                    >
                                        <Send className="h-6 w-6" />
                                    </Button>
                                </div>
                                <div className="mt-3 text-center text-xs text-muted-foreground font-medium">
                                    Press <kbd className="font-sans px-1.5 py-0.5 rounded-md bg-muted border border-border mx-1">Enter</kbd> to send, <kbd className="font-sans px-1.5 py-0.5 rounded-md bg-muted border border-border mx-1">Shift + Enter</kbd> for new line
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
