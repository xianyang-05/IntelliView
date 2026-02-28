"use client"

import { useState, useEffect } from "react"
import {
    Users, Search, FileText, Eye, Send, XCircle,
    ChevronRight, Clock, CheckCircle, AlertCircle, Sparkles,
    Briefcase, MapPin, ArrowLeft, X,
    Filter, Award, TrendingUp, Loader2, Building2, Target, Star,
    ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, PenLine
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, doc, updateDoc, addDoc, limit } from "firebase/firestore"
import { HrInterviewReport } from "./hr-interview-report"

// ── Types ──
type DecisionStatus = "pending" | "offer_sent" | "rejected"

interface ResumeReport {
    id: string
    company_name: string
    company_code: string
    job_title: string
    candidate_name: string
    candidate_email: string | null
    score: number
    summary: string
    criteria: { criterion: string; weight: number; score: number; explanation: string }[]
    fact_check_questions: string[]
    created_at: string
    decision_status?: DecisionStatus
}

// ── Score badge color ──
function getScoreBadge(score: number) {
    if (score >= 80) return "bg-emerald-100 text-emerald-700 border-emerald-200"
    if (score >= 60) return "bg-amber-100 text-amber-700 border-amber-200"
    return "bg-red-100 text-red-700 border-red-200"
}

function getScoreLabel(score: number) {
    if (score >= 80) return "Strong"
    if (score >= 60) return "Average"
    return "Below Average"
}

function getStatusBadge(status: DecisionStatus) {
    if (status === "offer_sent") return "bg-emerald-100 text-emerald-700 border-emerald-200"
    if (status === "rejected") return "bg-red-100 text-red-700 border-red-200"
    return "bg-amber-100 text-amber-700 border-amber-200"
}

function getStatusLabel(status: DecisionStatus) {
    if (status === "offer_sent") return "Offer Sent"
    if (status === "rejected") return "Rejected"
    return "Pending"
}

