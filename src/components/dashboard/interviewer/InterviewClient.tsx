"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Mic, Video, VideoOff, MicOff, Settings, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { SetupStep } from "./SetupStep"
import { ActiveSession } from "./ActiveSession"
import { InterviewFeedback } from "./InterviewFeedback"

export type InterviewStage = "SETUP" | "ACTIVE" | "FEEDBACK"

export interface ChatMessage {
    role: "user" | "assistant"
    content: string
}

export function InterviewClient() {
    const [stage, setStage] = useState<InterviewStage>("SETUP")
    const [jobDescription, setJobDescription] = useState("")
    const [language, setLanguage] = useState<"en" | "ar">("en")

    // Media State
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [isCameraOn, setIsCameraOn] = useState(false)
    const [isMicOn, setIsMicOn] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    // Interview State
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isAIProcessing, setIsAIProcessing] = useState(false)
    const [isAISpeaking, setIsAISpeaking] = useState(false)
    const [feedbackReport, setFeedbackReport] = useState<string | null>(null)

    // Cleanup media on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [stream])

    async function startCamera() {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            })
            setStream(mediaStream)
            setIsCameraOn(true)
            setIsMicOn(true)

            // Wait for video element mapping in ActiveSession
            toast.success("Camera and microphone connected")
        } catch (err) {
            console.error("Media Error:", err)
            toast.error("Could not access camera/microphone. Please allow permissions.")
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
            setIsCameraOn(false)
            setIsMicOn(false)
        }
    }

    const handleStartInterview = async () => {
        if (!jobDescription.trim()) {
            toast.error("Please enter a job description first")
            return
        }
        await startCamera()
        setStage("ACTIVE")
    }

    const handleEndInterview = async () => {
        setStage("FEEDBACK")
        stopCamera()

        // Fetch feedback logic will trigger in the Feedback component
        try {
            setIsAIProcessing(true)
            const res = await fetch("http://127.0.0.1:8001/api/interview/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages,
                    job_description: jobDescription,
                    language
                })
            })

            if (!res.ok) throw new Error("Failed to generate feedback")

            const data = await res.json()
            setFeedbackReport(data.report)
        } catch (err) {
            console.error(err)
            toast.error("Failed to generate report")
        } finally {
            setIsAIProcessing(false)
        }
    }

    return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
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
