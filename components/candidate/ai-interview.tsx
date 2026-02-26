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
    Loader2,
    CheckCircle2,
    MessageSquare,
    ArrowRight,
    Volume2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface AiInterviewProps {
    onEnd: () => void
}

interface InterviewQuestion {
    text: string
    answer: string
}

declare global {
    interface Window {
        webkitSpeechRecognition: any
        SpeechRecognition: any
    }
}

export function AiInterview({ onEnd }: AiInterviewProps) {
    const [phase, setPhase] = useState<"prejoin" | "live" | "done">("prejoin")
    const [micOn, setMicOn] = useState(false)
    const [camOn, setCamOn] = useState(false)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [permissionError, setPermissionError] = useState<string | null>(null)

    // Interview state
    const [questions, setQuestions] = useState<string[]>([])
    const [currentQIndex, setCurrentQIndex] = useState(0)
    const [interviewData, setInterviewData] = useState<InterviewQuestion[]>([])
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [currentTranscript, setCurrentTranscript] = useState("")
    const [statusText, setStatusText] = useState("")
    const [questionError, setQuestionError] = useState<string | null>(null)

    // Recording state
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)

    const previewVideoRef = useRef<HTMLVideoElement>(null)
    const liveVideoRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const recognitionRef = useRef<any>(null)
    const isListeningRef = useRef(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const recordedChunksRef = useRef<Blob[]>([])

    // ── Request media ────────────────────────────────
    const requestMedia = useCallback(async () => {
        try {
            setPermissionError(null)
            const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
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

    useEffect(() => {
        requestMedia()
        return () => {
            setStream((prev) => {
                prev?.getTracks().forEach((t) => t.stop())
                return null
            })
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Attach stream to video elements ──
    useEffect(() => {
        if (stream) {
            if (previewVideoRef.current) previewVideoRef.current.srcObject = stream
            if (liveVideoRef.current) liveVideoRef.current.srcObject = stream
        }
    }, [stream])

    useEffect(() => {
        if (stream) {
            const timer = setTimeout(() => {
                if (phase === "prejoin" && previewVideoRef.current) previewVideoRef.current.srcObject = stream
                if (phase === "live" && liveVideoRef.current) liveVideoRef.current.srcObject = stream
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [phase, stream])

    // ── Toggle mic / camera ──────────────────────────
    const toggleMic = () => {
        if (!stream) return
        const tracks = stream.getAudioTracks()
        if (tracks.length > 0) {
            const enabled = !tracks[0].enabled
            tracks[0].enabled = enabled
            setMicOn(enabled)
        }
    }

    const toggleCam = () => {
        if (!stream) return
        const tracks = stream.getVideoTracks()
        if (tracks.length > 0) {
            const enabled = !tracks[0].enabled
            tracks[0].enabled = enabled
            setCamOn(enabled)
        }
    }

    // ── MediaRecorder: start/stop recording ──────────
    const startRecording = () => {
        if (!stream) return
        recordedChunksRef.current = []
        try {
            const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9,opus" })
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) recordedChunksRef.current.push(e.data)
            }
            recorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: "video/webm" })
                setRecordedBlob(blob)
            }
            recorder.start(1000) // chunk every 1s
            mediaRecorderRef.current = recorder
        } catch (err) {
            console.error("MediaRecorder error:", err)
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop()
            mediaRecorderRef.current = null
        }
    }

    // ── STT: speech recognition for transcript ───────
    const startSTT = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            setStatusText("Speech recognition not supported. Use Chrome or Edge.")
            return
        }
        const recog = new SpeechRecognition()
        recog.continuous = true
        recog.interimResults = true
        recog.lang = "en-US"

        recog.onresult = (event: any) => {
            let transcript = ""
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript
            }
            setCurrentTranscript(transcript)
        }

        recog.onerror = (event: any) => {
            console.error("STT error:", event.error)
        }

        recog.onend = () => {
            if (isListeningRef.current) {
                try { recog.start() } catch { /* ignore */ }
            }
        }

        recog.start()
        recognitionRef.current = recog
    }

    const stopSTT = () => {
        isListeningRef.current = false
        if (recognitionRef.current) {
            try { recognitionRef.current.stop() } catch { /* ignore */ }
            recognitionRef.current = null
        }
    }

    // ── TTS: speak a question ────────────────────────
    const speakQuestion = async (text: string) => {
        setIsSpeaking(true)
        setStatusText("AI is asking the question...")
        try {
            const res = await fetch("http://localhost:8000/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            })
            if (!res.ok) throw new Error("TTS failed")
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)

            if (audioRef.current) {
                audioRef.current.src = url
                audioRef.current.onended = () => {
                    setIsSpeaking(false)
                    URL.revokeObjectURL(url)
                    startListening()
                }
                audioRef.current.play().catch(() => {
                    setIsSpeaking(false)
                    URL.revokeObjectURL(url)
                    startListening()
                })
            }
        } catch {
            setIsSpeaking(false)
            startListening()
        }
    }

    // ── Start / stop listening ────────────────────────
    const startListening = () => {
        setIsListening(true)
        isListeningRef.current = true
        setCurrentTranscript("")
        setStatusText("Your turn — answer the question.")
        startSTT()
    }

    const stopListening = () => {
        setIsListening(false)
        isListeningRef.current = false
        stopSTT()
    }

    // ── Fetch questions ──────────────────────────────
    const fetchQuestions = async () => {
        setIsLoadingQuestions(true)
        setQuestionError(null)
        try {
            const res = await fetch("http://localhost:8000/api/interview-questions")
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.detail || `Server error ${res.status}`)
            }
            const data = await res.json()
            if (!data.questions || data.questions.length === 0) {
                throw new Error("No questions found in the report.")
            }
            setQuestions(data.questions)
            setInterviewData(data.questions.map((q: string) => ({ text: q, answer: "" })))
        } catch (err: any) {
            setQuestionError(err.message || "Failed to load questions.")
        } finally {
            setIsLoadingQuestions(false)
        }
    }

    // ── Advance to next question (button only) ───────
    const handleNextQuestion = () => {
        stopListening()

        // Save transcript for current question
        setInterviewData((prev) => {
            const updated = [...prev]
            if (updated[currentQIndex]) {
                updated[currentQIndex] = {
                    ...updated[currentQIndex],
                    answer: currentTranscript || "(No response)",
                }
            }
            return updated
        })

        setCurrentTranscript("")

        if (currentQIndex + 1 >= questions.length) {
            stopRecording()
            setPhase("done")
        } else {
            setCurrentQIndex((prev) => prev + 1)
        }
    }

    // ── When question index changes, speak the question ──
    useEffect(() => {
        if (phase === "live" && questions.length > 0 && currentQIndex < questions.length && !isLoadingQuestions) {
            speakQuestion(questions[currentQIndex])
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQIndex, questions, phase, isLoadingQuestions])

    // ── Join interview ───────────────────────────────
    const joinInterview = async () => {
        setPhase("live")
        startRecording()
        await fetchQuestions()
    }

    // ── End call ─────────────────────────────────────
    const endCall = () => {
        stopListening()
        stopRecording()
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.src = ""
        }
        stream?.getTracks().forEach((t) => t.stop())
        setStream(null)
        setCamOn(false)
        setMicOn(false)
        onEnd()
    }

    // ── Save to project file system via backend ──────
    const [isSaving, setIsSaving] = useState(false)
    const [savedMessage, setSavedMessage] = useState("")

    const saveToServer = async (videoBlob: Blob) => {
        setIsSaving(true)
        setSavedMessage("")
        try {
            const transcript = interviewData.map((item, i) =>
                `Q${i + 1}: ${item.text}\nA${i + 1}: ${item.answer}\n`
            ).join("\n")

            const formData = new FormData()
            formData.append("video", videoBlob, "interview.webm")
            formData.append("transcript", transcript)

            const res = await fetch("http://localhost:8000/api/save-interview", {
                method: "POST",
                body: formData,
            })
            if (!res.ok) throw new Error("Failed to save")
            const data = await res.json()
            setSavedMessage(`Saved: ${data.video_file} & ${data.transcript_file}`)
        } catch (err: any) {
            setSavedMessage(`Save error: ${err.message}`)
        } finally {
            setIsSaving(false)
        }
    }

    // Auto-save when interview ends and recording is ready
    useEffect(() => {
        if (phase === "done" && recordedBlob) {
            saveToServer(recordedBlob)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, recordedBlob])

    const canJoin = micOn && camOn && stream && !permissionError

    // ═════════════════════════════════════════════════
    // PRE-JOIN SCREEN
    // ═════════════════════════════════════════════════
    if (phase === "prejoin") {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-[#202124] flex items-center justify-center p-6">
                <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                    <div className="lg:col-span-3">
                        <div className="relative rounded-2xl overflow-hidden bg-[#3c4043] aspect-video shadow-2xl">
                            <video
                                ref={previewVideoRef}
                                autoPlay playsInline muted
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
                                <Button size="icon" variant="ghost"
                                    className={`h-12 w-12 rounded-full transition-all ${micOn ? "bg-[#3c4043]/80 hover:bg-[#3c4043] text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
                                    onClick={toggleMic}>
                                    {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                                </Button>
                                <Button size="icon" variant="ghost"
                                    className={`h-12 w-12 rounded-full transition-all ${camOn ? "bg-[#3c4043]/80 hover:bg-[#3c4043] text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
                                    onClick={toggleCam}>
                                    {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 flex flex-col items-center text-center space-y-6">
                        <h2 className="text-2xl font-semibold text-white">Ready to join?</h2>
                        <p className="text-[#9aa0a6] text-sm leading-relaxed">
                            Your AI interviewer will ask questions based on your resume analysis. The session will be recorded.
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
                        <Button size="lg"
                            className="w-full max-w-xs bg-[#1a73e8] hover:bg-[#1765cc] text-white font-semibold rounded-full h-12 text-base shadow-lg disabled:opacity-40"
                            disabled={!canJoin} onClick={joinInterview}>
                            Join now
                        </Button>
                        <Button variant="ghost" className="text-[#8ab4f8] hover:text-[#aecbfa] hover:bg-transparent text-sm" onClick={onEnd}>
                            Go back
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // ═════════════════════════════════════════════════
    // DONE SCREEN
    // ═════════════════════════════════════════════════
    if (phase === "done") {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-[#202124] flex items-center justify-center p-6">
                <div className="max-w-3xl w-full space-y-6">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl">
                            <CheckCircle2 className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white">Interview Complete!</h2>
                        <p className="text-[#9aa0a6] text-lg">
                            Thank you for completing the AI screening interview.
                        </p>
                        {isSaving && (
                            <div className="flex items-center justify-center gap-2 text-indigo-400">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Saving recording and transcript...</span>
                            </div>
                        )}
                        {savedMessage && (
                            <p className="text-emerald-400 text-sm">{savedMessage}</p>
                        )}
                    </div>

                    {/* Q&A Summary */}
                    <div className="bg-[#303134] rounded-2xl p-6 space-y-4 border border-[#5f6368]/30">
                        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-indigo-400" />
                            Interview Summary
                        </h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {interviewData.map((item, i) => (
                                <div key={i} className="bg-[#3c4043] rounded-xl p-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <span className="shrink-0 h-7 w-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                                            {i + 1}
                                        </span>
                                        <p className="text-sm text-[#e8eaed] font-medium leading-relaxed">{item.text}</p>
                                    </div>
                                    <div className="ml-10">
                                        <p className="text-sm text-[#9aa0a6] italic">{item.answer || "(No response)"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Button size="lg" className="bg-[#1a73e8] hover:bg-[#1765cc] text-white font-semibold rounded-full h-12 px-8 text-base shadow-lg" onClick={endCall}>
                            End Interview
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
            <audio ref={audioRef} />

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-[#3c4043] shadow-2xl">
                    <video ref={liveVideoRef} autoPlay playsInline muted
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

                    {/* Name badge */}
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-[#202124]/70 backdrop-blur-sm rounded-md z-10">
                        <span className="text-white text-sm font-medium">You</span>
                    </div>
                    {!micOn && (
                        <div className="absolute bottom-3 right-3 p-1.5 bg-red-500 rounded-full z-10">
                            <MicOff className="h-3.5 w-3.5 text-white" />
                        </div>
                    )}

                    {/* AI Interviewer overlay */}
                    <div className="absolute top-3 left-3 w-52 aspect-video rounded-xl bg-[#3c4043] shadow-xl overflow-hidden border border-[#5f6368]/50 z-10">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-transparent to-purple-900/30" />
                        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-1.5">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md ${isSpeaking ? "animate-pulse" : ""}`}>
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-white text-xs font-medium">AI Interviewer</span>
                            {isSpeaking && (
                                <div className="flex items-center gap-1">
                                    <Volume2 className="h-3 w-3 text-indigo-300 animate-pulse" />
                                    <span className="text-[10px] text-indigo-300">Speaking...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recording indicator */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-600/80 backdrop-blur-sm rounded-full px-3 py-1.5 z-10">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-white text-[10px] font-medium">REC</span>
                    </div>

                    {/* Question overlay */}
                    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-10">
                        {isLoadingQuestions && (
                            <div className="bg-[#202124]/90 backdrop-blur-md rounded-xl p-4 text-center">
                                <Loader2 className="h-6 w-6 text-indigo-400 animate-spin mx-auto mb-2" />
                                <p className="text-white text-sm">Loading interview questions...</p>
                            </div>
                        )}

                        {questionError && (
                            <div className="bg-red-900/80 backdrop-blur-md rounded-xl p-4 text-center">
                                <AlertCircle className="h-6 w-6 text-red-400 mx-auto mb-2" />
                                <p className="text-red-200 text-sm">{questionError}</p>
                            </div>
                        )}

                        {!isLoadingQuestions && !questionError && questions.length > 0 && (
                            <div className="bg-[#202124]/90 backdrop-blur-md rounded-xl p-4 space-y-3">
                                {/* Progress */}
                                <div className="flex items-center justify-between">
                                    <span className="text-[#9aa0a6] text-xs font-medium">
                                        Question {currentQIndex + 1} of {questions.length}
                                    </span>
                                    <span className="text-[#9aa0a6] text-xs">{statusText}</span>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full bg-[#3c4043] rounded-full h-1.5">
                                    <div
                                        className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                                        style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
                                    />
                                </div>

                                {/* Question text */}
                                <p className="text-white text-sm leading-relaxed font-medium">
                                    {questions[currentQIndex]}
                                </p>

                                {/* Live transcript */}
                                {isListening && currentTranscript && (
                                    <div className="bg-[#3c4043]/80 rounded-lg p-3 border border-[#5f6368]/30">
                                        <p className="text-xs text-[#9aa0a6] mb-1 flex items-center gap-1">
                                            <Mic className="h-3 w-3 text-emerald-400 animate-pulse" />
                                            Your response:
                                        </p>
                                        <p className="text-sm text-[#e8eaed] italic">{currentTranscript}</p>
                                    </div>
                                )}

                                {/* Next question button */}
                                {isListening && (
                                    <div className="flex justify-end">
                                        <Button size="sm"
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 rounded-lg"
                                            onClick={handleNextQuestion}>
                                            {currentQIndex + 1 < questions.length ? "Next Question" : "Finish Interview"}
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Control Bar */}
            <div className="h-20 bg-[#202124] flex items-center justify-center gap-3 border-t border-[#3c4043]">
                <Button size="icon" variant="ghost"
                    className={`h-12 w-12 rounded-full transition-all ${micOn ? "bg-[#3c4043] hover:bg-[#4a4d51] text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
                    onClick={toggleMic}>
                    {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
                <Button size="icon" variant="ghost"
                    className={`h-12 w-12 rounded-full transition-all ${camOn ? "bg-[#3c4043] hover:bg-[#4a4d51] text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
                    onClick={toggleCam}>
                    {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
                <Button size="icon" variant="ghost"
                    className="h-12 w-16 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all"
                    onClick={endCall}>
                    <PhoneOff className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