// ═══════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════
export function HrInterviewCenter({ onNavigate, currentUser }: { onNavigate?: (page: string) => void; currentUser?: any }) {
    const [reports, setReports] = useState<ResumeReport[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedReport, setSelectedReport] = useState<ResumeReport | null>(null)

    // Sidebar: decision status filter
    const [statusFilter, setStatusFilter] = useState<"all" | DecisionStatus>("all")

    // Table-level: score filter + sort
    const [scoreFilter, setScoreFilter] = useState<string>("all")
    const [scoreSortOrder, setScoreSortOrder] = useState<"none" | "asc" | "desc">("none")

    const [showOfferModal, setShowOfferModal] = useState(false)
    const [offerReport, setOfferReport] = useState<ResumeReport | null>(null)
    const [showPreview, setShowPreview] = useState(false)
    const [interviewReport, setInterviewReport] = useState<any>(null)
    const [showInterviewReport, setShowInterviewReport] = useState(false)
    const [loadingInterviewReport, setLoadingInterviewReport] = useState<string | null>(null)
    const [offerForm, setOfferForm] = useState({
        position: "",
        salary: "8000",
        startDate: "2026-03-15",
        benefits: "Medical, Dental, Vision, EPF, SOCSO",
        contractType: "permanent",
        probation: "3",
        annualLeave: "14",
    })
    const [isEditingOffer, setIsEditingOffer] = useState(false)
    const [offerLetterId, setOfferLetterId] = useState<string | null>(null)

    // ── Fetch resume reports from Firestore ──
    useEffect(() => {
        async function fetchReports() {
            try {
                const companyCode = currentUser?.companyId || "ZHR-001"
                const q = query(
                    collection(db, "resume_reports"),
                    where("company_code", "==", companyCode)
                )

                const snapshot = await getDocs(q)
                const data: ResumeReport[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as ResumeReport[]

                // Default status to pending if not set
                data.forEach(r => {
                    if (!r.decision_status) r.decision_status = "pending"
                })

                // Sort newest first
                data.sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
                setReports(data)
            } catch (err) {
                console.error("Failed to fetch resume reports:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchReports()
    }, [currentUser])

    // ── Fetch interview report ──
    const fetchInterviewReport = async (candidateId: string) => {
        setLoadingInterviewReport(candidateId)
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
            // Try to find report by session ID pattern
            const reportId = `report_${candidateId}`
            const res = await fetch(`${backendUrl}/api/report/${reportId}/json`)
            if (res.ok) {
                const data = await res.json()
                setInterviewReport(data)
                setShowInterviewReport(true)
            } else {
                toast.error("Report Not Found", { description: "No interview report available for this candidate yet." })
            }
        } catch (err) {
            console.error("Failed to fetch interview report:", err)
            toast.error("Error", { description: "Failed to load interview report." })
        } finally {
            setLoadingInterviewReport(null)
        }
    }

    // ── Update decision status in Firebase ──
    async function updateDecisionStatus(reportId: string, status: DecisionStatus) {
        try {
            const docRef = doc(db, "resume_reports", reportId)
            await updateDoc(docRef, { decision_status: status })
        } catch (err) {
            console.error("Failed to update decision status:", err)
        }
    }

    // ── Filter logic ──
    const filteredReports = reports.filter((r) => {
        const matchesSearch =
            !searchQuery ||
            r.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.job_title.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus =
            statusFilter === "all" || r.decision_status === statusFilter

        const matchesScore =
            scoreFilter === "all" ||
            (scoreFilter === "strong" && r.score >= 80) ||
            (scoreFilter === "average" && r.score >= 60 && r.score < 80) ||
            (scoreFilter === "below" && r.score < 60)

        return matchesSearch && matchesStatus && matchesScore
    })

    // ── Sort by score ──
    const sortedReports = [...filteredReports]
    if (scoreSortOrder === "asc") {
        sortedReports.sort((a, b) => a.score - b.score)
    } else if (scoreSortOrder === "desc") {
        sortedReports.sort((a, b) => b.score - a.score)
    }

    // ── Stat counts ──
    const pendingCount = reports.filter((r) => r.decision_status === "pending").length
    const offerSentCount = reports.filter((r) => r.decision_status === "offer_sent").length
    const rejectedCount = reports.filter((r) => r.decision_status === "rejected").length

    // ── Cycle sort order ──
    function cycleSortOrder() {
        if (scoreSortOrder === "none") setScoreSortOrder("desc")
        else if (scoreSortOrder === "desc") setScoreSortOrder("asc")
        else setScoreSortOrder("none")
    }

    // ══════ REPORT DETAIL PANEL ══════
    if (selectedReport) {
        return (
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedReport(null)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <Avatar className="h-14 w-14">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-bold">
                                {selectedReport.candidate_name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold">{selectedReport.candidate_name}</h1>
                            <p className="text-muted-foreground">{selectedReport.job_title} · {selectedReport.company_name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className={`${getScoreBadge(selectedReport.score)} border text-sm px-3 py-1`}>
                            Score: {selectedReport.score}/100 — {getScoreLabel(selectedReport.score)}
                        </Badge>
                        <Badge className={`${getStatusBadge(selectedReport.decision_status || "pending")} border text-sm px-3 py-1`}>
                            {getStatusLabel(selectedReport.decision_status || "pending")}
                        </Badge>
                        {selectedReport.decision_status === "pending" && (
                            <>
                                <Button
                                    className="gap-2"
                                    onClick={() => {
                                        setOfferReport(selectedReport)
                                        setOfferForm({
                                            position: selectedReport.job_title,
                                            salary: "8000",
                                            startDate: "2026-03-15",
                                            benefits: "Medical, Dental, Vision, EPF, SOCSO",
                                            contractType: "permanent",
                                            probation: "3",
                                            annualLeave: "14"
                                        })
                                        setIsEditingOffer(false)
                                        setOfferLetterId(null)
                                        setShowOfferModal(true)
                                    }}
                                >
                                    <Send className="h-4 w-4" />
                                    Send Offer
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={async () => {
                                        await updateDecisionStatus(selectedReport.id, "rejected")
                                        setReports(prev => prev.map(r => r.id === selectedReport.id ? { ...r, decision_status: "rejected" as DecisionStatus } : r))
                                        setSelectedReport(prev => prev ? { ...prev, decision_status: "rejected" as DecisionStatus } : prev)
                                        toast("Candidate Rejected", { description: selectedReport.candidate_name })
                                    }}
                                >
                                    <XCircle className="h-4 w-4" />
                                    Reject
                                </Button>
                            </>
                        )}
                        {selectedReport.decision_status === "offer_sent" && (
                            <Button
                                className="gap-2 bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleEditOffer(selectedReport)}
                            >
                                <PenLine className="h-4 w-4" />
                                Edit Offer
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Profile + AI Summary */}
                    <div className="space-y-6">
                        {/* Quick Info */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Applicant Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>{selectedReport.candidate_name}</span>
                                </div>
                                {selectedReport.candidate_email && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="truncate">{selectedReport.candidate_email}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm">
                                    <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>{selectedReport.job_title}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>{selectedReport.company_name}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>{new Date(selectedReport.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Summary */}
                        <Card className="border-purple-200/50 bg-purple-50/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-purple-500" />
                                    Overall Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed text-muted-foreground">{selectedReport.summary}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Middle: Criteria Breakdown */}
                    <div>
                        <Card className="h-full">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Award className="h-4 w-4 text-amber-500" />
                                    Criteria Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedReport.criteria.map((c, i) => (
                                    <div key={i}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium">{c.criterion}</span>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{c.weight}%</Badge>
                                                <span className="text-sm font-bold">{c.score}/100</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-secondary rounded-full h-2 mb-1.5">
                                            <div
                                                className={`h-2 rounded-full transition-all ${c.score >= 80 ? "bg-emerald-500" : c.score >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                                                style={{ width: `${c.score}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{c.explanation}</p>
                                    </div>
                                ))}

                                <div className="border-t pt-3 mt-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold">Weighted Total</span>
                                        <span className="text-lg font-bold">{selectedReport.score}/100</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Fact-check Questions */}
                    <div>
                        <Card className="h-full">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Target className="h-4 w-4 text-indigo-500" />
                                    Fact-Check Questions
                                </CardTitle>
                                <CardDescription>AI-generated questions to verify resume claims</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {selectedReport.fact_check_questions.map((q, i) => (
                                        <div key={i} className="flex gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-all">
                                            <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                {i + 1}
                                            </span>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{q}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    // ══════ MAIN VIEW ══════
    return (
        <div className="flex h-full">
            {/* ── Decision Status Sidebar ── */}
            <aside className="w-56 border-r bg-card/50 shrink-0">
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-sm text-muted-foreground">Filter by Status</h3>
                </div>
                <ScrollArea className="h-[calc(100%-52px)]">
                    <div className="p-2 space-y-0.5">
                        {[
                            { id: "all", label: "All Candidates", icon: Users, color: "text-slate-500", count: reports.length },
                            { id: "pending", label: "Pending Decision", icon: Clock, color: "text-amber-500", count: pendingCount },
                            { id: "offer_sent", label: "Offer Sent", icon: Send, color: "text-emerald-500", count: offerSentCount },
                            { id: "rejected", label: "Rejected", icon: XCircle, color: "text-red-500", count: rejectedCount },
                        ].map(item => {
                            const Icon = item.icon
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setStatusFilter(item.id as any)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${statusFilter === item.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary/80 text-muted-foreground"}`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Icon className={`h-4 w-4 ${statusFilter === item.id ? "text-primary" : item.color}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusFilter === item.id ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                                        {item.count}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </ScrollArea>
            </aside>

            {/* ── Main Content ── */}
            <div className="flex-1 p-6 overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            {onNavigate && (
                                <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")} className="shrink-0">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold">Interview Center</h1>
                                <p className="text-muted-foreground text-sm">View resume analysis reports for applicants</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search applicants..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total Candidates", value: reports.length, icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
                        { label: "Pending Decision", value: pendingCount, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
                        { label: "Offers Sent", value: offerSentCount, icon: Send, color: "text-emerald-500", bg: "bg-emerald-50" },
                        { label: "Rejected", value: rejectedCount, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
                    ].map(stat => (
                        <Card key={stat.label}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                        <p className="text-muted-foreground text-sm">Loading reports...</p>
                    </div>
                )}

                {/* Reports Table */}
                {!loading && (
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/30">
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Candidate</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Position</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    {/* Score column header with inline filter + sort */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                                                Score
                                                                <ChevronDown className="h-3.5 w-3.5" />
                                                                {scoreFilter !== "all" && (
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                                )}
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="start" className="w-44">
                                                            <DropdownMenuLabel className="text-xs">Filter by Score</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            {[
                                                                { id: "all", label: "All Scores" },
                                                                { id: "strong", label: "Strong (80+)" },
                                                                { id: "average", label: "Average (60–79)" },
                                                                { id: "below", label: "Below Avg (<60)" },
                                                            ].map(item => (
                                                                <DropdownMenuItem
                                                                    key={item.id}
                                                                    onClick={() => setScoreFilter(item.id)}
                                                                    className={scoreFilter === item.id ? "bg-primary/10 font-medium" : ""}
                                                                >
                                                                    {scoreFilter === item.id && <CheckCircle className="h-3.5 w-3.5 mr-2 text-primary" />}
                                                                    {scoreFilter !== item.id && <span className="w-[22px]" />}
                                                                    {item.label}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                    {/* Sort toggle */}
                                                    <button
                                                        onClick={cycleSortOrder}
                                                        className="p-1 rounded hover:bg-secondary transition-colors"
                                                        title={scoreSortOrder === "none" ? "Sort by score" : scoreSortOrder === "desc" ? "Sorted: High → Low" : "Sorted: Low → High"}
                                                    >
                                                        {scoreSortOrder === "none" && <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />}
                                                        {scoreSortOrder === "desc" && <ArrowDown className="h-3.5 w-3.5 text-primary" />}
                                                        {scoreSortOrder === "asc" && <ArrowUp className="h-3.5 w-3.5 text-primary" />}
                                                    </button>
                                                </div>
                                            </th>
                                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedReports.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                                                    {reports.length === 0 ? "No resume reports yet" : "No reports match your filters"}
                                                </td>
                                            </tr>
                                        ) : (
                                            sortedReports.map(report => (
                                                <tr
                                                    key={report.id}
                                                    className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                                                    onClick={() => setSelectedReport(report)}
                                                >
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9">
                                                                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 text-xs font-semibold">
                                                                    {report.candidate_name.split(" ").map(n => n[0]).join("")}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">{report.candidate_name}</p>
                                                                <p className="text-xs text-muted-foreground">{report.candidate_email || "—"}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <p className="font-medium">{report.job_title}</p>
                                                        <p className="text-xs text-muted-foreground">{report.company_name}</p>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-sm">
                                                            {new Date(report.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge className={`${getScoreBadge(report.score)} border text-xs`}>
                                                            {report.score}/100
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge className={`${getStatusBadge(report.decision_status || "pending")} border text-xs`}>
                                                            {getStatusLabel(report.decision_status || "pending")}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="gap-1.5 text-xs h-8"
                                                                onClick={() => setSelectedReport(report)}
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />
                                                                Resume Report
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="gap-1.5 text-xs h-8 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                                                onClick={() => fetchInterviewReport(report.id)}
                                                                disabled={loadingInterviewReport === report.id}
                                                            >
                                                                {loadingInterviewReport === report.id ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                ) : (
                                                                    <FileText className="h-3.5 w-3.5" />
                                                                )}
                                                                Interview Report
                                                            </Button>
                                                            {report.decision_status === "pending" && (
                                                                <>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="gap-1.5 text-xs h-8"
                                                                        onClick={() => {
                                                                            setOfferReport(report)
                                                                            setOfferForm({
                                                                                position: report.job_title,
                                                                                salary: "8000",
                                                                                startDate: "2026-03-15",
                                                                                benefits: "Medical, Dental, Vision, EPF, SOCSO",
                                                                                contractType: "permanent",
                                                                                probation: "3",
                                                                                annualLeave: "14"
                                                                            })
                                                                            setIsEditingOffer(false)
                                                                            setOfferLetterId(null)
                                                                            setShowOfferModal(true)
                                                                        }}
                                                                    >
                                                                        <Send className="h-3.5 w-3.5" />
                                                                        Send Offer
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="gap-1.5 text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                        onClick={async () => {
                                                                            await updateDecisionStatus(report.id, "rejected")
                                                                            setReports(prev => prev.map(r => r.id === report.id ? { ...r, decision_status: "rejected" as DecisionStatus } : r))
                                                                            toast("Candidate Rejected", { description: report.candidate_name })
                                                                        }}
                                                                    >
                                                                        <XCircle className="h-3.5 w-3.5" />
                                                                        Reject
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {report.decision_status === "offer_sent" && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="gap-1.5 text-xs h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                                                    onClick={() => handleEditOffer(report)}
                                                                >
                                                                    <PenLine className="h-3.5 w-3.5" />
                                                                    Edit Offer
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Offer Modal */}
            {renderOfferModal()}

            {/* Interview Report Overlay */}
            {showInterviewReport && interviewReport && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <HrInterviewReport
                            report={interviewReport}
                            onClose={() => {
                                setShowInterviewReport(false)
                                setInterviewReport(null)
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    )

    // ── Edit Offer handler ──
    async function handleEditOffer(report: ResumeReport) {
        setOfferReport(report)
        try {
            const q = query(collection(db, "offer_letters"), where("resume_report_id", "==", report.id), limit(1))
            const snapshot = await getDocs(q)
            if (!snapshot.empty) {
                const docSnap = snapshot.docs[0]
                const data = docSnap.data()
                setOfferForm({
                    position: data.position || report.job_title,
                    salary: data.salary || "8000",
                    startDate: data.start_date || "2026-03-15",
                    benefits: data.benefits || "Medical, Dental, Vision, EPF, SOCSO",
                    contractType: data.contract_type || "permanent",
                    probation: data.probation || "3",
                    annualLeave: data.annual_leave || "14",
                })
                setOfferLetterId(docSnap.id)
                setIsEditingOffer(true)
                setShowOfferModal(true)
            } else {
                toast.error("Could not find the sent offer letter.")
            }
        } catch (err) {
            console.error(err)
            toast.error("Failed to load offer details.")
        }
    }

    // ── Send/Update Offer handler ──
    async function handleSendOffer() {
        if (!offerReport) return

        const payload = {
            candidate_name: offerReport.candidate_name,
            candidate_email: offerReport.candidate_email || "",
            position: offerForm.position,
            company_name: offerReport.company_name,
            salary: offerForm.salary,
            start_date: offerForm.startDate,
            benefits: offerForm.benefits,
            contract_type: offerForm.contractType,
            probation: offerForm.probation,
            annual_leave: offerForm.annualLeave,
            status: "pending",
            sent_at: new Date().toISOString(),
            resume_report_id: offerReport.id,
        }

        try {
            if (isEditingOffer && offerLetterId) {
                // Update existing offer
                await updateDoc(doc(db, "offer_letters", offerLetterId), payload)

                // Push notification
                const notifs = JSON.parse(localStorage.getItem('notifications') || '[]')
                notifs.push({
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'offer_updated',
                    employee: offerReport.candidate_name,
                    title: `Offer Letter Updated: ${offerForm.position}`,
                    message: `Your offer letter for the ${offerForm.position} position at ${offerReport.company_name} has been updated.`,
                    timestamp: new Date().toISOString(),
                    read: false
                })
                localStorage.setItem('notifications', JSON.stringify(notifs))

                toast.success("Offer Updated!", { description: `Updated offer for ${offerReport.candidate_name}` })
            } else {
                // Send new offer
                await updateDecisionStatus(offerReport.id, "offer_sent")
                setReports(prev => prev.map(r => r.id === offerReport.id ? { ...r, decision_status: "offer_sent" as DecisionStatus } : r))

                await addDoc(collection(db, "offer_letters"), payload)

                // Push notification
                const notifs = JSON.parse(localStorage.getItem('notifications') || '[]')
                notifs.push({
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'offer_letter',
                    employee: offerReport.candidate_name,
                    title: `Offer Letter: ${offerForm.position}`,
                    message: `You have received an offer letter for the ${offerForm.position} position at ${offerReport.company_name}. Salary: RM ${Number(offerForm.salary).toLocaleString()}/month.`,
                    timestamp: new Date().toISOString(),
                    read: false
                })
                localStorage.setItem('notifications', JSON.stringify(notifs))

                toast.success("Offer Letter Sent!", { description: `Offer sent to ${offerReport.candidate_name} for ${offerForm.position}` })
            }
        } catch (err) {
            console.error("Failed to save offer letter:", err)
            toast.error("Failed to save offer letter")
            return
        }

        setShowOfferModal(false)
        setShowPreview(false)
        setOfferReport(null)
    }

    // ── Offer Modal ──
    function renderOfferModal() {
        return (
            <Dialog open={showOfferModal} onOpenChange={(v) => { setShowOfferModal(v); if (!v) setShowPreview(false) }}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {isEditingOffer ? <PenLine className="h-5 w-5 text-blue-600" /> : <Send className="h-5 w-5 text-primary" />}
                            {isEditingOffer ? "Edit Offer Letter" : "Send Offer Letter"}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditingOffer ? `Update the offer letter for ${offerReport?.candidate_name}` : `Prepare and send an offer letter to ${offerReport?.candidate_name}`}
                        </DialogDescription>
                    </DialogHeader>

                    {!showPreview ? (
                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Position</Label>
                                    <Input
                                        value={offerForm.position}
                                        onChange={e => setOfferForm(p => ({ ...p, position: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Monthly Salary (MYR)</Label>
                                    <Input
                                        type="number"
                                        value={offerForm.salary}
                                        onChange={e => setOfferForm(p => ({ ...p, salary: e.target.value }))}
                                        placeholder="e.g. 8000"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input
                                        type="date"
                                        value={offerForm.startDate}
                                        onChange={e => setOfferForm(p => ({ ...p, startDate: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Contract Type</Label>
                                    <Select value={offerForm.contractType} onValueChange={v => setOfferForm(p => ({ ...p, contractType: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="permanent">Permanent</SelectItem>
                                            <SelectItem value="fixed_term">Fixed Term</SelectItem>
                                            <SelectItem value="contract">Contract</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Probation Period (months)</Label>
                                    <Select value={offerForm.probation} onValueChange={v => setOfferForm(p => ({ ...p, probation: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">No Probation</SelectItem>
                                            <SelectItem value="3">3 Months</SelectItem>
                                            <SelectItem value="6">6 Months</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Annual Leave (Days)</Label>
                                    <Input
                                        type="number"
                                        value={offerForm.annualLeave}
                                        onChange={e => setOfferForm(p => ({ ...p, annualLeave: e.target.value }))}
                                        placeholder="e.g. 14"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Benefits Package</Label>
                                <Textarea
                                    value={offerForm.benefits}
                                    onChange={e => setOfferForm(p => ({ ...p, benefits: e.target.value }))}
                                    rows={3}
                                />
                            </div>
                            <DialogFooter className="pt-4">
                                <Button variant="outline" onClick={() => { setShowOfferModal(false); setShowPreview(false) }}>Cancel</Button>
                                <Button
                                    onClick={() => setShowPreview(true)}
                                    disabled={!offerForm.salary || !offerForm.startDate}
                                    className="gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    Preview Offer Letter
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <div className="space-y-4 py-2">
                            <div className="border rounded-lg p-8 bg-white text-slate-800 space-y-6 shadow-inner">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-sm">GL</div>
                                        <div>
                                            <p className="font-bold text-lg">GreenLeaf Ventures</p>
                                            <p className="text-xs text-slate-500">Malaysia</p>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-slate-500">
                                        <p>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                        <p>Ref: GLV/OL/{new Date().getFullYear()}/{Math.floor(Math.random() * 900 + 100)}</p>
                                    </div>
                                </div>
                                <div className="space-y-4 text-sm">
                                    <p>Dear <strong>{offerReport?.candidate_name}</strong>,</p>
                                    <p>We are delighted to extend this offer of employment for the position of <strong>{offerForm.position}</strong> at GreenLeaf Ventures. We were impressed with your qualifications and believe you will be a valuable addition to our team.</p>
                                    <div className="bg-slate-50 rounded-lg p-4 space-y-2 border">
                                        <p className="font-semibold text-slate-900">Terms of Employment</p>
                                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                                            <span className="text-slate-500">Position:</span>
                                            <span className="font-medium">{offerForm.position}</span>
                                            <span className="text-slate-500">Monthly Salary:</span>
                                            <span className="font-medium">RM {Number(offerForm.salary).toLocaleString()}</span>
                                            <span className="text-slate-500">Start Date:</span>
                                            <span className="font-medium">{new Date(offerForm.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                            <span className="text-slate-500">Contract Type:</span>
                                            <span className="font-medium capitalize">{offerForm.contractType.replace("_", " ")}</span>
                                            <span className="text-slate-500">Probation:</span>
                                            <span className="font-medium">{offerForm.probation === "0" ? "None" : offerForm.probation + " months"}</span>
                                            <span className="text-slate-500">Annual Leave:</span>
                                            <span className="font-medium">{offerForm.annualLeave} days</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 mb-1">Benefits</p>
                                        <p className="text-slate-600">{offerForm.benefits}</p>
                                    </div>
                                    <p>Please indicate your acceptance of this offer by signing below or responding to this letter by <strong>{new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>.</p>
                                    <div className="pt-4 space-y-6">
                                        <div>
                                            <p className="text-slate-500 text-xs mb-1">For GreenLeaf Ventures</p>
                                            <p className="font-bold">Rachel Lim</p>
                                            <p className="text-xs text-slate-500">HR Director</p>
                                        </div>
                                        <div className="border-t pt-4">
                                            <p className="text-slate-500 text-xs mb-1">Candidate Acceptance</p>
                                            <div className="border-b border-dashed border-slate-300 w-48 h-8" />
                                            <p className="text-xs text-slate-400 mt-1">{offerReport?.candidate_name} · Date: ___________</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="pt-2">
                                <Button variant="outline" onClick={() => setShowPreview(false)} className="gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Edit Details
                                </Button>
                                <Button onClick={handleSendOffer} className="gap-2 bg-green-600 hover:bg-green-700">
                                    {isEditingOffer ? <PenLine className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                                    {isEditingOffer ? "Update Offer Letter" : "Send Offer Letter"}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        )
    }
}
