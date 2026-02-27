"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
    Bot,
    AlertCircle,
    Code,
    Send,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Loader2,
    Eye,
    AlertTriangle,
    X,
    CheckCircle,
    FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import CodingEditor from "@/components/candidate/coding-editor"
import FaceMeshOverlay from "@/components/candidate/face-mesh-overlay"
import { useProctoring } from "@/lib/hooks/use-proctoring"
import { useFaceTracking, type FaceTrackingViolation } from "@/lib/hooks/use-face-tracking"
import { motion, AnimatePresence } from "framer-motion"

// ── Types ────────────────────────────────────────────
interface AiInterviewProps {
    onEnd: () => void
    resumeSummary?: string
    jobTitle?: string
    sessionId?: string
}

interface TranscriptEntry {
    role: "ai" | "user" | "system"
    text: string
    timestamp: number
}

interface CodingProblem {
    title: string
    description: string
    starter_code: string
    language: string
}

type InterviewPhase = "prejoin" | "connecting" | "interview" | "coding" | "complete"
type IntegrityLevel = "green" | "yellow" | "red"

// ── Constants ────────────────────────────────────────
const BACKEND_WS_URL = process.env.NEXT_PUBLIC_BACKEND_WS_URL || "ws://localhost:8000"
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
const AUDIO_SAMPLE_RATE = 16000  // 16kHz for Gemini input
const AUDIO_CHUNK_MS = 100       // Send audio every 100ms
const VISION_INTERVAL_MS = 10000 // Send frame to Gemini Vision every 10s

