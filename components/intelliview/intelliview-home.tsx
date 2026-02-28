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

const mockApplications = [
    {
        id: "1",
        role: "Senior Frontend Developer",
        company: "TechCorp Global",
        status: "interview_scheduled",
        date: "2026-02-26",
        aiScore: 88,
    },
    {
        id: "2",
        role: "Full Stack Engineer",
        company: "InnovateLabs",
        status: "resume_reviewed",
        date: "2026-02-23",
        aiScore: 75,
    },
    {
        id: "3",
        role: "UX Engineer",
        company: "DesignFlow",
        status: "submitted",
        date: "2026-02-22",
        aiScore: null,
    },
]

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
    submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
    resume_reviewed: { label: "Resume Reviewed", color: "bg-amber-100 text-amber-700 border-amber-200", icon: FileText },
    interview_scheduled: { label: "Interview Scheduled", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: Video },
    completed: { label: "Completed", color: "bg-purple-100 text-purple-700 border-purple-200", icon: CheckCircle2 },
}

const prepTips = [
    {
        icon: Mic,
        title: "Practice Speaking",
        description: "Rehearse your answers out loud. AI interviews analyze clarity, confidence, and articulation.",
        gradient: "from-rose-500 to-pink-600",
    },
    {
        icon: Target,
        title: "STAR Method",
        description: "Structure answers: Situation, Task, Action, Result. This helps the AI assess your problem-solving approach.",
        gradient: "from-blue-500 to-indigo-600",
    },
    {
        icon: Lightbulb,
        title: "Research the Role",
        description: "Understand the job requirements. The AI tailors questions based on the role you're applying for.",
        gradient: "from-amber-500 to-orange-600",
    },
    {
        icon: TrendingUp,
        title: "Show Growth",
        description: "Highlight learning experiences and career progression. The AI values adaptability and continuous growth.",
        gradient: "from-emerald-500 to-teal-600",
    },
]

