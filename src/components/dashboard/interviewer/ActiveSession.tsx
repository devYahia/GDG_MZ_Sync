"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
    Mic, MicOff, Video, VideoOff, X, MessageSquare,
    RotateCcw, Play, Pause, Volume2, VolumeX, Settings,
    Cpu, User, Send
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { ChatMessage } from "./InterviewClient"
import { getBackendBase } from "@/lib/api-config"

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
    // --- Refs ---
    const videoRef = useRef<HTMLVideoElement>(null)
    const recognitionRef = useRef<any>(null)
    const synthRef = useRef<SpeechSynthesis | null>(null)
    const lastAIResponseRef = useRef<string>("")
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // --- State ---
    const [transcript, setTranscript] = useState("")
    const [interimTranscript, setInterimTranscript] = useState("")
    const [isListening, setIsListening] = useState(false)
    const [shouldBeListening, setShouldBeListening] = useState(false)
    const [volume, setVolume] = useState(0) // 0-100
    const [audioAllowed, setAudioAllowed] = useState(false)
    const [sessionDuration, setSessionDuration] = useState(0)
    const [isMuted, setIsMuted] = useState(false)
    const [aiVolume, setAiVolume] = useState(1) // 0-1
    const [manualInput, setManualInput] = useState("")

    // --- Timer ---
    useEffect(() => {
        const interval = setInterval(() => {
            setSessionDuration(prev => prev + 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // --- Video Stream Setup ---
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream
        }
    }, [stream])

    // --- Audio Visualizer (Waveform) ---
    useEffect(() => {
        if (!stream || !canvasRef.current) return

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 64 // Lower for bar chart style
        source.connect(analyser)

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")

        if (!ctx) return

        let animationId: number

        const draw = () => {
            animationId = requestAnimationFrame(draw)
            analyser.getByteFrequencyData(dataArray)

            // Calculate volume for state
            const avg = dataArray.reduce((a, b) => a + b) / bufferLength
            setVolume(avg)

            // Draw Waveform bars
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const barWidth = (canvas.width / bufferLength) * 2.5
            let barHeight
            let x = 0

            // If AI is speaking, simulate waveform (since we can't easily capture synth output)
            if (isAISpeaking) {
                // Randomize slightly based on time
                const time = Date.now() / 100
                for (let i = 0; i < bufferLength; i++) {
                    barHeight = (Math.sin(i * 0.5 + time) * 50 + 50) * (aiVolume) // Scale by AI volume
                    ctx.fillStyle = `rgba(168, 85, 247, ${barHeight / 200})` // Purple
                    ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2)
                    x += barWidth + 1
                }
            } else {
                // User Mic Input
                for (let i = 0; i < bufferLength; i++) {
                    barHeight = (dataArray[i] / 255) * canvas.height

                    ctx.fillStyle = "rgba(168, 85, 247, 0.8)" // Glowy Purple
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

                    x += barWidth + 1
                }
            }
        }

        draw()

        return () => {
            cancelAnimationFrame(animationId)
            audioContext.close()
        }
    }, [stream, isAISpeaking, aiVolume])

    // --- Speech Recognition ---
    useEffect(() => {
        if (typeof window !== "undefined") {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition()
                recognition.continuous = true
                recognition.interimResults = true
                recognition.lang = language === "ar" ? "ar-EG" : "en-US"

                recognition.onstart = () => {
                    setIsListening(true)
                    // Auto-stop AI speech if user interrupts
                    if (window.speechSynthesis) {
                        window.speechSynthesis.cancel()
                        setIsAISpeaking(false)
                    }
                }

                recognition.onend = () => setIsListening(false)

                recognition.onresult = (event: any) => {
                    // Interrupt AI if speaking
                    if (window.speechSynthesis?.speaking) {
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
                        setTranscript(prev => `${prev} ${final}`)
                    }
                }
                recognitionRef.current = recognition
            }
            synthRef.current = window.speechSynthesis
        }
    }, [language])

    // --- Auto-Restart Logic ---
    useEffect(() => {
        if (!recognitionRef.current) return
        if (shouldBeListening && !isListening) {
            try { recognitionRef.current.start() } catch (e) { }
        } else if (!shouldBeListening && isListening) {
            recognitionRef.current.stop()
        }
    }, [shouldBeListening, isListening])


    // --- Speak Function ---
    const speak = (text: string) => {
        if (!synthRef.current || isMuted) return

        synthRef.current.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = language === "ar" ? "ar-EG" : "en-US"
        utterance.rate = 0.95 // Natural pace
        utterance.pitch = 1
        utterance.volume = aiVolume

        // Voice Selection Strategy
        const voices = synthRef.current.getVoices()
        const preferredVoice = voices.find(v => v.name.includes("Google") && v.lang.includes(language === "ar" ? "ar" : "en"))
            || voices.find(v => v.lang.includes(language === "ar" ? "ar" : "en"))

        if (preferredVoice) utterance.voice = preferredVoice

        utterance.onstart = () => setIsAISpeaking(true)
        utterance.onend = () => setIsAISpeaking(false)

        synthRef.current.speak(utterance)
    }

    // --- Toggle Listening/Mute ---
    const toggleMic = () => {
        if (shouldBeListening) {
            setShouldBeListening(false)
            setAudioAllowed(false)
        } else {
            setShouldBeListening(true)
            setAudioAllowed(true)
            // Initial greeting if empty
            if (messages.length === 0) handleSendMessage("", true)
        }
    }

    // --- Send Message ---
    const handleSendMessage = async (textOverride?: string, isInitial = false) => {
        const textToSend = textOverride !== undefined ? textOverride : (manualInput || transcript)

        if (!textToSend.trim() && !isInitial) return

        setIsAIProcessing(true)
        setTranscript("")
        setInterimTranscript("")
        setManualInput("")

        // Pause listening
        setShouldBeListening(false)

        const newHistory = isInitial ? [] : [...messages, { role: "user" as const, content: textToSend }]
        if (!isInitial) setMessages(newHistory)

        try {
            const imageBase64 = captureFrame()
            const backendBase = getBackendBase()
            const res = await fetch(`${backendBase}/api/interview/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newHistory,
                    job_description: jobDescription,
                    language,
                    image_base64: imageBase64
                })
            })

            if (!res.ok) throw new Error("Failed to fetch response")

            const data = await res.json()
            const aiReply = data.reply

            setMessages(prev => [...prev, { role: "assistant", content: aiReply }])
            lastAIResponseRef.current = aiReply
            speak(aiReply)

        } catch (err) {
            toast.error("Connection failed")
        } finally {
            setIsAIProcessing(false)
            // Resume listening if we were allowed before, unless user manually stopped
            if (audioAllowed) setShouldBeListening(true)
        }
    }

    const captureFrame = () => {
        if (!videoRef.current) return null
        const canvas = document.createElement("canvas")
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0)
        return canvas.toDataURL("image/jpeg").split(",")[1]
    }

    // Auto-scroll transcript
    useEffect(() => {
        const viewport = document.getElementById("transcript-viewport")
        if (viewport) viewport.scrollTop = viewport.scrollHeight
    }, [messages, interimTranscript])


    return (
        <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">

            {/* --- LEFT PANE: Avatar & Video --- */}
            <div className="w-[50%] flex flex-col items-center justify-between border-r border-border bg-gradient-to-br from-card/50 via-background to-background relative p-6">

                {/* Header Overlay */}
                <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
                    <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary px-3 py-1 text-xs uppercase tracking-wider">
                        Live Session
                    </Badge>
                    <span className="text-sm font-mono text-muted-foreground">{formatTime(sessionDuration)}</span>
                </div>

                {/* End Session Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-6 right-6 z-20 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground"
                    onClick={onEnd}
                >
                    <X className="mr-2 h-4 w-4" />
                    End
                </Button>

                {/* Avatar Centerpiece */}
                <div className="flex-1 flex flex-col items-center justify-center relative w-full">
                    {/* The Sphere */}
                    <motion.div
                        animate={{
                            scale: isAISpeaking ? [1, 1.05, 1] : [1, 1.02, 1],
                            filter: isAISpeaking ? "brightness(1.3) drop-shadow(0 0 20px rgba(168,85,247,0.4))" : "brightness(1) drop-shadow(0 0 10px rgba(168,85,247,0.1))",
                        }}
                        transition={{ duration: isAISpeaking ? 0.4 : 3, repeat: Infinity, ease: "easeInOut" }}
                        className="h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative z-10 flex items-center justify-center"
                    >
                        {/* Shine */}
                        <div className="absolute top-0 right-0 w-full h-full rounded-full bg-gradient-to-bl from-white/30 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 rounded-full border border-white/10" />
                    </motion.div>

                    {/* Status Text */}
                    <div className="mt-8 text-center h-8">
                        {isAISpeaking ? (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-primary font-medium animate-pulse">
                                AI Interviewer is speaking...
                            </motion.p>
                        ) : isAIProcessing ? (
                            <p className="text-muted-foreground animate-pulse">Thinking...</p>
                        ) : isListening ? (
                            <p className="text-emerald-500 font-medium">Listening to you...</p>
                        ) : (
                            <p className="text-muted-foreground">Mic paused</p>
                        )}
                    </div>
                </div>

                {/* Bottom Control Bar */}
                <div className="w-full max-w-md bg-card/50 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col gap-4 shadow-xl">

                    {/* Waveform Canvas */}
                    <div className="h-16 w-full bg-black/20 rounded-lg overflow-hidden relative">
                        <canvas ref={canvasRef} width={400} height={64} className="w-full h-full" />
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between gap-4">
                        {/* Mic Control */}
                        <div className="flex items-center gap-2">
                            <Button
                                size="icon"
                                variant={shouldBeListening ? "destructive" : "secondary"}
                                onClick={toggleMic}
                                className={cn("h-12 w-12 rounded-full transition-all shadow-lg", shouldBeListening && "animate-pulse")}
                            >
                                {shouldBeListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                            </Button>
                            {/* User Video PiP */}
                            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-border bg-black">
                                <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover scale-x-[-1]" />
                            </div>
                        </div>

                        {/* Session Controls */}
                        <div className="flex items-center gap-2">
                            {/* AI Volume */}
                            <div className="flex items-center gap-2 bg-secondary/50 rounded-full px-3 py-1.5">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={() => setAiVolume(v => v === 0 ? 1 : 0)}
                                >
                                    {aiVolume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                </Button>
                                <Slider
                                    value={[aiVolume]}
                                    max={1}
                                    step={0.1}
                                    onValueChange={([v]) => setAiVolume(v)}
                                    className="w-20"
                                />
                            </div>
                        </div>

                        {/* Send Trigger (Mobile/Manual) */}
                        <Button
                            size="icon"
                            className="h-12 w-12 rounded-full"
                            onClick={() => handleSendMessage()}
                            disabled={isAIProcessing || (!transcript && !manualInput)}
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- RIGHT PANE: Transcript & Input --- */}
            <div className="w-[50%] flex flex-col bg-card/10 backdrop-blur-sm border-l border-white/5">
                <div className="p-4 border-b border-border flex items-center justify-between bg-card/20">
                    <h3 className="font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        Transcript
                    </h3>
                    <Badge variant="outline" className="text-xs font-mono">{messages.length} messages</Badge>
                </div>

                {/* Messages List using div overflow instead of ScrollArea to ensure standard behavior if component missing */}
                <div id="transcript-viewport" className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
                            <Cpu className="h-12 w-12" />
                            <p>Conversation will appear here...</p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex gap-4 max-w-[90%]",
                                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                            )}
                        >
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                                msg.role === "user" ? "bg-primary/20 text-primary" : "bg-purple-500/20 text-purple-500"
                            )}>
                                {msg.role === "user" ? <User className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
                            </div>

                            <div className={cn(
                                "rounded-2xl p-4 text-sm leading-relaxed",
                                msg.role === "user"
                                    ? "bg-primary/10 text-foreground rounded-tr-none border border-primary/20"
                                    : "bg-card border border-border rounded-tl-none shadow-sm"
                            )}>
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}

                    {/* Interim Result */}
                    {(transcript || interimTranscript) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-4 ml-auto flex-row-reverse max-w-[90%]"
                        >
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary animate-pulse">
                                <User className="h-4 w-4" />
                            </div>
                            <div className="rounded-2xl p-4 text-sm bg-primary/5 border border-dashed border-primary/20 text-muted-foreground rounded-tr-none">
                                {transcript} <span className="opacity-50">{interimTranscript}</span>
                                <span className="inline-block w-2 H-4 bg-primary align-middle ml-1 animate-pulse">|</span>
                            </div>
                        </motion.div>
                    )}

                    {isAIProcessing && (
                        <div className="flex gap-4 max-w-[90%]">
                            <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 animate-spin">
                                <RotateCcw className="h-4 w-4" />
                            </div>
                            <div className="flex gap-1 items-center h-10 px-4 rounded-full bg-card border border-border">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border bg-card/30 backdrop-blur-md">
                    <div className="relative">
                        <Textarea
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSendMessage()
                                }
                            }}
                            placeholder={shouldBeListening ? "Typing disabled while Mic is on..." : "Type your response here..."}
                            disabled={shouldBeListening}
                            className="min-h-[50px] max-h-[150px] pr-12 bg-background/50 border-white/10 resize-none focus:ring-primary/20"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute bottom-2 right-2 h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleSendMessage()}
                            disabled={!manualInput.trim()}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