export function AiInterview({
    onEnd,
    resumeSummary = "",
    jobTitle = "Software Engineer",
    sessionId = `session_${Date.now()}`,
}: AiInterviewProps) {
    // ── State ────────────────────────────────────────
    const [phase, setPhase] = useState<InterviewPhase>("prejoin")
    const [micOn, setMicOn] = useState(false)
    const [camOn, setCamOn] = useState(false)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [permissionError, setPermissionError] = useState<string | null>(null)
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
    const [isAiSpeaking, setIsAiSpeaking] = useState(false)
    const [integrityLevel, setIntegrityLevel] = useState<IntegrityLevel>("green")
    const [violationCount, setViolationCount] = useState(0)
    const [codingProblem, setCodingProblem] = useState<CodingProblem | null>(null)
    const [candidateCode, setCandidateCode] = useState("")
    const [codingSubmitted, setCodingSubmitted] = useState(false)
    const [warningPopup, setWarningPopup] = useState<{ message: string; severity: string } | null>(null)
    const [reportId, setReportId] = useState<string | null>(null)
    const [reportGenerating, setReportGenerating] = useState(false)
    const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // ── Refs ─────────────────────────────────────────
    const previewVideoRef = useRef<HTMLVideoElement>(null)
    const liveVideoRef = useRef<HTMLVideoElement>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const processorRef = useRef<ScriptProcessorNode | null>(null)
    const playbackContextRef = useRef<AudioContext | null>(null)
    const transcriptEndRef = useRef<HTMLDivElement>(null)
    const visionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const nextPlayTimeRef = useRef<number>(0)

    // ── Proctoring Hook ──────────────────────────────
    const handleViolation = useCallback((event: { type: string; timestamp: number; message: string }) => {
        if (phase !== "interview" && phase !== "coding") return

        setViolationCount((prev) => {
            const newCount = prev + 1
            if (newCount >= 5) setIntegrityLevel("red")
            else if (newCount >= 2) setIntegrityLevel("yellow")
            return newCount
        })

        // Send violation to backend
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "proctoring_event",
                event: {
                    ...event,
                    source: "browser",
                    severity: event.type === "fullscreen" ? "high" : "medium",
                },
            }))
        }

        // Add to transcript as system message
        setTranscript((prev) => [...prev, {
            role: "system",
            text: `⚠️ Proctoring alert: ${event.message}`,
            timestamp: Date.now(),
        }])
    }, [phase])

    // ── Face Tracking Violation Handler ───────────────
    const handleFaceTrackingViolation = useCallback((violation: FaceTrackingViolation) => {
        if (phase !== "interview" && phase !== "coding") return

        // Show warning popup
        setWarningPopup({ message: violation.message, severity: violation.severity })
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
        warningTimeoutRef.current = setTimeout(() => setWarningPopup(null), 4000)

        setViolationCount((prev) => {
            const newCount = prev + 1
            if (newCount >= 5) setIntegrityLevel("red")
            else if (newCount >= 2) setIntegrityLevel("yellow")
            return newCount
        })

        // Send to backend
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "proctoring_event",
                event: {
                    type: violation.subtype,
                    source: "mediapipe",
                    severity: violation.severity,
                    message: violation.message,
                    timestamp: violation.timestamp,
                },
            }))
        }

        // Add to transcript
        setTranscript((prev) => [...prev, {
            role: "system",
            text: `🔍 Face tracking: ${violation.message}`,
            timestamp: Date.now(),
        }])
    }, [phase])

    // Only activate proctoring during interview/coding phases
    const isInterviewActive = phase === "interview" || phase === "coding"
    useProctoring({
        enabled: isInterviewActive,
        onViolation: handleViolation,
    })

    // ── Face Tracking Hook ───────────────────────────
    const faceTracking = useFaceTracking({
        enabled: isInterviewActive && camOn,
        videoRef: liveVideoRef,
        onViolation: handleFaceTrackingViolation,
    })

    // ── Auto-scroll transcript ───────────────────────
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [transcript])

    // ── Request media ────────────────────────────────
    const requestMedia = useCallback(async () => {
        try {
            setPermissionError(null)
            const s = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: {
                    sampleRate: AUDIO_SAMPLE_RATE,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            })
            setStream((prev) => {
                prev?.getTracks().forEach((t) => t.stop())
                return s
            })
            setCamOn(true)
            setMicOn(true)
        } catch (err: any) {
            if (err.name === "NotAllowedError") {
                setPermissionError("Camera/mic permission denied. Please allow access in your browser settings.")
            } else if (err.name === "NotFoundError") {
                setPermissionError("No camera or microphone found. Please connect a device.")
            } else {
                setPermissionError(`Media error: ${err.message}`)
            }
        }
    }, [])

    // ── Auto-request on mount ────────────────────────
    useEffect(() => {
        requestMedia()
        return () => {
            setStream((prev) => {
                prev?.getTracks().forEach((t) => t.stop())
                return null
            })
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Attach stream to video elements ──────────────
    useEffect(() => {
        if (stream) {
            if (previewVideoRef.current) previewVideoRef.current.srcObject = stream
            if (liveVideoRef.current) liveVideoRef.current.srcObject = stream
        }
    }, [stream])

    useEffect(() => {
        if (stream) {
            const timer = setTimeout(() => {
                if (phase === "prejoin" && previewVideoRef.current) {
                    previewVideoRef.current.srcObject = stream
                }
                if (phase !== "prejoin" && liveVideoRef.current) {
                    liveVideoRef.current.srcObject = stream
                }
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [phase, stream])

    // ── Audio Processing: Capture mic → PCM → base64 → WebSocket ──
    const startAudioCapture = useCallback(() => {
        if (!stream) return

        const audioCtx = new AudioContext({ sampleRate: AUDIO_SAMPLE_RATE })
        audioContextRef.current = audioCtx

        const source = audioCtx.createMediaStreamSource(stream)
        // Buffer size 4096 at 16kHz ≈ 256ms chunks
        const processor = audioCtx.createScriptProcessor(4096, 1, 1)
        processorRef.current = processor

        processor.onaudioprocess = (e) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
            if (!micOn) return

            const inputData = e.inputBuffer.getChannelData(0)
            // Convert Float32 [-1, 1] to Int16 PCM
            const pcm16 = new Int16Array(inputData.length)
            for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]))
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
            }

            // Encode as base64
            const bytes = new Uint8Array(pcm16.buffer)
            let binary = ""
            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i])
            }
            const base64 = btoa(binary)

            wsRef.current.send(JSON.stringify({
                type: "audio",
                data: base64,
            }))
        }

        source.connect(processor)
        processor.connect(audioCtx.destination)
    }, [stream, micOn])

    // ── Audio Playback: base64 PCM from Gemini → Speaker ──
    const playAudioChunk = useCallback((base64Data: string) => {
        try {
            if (!playbackContextRef.current) {
                playbackContextRef.current = new AudioContext({ sampleRate: 24000 })
            }
            const ctx = playbackContextRef.current

            // Decode base64 to Int16 PCM
            const binary = atob(base64Data)
            const bytes = new Uint8Array(binary.length)
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i)
            }
            const pcm16 = new Int16Array(bytes.buffer)

            // Convert Int16 to Float32
            const float32 = new Float32Array(pcm16.length)
            for (let i = 0; i < pcm16.length; i++) {
                float32[i] = pcm16[i] / 32768.0
            }

            // Create audio buffer and play (queued)
            const buffer = ctx.createBuffer(1, float32.length, 24000)
            buffer.getChannelData(0).set(float32)

            const source = ctx.createBufferSource()
            source.buffer = buffer
            source.connect(ctx.destination)

            const now = ctx.currentTime
            const startTime = Math.max(now, nextPlayTimeRef.current)
            source.start(startTime)
            nextPlayTimeRef.current = startTime + buffer.duration

            setIsAiSpeaking(true)
            source.onended = () => {
                // Only clear speaking state if this is the last queued chunk
                if (ctx.currentTime >= nextPlayTimeRef.current - 0.05) {
                    setIsAiSpeaking(false)
                }
            }
        } catch (err) {
            console.error("Audio playback error:", err)
        }
    }, [])

    // ── Vision Proctoring: Capture frame → send to backend ──
    const startVisionProctoring = useCallback(() => {
        if (visionIntervalRef.current) clearInterval(visionIntervalRef.current)

        visionIntervalRef.current = setInterval(() => {
            if (!liveVideoRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

            const video = liveVideoRef.current
            const canvas = canvasRef.current || document.createElement("canvas")
            canvas.width = 320  // Low res for speed
            canvas.height = 240
            const ctx = canvas.getContext("2d")
            if (!ctx) return

            ctx.drawImage(video, 0, 0, 320, 240)
            const dataUrl = canvas.toDataURL("image/jpeg", 0.6)
            const base64 = dataUrl.split(",")[1]

            wsRef.current.send(JSON.stringify({
                type: "vision_frame",
                data: base64,
            }))
        }, VISION_INTERVAL_MS)
    }, [])

    // ── WebSocket Connection ─────────────────────────
    const connectWebSocket = useCallback(() => {
        setPhase("connecting")

        const ws = new WebSocket(
            `${BACKEND_WS_URL}/ws/interview/${sessionId}?resume_summary=${encodeURIComponent(resumeSummary)}&job_title=${encodeURIComponent(jobTitle)}`
        )
        wsRef.current = ws

        ws.onopen = () => {
            console.log("[WS] Connected to interview backend")
        }

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data)

                switch (msg.type) {
                    case "session_ready":
                        setPhase("interview")
                        startAudioCapture()
                        startVisionProctoring()
                        setTranscript((prev) => [...prev, {
                            role: "system",
                            text: "Interview session started. The AI interviewer will begin shortly.",
                            timestamp: Date.now(),
                        }])
                        break

                    case "audio":
                        playAudioChunk(msg.data)
                        break

                    case "transcript":
                        setTranscript((prev) => [...prev, {
                            role: msg.role as "ai" | "user",
                            text: msg.text,
                            timestamp: Date.now(),
                        }])
                        break

                    case "turn_complete":
                        setIsAiSpeaking(false)
                        break

                    case "phase_change":
                        if (msg.phase === "coding") {
                            setPhase("coding")
                            // Fetch coding problem from backend
                            fetchCodingProblem(msg.difficulty, msg.topic)
                        } else if (msg.phase === "complete") {
                            setPhase("complete")
                            setTranscript((prev) => [...prev, {
                                role: "system",
                                text: `Interview complete. ${msg.summary || ""}`,
                                timestamp: Date.now(),
                            }])
                        }
                        break

                    case "vision_result":
                        // Update integrity based on vision analysis
                        if (msg.suspicion_level === "high" || msg.suspicion_level === "critical") {
                            setIntegrityLevel("red")
                            setTranscript((prev) => [...prev, {
                                role: "system",
                                text: `🔴 Vision alert: ${msg.summary || "Suspicious activity detected"}`,
                                timestamp: Date.now(),
                            }])
                        } else if (msg.suspicion_level === "medium") {
                            setIntegrityLevel((prev) => prev === "red" ? "red" : "yellow")
                        }
                        break

                    case "error":
                        console.error("[WS] Server error:", msg.message)
                        setTranscript((prev) => [...prev, {
                            role: "system",
                            text: `Error: ${msg.message}`,
                            timestamp: Date.now(),
                        }])
                        break
                }
            } catch (err) {
                console.error("[WS] Parse error:", err)
            }
        }

        ws.onclose = () => {
            console.log("[WS] Disconnected")
            if (phase !== "complete") {
                setTranscript((prev) => [...prev, {
                    role: "system",
                    text: "Connection lost. The interview session has ended.",
                    timestamp: Date.now(),
                }])
            }
        }

        ws.onerror = (err) => {
            console.error("[WS] Error:", err)
            setPermissionError("Failed to connect to interview server. Please try again.")
            setPhase("prejoin")
        }
    }, [sessionId, resumeSummary, jobTitle, startAudioCapture, playAudioChunk, startVisionProctoring, phase])

    // ── Fetch Coding Problem ─────────────────────────
    const fetchCodingProblem = async (difficulty: string, topic: string) => {
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
            const resp = await fetch(
                `${backendUrl}/api/coding-problem?difficulty=${difficulty}&topic=${topic}`
            )
            const data = await resp.json()
            setCodingProblem({
                title: data.title,
                description: data.description,
                starter_code: data.starter_code?.python || "# Write your solution here\n",
                language: "python",
            })
            setCandidateCode(data.starter_code?.python || "# Write your solution here\n")
        } catch (err) {
            // Fallback problem
            setCodingProblem({
                title: "Two Sum",
                description: "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.",
                starter_code: "def two_sum(nums, target):\n    # Write your solution here\n    pass\n",
                language: "python",
            })
            setCandidateCode("def two_sum(nums, target):\n    # Write your solution here\n    pass\n")
        }
    }

    // ── Submit Code ──────────────────────────────────
    const submitCode = () => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
        setCodingSubmitted(true)

        wsRef.current.send(JSON.stringify({
            type: "coding_submit",
            code: candidateCode,
            language: codingProblem?.language || "python",
        }))

        setTranscript((prev) => [...prev, {
            role: "system",
            text: "Code submitted successfully.",
            timestamp: Date.now(),
        }])
    }

    // ── Toggle mic ───────────────────────────────────
    const toggleMic = () => {
        if (!stream) return
        const audioTracks = stream.getAudioTracks()
        if (audioTracks.length > 0) {
            const enabled = !audioTracks[0].enabled
            audioTracks[0].enabled = enabled
            setMicOn(enabled)
        }
    }

    // ── Toggle camera ────────────────────────────────
    const toggleCam = () => {
        if (!stream) return
        const videoTracks = stream.getVideoTracks()
        if (videoTracks.length > 0) {
            const enabled = !videoTracks[0].enabled
            videoTracks[0].enabled = enabled
            setCamOn(enabled)
        }
    }

    // ── End call ─────────────────────────────────────
    const endCall = () => {
        // Send end signal
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "end" }))
            wsRef.current.close()
        }
        // Cleanup audio
        processorRef.current?.disconnect()
        audioContextRef.current?.close()
        playbackContextRef.current?.close()
        // Cleanup vision
        if (visionIntervalRef.current) clearInterval(visionIntervalRef.current)
        // Cleanup warning
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
        // Cleanup media
        stream?.getTracks().forEach((t) => t.stop())
        setStream(null)
        setCamOn(false)
        setMicOn(false)
        // Show completion screen instead of immediately leaving
        setPhase("complete")
    }

    // ── Auto-generate report when interview completes ──
    const [reportError, setReportError] = useState(false)

    useEffect(() => {
        if (phase !== "complete" || reportGenerating || reportId || reportError) return
        setReportGenerating(true)

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 60000) // 60s timeout

        const generateReport = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/generate-report`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ session_id: sessionId }),
                    signal: controller.signal,
                })
                if (!res.ok) {
                    console.error("Report generation failed:", res.status, res.statusText)
                    setReportError(true)
                    return
                }
                const data = await res.json()
                if (data.report_id) {
                    console.log("Report generated:", data.report_id)
                    setReportId(data.report_id)
                } else {
                    setReportError(true)
                }
            } catch (err) {
                console.error("Failed to generate report:", err)
                setReportError(true)
            } finally {
                clearTimeout(timeout)
                setReportGenerating(false)
            }
        }
        generateReport()

        return () => {
            clearTimeout(timeout)
            controller.abort()
        }
    }, [phase, sessionId, reportGenerating, reportId, reportError])

    // ── Skip to coding (debug) ───────────────────────
    const skipToCoding = () => {
        setPhase("coding")
        fetchCodingProblem("medium", "arrays")
        setTranscript((prev) => [...prev, {
            role: "system",
            text: "[DEBUG] Skipped to coding phase.",
            timestamp: Date.now(),
        }])
    }

    // ── Join interview ───────────────────────────────
    const joinInterview = () => {
        connectWebSocket()
    }

    const canJoin = micOn && camOn && stream && !permissionError

    // ── Integrity badge ──────────────────────────────
    const IntegrityBadge = () => {
        const config = {
            green: { icon: ShieldCheck, color: "text-green-400", bg: "bg-green-500/20", label: "Integrity: Good" },
            yellow: { icon: ShieldAlert, color: "text-yellow-400", bg: "bg-yellow-500/20", label: "Integrity: Warning" },
            red: { icon: Shield, color: "text-red-400", bg: "bg-red-500/20", label: "Integrity: Alert" },
        }
        const c = config[integrityLevel]
        return (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${c.bg} ${c.color} text-xs font-medium`}>
                <c.icon className="h-3.5 w-3.5" />
                <span>{c.label}</span>
                {violationCount > 0 && <span className="ml-1">({violationCount})</span>}
            </div>
        )
    }

    // ── Warning Popup ────────────────────────────────
    const WarningPopupOverlay = () => (
        <AnimatePresence>
            {warningPopup && (
                <motion.div
                    initial={{ opacity: 0, y: -30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full px-4"
                >
                    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md ${warningPopup.severity === 'critical'
                        ? 'bg-red-950/90 border-red-500/50 text-red-100'
                        : warningPopup.severity === 'high'
                            ? 'bg-red-950/80 border-red-500/40 text-red-200'
                            : 'bg-amber-950/80 border-amber-500/40 text-amber-200'
                        }`}>
                        <div className={`mt-0.5 shrink-0 p-1.5 rounded-lg ${warningPopup.severity === 'critical' || warningPopup.severity === 'high'
                            ? 'bg-red-500/20'
                            : 'bg-amber-500/20'
                            }`}>
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-0.5">
                                ⚠️ Proctoring Warning
                            </p>
                            <p className="text-sm font-medium leading-snug">
                                {warningPopup.message}
                            </p>
                        </div>
                        <button
                            onClick={() => setWarningPopup(null)}
                            className="shrink-0 mt-0.5 p-1 rounded-md hover:bg-white/10 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    // Hidden canvas for vision capture
    const hiddenCanvas = <canvas ref={canvasRef} className="hidden" width={320} height={240} />

    // ═════════════════════════════════════════════════
    // COMPLETE SCREEN
    // ═════════════════════════════════════════════════
    if (phase === "complete") {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-[#202124] flex items-center justify-center p-6">
                <div className="max-w-lg w-full text-center space-y-6">
                    <div className="relative mx-auto w-20 h-20">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                            <CheckCircle className="h-10 w-10 text-white" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-white">Interview Complete</h2>
                        <p className="text-[#9aa0a6] text-sm leading-relaxed">
                            Your interview has been recorded and analyzed. A comprehensive report is being generated for the hiring team.
                        </p>
                    </div>

                    {/* Report Status */}
                    <div className="bg-[#303134] rounded-xl p-5 border border-[#3c4043] space-y-3">
                        <div className="flex items-center justify-center gap-2 text-sm">
                            {reportGenerating ? (
                                <>
                                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                                    <span className="text-blue-400">Generating Report...</span>
                                </>
                            ) : reportId ? (
                                <>
                                    <FileText className="h-4 w-4 text-green-400" />
                                    <span className="text-green-400">Report Generated</span>
                                </>
                            ) : reportError ? (
                                <>
                                    <AlertCircle className="h-4 w-4 text-red-400" />
                                    <span className="text-red-400">Report generation failed</span>
                                    <button
                                        onClick={() => { setReportError(false); setReportGenerating(false) }}
                                        className="ml-2 text-xs text-blue-400 hover:text-blue-300 underline"
                                    >
                                        Retry
                                    </button>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                                    <span className="text-yellow-400">Preparing report...</span>
                                </>
                            )}
                        </div>
                        {reportId && (
                            <div className="text-xs text-[#9aa0a6] bg-[#202124] rounded-lg px-3 py-2 font-mono">
                                Report ID: {reportId}
                            </div>
                        )}
                        <div className="text-xs text-[#9aa0a6] leading-relaxed">
                            Session: {sessionId}
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#303134] rounded-lg p-3 border border-[#3c4043]">
                            <p className="text-2xl font-bold text-white">{transcript.filter(t => t.role === "ai").length}</p>
                            <p className="text-[10px] text-[#9aa0a6] mt-0.5">Questions Asked</p>
                        </div>
                        <div className="bg-[#303134] rounded-lg p-3 border border-[#3c4043]">
                            <p className="text-2xl font-bold text-white">{violationCount}</p>
                            <p className="text-[10px] text-[#9aa0a6] mt-0.5">Violations</p>
                        </div>
                        <div className="bg-[#303134] rounded-lg p-3 border border-[#3c4043]">
                            <p className={`text-2xl font-bold ${integrityLevel === 'green' ? 'text-green-400' : integrityLevel === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`}>
                                {integrityLevel === 'green' ? '✓' : integrityLevel === 'yellow' ? '!' : '✗'}
                            </p>
                            <p className="text-[10px] text-[#9aa0a6] mt-0.5">Integrity</p>
                        </div>
                    </div>

                    <Button
                        onClick={onEnd}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all shadow-lg shadow-blue-500/20"
                    >
                        Return to Job Board
                    </Button>
                </div>
            </div>
        )
    }

    // ═════════════════════════════════════════════════
    // PRE-JOIN SCREEN
    // ═════════════════════════════════════════════════
    if (phase === "prejoin") {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-[#202124] flex items-center justify-center p-6">
                {hiddenCanvas}
                <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                    {/* Camera Preview */}
                    <div className="lg:col-span-3">
                        <div className="relative rounded-2xl overflow-hidden bg-[#3c4043] aspect-video shadow-2xl">
                            <video
                                ref={previewVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover absolute inset-0"
                                style={{ transform: "scaleX(-1)", opacity: camOn ? 1 : 0 }}
                            />
                            {!camOn && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-24 h-24 rounded-full bg-[#5f6368] flex items-center justify-center">
                                        <VideoOff className="h-10 w-10 text-[#dadce0]" />
                                    </div>
                                </div>
                            )}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`h-12 w-12 rounded-full transition-all ${micOn ? "bg-[#3c4043]/80 hover:bg-[#3c4043] text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
                                    onClick={toggleMic}
                                >
                                    {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`h-12 w-12 rounded-full transition-all ${camOn ? "bg-[#3c4043]/80 hover:bg-[#3c4043] text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
                                    onClick={toggleCam}
                                >
                                    {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Join Panel */}
                    <div className="lg:col-span-2 flex flex-col items-center text-center space-y-6">
                        <h2 className="text-2xl font-semibold text-white">Ready to join?</h2>
                        <p className="text-[#9aa0a6] text-sm leading-relaxed">
                            Your AI interviewer will ask personalized questions based on your resume.
                            The session includes voice Q&A and a coding assessment.
                        </p>

                        <div className="w-full space-y-2 text-left">
                            <div className="flex items-center gap-2 text-[#9aa0a6] text-xs">
                                <ShieldCheck className="h-4 w-4 text-green-400" />
                                <span>Proctoring will be active during the interview</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#9aa0a6] text-xs">
                                <Code className="h-4 w-4 text-blue-400" />
                                <span>A coding challenge will be presented</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#9aa0a6] text-xs">
                                <Video className="h-4 w-4 text-purple-400" />
                                <span>Camera must remain on throughout</span>
                            </div>
                        </div>

                        {permissionError && (
                            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>{permissionError}</span>
                            </div>
                        )}

                        {!canJoin && !permissionError && (
                            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>Please turn on both your camera and microphone to join.</span>
                            </div>
                        )}

                        <Button
                            size="lg"
                            className="w-full max-w-xs bg-[#1a73e8] hover:bg-[#1765cc] text-white font-semibold rounded-full h-12 text-base shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                            disabled={!canJoin}
                            onClick={joinInterview}
                        >
                            Join now
                        </Button>

                        <Button
                            variant="ghost"
                            className="text-[#8ab4f8] hover:text-[#aecbfa] hover:bg-transparent text-sm"
                            onClick={onEnd}
                        >
                            Go back
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // ═════════════════════════════════════════════════
    // CONNECTING SCREEN
    // ═════════════════════════════════════════════════
    if (phase === "connecting") {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-[#202124] flex items-center justify-center p-6">
                {hiddenCanvas}
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 text-[#8ab4f8] animate-spin" />
                    <h2 className="text-xl font-semibold text-white">Connecting to AI Interviewer...</h2>
                    <p className="text-[#9aa0a6] text-sm">Setting up your interview session</p>
                </div>
            </div>
        )
    }

    // ═════════════════════════════════════════════════
    // LIVE INTERVIEW / CODING SCREEN
    // ═════════════════════════════════════════════════
    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#202124] flex flex-col">
            {hiddenCanvas}
            <WarningPopupOverlay />

            {/* Top Bar */}
            <div className="h-12 bg-[#202124] flex items-center justify-between px-4 border-b border-[#3c4043]">
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 ${isAiSpeaking ? "text-green-400" : "text-[#9aa0a6]"}`}>
                        <Bot className={`h-4 w-4 ${isAiSpeaking ? "animate-pulse" : ""}`} />
                        <span className="text-xs font-medium">
                            {isAiSpeaking ? "AI is speaking..." : "AI Interviewer"}
                        </span>
                    </div>
                    {phase === "coding" && (
                        <div className="flex items-center gap-1.5 text-blue-400">
                            <Code className="h-4 w-4" />
                            <span className="text-xs font-medium">Coding Phase</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <IntegrityBadge />
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Video + Coding */}
                <div className="flex-1 flex flex-col">
                    {phase === "coding" && codingProblem ? (
                        /* Coding Phase Layout */
                        <div className="flex-1 flex flex-col p-4 gap-4">
                            {/* Problem description */}
                            <div className="bg-[#292b2e] rounded-xl p-4 max-h-40 overflow-y-auto">
                                <h3 className="text-white font-semibold text-sm mb-2">
                                    {codingProblem.title}
                                </h3>
                                <p className="text-[#9aa0a6] text-xs whitespace-pre-wrap">
                                    {codingProblem.description}
                                </p>
                            </div>

                            {/* Code Editor */}
                            <div className="flex-1 min-h-0">
                                <CodingEditor
                                    initialCode={codingProblem.starter_code}
                                    language={codingProblem.language}
                                    onCodeChange={setCandidateCode}
                                />
                            </div>

                            {/* Submit button */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {/* Small webcam preview during coding with face mesh */}
                                    <div className="w-40 aspect-video rounded-lg overflow-hidden bg-[#3c4043] relative">
                                        <FaceMeshOverlay
                                            videoStream={stream}
                                            landmarks={faceTracking.landmarks}
                                            headPose={faceTracking.headPose}
                                            gazeScore={faceTracking.gazeScore}
                                            faceDetected={faceTracking.faceDetected}
                                            status={faceTracking.status}
                                            statusMessage={faceTracking.statusMessage}
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg h-10 px-6"
                                    onClick={submitCode}
                                    disabled={codingSubmitted}
                                >
                                    {codingSubmitted ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Submitted
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Submit Solution
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* Interview Phase Layout */
                        <div className="flex-1 flex items-center justify-center p-4">
                            <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-[#3c4043] shadow-2xl">
                                {/* Main video with face mesh overlay */}
                                <div className="absolute inset-0" style={{ opacity: camOn ? 1 : 0 }}>
                                    <video
                                        ref={liveVideoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover absolute inset-0"
                                        style={{ transform: "scaleX(-1)" }}
                                    />
                                    {/* Face mesh canvas overlay */}
                                    {faceTracking.landmarks && (
                                        <FaceMeshOverlay
                                            videoStream={null}
                                            landmarks={faceTracking.landmarks}
                                            headPose={faceTracking.headPose}
                                            gazeScore={faceTracking.gazeScore}
                                            faceDetected={faceTracking.faceDetected}
                                            status={faceTracking.status}
                                            statusMessage={faceTracking.statusMessage}
                                        />
                                    )}
                                </div>
                                {!camOn && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-24 h-24 rounded-full bg-[#5f6368] flex items-center justify-center">
                                            <VideoOff className="h-10 w-10 text-[#dadce0]" />
                                        </div>
                                    </div>
                                )}
                                <div className="absolute bottom-3 left-3 px-3 py-1 bg-[#202124]/70 backdrop-blur-sm rounded-md z-10">
                                    <span className="text-white text-sm font-medium">You</span>
                                </div>
                                {!micOn && (
                                    <div className="absolute bottom-3 right-3 p-1.5 bg-red-500 rounded-full z-10">
                                        <MicOff className="h-3.5 w-3.5 text-white" />
                                    </div>
                                )}
                                {/* Face tracking status badge */}
                                {isInterviewActive && camOn && (
                                    <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium backdrop-blur-sm z-10 ${faceTracking.status === 'alert'
                                        ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                                        : faceTracking.status === 'warning'
                                            ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/40'
                                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                                        }`}>
                                        <Eye className="h-3 w-3" />
                                        {faceTracking.statusMessage}
                                    </div>
                                )}
                                {/* AI Interviewer overlay */}
                                <div className="absolute top-3 left-3 w-52 aspect-video rounded-xl bg-[#3c4043] shadow-xl overflow-hidden border border-[#5f6368]/50 z-10">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-transparent to-purple-900/30" />
                                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-1.5">
                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md ${isAiSpeaking ? "animate-pulse" : ""}`}>
                                            <Bot className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="text-white text-xs font-medium">
                                            {isAiSpeaking ? "Speaking..." : "AI Interviewer"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Control Bar */}
            <div className="h-20 bg-[#202124] flex items-center justify-center gap-3 border-t border-[#3c4043]">
                <Button
                    size="icon"
                    variant="ghost"
                    className={`h-12 w-12 rounded-full transition-all ${micOn ? "bg-[#3c4043] hover:bg-[#4a4d51] text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
                    onClick={toggleMic}
                >
                    {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>

                <Button
                    size="icon"
                    variant="ghost"
                    className={`h-12 w-12 rounded-full transition-all ${camOn ? "bg-[#3c4043] hover:bg-[#4a4d51] text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
                    onClick={toggleCam}
                >
                    {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>

                {/* Skip to Coding (debug) */}
                {phase === "interview" && (
                    <Button
                        variant="ghost"
                        className="h-10 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-all gap-1.5"
                        onClick={skipToCoding}
                    >
                        <Code className="h-3.5 w-3.5" />
                        Skip to Coding
                    </Button>
                )}

                <Button
                    size="icon"
                    variant="ghost"
                    className="h-12 w-16 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all"
                    onClick={endCall}
                >
                    <PhoneOff className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
