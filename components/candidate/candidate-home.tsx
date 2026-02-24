"use client"

import { useState, useRef } from "react"
import {
    Upload,
    FileText,
    Brain,
    Play,
    CheckCircle2,
    Clock,
    ArrowRight,
    Sparkles,
    Video,
    Mic,
    BookOpen,
    Target,
    Lightbulb,
    TrendingUp,
    Star,
    Zap,
    ChevronRight,
    X,
    File,
    Search,
    BarChart3,
    MessageSquareText,
    Download,
    Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// ─── Types ───────────────────────────────────────────
interface CriterionResult {
    criterion: string
    weight: number
    score: number
    explanation: string
}

interface AnalysisResult {
    criteria: CriterionResult[]
    weighted_total: number
    summary: string
    fact_check_questions: string[]
    report_path: string
}

// ─── Step indicator ──────────────────────────────────
function StepIndicator({ step, currentStep, label }: { step: number; currentStep: number; label: string }) {
    const isActive = currentStep === step
    const isDone = currentStep > step
    return (
        <div className="flex items-center gap-3">
            <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isDone
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                        : isActive
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 animate-pulse"
                            : "bg-muted text-muted-foreground"
                    }`}
            >
                {isDone ? <CheckCircle2 className="h-5 w-5" /> : step}
            </div>
            <span className={`text-sm font-medium ${isActive ? "text-indigo-600" : isDone ? "text-emerald-600" : "text-muted-foreground"}`}>
                {label}
            </span>
        </div>
    )
}

// ─── Score bar ───────────────────────────────────────
function ScoreBar({ label, score, weight, explanation }: { label: string; score: number; weight: number; explanation: string }) {
    const color =
        score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : score >= 40 ? "bg-orange-500" : "bg-red-500"
    const textColor =
        score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : score >= 40 ? "text-orange-600" : "text-red-600"

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{label}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                        {weight}%
                    </Badge>
                </div>
                <span className={`text-sm font-bold ${textColor}`}>{score}/100</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
                    style={{ width: `${score}%` }}
                />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{explanation}</p>
        </div>
    )
}

// ═════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════
export function CandidateHome() {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [jobDescription, setJobDescription] = useState("")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisStep, setAnalysisStep] = useState(0) // 0 = idle, 1/2/3 = steps, 4 = done
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
    const [analysisError, setAnalysisError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // ─── File handling ───────────────────────────────
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file && file.type === "application/pdf") {
            setUploadedFile(file)
        }
    }
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setUploadedFile(file)
        }
    }

    // ─── Analyze resume ──────────────────────────────
    const handleAnalyze = async () => {
        if (!uploadedFile || !jobDescription.trim()) return

        setIsAnalyzing(true)
        setAnalysisError(null)
        setAnalysisResult(null)
        setAnalysisStep(1) // extracting text

        try {
            const formData = new FormData()
            formData.append("resume", uploadedFile)
            formData.append("job_description", jobDescription)

            // Simulate step progression while waiting for response
            const stepTimer1 = setTimeout(() => setAnalysisStep(2), 2000) // analyzing
            const stepTimer2 = setTimeout(() => setAnalysisStep(3), 5000) // generating questions

            const response = await fetch("http://localhost:8000/api/analyze-resume", {
                method: "POST",
                body: formData,
            })

            clearTimeout(stepTimer1)
            clearTimeout(stepTimer2)

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.detail || `Server error ${response.status}`)
            }

            const data = await response.json()

            // Check if backend returned an error (detail field)
            if (data.detail) {
                throw new Error(data.detail)
            }

            const result: AnalysisResult = data
            setAnalysisResult(result)
            setAnalysisStep(4)
        } catch (err: any) {
            setAnalysisError(err.message || "Analysis failed. Please try again.")
            setAnalysisStep(0)
        } finally {
            setIsAnalyzing(false)
        }
    }

    // ─── Download report ─────────────────────────────
    const handleDownloadReport = async () => {
        if (!analysisResult?.report_path) return
        try {
            const resp = await fetch(`http://localhost:8000/api/download-report?path=${encodeURIComponent(analysisResult.report_path)}`)
            if (!resp.ok) throw new Error("Download failed")
            const blob = await resp.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = analysisResult.report_path.split("/").pop() || "report.txt"
            a.click()
            URL.revokeObjectURL(url)
        } catch {
            alert("Failed to download report")
        }
    }

    // ═════════════════════════════════════════════════
    // RENDER
    // ═════════════════════════════════════════════════
    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
                <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-3 max-w-2xl">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                <Brain className="h-6 w-6" />
                            </div>
                            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                AI-Powered Resume Analysis
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Candidate Portal</h1>
                        <p className="text-white/80 text-lg leading-relaxed">
                            Upload your resume, get AI-powered analysis with detailed scoring across 6 key criteria, and receive personalized fact-checking questions — all in one place.
                        </p>
                    </div>
                    <div className="hidden lg:flex items-center justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-150" />
                            <div className="relative p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                                <Search className="h-20 w-20 text-white/90 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column — Resume Upload + Job Description + Analyze */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Resume Upload */}
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="h-5 w-5 text-indigo-600" />
                                Upload Resume
                            </CardTitle>
                            <CardDescription>Upload your CV (PDF) to get an AI-powered analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer group ${isDragging
                                        ? "border-indigo-500 bg-indigo-50 scale-[1.01]"
                                        : uploadedFile
                                            ? "border-emerald-300 bg-emerald-50"
                                            : "border-muted-foreground/20 hover:border-indigo-400 hover:bg-indigo-50/50"
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={handleFileInput}
                                />

                                {uploadedFile ? (
                                    <div className="space-y-3">
                                        <div className="mx-auto w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-emerald-700">Resume Uploaded</p>
                                            <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                                                <File className="h-4 w-4" />
                                                <span>{uploadedFile.name}</span>
                                                <span className="text-xs">({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 hover:bg-red-100 hover:text-red-600"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setUploadedFile(null)
                                                        setAnalysisResult(null)
                                                        setAnalysisStep(0)
                                                    }}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="mx-auto w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Upload className="h-7 w-7 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">
                                                Drag & drop your resume here
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                or <span className="text-indigo-600 font-medium underline underline-offset-2">browse files</span> • PDF only
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Job Description Input */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Target className="h-5 w-5 text-violet-600" />
                                Job Description
                            </CardTitle>
                            <CardDescription>Paste the target job description to evaluate resume relevance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Paste the job description here... e.g. 'We are looking for a Senior Frontend Developer with 5+ years of experience in React, TypeScript...'"
                                className="min-h-[140px] resize-none"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-xs text-muted-foreground">
                                    {jobDescription.length > 0 ? `${jobDescription.length} characters` : "No job description provided yet"}
                                </p>
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg font-semibold"
                                    disabled={!uploadedFile || !jobDescription.trim() || isAnalyzing}
                                    onClick={handleAnalyze}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Analyze Resume
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Analysis Error */}
                    {analysisError && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="p-4">
                                <p className="text-sm text-red-700 flex items-center gap-2">
                                    <X className="h-4 w-4" />
                                    {analysisError}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Analysis Results */}
                    {analysisResult && (
                        <>
                            {/* Weighted Total Score */}
                            <Card className="overflow-hidden border-2 border-indigo-100">
                                <div className="bg-gradient-to-r from-indigo-50 to-violet-50 p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Weighted Total Score</p>
                                        <p className="text-4xl font-bold text-indigo-600 mt-1">{(analysisResult.weighted_total ?? 0).toFixed(1)}<span className="text-lg text-muted-foreground">/100</span></p>
                                    </div>
                                    <div className={`p-4 rounded-2xl ${analysisResult.weighted_total >= 70 ? "bg-emerald-100" : analysisResult.weighted_total >= 50 ? "bg-amber-100" : "bg-red-100"}`}>
                                        {analysisResult.weighted_total >= 70 ? (
                                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                        ) : analysisResult.weighted_total >= 50 ? (
                                            <BarChart3 className="h-8 w-8 text-amber-600" />
                                        ) : (
                                            <TrendingUp className="h-8 w-8 text-red-600" />
                                        )}
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    <p className="text-sm text-muted-foreground leading-relaxed">{analysisResult.summary}</p>
                                </CardContent>
                            </Card>

                            {/* Criteria Breakdown */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                                        Criteria Breakdown
                                    </CardTitle>
                                    <CardDescription>Detailed scoring across 6 evaluation criteria</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    {analysisResult.criteria.map((c, i) => (
                                        <ScoreBar
                                            key={i}
                                            label={c.criterion}
                                            score={c.score}
                                            weight={c.weight}
                                            explanation={c.explanation}
                                        />
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Fact-checking Questions */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <MessageSquareText className="h-5 w-5 text-violet-600" />
                                        Fact-Checking Questions
                                    </CardTitle>
                                    <CardDescription>Personalized questions to verify resume claims in an interview</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {analysisResult.fact_check_questions.map((q, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-all"
                                            >
                                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shrink-0 mt-0.5 shadow-sm">
                                                    <span className="text-[10px] font-bold w-4 h-4 flex items-center justify-center">{i + 1}</span>
                                                </div>
                                                <p className="text-sm leading-relaxed">{q}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Download Report */}
                            <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-indigo-100 rounded-xl">
                                            <FileText className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">Analysis Report</p>
                                            <p className="text-xs text-muted-foreground">Full report saved as .txt file</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="gap-2"
                                        onClick={handleDownloadReport}
                                    >
                                        <Download className="h-4 w-4" />
                                        Download Report
                                    </Button>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                {/* Right Column — Analysis Steps + Tips */}
                <div className="space-y-6">
                    {/* Analysis Progress */}
                    {(isAnalyzing || analysisStep > 0) && (
                        <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-indigo-600" />
                                    Analysis Progress
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <StepIndicator step={1} currentStep={analysisStep} label="Extracting text from PDF" />
                                <div className="ml-4 border-l-2 border-dashed border-muted h-3" />
                                <StepIndicator step={2} currentStep={analysisStep} label="Analyzing with AI" />
                                <div className="ml-4 border-l-2 border-dashed border-muted h-3" />
                                <StepIndicator step={3} currentStep={analysisStep} label="Generating questions" />
                                <div className="ml-4 border-l-2 border-dashed border-muted h-3" />
                                <StepIndicator step={4} currentStep={analysisStep} label="Report complete" />
                            </CardContent>
                        </Card>
                    )}

                    {/* How It Works */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-amber-500" />
                                How It Works
                            </CardTitle>
                            <CardDescription>Our AI evaluates resumes across 6 weighted criteria</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { icon: Target, title: "Job Relevance", desc: "How well the resume aligns with the job description", weight: "30%", gradient: "from-indigo-500 to-blue-600" },
                                { icon: Zap, title: "Hard Skills Match", desc: "Technical skills and tools matching the requirements", weight: "25%", gradient: "from-violet-500 to-purple-600" },
                                { icon: Mic, title: "Soft Skills", desc: "Communication, leadership, teamwork indicators", weight: "15%", gradient: "from-rose-500 to-pink-600" },
                                { icon: TrendingUp, title: "Work Experience", desc: "Relevance and depth of professional experience", weight: "15%", gradient: "from-emerald-500 to-teal-600" },
                                { icon: Star, title: "Achievements", desc: "Quantifiable accomplishments and impact", weight: "10%", gradient: "from-amber-500 to-orange-600" },
                                { icon: BookOpen, title: "Education", desc: "Academic background and qualifications", weight: "5%", gradient: "from-blue-500 to-indigo-600" },
                            ].map((item, i) => {
                                const TipIcon = item.icon
                                return (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-all group">
                                        <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient} text-white shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                                            <TipIcon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold text-sm">{item.title}</p>
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.weight}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