export function IntelliViewHome() {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [showInterviewDialog, setShowInterviewDialog] = useState(false)
    const [showUploadSuccess, setShowUploadSuccess] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

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
        if (file && (file.type === "application/pdf" || file.name.endsWith(".pdf") || file.name.endsWith(".docx") || file.name.endsWith(".doc"))) {
            setUploadedFile(file)
            setShowUploadSuccess(true)
            setTimeout(() => setShowUploadSuccess(false), 3000)
        }
    }
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setUploadedFile(file)
            setShowUploadSuccess(true)
            setTimeout(() => setShowUploadSuccess(false), 3000)
        }
    }

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
                                AI-Powered Interviews
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Welcome to IntelliView</h1>
                        <p className="text-white/80 text-lg leading-relaxed">
                            Your AI-powered interview platform. Submit your resume, practice with AI interviews, and land your dream role — all in one place.
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                size="lg"
                                className="bg-white text-violet-700 hover:bg-white/90 shadow-lg font-semibold"
                                onClick={() => setShowInterviewDialog(true)}
                            >
                                <Play className="h-4 w-4 mr-2" />
                                Start AI Interview
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white/40 text-white hover:bg-white/10 backdrop-blur-sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Resume
                            </Button>
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-150" />
                            <div className="relative p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                                <Sparkles className="h-20 w-20 text-white/90 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column — Resume Upload + AI Interview */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Resume Upload */}
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="h-5 w-5 text-indigo-600" />
                                Submit Your Resume
                            </CardTitle>
                            <CardDescription>Upload your CV to get AI-matched with the best opportunities</CardDescription>
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
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={handleFileInput}
                                />

                                {uploadedFile ? (
                                    <div className="space-y-3">
                                        <div className="mx-auto w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-emerald-700">Resume Uploaded Successfully!</p>
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
                                                    }}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        {showUploadSuccess && (
                                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <Badge className="bg-emerald-600">
                                                    <Sparkles className="h-3 w-3 mr-1" />
                                                    AI is analyzing your resume...
                                                </Badge>
                                            </div>
                                        )}
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
                                                or <span className="text-indigo-600 font-medium underline underline-offset-2">browse files</span> • PDF, DOC, DOCX
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Start AI Interview */}
                    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-200/40 to-transparent rounded-bl-[100px]" />
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Video className="h-5 w-5 text-violet-600" />
                                    AI Interview Sessions
                                </CardTitle>
                                <CardDescription>Practice or complete real AI-powered interviews</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div
                                        className="p-5 rounded-xl border-2 border-dashed border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 hover:border-violet-400 hover:shadow-md transition-all cursor-pointer group/card"
                                        onClick={() => setShowInterviewDialog(true)}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white shadow-md group-hover/card:scale-110 transition-transform">
                                                <Play className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">Start Live Interview</p>
                                                <p className="text-xs text-muted-foreground">AI-guided session</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Begin a real-time AI interview. Video & audio enabled with instant feedback.
                                        </p>
                                    </div>

                                    <div
                                        className="p-5 rounded-xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group/card"
                                        onClick={() => setShowInterviewDialog(true)}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-md group-hover/card:scale-110 transition-transform">
                                                <BookOpen className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">Practice Mode</p>
                                                <p className="text-xs text-muted-foreground">No pressure</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Practice with AI-generated questions. Get scored and improve before the real interview.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </div>
                    </Card>

                    {/* Application Tracker */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                                My Applications
                            </CardTitle>
                            <CardDescription>Track your submitted applications and interview status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {mockApplications.map((app) => {
                                    const st = statusLabels[app.status]
                                    const StIcon = st.icon
                                    return (
                                        <div
                                            key={app.id}
                                            className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-sm transition-all group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-indigo-100 rounded-lg">
                                                    <FileText className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{app.role}</p>
                                                    <p className="text-xs text-muted-foreground">{app.company} · Applied {new Date(app.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {app.aiScore && (
                                                    <div className="text-right hidden sm:block">
                                                        <p className="text-xs text-muted-foreground">AI Match</p>
                                                        <p className="font-bold text-sm text-indigo-600">{app.aiScore}%</p>
                                                    </div>
                                                )}
                                                <Badge variant="outline" className={`text-xs ${st.color}`}>
                                                    <StIcon className="h-3 w-3 mr-1" />
                                                    {st.label}
                                                </Badge>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column — Quick Stats & Tips */}
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Zap className="h-5 w-5 text-amber-500" />
                                Quick Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                <span className="text-sm text-muted-foreground">Applications</span>
                                <span className="text-lg font-bold text-indigo-600">{mockApplications.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                <span className="text-sm text-muted-foreground">Interviews</span>
                                <span className="text-lg font-bold text-violet-600">
                                    {mockApplications.filter((a) => a.status === "interview_scheduled").length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                <span className="text-sm text-muted-foreground">Avg AI Match</span>
                                <span className="text-lg font-bold text-emerald-600">
                                    {Math.round(mockApplications.filter((a) => a.aiScore).reduce((sum, a) => sum + (a.aiScore || 0), 0) / mockApplications.filter((a) => a.aiScore).length)}%
                                </span>
                            </div>
                            <div className="pt-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                                    <span>Profile Completeness</span>
                                    <span className="font-medium">72%</span>
                                </div>
                                <Progress value={72} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Interview Prep Tips */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Star className="h-5 w-5 text-amber-500" />
                                Interview Prep Tips
                            </CardTitle>
                            <CardDescription>Get ready to ace your AI interview</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {prepTips.map((tip, i) => {
                                const TipIcon = tip.icon
                                return (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-all cursor-pointer group">
                                        <div className={`p-2 rounded-lg bg-gradient-to-br ${tip.gradient} text-white shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                                            <TipIcon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{tip.title}</p>
                                            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{tip.description}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Start Interview Dialog */}
            <Dialog open={showInterviewDialog} onOpenChange={setShowInterviewDialog}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white">
                                <Video className="h-5 w-5" />
                            </div>
                            Start AI Interview
                        </DialogTitle>
                        <DialogDescription>
                            Set up your interview session. The AI will adapt questions based on your resume and the target role.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Target Role</Label>
                            <Input placeholder="e.g. Senior Frontend Developer" />
                        </div>
                        <div className="space-y-2">
                            <Label>Company (Optional)</Label>
                            <Input placeholder="e.g. TechCorp Global" />
                        </div>
                        <div className="space-y-2">
                            <Label>Additional Notes</Label>
                            <Textarea placeholder="Any specific areas you want to focus on..." className="resize-none h-20" />
                        </div>

                        <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-violet-100 rounded-lg">
                                    <Sparkles className="h-4 w-4 text-violet-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-violet-900">AI-Adaptive Questions</p>
                                    <p className="text-xs text-violet-600">The AI will generate personalized questions based on your profile</p>
                                </div>
                            </div>
                        </div>

                        {!uploadedFile && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-xs text-amber-700 flex items-center gap-1.5">
                                    <Upload className="h-3 w-3" />
                                    Upload your resume first for better-tailored questions
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowInterviewDialog(false)}>Cancel</Button>
                        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                            <Play className="h-4 w-4 mr-1.5" />
                            Begin Interview
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
