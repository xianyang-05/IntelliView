"use client"

import { useState, useRef } from "react"
import {
    Upload,
    FileText,
    Brain,
    CheckCircle2,
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
    X,
    File,
    Search,
    Loader2,
    Building2,
    MapPin,
    DollarSign,
    Briefcase,
    ClipboardCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AiInterview } from "./ai-interview"
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"

// ─── Types ───────────────────────────────────────────
interface AnalysisResult {
    criteria: any[]
    weighted_total: number
    summary: string
    fact_check_questions: string[]
    report_path: string
    report_id?: string
}

interface JobListing {
    id: string
    title: string
    company: string
    company_code: string
    location: string
    type: string
    salary_range: string
    description: string
    requirements: string[]
    posted_at: string
    is_active: boolean
}

interface CandidateHomeProps {
    selectedJob?: JobListing | null
    currentUser?: any
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

function getCompanyGradient(company: string) {
    const gradients: Record<string, string> = {
        "TechNova Solutions": "from-blue-500 to-cyan-500",
        "Axiom Corp": "from-violet-500 to-purple-500",
        "GreenLeaf Ventures": "from-emerald-500 to-teal-500",
        "Pinnacle Analytics": "from-orange-500 to-amber-500",
        "CloudBridge Systems": "from-indigo-500 to-blue-500",
    }
    return gradients[company] || "from-slate-500 to-slate-600"
}

// ═════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════
export function CandidateHome({ selectedJob, currentUser }: CandidateHomeProps) {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisStep, setAnalysisStep] = useState(0)
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
    const [analysisError, setAnalysisError] = useState<string | null>(null)
    const [showInterview, setShowInterview] = useState(false)
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

    // ─── Build job description from selected job ─────
    const buildJobDescription = () => {
        if (!selectedJob) return ""
        return `Position: ${selectedJob.title}\nCompany: ${selectedJob.company}\nLocation: ${selectedJob.location}\nType: ${selectedJob.type}\nSalary: ${selectedJob.salary_range}\n\nDescription:\n${selectedJob.description}\n\nRequirements:\n${selectedJob.requirements.map((r) => `- ${r}`).join("\n")}`
    }

    // ─── Analyze resume ──────────────────────────────
    const handleAnalyze = async () => {
        if (!uploadedFile || !selectedJob) return

        setIsAnalyzing(true)
        setAnalysisError(null)
        setAnalysisResult(null)
        setAnalysisStep(1)

        try {
            const formData = new FormData()
            formData.append("resume", uploadedFile)
            formData.append("job_description", buildJobDescription())
            formData.append("company_name", selectedJob.company)
            formData.append("company_code", selectedJob.company_code || "")
            formData.append("job_title", selectedJob.title)
            formData.append("candidate_name", currentUser?.name || currentUser?.full_name || "Unknown Candidate")

            const stepTimer1 = setTimeout(() => setAnalysisStep(2), 2000)
            const stepTimer2 = setTimeout(() => setAnalysisStep(3), 5000)

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
            if (data.detail) {
                throw new Error(data.detail)
            }

            // Save report to Firestore
            try {
                const reportDoc = await addDoc(collection(db, "resume_reports"), {
                    company_name: selectedJob.company,
                    company_code: selectedJob.company_code || "",
                    job_title: selectedJob.title,
                    candidate_name: currentUser?.name || currentUser?.full_name || "Unknown Candidate",
                    candidate_email: currentUser?.email || null,
                    score: data.weighted_total,
                    summary: data.summary,
                    criteria: data.criteria,
                    fact_check_questions: data.fact_check_questions,
                    created_at: new Date().toISOString(),
                })
                data.report_id = reportDoc.id
                console.log("Report saved to Firestore:", reportDoc.id)
            } catch (firebaseErr) {
                console.error("Failed to save report to Firestore:", firebaseErr)
            }

            setAnalysisResult(data)
            setAnalysisStep(4)
        } catch (err: any) {
            setAnalysisError(err.message || "Analysis failed. Please try again.")
            setAnalysisStep(0)
        } finally {
            setIsAnalyzing(false)
        }
    }

