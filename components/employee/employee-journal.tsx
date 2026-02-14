"use client"

import { useState } from "react"
import { BookOpen, GitBranch, MessageSquare, Target, Send, Pencil, Plus, Trash2, ExternalLink, Loader2, Check, Clock, RefreshCw, Sparkles, Calendar } from "lucide-react"
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

    // Calculate countdown to next journal deadline
    const journalDeadline = new Date(2026, 2, 31) // Mar 31, 2026
    const now = new Date()
    const diffTime = journalDeadline.getTime() - now.getTime()
    const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
    const isUrgent = daysLeft <= 14
    const isWarning = daysLeft <= 30 && daysLeft > 14

    return (
        <div className="p-8">
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
                                        onClick={handleSendToManager}
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
