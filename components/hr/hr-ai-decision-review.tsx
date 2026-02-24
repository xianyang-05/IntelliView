"use client"

import { useState } from "react"
import {
    Brain,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Clock,
    ThumbsUp,
    ThumbsDown,
    Eye,
    Filter,
    Search,
    TrendingUp,
    Users,
    ShieldCheck,
    BarChart3,
    ChevronRight,
    Sparkles,
    FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

type DecisionStatus = "pending" | "approved" | "rejected" | "flagged"

interface AIDecision {
    id: string
    type: "hiring" | "performance" | "compensation" | "termination"
    title: string
    employee?: string
    candidate?: string
    summary: string
    confidence: number
    recommendation: string
    status: DecisionStatus
    biasScore: number
    factors: { label: string; impact: "positive" | "negative" | "neutral"; weight: number }[]
    timestamp: string
}

const mockDecisions: AIDecision[] = [
    {
        id: "1",
        type: "hiring",
        title: "Senior Frontend Developer — Hiring Recommendation",
        candidate: "Sarah Chen",
        summary:
            "AI analysis of interview transcripts, coding assessment, and cultural fit scores indicates a strong match for the Senior Frontend Developer role.",
        confidence: 92,
        recommendation: "Strongly recommend hiring. Top 5% of assessed candidates.",
        status: "pending",
        biasScore: 96,
        factors: [
            { label: "Technical Skills", impact: "positive", weight: 95 },
            { label: "Communication", impact: "positive", weight: 88 },
            { label: "Cultural Fit", impact: "positive", weight: 91 },
            { label: "Experience Gap", impact: "negative", weight: 15 },
        ],
        timestamp: "2026-02-24T09:30:00Z",
    },
    {
        id: "2",
        type: "performance",
        title: "Quarterly Performance — Improvement Plan",
        employee: "Marcus Rivera",
        summary:
            "Performance metrics show a 23% decline in output over the last quarter. AI identified potential burnout patterns and workload imbalance.",
        confidence: 78,
        recommendation: "Suggest a structured improvement plan with reduced workload for 30 days.",
        status: "flagged",
        biasScore: 89,
        factors: [
            { label: "Output Decline", impact: "negative", weight: 72 },
            { label: "Attendance", impact: "neutral", weight: 50 },
            { label: "Peer Reviews", impact: "positive", weight: 80 },
            { label: "Burnout Risk", impact: "negative", weight: 68 },
        ],
        timestamp: "2026-02-23T14:15:00Z",
    },
    {
        id: "3",
        type: "compensation",
        title: "Salary Adjustment — Market Alignment",
        employee: "Priya Sharma",
        summary:
            "Market data analysis shows the current compensation is 18% below market median for comparable roles and experience levels.",
        confidence: 85,
        recommendation: "Recommend a 12% salary increase to align with market P50.",
        status: "approved",
        biasScore: 98,
        factors: [
            { label: "Market Position", impact: "negative", weight: 82 },
            { label: "Performance Rating", impact: "positive", weight: 90 },
            { label: "Tenure", impact: "positive", weight: 75 },
            { label: "Budget Impact", impact: "neutral", weight: 45 },
        ],
        timestamp: "2026-02-22T11:00:00Z",
    },
    {
        id: "4",
        type: "hiring",
        title: "Data Analyst — Hiring Recommendation",
        candidate: "James Walker",
        summary:
            "Candidate shows strong analytical skills but AI detected potential overconfidence indicators in behavioral assessment. Cultural fit score is average.",
        confidence: 64,
        recommendation: "Proceed with caution. Recommend second-round panel interview.",
        status: "pending",
        biasScore: 93,
        factors: [
            { label: "Analytical Skills", impact: "positive", weight: 88 },
            { label: "Behavioral Assessment", impact: "negative", weight: 55 },
            { label: "Cultural Fit", impact: "neutral", weight: 62 },
            { label: "References", impact: "positive", weight: 80 },
        ],
        timestamp: "2026-02-24T08:00:00Z",
    },
    {
        id: "5",
        type: "termination",
        title: "Contract Non-Renewal Assessment",
        employee: "Daniel Okafor",
        summary:
            "Contract assessment suggests non-renewal based on project completion, performance metrics, and team restructuring needs.",
        confidence: 71,
        recommendation: "AI recommends non-renewal with a transition plan. HR review required for bias audit.",
        status: "flagged",
        biasScore: 82,
        factors: [
            { label: "Project Status", impact: "neutral", weight: 60 },
            { label: "Performance", impact: "negative", weight: 55 },
            { label: "Team Redundancy", impact: "negative", weight: 70 },
            { label: "Retention Value", impact: "positive", weight: 45 },
        ],
        timestamp: "2026-02-21T16:45:00Z",
    },
]

const statusConfig: Record<DecisionStatus, { label: string; color: string; icon: any }> = {
    pending: { label: "Pending Review", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
    flagged: { label: "Flagged for Review", color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertTriangle },
}

const typeConfig: Record<string, { label: string; gradient: string; icon: any }> = {
    hiring: { label: "Hiring", gradient: "from-blue-500 to-indigo-600", icon: Users },
    performance: { label: "Performance", gradient: "from-amber-500 to-orange-600", icon: TrendingUp },
    compensation: { label: "Compensation", gradient: "from-emerald-500 to-teal-600", icon: BarChart3 },
    termination: { label: "Contract", gradient: "from-rose-500 to-red-600", icon: FileText },
}

export function HrAiDecisionReview() {
    const [decisions, setDecisions] = useState<AIDecision[]>(mockDecisions)
    const [selectedDecision, setSelectedDecision] = useState<AIDecision | null>(null)
    const [detailOpen, setDetailOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("all")

    const filteredDecisions = decisions.filter((d) => {
        const matchesSearch =
            d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.candidate || d.employee || "").toLowerCase().includes(searchQuery.toLowerCase())
        const matchesTab = activeTab === "all" || d.type === activeTab
        return matchesSearch && matchesTab
    })

    const handleAction = (id: string, action: "approved" | "rejected") => {
        setDecisions((prev) => prev.map((d) => (d.id === id ? { ...d, status: action } : d)))
        if (selectedDecision?.id === id) {
            setSelectedDecision((prev) => (prev ? { ...prev, status: action } : prev))
        }
    }

    const pendingCount = decisions.filter((d) => d.status === "pending" || d.status === "flagged").length
    const avgConfidence = Math.round(decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length)
    const avgBias = Math.round(decisions.reduce((sum, d) => sum + d.biasScore, 0) / decisions.length)

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white shadow-lg">
                            <Brain className="h-6 w-6" />
                        </div>
                        AI Decision Review
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Review and approve AI-generated recommendations across hiring, performance, and compensation decisions.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-3 py-1.5 text-sm bg-amber-50 text-amber-700 border-amber-200">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        {pendingCount} Pending
                    </Badge>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">Total Decisions</p>
                                <p className="text-3xl font-bold text-violet-900 mt-1">{decisions.length}</p>
                            </div>
                            <div className="p-3 bg-violet-100 rounded-xl">
                                <Brain className="h-5 w-5 text-violet-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Pending Review</p>
                                <p className="text-3xl font-bold text-amber-900 mt-1">{pendingCount}</p>
                            </div>
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Avg Confidence</p>
                                <p className="text-3xl font-bold text-blue-900 mt-1">{avgConfidence}%</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Sparkles className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Bias Score</p>
                                <p className="text-3xl font-bold text-emerald-900 mt-1">{avgBias}%</p>
                            </div>
                            <div className="p-3 bg-emerald-100 rounded-xl">
                                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search decisions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Tabs + Decision Cards */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-muted/50">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="hiring">Hiring</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="compensation">Compensation</TabsTrigger>
                    <TabsTrigger value="termination">Contract</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-4 space-y-3">
                    {filteredDecisions.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <Brain className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p>No decisions found matching your criteria.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredDecisions.map((decision) => {
                            const status = statusConfig[decision.status]
                            const type = typeConfig[decision.type]
                            const StatusIcon = status.icon
                            const TypeIcon = type.icon

                            return (
                                <Card
                                    key={decision.id}
                                    className="group hover:shadow-md transition-all duration-200 cursor-pointer border-l-4"
                                    style={{ borderLeftColor: decision.status === "flagged" ? "#f97316" : decision.status === "pending" ? "#eab308" : decision.status === "approved" ? "#10b981" : "#ef4444" }}
                                    onClick={() => {
                                        setSelectedDecision(decision)
                                        setDetailOpen(true)
                                    }}
                                >
                                    <CardContent className="py-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${type.gradient} text-white shrink-0 shadow-sm`}>
                                                    <TypeIcon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-sm truncate">{decision.title}</h3>
                                                        <Badge variant="outline" className={`shrink-0 text-xs ${status.color}`}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {status.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{decision.summary}</p>
                                                    <div className="flex items-center gap-4 mt-2.5">
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <Sparkles className="h-3 w-3" />
                                                            <span>Confidence: <span className="font-medium text-foreground">{decision.confidence}%</span></span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <ShieldCheck className="h-3 w-3" />
                                                            <span>Bias Score: <span className="font-medium text-foreground">{decision.biasScore}%</span></span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(decision.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {(decision.status === "pending" || decision.status === "flagged") && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                            onClick={(e) => { e.stopPropagation(); handleAction(decision.id, "rejected") }}
                                                        >
                                                            <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                                                            Reject
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                            onClick={(e) => { e.stopPropagation(); handleAction(decision.id, "approved") }}
                                                        >
                                                            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                                                            Approve
                                                        </Button>
                                                    </>
                                                )}
                                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </TabsContent>
            </Tabs>

            {/* Detail Modal */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh]">
                    {selectedDecision && (() => {
                        const status = statusConfig[selectedDecision.status]
                        const type = typeConfig[selectedDecision.type]
                        const StatusIcon = status.icon
                        const TypeIcon = type.icon
                        return (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-3 text-lg">
                                        <div className={`p-2 rounded-xl bg-gradient-to-br ${type.gradient} text-white`}>
                                            <TypeIcon className="h-5 w-5" />
                                        </div>
                                        {selectedDecision.title}
                                    </DialogTitle>
                                    <DialogDescription className="flex items-center gap-3 pt-1">
                                        <Badge variant="outline" className={`${status.color}`}>
                                            <StatusIcon className="h-3 w-3 mr-1" />
                                            {status.label}
                                        </Badge>
                                        <span>{new Date(selectedDecision.timestamp).toLocaleString()}</span>
                                    </DialogDescription>
                                </DialogHeader>

                                <ScrollArea className="max-h-[55vh]">
                                    <div className="space-y-5 pr-4 py-2">
                                        {/* Person */}
                                        <div className="p-4 bg-secondary/30 rounded-xl border">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                                {selectedDecision.candidate ? "Candidate" : "Employee"}
                                            </p>
                                            <p className="font-semibold">{selectedDecision.candidate || selectedDecision.employee}</p>
                                        </div>

                                        {/* Summary */}
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">AI Summary</p>
                                            <p className="text-sm leading-relaxed">{selectedDecision.summary}</p>
                                        </div>

                                        {/* Recommendation */}
                                        <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                                            <p className="text-xs font-medium text-violet-600 uppercase tracking-wider mb-2">AI Recommendation</p>
                                            <p className="text-sm font-medium text-violet-900">{selectedDecision.recommendation}</p>
                                        </div>

                                        {/* Scores */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl border bg-card">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Confidence Score</p>
                                                <div className="flex items-center gap-3">
                                                    <Progress value={selectedDecision.confidence} className="flex-1 h-2.5" />
                                                    <span className="font-bold text-lg">{selectedDecision.confidence}%</span>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-xl border bg-card">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Bias Fairness Score</p>
                                                <div className="flex items-center gap-3">
                                                    <Progress value={selectedDecision.biasScore} className="flex-1 h-2.5" />
                                                    <span className="font-bold text-lg">{selectedDecision.biasScore}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Decision Factors */}
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Decision Factors</p>
                                            <div className="space-y-2.5">
                                                {selectedDecision.factors.map((factor, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                                                        <div className="flex items-center gap-2">
                                                            {factor.impact === "positive" ? (
                                                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                            ) : factor.impact === "negative" ? (
                                                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                                            ) : (
                                                                <div className="h-2 w-2 rounded-full bg-slate-400" />
                                                            )}
                                                            <span className="text-sm font-medium">{factor.label}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Progress value={factor.weight} className="w-24 h-1.5" />
                                                            <span className="text-xs font-medium w-8 text-right">{factor.weight}%</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>

                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
                                    {(selectedDecision.status === "pending" || selectedDecision.status === "flagged") && (
                                        <>
                                            <Button
                                                variant="outline"
                                                className="text-red-600 hover:bg-red-50"
                                                onClick={() => { handleAction(selectedDecision.id, "rejected"); setDetailOpen(false) }}
                                            >
                                                <ThumbsDown className="h-4 w-4 mr-1.5" />
                                                Reject
                                            </Button>
                                            <Button
                                                className="bg-emerald-600 hover:bg-emerald-700"
                                                onClick={() => { handleAction(selectedDecision.id, "approved"); setDetailOpen(false) }}
                                            >
                                                <ThumbsUp className="h-4 w-4 mr-1.5" />
                                                Approve
                                            </Button>
                                        </>
                                    )}
                                </DialogFooter>
                            </>
                        )
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    )
}
