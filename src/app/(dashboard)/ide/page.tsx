"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "motion/react"
import {
    Play, Download, Loader2, CheckCircle2, XCircle, FileCode,
    Zap, Search, Terminal as TerminalIcon, FileText, ChevronRight, ChevronDown,
    FilePlus, Trash2, Menu, X, Code2, Bug, Activity, Maximize2, Minimize2
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import { getBackendBase } from "@/lib/api-config"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full items-center justify-center bg-black/50 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    ),
})

const API_BASE = getBackendBase()

interface FileNode {
    name: string
    content: string
    type: "file"
}

interface StepEvent {
    type: "step" | "file" | "execute" | "lint" | "error" | "done" | "report"
    message: string
    data?: string
}

const STEP_CONFIG = {
    step: { icon: Zap, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/30" },
    file: { icon: FileCode, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
    execute: { icon: TerminalIcon, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
    lint: { icon: Search, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    error: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
    done: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    report: { icon: FileText, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
}

export default function IDEPage() {
    const { resolvedTheme } = useTheme()

    // File management
    const [files, setFiles] = useState<Record<string, FileNode>>({
        "src/index.js": { name: "src/index.js", content: "// Welcome to the Advanced IDE\nconsole.log('Hello World!');\n\n// Try the integrated code review:\n// 1. Paste a GitHub repo URL in the right panel\n// 2. Click 'Run Review' to analyze the entire codebase\n// 3. View real-time progress and detailed reports\n", type: "file" },
        "src/app.py": { name: "src/app.py", content: "# Python Example\nprint('Hello from Python!')\nprint('This IDE supports both Python and JavaScript!')\n\n# Try running this file\nfor i in range(5):\n    print(f'Count: {i}')\n", type: "file" },
        "src/utils.js": { name: "src/utils.js", content: "// Utility functions\nexport function greet(name) {\n  return `Hello, ${name}!`;\n}\n", type: "file" },
    })
    const [activeFile, setActiveFile] = useState("src/app.py")
    const [openFiles, setOpenFiles] = useState<string[]>(["src/app.py"])

    // Code execution
    const [output, setOutput] = useState("")
    const [isRunning, setIsRunning] = useState(false)

    // Code review
    const [repoUrl, setRepoUrl] = useState("")
    const [isReviewing, setIsReviewing] = useState(false)
    const [reviewSteps, setReviewSteps] = useState<StepEvent[]>([])
    const [report, setReport] = useState("")
    const [showReport, setShowReport] = useState(false)
    const eventSourceRef = useRef<EventSource | null>(null)

    // UI state
    const [showFileExplorer, setShowFileExplorer] = useState(true)
    const [showReviewPanel, setShowReviewPanel] = useState(true)
    const [showTerminal, setShowTerminal] = useState(true)

    const updateFileContent = useCallback((path: string, content: string) => {
        setFiles(prev => ({
            ...prev,
            [path]: { ...prev[path], content }
        }))
    }, [])

    const createFile = useCallback(() => {
        const newFileName = prompt("Enter file name (e.g., src/newfile.js):")
        if (newFileName && !files[newFileName]) {
            const newFile: FileNode = { name: newFileName, content: "// New file\n", type: "file" }
            setFiles(prev => ({ ...prev, [newFileName]: newFile }))
            setActiveFile(newFileName)
            if (!openFiles.includes(newFileName)) {
                setOpenFiles(prev => [...prev, newFileName])
            }
        }
    }, [files, openFiles])

    const deleteFile = useCallback((path: string) => {
        if (confirm(`Delete ${path}?`)) {
            setFiles(prev => {
                const newFiles = { ...prev }
                delete newFiles[path]
                return newFiles
            })
            setOpenFiles(prev => prev.filter(f => f !== path))
            if (activeFile === path && openFiles.length > 1) {
                setActiveFile(openFiles[0] === path ? openFiles[1] : openFiles[0])
            }
        }
    }, [activeFile, openFiles])

    const runCode = useCallback(async () => {
        setIsRunning(true)
        setOutput("")
        setShowTerminal(true)

        try {
            const code = files[activeFile]?.content || ""
            const fileName = activeFile.toLowerCase()

            // Detect language from file extension
            let language = "javascript"
            if (fileName.endsWith(".py")) {
                language = "python"
            } else if (fileName.endsWith(".js") || fileName.endsWith(".jsx") || fileName.endsWith(".ts") || fileName.endsWith(".tsx")) {
                language = "javascript"
            }

            // Call backend execution API
            const res = await fetch(`${API_BASE}/api/execute`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language }),
            })

            const data = await res.json()
            setOutput(data.output || "(no output)")

        } catch (err) {
            setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`)
        } finally {
            setIsRunning(false)
        }
    }, [files, activeFile])

    const [pendingSandboxRedirect, setPendingSandboxRedirect] = useState(false)
    const pendingRedirectRef = useRef(false)

    const startReview = async (shouldRedirect = false) => {
        if (!repoUrl.startsWith("http")) {
            alert("Please enter a valid GitHub URL")
            return
        }

        if (shouldRedirect) pendingRedirectRef.current = true

        setReviewSteps([])
        setReport("")
        setShowReport(false)
        setIsReviewing(true)

        if (eventSourceRef.current) eventSourceRef.current.close()

        try {
            const res = await fetch(`${API_BASE}/api/review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repo_url: repoUrl }),
            })

            if (!res.ok) {
                const err = await res.json()
                setReviewSteps([{ type: "error", message: err.detail || "Failed to start review" }])
                setIsReviewing(false)
                pendingRedirectRef.current = false
                return
            }

            const { job_id, stream_url } = await res.json()
            setReviewSteps([{ type: "step", message: `🚀 Review started (${job_id.slice(0, 8)}…)` }])

            // If we have a pending redirect, do it now
            if (pendingRedirectRef.current) {
                window.open(`/sandbox?job=${job_id}`, '_blank')
                pendingRedirectRef.current = false
            }

            const eventSource = new EventSource(`${API_BASE}${stream_url}`)
            eventSourceRef.current = eventSource

            const eventTypes: StepEvent["type"][] = ["step", "file", "execute", "lint", "error", "done", "report"]

            eventTypes.forEach(eventType => {
                eventSource.addEventListener(eventType, (e) => {
                    try {
                        const payload = JSON.parse(e.data)

                        console.log(`[SSE] ${eventType}:`, payload) // Debug logging

                        if (eventType === "report") {
                            setReviewSteps(prev => [...prev, { type: "report", message: "📋 Report generated" }])
                            setReport(payload.data || "")
                            setShowReport(true)
                        } else if (eventType === "done") {
                            setReviewSteps(prev => [...prev, {
                                type: "done",
                                message: "✅ Review complete"
                            }])
                            setIsReviewing(false)
                            eventSource.close()
                        } else if (eventType === "error") {
                            setReviewSteps(prev => [...prev, { type: "error", message: payload.message || "An error occurred" }])
                            setIsReviewing(false)
                            eventSource.close()
                        } else {
                            setReviewSteps(prev => [...prev, { type: eventType, message: payload.message || "" }])
                        }
                    } catch (err) {
                        console.error(`Failed to parse SSE event (${eventType}):`, err, e.data)
                    }
                })
            })

            eventSource.onerror = (err) => {
                console.error("SSE Error:", err)
                setReviewSteps(prev => [...prev, { type: "error", message: "Connection lost" }])
                setIsReviewing(false)
                eventSource.close()
            }
        } catch (err) {
            setReviewSteps([{ type: "error", message: `Network error: ${err instanceof Error ? err.message : "Unknown"}` }])
            setIsReviewing(false)
        }
    }

    const downloadReport = () => {
        const blob = new Blob([report], { type: "text/markdown" })
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = "code_review_report.md"
        a.click()
    }

    const fileList = Object.keys(files).sort()

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-background text-foreground">
            {/* Top Bar */}
            <div className="h-14 flex items-center justify-between px-4 bg-card/40 backdrop-blur-xl border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30">
                        <Code2 className="h-5 w-5 text-primary" />
                    </div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-primary via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        IDE Environment
                    </h1>
                    <span className="text-xs text-muted-foreground">with AI Agent Sync</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={runCode}
                        disabled={isRunning}
                        size="sm"
                        className="bg-primary hover:bg-primary/90 h-8 text-black font-semibold"
                    >
                        {isRunning ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Play className="h-4 w-4 mr-1 fill-current" />}
                        Run Code
                    </Button>
                    <Button onClick={() => setShowFileExplorer(!showFileExplorer)} variant="ghost" size="sm" className="h-8">
                        <Menu className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Main Content - CSS Grid Layout */}
            <div className="flex-1 grid overflow-hidden" style={{
                gridTemplateColumns: showFileExplorer ? (showReviewPanel ? "250px 1fr 350px" : "250px 1fr") : (showReviewPanel ? "1fr 350px" : "1fr"),
                gridTemplateRows: showTerminal ? "1fr 200px" : "1fr"
            }}>
                {/* File Explorer */}
                {showFileExplorer && (
                    <div className="bg-black/20 border-r border-white/10 flex flex-col overflow-hidden row-span-2">
                        <div className="p-3 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Explorer</span>
                            <button onClick={createFile} className="p-1 hover:bg-white/10 rounded transition">
                                <FilePlus className="h-3.5 w-3.5 text-gray-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {fileList.map(path => (
                                <div
                                    key={path}
                                    className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition ${activeFile === path ? "bg-primary/20 text-primary" : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                                        }`}
                                    onClick={() => {
                                        setActiveFile(path)
                                        if (!openFiles.includes(path)) setOpenFiles(prev => [...prev, path])
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <FileCode className="h-3.5 w-3.5" />
                                        <span className="text-xs font-medium">{path.split("/").pop()}</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteFile(path)
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 rounded transition"
                                    >
                                        <Trash2 className="h-3 w-3 text-red-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Editor Area */}
                <div className="flex flex-col bg-black/30 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex items-center gap-1 px-2 py-1 bg-black/40 border-b border-white/10 overflow-x-auto flex-shrink-0">
                        {openFiles.map(path => (
                            <div
                                key={path}
                                className={`group flex items-center gap-2 px-3 py-1.5 rounded-t transition cursor-pointer ${activeFile === path ? "bg-black/60 text-white" : "bg-transparent text-gray-400 hover:bg-white/5"
                                    }`}
                                onClick={() => setActiveFile(path)}
                            >
                                <span className="text-xs font-medium">{path.split("/").pop()}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setOpenFiles(prev => prev.filter(f => f !== path))
                                        if (activeFile === path && openFiles.length > 1) {
                                            const idx = openFiles.indexOf(path)
                                            setActiveFile(openFiles[idx === 0 ? 1 : idx - 1])
                                        }
                                    }}
                                    className="opacity-0 group-hover:opacity-100"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                    {/* Monaco Editor */}
                    <div className="flex-1 overflow-hidden">
                        <MonacoEditor
                            height="100%"
                            language="javascript"
                            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                            value={files[activeFile]?.content || ""}
                            onChange={(value) => updateFileContent(activeFile, value || "")}
                            options={{
                                minimap: { enabled: true },
                                fontSize: 14,
                                lineNumbers: "on",
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                        />
                    </div>
                </div>

                {/* Code Review Panel */}
                {showReviewPanel && (
                    <div className="bg-black/20 border-l border-white/10 flex flex-col overflow-hidden row-span-2">
                        <div className="p-3 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Bug className="h-4 w-4 text-purple-400" />
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Code Review</span>
                            </div>
                            <button onClick={() => setShowReviewPanel(false)} className="p-1 hover:bg-white/10 rounded">
                                <X className="h-4 w-4 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-3 border-b border-white/10 flex-shrink-0">
                            <Input
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                placeholder="GitHub repo URL..."
                                className="mb-2 bg-black/50 border-white/20 text-sm h-9"
                            />
                            <Button
                                onClick={() => startReview(true)}
                                disabled={!repoUrl || isReviewing}
                                size="sm"
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-8"
                            >
                                <Activity className="h-4 w-4 mr-1" />
                                {isReviewing ? "Starting..." : "Open in Sandbox"}
                            </Button>
                        </div>
                    </div>
                )}

                {showTerminal && (
                    <div className="bg-black/50 border-t border-white/10 flex flex-col overflow-hidden" style={{ gridColumn: showFileExplorer && showReviewPanel ? "1 / 4" : (showFileExplorer || showReviewPanel ? "1 / 3" : "1") }}>
                        <div className="px-4 py-2 bg-black/40 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <TerminalIcon className="h-4 w-4 text-primary" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Console Output</span>
                            </div>
                            <button onClick={() => setShowTerminal(false)} className="p-1 hover:bg-white/10 rounded text-muted-foreground">
                                <Minimize2 className="h-3 w-3" />
                            </button>
                        </div>
                        <pre className="flex-1 p-4 overflow-auto text-xs font-mono text-primary whitespace-pre-wrap selection:bg-primary/20">
                            {output || "Execution output will appear here..."}
                        </pre>
                    </div>
                )}
            </div>

            {
                !showTerminal && (
                    <button
                        onClick={() => setShowTerminal(true)}
                        className="fixed bottom-4 right-4 p-2 bg-primary rounded-lg shadow-lg hover:bg-primary/90 transition text-black"
                    >
                        <Maximize2 className="h-4 w-4" />
                    </button>
                )
            }
        </div >
    )
}
