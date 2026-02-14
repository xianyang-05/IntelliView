"use client"

import { useState } from "react"
import { BookOpen, GitBranch, MessageSquare, Target, Send, Pencil, Plus, Trash2, ExternalLink, Loader2, Check, Clock, RefreshCw, Sparkles, Calendar, Shield, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function EmployeeJournal() {
    const [journalStep, setJournalStep] = useState<"integrations" | "generating" | "review">("integrations")
    const [journalEditing, setJournalEditing] = useState(false)
    const [journalSent, setJournalSent] = useState(false)
    const [kpis, setKpis] = useState([
        { id: 1, text: "Improve design system adoption rate by 25%", target: "25% increase" },
        { id: 2, text: "Complete 3 user research studies for new features", target: "3 studies" },
        { id: 3, text: "Reduce design handoff revision cycles by 40%", target: "40% reduction" },
    ])
    const [newKpi, setNewKpi] = useState("")

    const integrations = [
        { name: "ClickUp", icon: <Target className="h-5 w-5" />, status: "Connected", color: "text-purple-500", bgColor: "bg-purple-500/10" },
        { name: "GitHub", icon: <GitBranch className="h-5 w-5" />, status: "Connected", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
        { name: "Slack", icon: <MessageSquare className="h-5 w-5" />, status: "Connected", color: "text-sky-500", bgColor: "bg-sky-500/10" },
    ]

    const generatedReport = {
        quarter: "Q1 2026 (Jan - Mar)",
        summary: "Successfully led the redesign of the employee portal, delivering 3 major feature updates. Collaborated with the engineering team to implement a new design system, reducing development time by 30%. Conducted 5 user research sessions that informed product decisions.",
        highlights: [
            { label: "Tasks Completed", value: "47 / 52", source: "ClickUp" },
            { label: "Pull Requests Merged", value: "23", source: "GitHub" },
            { label: "Code Reviews", value: "31", source: "GitHub" },
            { label: "Team Messages", value: "1,240", source: "Slack" },
            { label: "Design Files Created", value: "18", source: "ClickUp" },
            { label: "Sprint Velocity", value: "94%", source: "ClickUp" },
        ],
        activities: [
            { date: "Jan 15", text: "Completed employee portal home page redesign", source: "ClickUp" },
            { date: "Feb 3", text: "Merged PR #142 - New design system components", source: "GitHub" },
            { date: "Feb 10", text: "Presented Q1 design review to stakeholders", source: "Slack" },
            { date: "Feb 28", text: "Finished user research for compliance module", source: "ClickUp" },
            { date: "Mar 5", text: "Shipped contracts & equity page update", source: "GitHub" },
        ]
    }

    const handleGenerate = () => {
        setJournalStep("generating")
        setTimeout(() => setJournalStep("review"), 2000)
    }

    const handleSendToManager = () => {
        setJournalSent(true)
    }

    // Manager Modal State
    const [isManagerModalOpen, setIsManagerModalOpen] = useState(false)
    const [managerActionType, setManagerActionType] = useState<"journal" | "kpi" | null>(null)

    // Calculate countdown to next journal deadline
    const journalDeadline = new Date(2026, 2, 31) // Mar 31, 2026
    const now = new Date()
    const diffTime = journalDeadline.getTime() - now.getTime()
    const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
    const isUrgent = daysLeft <= 14
    const isWarning = daysLeft <= 30 && daysLeft > 14

    const handleOpenManagerView = (type: "journal" | "kpi") => {
        setManagerActionType(type)
        setIsManagerModalOpen(true)
    }

    const handleManagerAction = (approved: boolean) => {
        setIsManagerModalOpen(false)
        if (approved) {
            alert("Approved by Manager!")
            if (managerActionType === 'journal') {
                setJournalSent(true)
            }
        } else {
            alert("Returned for revision.")
        }
    }

    return (
        <div className="p-8">
            {/* Manager View Modal */}
            <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${isManagerModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} transition-opacity p-4`}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                    <div className="bg-slate-900 text-white p-6 shrink-0 flex items-start gap-4">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10 -ml-2" onClick={() => setIsManagerModalOpen(false)}>
                            <X className="h-6 w-6" />
                        </Button>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Shield className="h-6 w-6 text-emerald-400" />
                                Manager View: {managerActionType === 'journal' ? 'Quarterly Journal Review' : 'KPI Change Request'}
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">
                                Reviewing submission from <strong>Alex Chan</strong> • {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">

                        {/* KPI Change Request View */}
                        {managerActionType === 'kpi' && (
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="p-4 bg-slate-50 border rounded-xl">
                                        <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <Target className="h-4 w-4 text-blue-600" />
                                            Proposed Change
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-xs text-muted-foreground uppercase">New KPI Goal</Label>
                                                <p className="text-lg font-medium text-slate-900 mt-1">Increase unit test coverage to 80%</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground uppercase">Reason for Change</Label>
                                                <p className="text-sm text-slate-600 mt-1 bg-white p-3 rounded border">
                                                    "Project priorities have shifted towards stability and reducing technical debt. This goal aligns better with the new Q2 roadmap than the previous feature-velocity goal."
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                                        <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-purple-600" />
                                            AI Impact Analysis
                                        </h4>
                                        <p className="text-sm text-purple-800 leading-relaxed">
                                            <strong>Positive Alignment:</strong> This change strongly correlates with the department's Q2 objective of "Operational Excellence".
                                            <br /><br />
                                            <strong>Risk Assessment:</strong> Low risk. Shifting focus to quality may slightly reduce feature delivery speed (-10% est), but is expected to decrease bug reports by ~25%.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="border rounded-xl overflow-hidden">
                                        <div className="bg-slate-50 p-3 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Before vs After Comparison
                                        </div>
                                        <div className="divide-y">
                                            <div className="p-4 flex gap-4 opacity-60 bg-red-50/30">
                                                <div className="w-8 pt-1 text-red-500 font-bold text-xs">BEFORE</div>
                                                <div>
                                                    <p className="font-medium text-sm line-through decoration-red-400">Ship 5 new major features</p>
                                                    <p className="text-xs text-muted-foreground">Focus: Velocity</p>
                                                </div>
                                            </div>
                                            <div className="p-4 flex gap-4 bg-emerald-50/30">
                                                <div className="w-8 pt-1 text-emerald-600 font-bold text-xs">AFTER</div>
                                                <div>
                                                    <p className="font-medium text-sm">Increase unit test coverage to 80%</p>
                                                    <p className="text-xs text-emerald-600">Focus: Quality & Stability</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Journal Review View */}
                        {managerActionType === 'journal' && (
                            <div className="grid grid-cols-3 gap-8">
                                {/* Main Content: Report & KPIs */}
                                <div className="col-span-2 space-y-8">
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-lg flex items-center gap-2">
                                            <BookOpen className="h-5 w-5 text-slate-500" />
                                            Employee Submission
                                        </h4>
                                        <div className="p-6 border rounded-xl bg-slate-50/50">
                                            <h5 className="font-semibold text-sm text-slate-900 mb-2">Quarterly Summary</h5>
                                            <p className="text-sm text-slate-600 leading-relaxed mb-6">
                                                {generatedReport.summary}
                                            </p>

                                            <h5 className="font-semibold text-sm text-slate-900 mb-3">Activity Log</h5>
                                            <div className="space-y-3 pl-2 border-l-2 border-slate-200">
                                                {generatedReport.activities.map((act, i) => (
                                                    <div key={i} className="text-sm">
                                                        <p className="text-slate-700">{act.text}</p>
                                                        <span className="text-xs text-muted-foreground">{act.date} • {act.source}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-lg flex items-center gap-2">
                                            <Target className="h-5 w-5 text-emerald-600" />
                                            Proposed Goals (Next Quarter)
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {kpis.map((kpi) => (
                                                <div key={kpi.id} className="p-4 border border-emerald-100 bg-emerald-50/30 rounded-xl">
                                                    <p className="font-medium text-slate-900 text-sm">{kpi.text}</p>
                                                    <p className="text-xs text-emerald-600 mt-1">Target: {kpi.target}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar: AI Analysis */}
                                <div className="space-y-6">
                                    <Card className="bg-purple-900 text-white border-0 shadow-xl overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-32 bg-purple-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
                                        <CardHeader>
                                            <div className="flex items-center gap-2 text-purple-200 mb-1">
                                                <Sparkles className="h-4 w-4" />
                                                <span>AI Insight</span>
                                            </div>
                                            <CardTitle className="text-lg">Performance Helper</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 relative z-10">
                                            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                                <p className="text-xs font-semibold text-purple-200 uppercase tracking-widest mb-1">Sentiment</p>
                                                <p className="font-medium">Highly Positive (92%)</p>
                                            </div>
                                            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                                <p className="text-xs font-semibold text-purple-200 uppercase tracking-widest mb-1">Key Strengths</p>
                                                <ul className="text-sm space-y-1 text-purple-100 list-disc list-inside">
                                                    <li>High code velocity</li>
                                                    <li>Strong cross-team collab</li>
                                                    <li>Proactive bug fixing</li>
                                                </ul>
                                            </div>
                                            <div className="p-3 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                                                <p className="text-xs text-indigo-200 mb-1">Manager Note Recommendation</p>
                                                <p className="text-xs italic text-indigo-100">"Great job on the frontend migration. Consider facilitating a workshop to share these learnings."</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-slate-50 border-t shrink-0">
                        <div className="flex gap-4 items-start">
                            <div className="flex-1">
                                <Label className="text-xs font-semibold text-slate-500 uppercase">Manager's Feedback / Comments</Label>
                                <Textarea
                                    placeholder="Add your feedback for Alex here..."
                                    className="mt-2 bg-white resize-none"
                                    rows={3}
                                />
                            </div>
                            <div className="flex flex-col gap-3 w-48">
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-10 shadow-sm" onClick={() => handleManagerAction(true)}>
                                    <Check className="h-4 w-4 mr-2" /> Approve
                                </Button>
                                <Button variant="outline" className="w-full h-10 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleManagerAction(false)}>
                                    <X className="h-4 w-4 mr-2" /> Reject
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Countdown Banner */}
            <div className={`mb-6 rounded-xl p-4 flex items-center gap-4 border ${isUrgent ? 'bg-red-500/10 border-red-500/30' :
                isWarning ? 'bg-amber-500/10 border-amber-500/30' :
                    'bg-purple-500/10 border-purple-500/30'
                }`}>
                <div className={`p-3 rounded-lg ${isUrgent ? 'bg-red-500/20' : isWarning ? 'bg-amber-500/20' : 'bg-purple-500/20'
                    }`}>
                    <Calendar className={`h-6 w-6 ${isUrgent ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-purple-400'
                        }`} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${isUrgent ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-purple-400'
                            }`}>{daysLeft}</span>
                        <span className={`text-sm font-medium ${isUrgent ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-purple-400'
                            }`}>days until next journal deadline</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Q1 2026 journal due on March 31, 2026</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                        Q1 2026
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${isUrgent ? 'bg-red-500/20 text-red-400' :
                        isWarning ? 'bg-amber-500/20 text-amber-400' :
                            'bg-yellow-500/20 text-yellow-500'
                        }`}>
                        Due Mar 31
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-purple-500" />
                        Personal Journal
                    </h1>
                    <p className="text-sm text-muted-foreground">Quarterly progress report & KPI planning • Due every 3 months</p>
                </div>
            </div>

            {/* Change KPI Request Section */}
            <Card className="mb-6 border-blue-200/50 bg-blue-50/10">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-blue-700">
                        <Target className="h-4 w-4" />
                        Request KPI Adjustment
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <Label className="text-xs">New KPI Goal</Label>
                            <Input placeholder="E.g. Increase unit test coverage to 80%" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label className="text-xs">Reason for Change</Label>
                            <Input placeholder="E.g. Project priorities shifted..." />
                        </div>
                        <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => handleOpenManagerView('kpi')}>
                            <Send className="h-3 w-3 mr-2" />
                            Request Change
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Integration Status */}
            <Card className="mb-6">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        Connected Integrations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        {integrations.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                                    <span className={item.color}>{item.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.status}</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Step: Integrations / Generate */}
            {journalStep === "integrations" && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="h-8 w-8 text-purple-500" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Generate Quarterly Report</h2>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            AI will automatically compile your progress report from connected apps — ClickUp tasks, GitHub commits, and Slack activity.
                        </p>
                        <Button
                            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8"
                            size="lg"
                            onClick={handleGenerate}
                        >
                            <Sparkles className="h-4 w-4" />
                            Auto-Generate Report
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Step: Generating */}
            {journalStep === "generating" && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Generating Report...</h2>
                        <p className="text-muted-foreground mb-4">Analyzing data from ClickUp, GitHub, and Slack</p>
                        <div className="max-w-sm mx-auto space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-emerald-500" /> Fetching ClickUp tasks & sprint data
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-emerald-500" /> Analyzing GitHub contributions
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 text-purple-500 animate-spin" /> Summarizing Slack activity
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step: Review Generated Report */}
            {journalStep === "review" && (
                <div className="space-y-6">
                    {/* Sent Confirmation */}
                    {journalSent && (
                        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                            <Check className="h-5 w-5 text-emerald-500" />
                            <div>
                                <p className="font-semibold text-emerald-500 text-sm">Journal sent to manager!</p>
                                <p className="text-xs text-muted-foreground">Your manager will review and provide feedback.</p>
                            </div>
                        </div>
                    )}

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Main Report */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Report Summary */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-purple-500" />
                                            AI Generated Report — {generatedReport.quarter}
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1"
                                                onClick={() => setJournalEditing(!journalEditing)}
                                            >
                                                <Pencil className="h-3 w-3" />
                                                {journalEditing ? "Done Editing" : "Edit"}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1"
                                                onClick={() => { setJournalStep("integrations") }}
                                            >
                                                <RefreshCw className="h-3 w-3" />
                                                Regenerate
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground mb-2 block">QUARTERLY SUMMARY</Label>
                                        {journalEditing ? (
                                            <Textarea
                                                defaultValue={generatedReport.summary}
                                                rows={4}
                                                className="resize-none"
                                            />
                                        ) : (
                                            <p className="text-sm leading-relaxed">{generatedReport.summary}</p>
                                        )}
                                    </div>

                                    {/* Activities Timeline */}
                                    <div>
                                        <Label className="text-xs text-muted-foreground mb-3 block">KEY ACTIVITIES</Label>
                                        <div className="space-y-3">
                                            {generatedReport.activities.map((activity, index) => (
                                                <div key={index} className="flex items-start gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                                                    <div className="flex-1">
                                                        {journalEditing ? (
                                                            <Input defaultValue={activity.text} className="text-sm" />
                                                        ) : (
                                                            <p className="text-sm">{activity.text}</p>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-muted-foreground">{activity.date}</span>
                                                            <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{activity.source}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* KPI for Next Quarter */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-emerald-500" />
                                        KPI Goals — Next Quarter (Q2 2026)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {kpis.map((kpi) => (
                                        <div key={kpi.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 group">
                                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <Target className="h-3 w-3 text-emerald-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{kpi.text}</p>
                                                <span className="text-xs text-emerald-500">Target: {kpi.target}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500"
                                                onClick={() => setKpis(kpis.filter(k => k.id !== kpi.id))}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}

                                    {/* Add More KPI */}
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="Add a new KPI goal..."
                                            value={newKpi}
                                            onChange={(e) => setNewKpi(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && newKpi.trim()) {
                                                    setKpis([...kpis, { id: Date.now(), text: newKpi, target: "To be defined" }])
                                                    setNewKpi("")
                                                }
                                            }}
                                            className="flex-1"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            disabled={!newKpi.trim()}
                                            onClick={() => {
                                                if (newKpi.trim()) {
                                                    setKpis([...kpis, { id: Date.now(), text: newKpi, target: "To be defined" }])
                                                    setNewKpi("")
                                                }
                                            }}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            {!journalSent && (
                                <div className="flex items-center justify-end gap-3">
                                    <Button variant="outline">Save Draft</Button>
                                    <Button
                                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={() => handleOpenManagerView('journal')}
                                    >
                                        <Send className="h-4 w-4" />
                                        Send to Manager
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar: Stats */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Performance Snapshot</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {generatedReport.highlights.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium">{item.label}</p>
                                                <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{item.source}</span>
                                            </div>
                                            <span className="text-lg font-bold">{item.value}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Past Journals */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Clock className="h-4 w-4" />
                                        Past Journals
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[
                                        { quarter: "Q4 2025", status: "Reviewed", statusColor: "text-emerald-500" },
                                        { quarter: "Q3 2025", status: "Reviewed", statusColor: "text-emerald-500" },
                                        { quarter: "Q2 2025", status: "Reviewed", statusColor: "text-emerald-500" },
                                    ].map((journal, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">{journal.quarter}</span>
                                            </div>
                                            <span className={`text-xs font-medium ${journal.statusColor}`}>{journal.status}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
