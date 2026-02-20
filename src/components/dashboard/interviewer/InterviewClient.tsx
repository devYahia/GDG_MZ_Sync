"use client"

import { useState, useRef, useEffect } from "react"
import { AnimatePresence } from "motion/react"
import { toast } from "sonner"
import { SetupStep } from "./SetupStep"
import { ActiveSession } from "./ActiveSession"
import { InterviewFeedback } from "./InterviewFeedback"
import { getBackendBase } from "@/lib/api-config"
import { saveInterviewSession, saveSkillScores } from "@/app/(dashboard)/actions"

export type InterviewStage = "SETUP" | "ACTIVE" | "FEEDBACK"

export interface ChatMessage {
    role: "user" | "assistant"
    content: string
}

export function InterviewClient() {
    const [stage, setStage] = useState<InterviewStage>("SETUP")
    const [jobDescription, setJobDescription] = useState("")
    const [language, setLanguage] = useState<"en" | "ar">("en")

    // Config from setup
    const [config, setConfig] = useState<{ difficulty: number; focusAreas: string[]; role: string }>({
        difficulty: 1,
        focusAreas: [],
        role: "Frontend Engineer",
    })

    // Media State
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [isCameraOn, setIsCameraOn] = useState(false)
    const [isMicOn, setIsMicOn] = useState(false)

    // Interview State
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isAIProcessing, setIsAIProcessing] = useState(false)
    const [isAISpeaking, setIsAISpeaking] = useState(false)
    const [feedbackReport, setFeedbackReport] = useState<string | null>(null)
    const startTimeRef = useRef<number>(0)

    // Cleanup media on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop())
            }
        }
    }, [stream])

    async function startCamera() {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            setStream(mediaStream)
            setIsCameraOn(true)
            setIsMicOn(true)
            toast.success("Camera and microphone connected")
        } catch (err) {
            console.error("Media Error:", err)
            toast.error("Could not access camera/microphone. Please allow permissions.")
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop())
            setStream(null)
            setIsCameraOn(false)
            setIsMicOn(false)
        }
    }

    const handleStartInterview = async (setupConfig: { difficulty: number; focusAreas: string[]; role: string }) => {
        if (!jobDescription.trim()) {
            toast.error("Please enter a job description first")
            return
        }
        setConfig(setupConfig)
        startTimeRef.current = Date.now()
        await startCamera()
        setStage("ACTIVE")
    }

    const handleEndInterview = async () => {
        setStage("FEEDBACK")
        stopCamera()

        const durationMinutes = Math.round((Date.now() - startTimeRef.current) / 60000)

        try {
            setIsAIProcessing(true)
            const backendBase = getBackendBase()
            const res = await fetch(`${backendBase}/api/interview/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages,
                    job_description: jobDescription,
                    language,
                }),
            })

            if (!res.ok) throw new Error("Failed to generate feedback")

            const data = await res.json()
            setFeedbackReport(data.report)

            // T037: Save interview session + skill scores
            const scores: Record<string, number> = {}
            if (data.scores && typeof data.scores === "object") {
                Object.assign(scores, data.scores)
            }
            const overall = data.overall_rating ?? 70

            saveInterviewSession({
                role: config.role,
                difficulty: ["easy", "medium", "hard", "expert"][config.difficulty] ?? "medium",
                focusAreas: config.focusAreas,
                transcript: messages,
                feedbackScores: scores,
                overallRating: overall,
                durationMinutes,
            }).catch(() => { })

            saveSkillScores({
                sourceType: "interview_feedback",
                communication: scores.communication ?? 50,
                codeQuality: scores.code_quality ?? 50,
                requirementsGathering: scores.requirements ?? 50,
                technicalDepth: scores.technical ?? 50,
                problemSolving: scores.problem_solving ?? 50,
                professionalism: scores.professionalism ?? 50,
                overallScore: overall,
            }).catch(() => { })
        } catch (err) {
            console.error(err)
            toast.error("Failed to generate report")
        } finally {
            setIsAIProcessing(false)
        }
    }

    return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-y-auto overflow-x-hidden bg-background">
            <AnimatePresence mode="wait">
                {stage === "SETUP" && (
                    <SetupStep
                        jobDescription={jobDescription}
                        setJobDescription={setJobDescription}
                        language={language}
                        setLanguage={setLanguage}
                        onStart={handleStartInterview}
                    />
                )}

                {stage === "ACTIVE" && (
                    <ActiveSession
                        stream={stream}
                        messages={messages}
                        setMessages={setMessages}
                        jobDescription={jobDescription}
                        language={language}
                        isAISpeaking={isAISpeaking}
                        setIsAISpeaking={setIsAISpeaking}
                        isAIProcessing={isAIProcessing}
                        setIsAIProcessing={setIsAIProcessing}
                        onEnd={handleEndInterview}
                    />
                )}

                {stage === "FEEDBACK" && (
                    <InterviewFeedback
                        report={feedbackReport}
                        processing={isAIProcessing}
                        onRestart={() => setStage("SETUP")}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
