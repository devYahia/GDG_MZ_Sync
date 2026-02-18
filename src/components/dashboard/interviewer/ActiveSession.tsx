"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Mic, MicOff, Video, VideoOff, X, MessageSquare, RotateCcw } from "lucide-react"
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
    const [shouldBeListening, setShouldBeListening] = useState(false) // Track intended state

    // Audio Context State
    const [audioContextReady, setAudioContextReady] = useState(false)
    const [volume, setVolume] = useState(0)
    const [interimTranscript, setInterimTranscript] = useState("")

    // Initialize Video
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream
        }

        // Audio Visualizer
        if (stream) {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            const source = audioContext.createMediaStreamSource(stream)
            const analyser = audioContext.createAnalyser()
            analyser.fftSize = 256
            source.connect(analyser)

            const dataArray = new Uint8Array(analyser.frequencyBinCount)

            const updateVolume = () => {
                analyser.getByteFrequencyData(dataArray)
                const avg = dataArray.reduce((a, b) => a + b) / dataArray.length
                setVolume(avg) // 0 to 255
                requestAnimationFrame(updateVolume)
            }
            updateVolume()

            return () => {
                audioContext.close()
            }
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
                    // Auto-restart ONLY if we intended to facilitate continuous listening
                    // checking a ref or state would be better here to avoid loops
                }

                recognition.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error)
                    setIsListening(false)
                    if (event.error !== "aborted" && event.error !== "no-speech") {
                        toast.error(`Mic Error: ${event.error}`)
                    }
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

                    setInterimTranscript(interim)

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

    // Auto-restart logic based on "shouldBeListening"
    useEffect(() => {
        if (!recognitionRef.current) return

        if (shouldBeListening && !isListening) {
            try {
                recognitionRef.current.start()
            } catch (e) {
                // ignore if already started
            }
        } else if (!shouldBeListening && isListening) {
            recognitionRef.current.stop()
        }
    }, [shouldBeListening, isListening])


    const startSession = () => {
        setAudioContextReady(true)
        setShouldBeListening(true) // Start listening
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
        setInterimTranscript("")

        // Stop listening while processing to avoid echoes/loops
        if (shouldBeListening) {
            setShouldBeListening(false) // Temporarily stop
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
            setShouldBeListening(true) // Resume listening automatically
        }
    }

    const toggleListening = () => {
        setShouldBeListening(prev => !prev)
    }

    return (
        <motion.div
            className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-between p-4 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Context / Header */}
            <div className="absolute top-4 left-4 z-20 flex cursor-pointer items-center gap-2 rounded-full bg-background/60 px-4 py-2 text-sm text-foreground/80 backdrop-blur-md hover:bg-background/80 border border-border" onClick={onEnd}>
                <X className="h-4 w-4" />
                <span>End Session</span>
            </div>

            {/* Avatar Centerpiece */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl relative">

                {/* The Flowing Sphere - Simplified Visuals */}
                <div className="relative flex items-center justify-center">

                    {/* Clean Gradient Glow instead of blobs */}
                    <div className={cn(
                        "absolute inset-0 bg-primary/20 blur-[100px] rounded-full transition-all duration-1000",
                        isAISpeaking ? "scale-150 opacity-40" : "scale-100 opacity-20"
                    )} />

                    {/* Core Sphere */}
                    <motion.div
                        animate={{
                            scale: isAISpeaking ? [1, 1.1, 1] : [1, 1.02, 1],
                            filter: isAISpeaking ? "brightness(1.2)" : "brightness(1)",
                        }}
                        transition={{
                            duration: isAISpeaking ? 0.5 : 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={cn(
                            "h-56 w-56 rounded-full bg-gradient-to-br from-primary via-indigo-500 to-purple-600 shadow-2xl shadow-primary/30",
                            "relative z-10 flex items-center justify-center"
                        )}
                    >
                        {/* Simple reflection */}
                        <div className="absolute top-0 right-0 h-full w-full rounded-full bg-gradient-to-bl from-white/20 to-transparent" />
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
                            className="mt-12 max-w-2xl text-center z-10"
                        >
                            <p className="text-xl md:text-2xl font-medium leading-relaxed text-foreground/90 drop-shadow-sm">
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
                    "w-full rounded-xl bg-card/60 p-4 backdrop-blur-md border border-border/50 transition-all text-center min-h-[60px] flex items-center justify-center flex-col gap-2",
                    (transcript || interimTranscript) ? "opacity-100" : "opacity-0 h-0 p-0 overflow-hidden"
                )}>
                    <p className="text-foreground/90 font-medium">{transcript} <span className="text-muted-foreground">{interimTranscript}</span></p>
                    {shouldBeListening && volume > 10 && (
                        <div className="flex gap-1 h-1 items-end justify-center">
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1 bg-green-500 rounded-full"
                                    animate={{ height: Math.min(20, Math.max(4, volume / (2 * (i + 1)))) }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Control Bar */}
                <div className="flex items-center gap-6">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-border bg-black/50 shadow-lg">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="h-full w-full object-cover transform scale-x-[-1]"
                        />
                    </div>

                    <div className="relative">
                        {shouldBeListening && (
                            <span className={cn(
                                "absolute inset-0 animate-ping rounded-full opacity-75",
                                volume > 20 ? "bg-green-500" : "bg-red-500"
                            )}></span>
                        )}
                        <Button
                            size="icon"
                            variant={shouldBeListening ? "destructive" : "secondary"}
                            className={cn(
                                "relative h-16 w-16 rounded-full shadow-xl transition-all duration-300 z-10",
                                shouldBeListening ? "bg-red-500 hover:bg-red-600 text-white" : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                            )}
                            onClick={toggleListening}
                        >
                            {shouldBeListening ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                        </Button>
                        {/* Audio Bar Overlay */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap">
                            Vol: {Math.round(volume)}
                        </div>
                    </div>

                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-12 w-12 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        onClick={() => handleSendMessage()}
                        disabled={!transcript.trim() || isAIProcessing}
                    >
                        <MessageSquare className="h-5 w-5" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                    {shouldBeListening ? "Listening..." : "Mic Muted"}
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