    // ─── Interview mode ──────────────────────────────
    if (showInterview) {
        return <AiInterview onEnd={() => setShowInterview(false)} />
    }

    // ─── No job selected state ───────────────────────
    if (!selectedJob) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                            <Briefcase className="h-8 w-8 text-indigo-400" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="font-semibold text-lg">No Position Selected</p>
                            <p className="text-muted-foreground text-sm">
                                Please select a job from the Job Board to begin your application.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
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
                        <h1 className="text-3xl font-bold tracking-tight">Apply for Position</h1>
                        <p className="text-white/80 text-lg leading-relaxed">
                            Upload your resume and we'll analyze it against the position requirements using AI.
                        </p>
                    </div>
                    <div className="hidden lg:flex items-center justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-150" />
                            <div className="relative p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                                <ClipboardCheck className="h-20 w-20 text-white/90 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Position Details Card */}
                    <Card className="overflow-hidden border-indigo-100">
                        <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-violet-50">
                            <div className="flex items-start gap-3">
                                <div
                                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCompanyGradient(
                                        selectedJob.company
                                    )} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}
                                >
                                    {selectedJob.company
                                        .split(" ")
                                        .map((w) => w[0])
                                        .join("")
                                        .slice(0, 2)}
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{selectedJob.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-1 mt-0.5">
                                        <Building2 className="h-3.5 w-3.5" />
                                        {selectedJob.company}
                                    </CardDescription>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={`shrink-0 ${
                                        selectedJob.type === "Full-time"
                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                            : selectedJob.type === "Part-time"
                                            ? "bg-amber-100 text-amber-700 border-amber-200"
                                            : "bg-violet-100 text-violet-700 border-violet-200"
                                    }`}
                                >
                                    {selectedJob.type}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-indigo-500" />
                                    {selectedJob.location}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <DollarSign className="h-4 w-4 text-emerald-500" />
                                    {selectedJob.salary_range}
                                </span>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {selectedJob.description}
                            </p>

                            <div>
                                <p className="text-sm font-semibold mb-2">Requirements</p>
                                <ul className="space-y-1.5">
                                    {selectedJob.requirements.map((req, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <Sparkles className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

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
                                            <p className="font-semibold text-foreground">Drag & drop your resume here</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                or <span className="text-indigo-600 font-medium underline underline-offset-2">browse files</span> • PDF only
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Submission Button */}
                            <div className="flex items-center justify-end mt-4">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg font-semibold"
                                    disabled={!uploadedFile || isAnalyzing || !!analysisResult}
                                    onClick={handleAnalyze}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : analysisResult ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Analysis Complete
                                        </>
                                    ) : (
                                        <>
                                            <ClipboardCheck className="h-4 w-4 mr-2" />
                                            Confirm Submission
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

                    {/* ── SUCCESS: Proceed to AI Screening ── */}
                    {analysisResult && (
                        <Card className="overflow-hidden border-2 border-emerald-200 shadow-lg">
                            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">
                                <div className="flex flex-col items-center text-center space-y-5">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-200/50">
                                        <CheckCircle2 className="h-10 w-10 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-emerald-800">
                                            Resume Analysis Complete!
                                        </h3>
                                        <p className="text-emerald-600/80 max-w-md leading-relaxed">
                                            Your resume scored <span className="font-bold">{analysisResult.weighted_total}/100</span>. You're now ready to proceed to the AI screening interview.
                                        </p>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg font-semibold h-14 px-8 text-base rounded-xl gap-3"
                                        onClick={() => setShowInterview(true)}
                                    >
                                        <Video className="h-5 w-5" />
                                        Start AI Screening Interview
                                        <ArrowRight className="h-5 w-5" />
                                    </Button>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Mic className="h-3.5 w-3.5" />
                                        Camera and microphone required
                                    </p>
                                </div>
                            </div>
                        </Card>
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
                                <StepIndicator step={4} currentStep={analysisStep} label="Analysis complete" />
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
