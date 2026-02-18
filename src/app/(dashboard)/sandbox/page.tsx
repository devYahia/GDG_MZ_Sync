"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, FileCode, Download, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"

interface ReviewFile {
    content: string
    language: string
    size: number
    lines: number
}

interface ReviewData {
    files: Record<string, ReviewFile>
    reviews: any[]
    score: number
    report?: string
}

export default function SandboxPage() {
    const searchParams = useSearchParams()
    const jobId = searchParams.get("job")

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [reviewData, setReviewData] = useState<ReviewData | null>(null)
    const [activeFile, setActiveFile] = useState("")

    useEffect(() => {
        if (!jobId) {
            setError("No review job ID provided")
            setLoading(false)
            return
        }

        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"
        // Fetch review results
        fetch(`${apiBase}/review/${jobId}/files`)
            .then(res => res.json())
            .then(data => {
                setReviewData(data)
                const firstFile = Object.keys(data.files || {})[0]
                if (firstFile) setActiveFile(firstFile)
                setLoading(false)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [jobId])

    const downloadReport = () => {
        if (!reviewData?.report) return
        const blob = new Blob([reviewData.report], { type: "text/markdown" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "code_review_report.md"
        a.click()
    }

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-400">Loading review sandbox...</p>
                </div>
            </div>
        )
    }

    if (error || !reviewData) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black">
                <div className="text-center">
                    <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-gray-400">{error || "Failed to load review data"}</p>
                </div>
            </div>
        )
    }

    const files = reviewData.files || {}
    const fileList = Object.keys(files)

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100">
            {/* Header */}
            <div className="h-16 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                        <FileCode className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Code Review Sandbox
                        </h1>
                        <p className="text-xs text-gray-500">{fileList.length} files reviewed • Score: {reviewData.score?.toFixed(1) || "N/A"}/10</p>
                    </div>
                </div>
                <Button onClick={downloadReport} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* File List */}
                <div className="w-64 bg-black/20 border-r border-white/10 overflow-y-auto">
                    <div className="p-4 border-b border-white/10">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase">Reviewed Files</h2>
                    </div>
                    <div className="p-2">
                        {fileList.map(path => (
                            <button
                                key={path}
                                onClick={() => setActiveFile(path)}
                                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition ${activeFile === path
                                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                    : "hover:bg-white/5 text-gray-300"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <FileCode className="h-4 w-4 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium truncate">{path.split("/").pop()}</div>
                                        <div className="text-xs text-gray-500">{files[path].lines} lines</div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Code Viewer */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {activeFile && (
                        <>
                            <div className="bg-black/40 border-b border-white/10 px-6 py-3">
                                <h3 className="text-sm font-semibold text-gray-200">{activeFile}</h3>
                                <p className="text-xs text-gray-500">
                                    {files[activeFile].language} • {files[activeFile].size} bytes
                                </p>
                            </div>
                            <div className="flex-1 overflow-auto">
                                <pre className="p-6 text-sm font-mono text-gray-300">
                                    <code>{files[activeFile].content}</code>
                                </pre>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
