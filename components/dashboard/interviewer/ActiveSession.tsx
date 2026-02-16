"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Mic, MicOff, Video, VideoOff, X, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
// import { useSpeechRecognition } from "@/hooks/useSpeechRecognition" // We'll implement inline for simplicity or hook if needed
import { toast } from "sonner"
import type { ChatMessage } from "./InterviewClient"

interface ActiveSessionProps {
    stream: MediaStream | null
    messages: ChatMessage[]
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
    jobDescription: string
    language: "en" | "ar"
    isAISpeaking: boolean
    setIsAISpeaking: (v: boolean) => void
    isAIProcessing: boolean
    setIsAIProcessing: (v: boolean) => void
    onEnd: () => void
}

export function ActiveSession({
    stream,
    messages,
    setMessages,
    jobDescription,
    language,
    isAISpeaking,
    setIsAISpeaking,
    isAIProcessing,
    setIsAIProcessing,
    onEnd
}: ActiveSessionProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [transcript, setTranscript] = useState("")
    const [isListening, setIsListening] = useState(false)
    const recognitionRef = useRef<any>(null)
    const synthRef = useRef<SpeechSynthesis | null>(null)
    const lastAIResponseRef = useRef<string>("")

    // Audio Context State
    const [audioContextReady, setAudioContextReady] = useState(false)

    // Initialize Video
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream
        }
    }, [stream])

    // Initialize Speech Recognition & Synth
    useEffect(() => {
        if (typeof window !== "undefined") {
            // @ts-ignore
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition()
                recognition.continuous = true
                recognition.interimResults = true
                recognition.lang = language === "ar" ? "ar-EG" : "en-US"

                recognition.onstart = () => {
                    console.log("Speech recognition started")
                    setIsListening(true)
                    // Interruption: Stop AI speech when user starts speaking
                    if (window.speechSynthesis) {
                        window.speechSynthesis.cancel()
                        setIsAISpeaking(false)
                    }
                }

                recognition.onend = () => {
                    console.log("Speech recognition ended")
                    setIsListening(false)
                    // Auto-restart if we didn't explicitly stop it (and assuming we want continuous)
                    // logic to be added if needed, but for now let's rely on button or re-click
                }

                recognition.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error)
                    setIsListening(false)
                    toast.error(`Mic Error: ${event.error}`)
                }

                recognition.onresult = (event: any) => {
                    // Interruption: Double check cancellation
                    if (window.speechSynthesis && window.speechSynthesis.speaking) {
                        window.speechSynthesis.cancel()
                        setIsAISpeaking(false)
                    }

                    let interim = ""
                    let final = ""
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            final += event.results[i][0].transcript
                        } else {
                            interim += event.results[i][0].transcript
                        }
                    }
                    if (final) {
                        setTranscript(prev => {
                            const newVal = prev ? `${prev} ${final}` : final
                            return newVal
                        })
                    }
                }

                recognitionRef.current = recognition
            }

            synthRef.current = window.speechSynthesis
        }
    }, [language])

    const startSession = () => {
        setAudioContextReady(true)
        // Trigger initial greeting if empty
        if (messages.length === 0) {
            handleSendMessage("", true)
        }
    }

    const captureFrame = () => {
        if (!videoRef.current) return null
        const canvas = document.createElement("canvas")
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(videoRef.current, 0, 0)
        return canvas.toDataURL("image/jpeg").split(",")[1] // base64
    }

    const speak = (text: string) => {
        if (!synthRef.current) return

        // Cancel previous
        synthRef.current.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = language === "ar" ? "ar-EG" : "en-US"

        // Improved Voice Selection
        const voices = synthRef.current.getVoices()
        // Priority: Google -> Microsoft -> any matching lang
        const preferredVoice = voices.find(v => v.lang.includes(language === "ar" ? "ar" : "en") && v.name.includes("Google"))
            || voices.find(v => v.lang.includes(language === "ar" ? "ar" : "en") && v.name.includes("Microsoft"))
            || voices.find(v => v.lang.includes(language === "ar" ? "ar" : "en"))

        if (preferredVoice) utterance.voice = preferredVoice

        utterance.pitch = 1
        utterance.rate = 1

        utterance.onstart = () => setIsAISpeaking(true)
        utterance.onend = () => setIsAISpeaking(false)

        synthRef.current.speak(utterance)
    }

    const handleSendMessage = async (textOverride?: string, isInitial = false) => {
        const textToSend = textOverride !== undefined ? textOverride : transcript
        if (!textToSend.trim() && !isInitial) return

        setIsAIProcessing(true)
        setTranscript("") // Clear input

        // Stop listening while processing to avoid echoes/loops
        if (isListening) {
            recognitionRef.current?.stop()
        }

        // Add user message to history (unless initial trigger)
        const newHistory = isInitial ? [] : [...messages, { role: "user" as const, content: textToSend }]
        if (!isInitial) setMessages(newHistory)

        try {
            // Optional: Capture frame every few turns or always? 
            // Let's capture active frame
            const imageBase64 = captureFrame()

            const res = await fetch("http://127.0.0.1:8001/api/interview/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newHistory,
                    job_description: jobDescription,
                    language,
                    image_base64: imageBase64 // Send vision!
                })
            })

            if (!res.ok) throw new Error("Failed to fetch response")

            const data = await res.json()
            const aiReply = data.reply

            setMessages(prev => [...prev, { role: "assistant", content: aiReply }])
            lastAIResponseRef.current = aiReply
            speak(aiReply)

        } catch (err) {
            console.error(err)
            toast.error("Failed to connect to Interviewer")
        } finally {
            setIsAIProcessing(false)
        }
    }

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop()
        } else {
            recognitionRef.current?.start()
        }
    }

    return (
        <motion.div
            className="flex h-full w-full flex-col items-center justify-between p-4 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Context / Header */}
            <div className="absolute top-4 left-4 z-10 flex cursor-pointer items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-sm text-white/70 backdrop-blur-md hover:bg-black/60" onClick={onEnd}>
                <X className="h-4 w-4" />
                <span>End Session</span>
            </div>

            {/* Avatar Centerpiece */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl relative">

                {/* The Flowing Sphere */}
                <div className="relative flex items-center justify-center">

                    {/* Ambient Background Pulse */}
                    <motion.div
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 0.1, 0.3],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute h-64 w-64 rounded-full bg-primary/20 blur-3xl"
                    />

                    {/* Core Sphere */}
                    <motion.div
                        animate={{
                            scale: isAISpeaking ? [1, 1.15, 1] : [1, 1.05, 1],
                            borderRadius: isAISpeaking
                                ? ["50% 50% 50% 50%", "30% 70% 70% 30%", "50% 50% 50% 50%", "40% 60% 60% 40%"]
                                : ["50%", "45% 55% 55% 45%", "50%", "55% 45% 45% 55%"],
                            filter: isAISpeaking ? "brightness(1.4) hue-rotate(15deg)" : "brightness(1) hue-rotate(0deg)",
                            rotate: isAISpeaking ? [0, 10, -10, 0] : [0, 5, -5, 0]
                        }}
                        transition={{
                            duration: isAISpeaking ? 3 : 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={cn(
                            "h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 blur-md shadow-[0_0_100px_-20px_rgba(168,85,247,0.6)]",
                            "relative z-10"
                        )}
                    >
                        {/* Inner fluid effect overlay (simulation) */}
                        <div className="absolute inset-0 rounded-full bg-white opacity-20 mix-blend-overlay" />
                    </motion.div>

                    {/* Orbiting Particles */}
                    <Particles active={isAISpeaking} />
                </div>

                {/* Start Overlay */}
                {!audioContextReady && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <Button size="lg" onClick={startSession} className="text-lg px-8 py-6 rounded-full shadow-2xl animate-bounce">
                            Start Interview
                        </Button>
                    </div>
                )}

                {/* AI Captions */}
                <AnimatePresence mode="wait">
                    {lastAIResponseRef.current && (
                        <motion.div
                            key={lastAIResponseRef.current}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-12 max-w-2xl text-center"
                        >
                            <p className="text-xl md:text-2xl font-medium leading-relaxed text-white/90 drop-shadow-md">
                                "{lastAIResponseRef.current}"
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* User Controls & Camera */}
            <div className="w-full max-w-3xl flex flex-col items-center gap-6 z-10 pb-4">

                {/* Transcript Preview */}
                <div className={cn(
                    "w-full rounded-xl bg-black/40 p-4 backdrop-blur-md border border-white/10 transition-all text-center",
                    transcript ? "opacity-100" : "opacity-0 h-0 p-0 overflow-hidden"
                )}>
                    <p className="text-white/80">{transcript}</p>
                </div>

                {/* Control Bar */}
                <div className="flex items-center gap-6">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white/20 bg-black/50 shadow-lg">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="h-full w-full object-cover transform scale-x-[-1]"
                        />
                    </div>

                    <div className="relative">
                        {isListening && (
                            <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75"></span>
                        )}
                        <Button
                            size="icon"
                            variant={isListening ? "default" : "secondary"}
                            className={cn(
                                "relative h-16 w-16 rounded-full shadow-xl transition-all duration-300 z-10",
                                isListening ? "bg-red-500 hover:bg-red-600" : "bg-white hover:bg-gray-100"
                            )}
                            onClick={toggleListening}
                        >
                            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6 text-black" />}
                        </Button>
                    </div>

                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20"
                        onClick={() => handleSendMessage()}
                        disabled={!transcript.trim() || isAIProcessing}
                    >
                        <MessageSquare className="h-5 w-5" />
                    </Button>
                </div>
                <p className="text-xs text-white/40 uppercase tracking-widest font-medium">
                    {isListening ? "Listening..." : "Tap mic to speak"}
                </p>
            </div>
        </motion.div>
    )
}

function Particles({ active }: { active: boolean }) {
    // Generate some random particles
    return (
        <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white/40 rounded-full blur-[1px]"
                    style={{
                        height: Math.random() * 8 + 4,
                        width: Math.random() * 8 + 4,
                        left: "50%",
                        top: "50%",
                    }}
                    animate={{
                        x: [0, (Math.random() - 0.5) * 300],
                        y: [0, (Math.random() - 0.5) * 300],
                        opacity: [0, 1, 0],
                        scale: active ? [1, 1.5, 0] : [1, 1, 0]
                    }}
                    transition={{
                        duration: active ? 2 + Math.random() : 4 + Math.random(),
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "easeOut"
                    }}
                />
            ))}
        </div>
    )
}
