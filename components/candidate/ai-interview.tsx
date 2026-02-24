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
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface AiInterviewProps {
    onEnd: () => void
}

export function AiInterview({ onEnd }: AiInterviewProps) {
    const [phase, setPhase] = useState<"prejoin" | "live">("prejoin")
    const [micOn, setMicOn] = useState(false)
    const [camOn, setCamOn] = useState(false)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [permissionError, setPermissionError] = useState<string | null>(null)

    const previewVideoRef = useRef<HTMLVideoElement>(null)
    const liveVideoRef = useRef<HTMLVideoElement>(null)

    // ── Request media ────────────────────────────────
    const requestMedia = useCallback(async () => {
        try {
            setPermissionError(null)
            const s = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
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

    // ── Attach stream to BOTH video elements whenever stream changes ──
    useEffect(() => {
        if (stream) {
            if (previewVideoRef.current) {
                previewVideoRef.current.srcObject = stream
            }
            if (liveVideoRef.current) {
                liveVideoRef.current.srcObject = stream
            }
        }
    }, [stream])

    // ── Also attach when phase changes (new video element mounts) ──
    useEffect(() => {
        if (stream) {
            // Small delay to ensure DOM is updated
            const timer = setTimeout(() => {
                if (phase === "prejoin" && previewVideoRef.current) {
                    previewVideoRef.current.srcObject = stream
                }
                if (phase === "live" && liveVideoRef.current) {
                    liveVideoRef.current.srcObject = stream
                }
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [phase, stream])

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
        stream?.getTracks().forEach((t) => t.stop())
        setStream(null)
        setCamOn(false)
        setMicOn(false)
        onEnd()
    }

    // ── Join interview ───────────────────────────────
    const joinInterview = () => {
        setPhase("live")
    }

    const canJoin = micOn && camOn && stream && !permissionError

    // ═════════════════════════════════════════════════
    // PRE-JOIN SCREEN
    // ═════════════════════════════════════════════════
    if (phase === "prejoin") {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-[#202124] flex items-center justify-center p-6">
                <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                    {/* Camera Preview — always rendered */}
                    <div className="lg:col-span-3">
                        <div className="relative rounded-2xl overflow-hidden bg-[#3c4043] aspect-video shadow-2xl">
                            {/* Video is ALWAYS in the DOM */}
                            <video
                                ref={previewVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover absolute inset-0"
                                style={{
                                    transform: "scaleX(-1)",
                                    opacity: camOn ? 1 : 0,
                                }}
                            />
                            {/* Camera-off overlay */}
                            {!camOn && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-24 h-24 rounded-full bg-[#5f6368] flex items-center justify-center">
                                        <VideoOff className="h-10 w-10 text-[#dadce0]" />
                                    </div>
                                </div>
                            )}

                            {/* Controls on preview */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`h-12 w-12 rounded-full transition-all ${
                                        micOn
                                            ? "bg-[#3c4043]/80 hover:bg-[#3c4043] text-white"
                                            : "bg-red-500 hover:bg-red-600 text-white"
                                    }`}
                                    onClick={toggleMic}
                                >
                                    {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`h-12 w-12 rounded-full transition-all ${
                                        camOn
                                            ? "bg-[#3c4043]/80 hover:bg-[#3c4043] text-white"
                                            : "bg-red-500 hover:bg-red-600 text-white"
                                    }`}
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
                            Your AI interviewer will ask personalized questions based on your resume analysis.
                        </p>

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
    // LIVE INTERVIEW SCREEN
    // ═════════════════════════════════════════════════
    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#202124] flex flex-col">
            {/* Main content */}
            <div className="flex-1 flex items-center justify-center p-4">
                {/* User Camera Feed — Main View */}
                <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-[#3c4043] shadow-2xl">
                    {/* Video is ALWAYS in the DOM */}
                    <video
                        ref={liveVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover absolute inset-0"
                        style={{
                            transform: "scaleX(-1)",
                            opacity: camOn ? 1 : 0,
                        }}
                    />
                    {/* Camera-off overlay */}
                    {!camOn && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-[#5f6368] flex items-center justify-center">
                                <VideoOff className="h-10 w-10 text-[#dadce0]" />
                            </div>
                        </div>
                    )}

                    {/* Name badge */}
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-[#202124]/70 backdrop-blur-sm rounded-md z-10">
                        <span className="text-white text-sm font-medium">You</span>
                    </div>
                    {/* Mic indicator */}
                    {!micOn && (
                        <div className="absolute bottom-3 right-3 p-1.5 bg-red-500 rounded-full z-10">
                            <MicOff className="h-3.5 w-3.5 text-white" />
                        </div>
                    )}

                    {/* AI Interviewer — Small overlay top-left */}
                    <div className="absolute top-3 left-3 w-52 aspect-video rounded-xl bg-[#3c4043] shadow-xl overflow-hidden border border-[#5f6368]/50 z-10">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-transparent to-purple-900/30" />
                        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-1.5">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md animate-pulse">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-white text-xs font-medium">AI Interviewer</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Control Bar */}
            <div className="h-20 bg-[#202124] flex items-center justify-center gap-3 border-t border-[#3c4043]">
                <Button
                    size="icon"
                    variant="ghost"
                    className={`h-12 w-12 rounded-full transition-all ${
                        micOn
                            ? "bg-[#3c4043] hover:bg-[#4a4d51] text-white"
                            : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                    onClick={toggleMic}
                >
                    {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>

                <Button
                    size="icon"
                    variant="ghost"
                    className={`h-12 w-12 rounded-full transition-all ${
                        camOn
                            ? "bg-[#3c4043] hover:bg-[#4a4d51] text-white"
                            : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                    onClick={toggleCam}
                >
                    {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>

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
