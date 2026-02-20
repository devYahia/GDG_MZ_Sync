"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export function useGeminiLive(language: "en" | "ar") {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connected, setConnected] = useState(false);
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    // Playback state
    const playQueueRef = useRef<Int16Array[]>([]);
    const nextPlayTimeRef = useRef<number>(0);
    const isPlayingRef = useRef(false);

    // We'll accumulate AI transcript parts here until the turn ends
    const currentAITurnRef = useRef<string>("");

    // Output audio config 
    const OUTPUT_SAMPLE_RATE = 24000;

    // --- Cleanup completely on unmount or disconnect ---
    const disconnect = useCallback(() => {
        setConnected(false);
        setIsListening(false);
        setIsAISpeaking(false);

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        if (workletNodeRef.current) {
            workletNodeRef.current.disconnect();
            workletNodeRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(t => t.stop());
            mediaStreamRef.current = null;
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }

        playQueueRef.current = [];
        isPlayingRef.current = false;
        currentAITurnRef.current = "";
    }, []);

    useEffect(() => {
        return () => disconnect();
    }, [disconnect]);


    // --- Audio Playback Engine (for AI output) ---
    const playAudioChunks = useCallback(() => {
        if (!audioCtxRef.current || playQueueRef.current.length === 0) {
            isPlayingRef.current = false;
            setIsAISpeaking(false);
            return;
        }

        isPlayingRef.current = true;
        setIsAISpeaking(true);

        const ctx = audioCtxRef.current;
        const chunk = playQueueRef.current.shift()!;

        // Convert Int16Array PCM to Float32Array for WebAudio
        const float32Data = new Float32Array(chunk.length);
        for (let i = 0; i < chunk.length; i++) {
            float32Data[i] = chunk[i] / 32768.0;
        }

        const buffer = ctx.createBuffer(1, float32Data.length, OUTPUT_SAMPLE_RATE);
        buffer.copyToChannel(float32Data, 0);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);

        // Schedule playback sequentially
        const currTime = ctx.currentTime;
        const startTime = Math.max(currTime, nextPlayTimeRef.current);

        source.start(startTime);
        nextPlayTimeRef.current = startTime + buffer.duration;

        source.onended = () => {
            // Trigger next chunk when this one finishes
            playAudioChunks();
        };
    }, []);


    // --- WebSocket Connection ---
    const startConnection = useCallback(async (jobDescription: string) => {
        try {
            // 1. Fetch short-lived token/WS URL from our backend
            const res = await fetch("/api/interview/live-token");
            if (!res.ok) {
                const errText = await res.text();
                console.error("Live Token Error:", res.status, errText);
                throw new Error("Failed to secure connection token: " + res.statusText);
            }

            const data = await res.json();
            const wsUrl = data.wsUrl;

            if (!wsUrl) {
                throw new Error("No WebSocket URL returned from token endpoint.");
            }

            // 2. Setup AudioContext immediately (requires user gesture)
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
                sampleRate: 16000 // Force 16kHz for input mic processing
            });
            audioCtxRef.current = ctx;
            nextPlayTimeRef.current = ctx.currentTime;

            // Load worklet
            await ctx.audioWorklet.addModule("/audio-processor.js");

            // 3. Setup WebSocket
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setConnected(true);

                // Initial Setup Message
                const voiceName = language === "ar" ? "Aoede" : "Aoede";

                const setupMessage = {
                    setup: {
                        model: "models/gemini-2.0-flash",
                        systemInstruction: {
                            parts: [{
                                text: `You are an expert technical interviewer evaluating a candidate for the role described below.
Job Description: ${jobDescription}.
Output Language: You MUST use ${language === "ar" ? "Arabic" : "English"} ONLY. Do not use markdown.
Guidelines: Be natural, brief, conversational, and evaluate their answers progressively.`
                            }]
                        },
                        generationConfig: {
                            responseModalities: ["AUDIO"],
                            speechConfig: {
                                voiceConfig: {
                                    prebuiltVoiceConfig: { voiceName }
                                }
                            }
                        }
                    }
                };

                ws.send(JSON.stringify(setupMessage));
            };

            ws.onmessage = (event) => {
                // Read Blob as text or JSON
                if (event.data instanceof Blob) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        handleServerMessage(JSON.parse(reader.result as string));
                    };
                    reader.readAsText(event.data);
                } else {
                    handleServerMessage(JSON.parse(event.data));
                }
            };

            ws.onerror = (e) => {
                console.error("Live API WebSocket Error:", e);
                toast.error("Live audio connection lost");
                disconnect();
            };

            ws.onclose = (e) => {
                console.warn("Live API WebSocket Closed:", e.code, e.reason);
                if (e.code !== 1000 && connected) {
                    toast.error("Live audio connection closed unexpectedly");
                }
                disconnect();
            };

            // 4. Request Mic permissions and attach Worklet
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const source = ctx.createMediaStreamSource(stream);
            const workletNode = new AudioWorkletNode(ctx, "pcm-processor");
            workletNodeRef.current = workletNode;

            workletNode.port.onmessage = (e) => {
                // e.data is an Int16Array of raw PCM audio
                // Only send to WS if we are "listening"
                if (wsRef.current?.readyState === WebSocket.OPEN && isListening) {
                    const base64Audio = arrayBufferToBase64(e.data);

                    wsRef.current.send(JSON.stringify({
                        realtimeInput: {
                            mediaChunks: [{
                                mimeType: "audio/pcm;rate=16000",
                                data: base64Audio
                            }]
                        }
                    }));
                }
            };

            source.connect(workletNode);
            // DO NOT connect workletNode to destination, or it plays back mic input

        } catch (error) {
            console.error("Setup error:", error);
            toast.error("Failed to start Live Audio. Ensure mic permissions are granted.");
            disconnect();
        }
    }, [language, disconnect, isListening]);


    // --- Handle Incoming Server Messages (Text & Audio) ---
    const handleServerMessage = (msg: any) => {
        if (!msg.serverContent) return;

        const content = msg.serverContent;

        // VAD (Voice Activity Detection) - User interrupted AI
        if (content.interrupted) {
            console.log("[Interrupted] - User spoke over AI");
            playQueueRef.current = []; // Clear current audio queue
            setIsAISpeaking(false);
            isPlayingRef.current = false;

            // Commit whatever text it had managed to say so far into chat history
            if (currentAITurnRef.current) {
                setMessages(prev => [...prev, { role: "assistant", content: currentAITurnRef.current }]);
                currentAITurnRef.current = "";
            }
            return;
        }

        if (content.modelTurn) {
            const parts = content.modelTurn.parts;

            for (const part of parts) {
                // 1. Accumulate Transcript Text
                if (part.text) {
                    currentAITurnRef.current += part.text;
                }

                // 2. Stream Audio PCM
                if (part.inlineData && part.inlineData.data) {
                    const base64 = part.inlineData.data;
                    const pcm16 = base64ToArrayBuffer(base64);
                    playQueueRef.current.push(new Int16Array(pcm16));

                    // If not currently playing, start the playback loop
                    if (!isPlayingRef.current) {
                        nextPlayTimeRef.current = audioCtxRef.current?.currentTime || 0;
                        playAudioChunks();
                    }
                }
            }
        }

        // Commit full response when turn completes
        if (content.turnComplete) {
            if (currentAITurnRef.current) {
                setMessages(prev => [...prev, { role: "assistant", content: currentAITurnRef.current }]);
                currentAITurnRef.current = "";
            }
        }
    };


    // --- Toggle Listening (Mic Mute/Unmute) ---
    const toggleListening = useCallback(() => {
        setIsListening(prev => {
            const next = !prev;
            if (next && wsRef.current?.readyState === WebSocket.OPEN) {
                // When unmuting, optionally trigger a client tick if necessary
                // But in realtimeInput mode, just resuming the worklet chunk transmission is enough
            }
            return next;
        });
    }, []);

    // --- Manual Text Fallback ---
    const sendManualText = useCallback((text: string) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        setMessages(prev => [...prev, { role: "user", content: text }]);

        wsRef.current.send(JSON.stringify({
            clientContent: {
                turns: [{
                    role: "user",
                    parts: [{ text }]
                }],
                turnComplete: true
            }
        }));
    }, []);


    // --- Utilities ---
    const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    const base64ToArrayBuffer = (base64: string) => {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    return {
        messages,
        setMessages, // Usually internal, but exposed if needed for session finalization
        connected,
        isAISpeaking,
        isListening,
        startConnection,
        disconnect,
        toggleListening,
        sendManualText
    };
}
