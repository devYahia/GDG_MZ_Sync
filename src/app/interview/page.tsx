"use client"

import { useState, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { Play, SquareTerminal, MessageSquare, ChevronLeft, Loader2, Send, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { FeedbackDashboard } from "@/components/interview/FeedbackDashboard"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

type Message = {
    id: string
    role: "user" | "ai" | "system"
    content: string
    timestamp: Date
}

export default function InterviewSessionClient() {
    const router = useRouter()
    const [code, setCode] = useState<string>('// Start coding your solution here...\n\nfunction solution() {\n  \n}\n\nconsole.log("Testing solution...");')
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "msg-1",
            role: "ai",
            content: "Welcome. I will be your engineering manager for this session. We are going to assess your problem-solving skills, code quality, and communication. Please explain your approach before writing code. \n\n**Your Task:** Write a robust function that determines if a given string is a valid palindrome, considering only alphanumeric characters and ignoring cases. Discuss edge cases first.",
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState("")
    const [isThinking, setIsThinking] = useState(false)
    const [isFinished, setIsFinished] = useState(false)
    const [finalScore, setFinalScore] = useState(0)
    const [finalReport, setFinalReport] = useState("")
    const [timeElapsed, setTimeElapsed] = useState(0)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const [sessionId, setSessionId] = useState<string>("")

    // Timer and Init logic
    useEffect(() => {
        const timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000)

        // Init Session
        fetch("/api/interview/init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "Senior Software Engineer", difficulty: "senior" })
        })
            .then(res => res.json())
            .then(data => {
                if (data.sessionId) setSessionId(data.sessionId)
                if (data.aiGreeting) {
                    setMessages([{ id: "msg-1", role: "ai", content: data.aiGreeting, timestamp: new Date() }])
                }
            })
            .catch(console.error)

        return () => clearInterval(timer)
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
        setIsThinking(true)

        const apiMessages = [...messages, newUserMsg].map(m => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.content
        })).filter(Math => Math.role !== "system"); // Ignore internal system mock messages

        fetch("/api/interview/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionId: sessionId || "temp-uuid",
                messages: apiMessages,
                jobDescription: "Senior Software Engineer",
                language: "en"
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.reply) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: "ai",
                        content: data.reply,
                        timestamp: new Date()
                    }])
                } else if (data.error) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: "ai",
                        content: `Error: ${data.error}`,
                        timestamp: new Date()
                    }])
                }
            })
            .catch(() => {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: "ai",
                    content: "Error: Could not reach the AI service.",
                    timestamp: new Date()
                }])
            })
            .finally(() => setIsThinking(false))
    }

    const handleRunCode = () => {
        // Mock Execution (To be wired to real sandbox API in Phase 2)
        const systemMsg: Message = {
            id: Date.now().toString(),
            role: "system",
            content: "Executing code in secure sandbox...\n> Testing solution...\nExecution complete in 0.4s.",
            timestamp: new Date()
        }
        setMessages(prev => [...prev, systemMsg])
    }

    const handleEndInterview = () => {
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
                jobDescription: "Senior Software Engineer",
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
        <div className="flex h-screen w-full flex-col bg-[#0A0A0A] text-slate-300 font-sans">

            {/* Top Navigation Bar */}
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#0F0F12] px-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/dashboard")}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Exit
                    </Button>
                    <div className="h-4 w-px bg-white/10" />
                    <h1 className="text-sm font-semibold tracking-wide text-white flex items-center gap-2">
                        <SquareTerminal className="h-4 w-4 text-cyan-400" />
                        Senior Engineering Assessment
                    </h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-slate-400 font-mono bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                        <Clock className="h-4 w-4" />
                        {formatTime(timeElapsed)}
                    </div>
                    <Button
                        size="sm"
                        variant="default"
                        onClick={handleEndInterview}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20 transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                    >
                        End Interview
                    </Button>
                </div>
            </header>

            {/* Split Pane Main Area */}
            <div className="flex flex-1 overflow-hidden">

                {/* Left Pane: Code Editor */}
                <div className="flex w-1/2 flex-col border-r border-white/10 bg-[#161618] relative">
                    <div className="flex items-center justify-between border-b border-white/10 bg-[#1A1A1D] px-4 py-2">
                        <span className="text-xs font-mono text-slate-400">solution.ts</span>
                        <Button
                            size="sm"
                            onClick={handleRunCode}
                            className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 h-7 text-xs px-3 shadow-[0_0_10px_rgba(16,185,129,0.1)] transition-all"
                        >
                            <Play className="mr-1.5 h-3 w-3" /> Run Code
                        </Button>
                    </div>
                    <div className="flex-1 relative">
                        <MonacoEditor
                            height="100%"
                            language="typescript"
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value || "")}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                padding: { top: 16 },
                                scrollBeyondLastLine: false,
                                smoothScrolling: true,
                                cursorBlinking: "smooth",
                                cursorSmoothCaretAnimation: "on",
                                formatOnPaste: true,
                            }}
                            loading={
                                <div className="flex h-full items-center justify-center text-slate-500 gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Loading Editor...
                                </div>
                            }
                        />
                    </div>
                </div>

                {/* Right Pane: AI Interviewer */}
                <div className="flex w-1/2 flex-col bg-[#0F0F12]">
                    <div className="flex items-center gap-2 border-b border-white/10 bg-[#1A1A1D] px-4 py-2">
                        <MessageSquare className="h-4 w-4 text-purple-400" />
                        <span className="text-xs font-semibold text-slate-300">Staff Engineer AI</span>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                                        }`}
                                >
                                    <div className={`text-[10px] mb-1 px-1 opacity-50 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                                        {msg.role === "ai" ? "Interviewer" : msg.role === "system" ? "System" : "You"}
                                    </div>
                                    <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.role === "user"
                                        ? "bg-cyan-600/20 text-cyan-100 border border-cyan-500/20 rounded-tr-sm backdrop-blur-sm"
                                        : msg.role === "system"
                                            ? "bg-slate-800/50 text-slate-400 border border-white/5 font-mono text-xs w-full"
                                            : "bg-[#1C1C21] text-slate-200 border border-white/5 rounded-tl-sm backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                                        }`}>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {isThinking && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mr-auto items-start flex flex-col max-w-[85%]"
                                >
                                    <div className="text-[10px] mb-1 px-1 opacity-50 text-left">Interviewer</div>
                                    <div className="rounded-xl px-4 py-3 bg-[#1C1C21] border border-white/5 rounded-tl-sm w-16 flex justify-center items-center h-10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </AnimatePresence>
                    </div>

                    {/* Chat Input */}
                    <div className="border-t border-white/10 bg-[#161618] p-4">
                        <div className="relative flex items-center rounded-xl bg-[#0F0F12] border border-white/10 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all shadow-inner">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSendMessage()
                                    }
                                }}
                                placeholder="Explain your approach..."
                                className="w-full bg-transparent px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none resize-none min-h-[44px] max-h-[120px]"
                                rows={1}
                            />
                            <Button
                                size="icon"
                                onClick={handleSendMessage}
                                disabled={!input.trim() || isThinking}
                                className="mr-2 h-8 w-8 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_10px_rgba(8,145,178,0.4)] disabled:opacity-50 disabled:shadow-none transition-all"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="mt-2 text-center text-[10px] text-slate-500">
                            Press <kbd className="font-sans px-1 rounded bg-white/5 border border-white/10">Enter</kbd> to send, <kbd className="font-sans px-1 rounded bg-white/5 border border-white/10">Shift + Enter</kbd> for new line
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
