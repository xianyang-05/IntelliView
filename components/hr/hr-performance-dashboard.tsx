"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts"
import {
    TrendingUp, TrendingDown, Users, AlertTriangle, ArrowRight, Zap, Target,
    FileWarning, TrendingUp as PromotionIcon, Download, Send, Sparkles, Loader2,
    Brain, ChevronDown, ChevronUp, Shield, Eye, CheckCircle, XCircle
} from "lucide-react"
import {
    generateWarningNoticeTemplate,
    generateTerminationNoticeTemplate,
    generatePromotionLetterTemplate,
    type DocumentData
} from "@/lib/document-templates"

interface HrPerformanceDashboardProps {
    onViewDetail: (employeeId: string) => void
}

// ── Types for AI review results ──
interface LlmReview {
    final_category: string
    confidence: string
    strengths: string[]
    weaknesses: string[]
    reasoning: string
    recommended_action: string
}

interface EmployeeResult {
    employee_id: string
    name: string
    role: string
    score: number
    rule_category: string
    is_edge_case: boolean
    quality_trend: number
    timeliness_trend: number
    tasks_completed: number
    on_time_rate: number
    quality_score: number
    kpi_score: number
    collaboration: number
    attendance: number
    edge_reasons: string[]
    llm_review: LlmReview | null
    final_category: string
}

export function HrPerformanceDashboard({ onViewDetail }: HrPerformanceDashboardProps) {
    const [previewContent, setPreviewContent] = useState<string>("")
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [currentDocTitle, setCurrentDocTitle] = useState("")
    const [currentEmployeeName, setCurrentEmployeeName] = useState("")
    const [departmentFilter, setDepartmentFilter] = useState("All")
    const [sortBy, setSortBy] = useState("Highest Score")
    const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)

    // AI Review state
    const [aiResults, setAiResults] = useState<EmployeeResult[] | null>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiError, setAiError] = useState<string | null>(null)

    // ── Run AI Review ──
    const handleRunAiReview = async () => {
        setAiLoading(true)
        setAiError(null)
        try {
            const res = await fetch("http://localhost:8000/api/performance-review", { method: "POST" })
            if (!res.ok) throw new Error(`Server error: ${res.status}`)
            const data = await res.json()
            setAiResults(data.results)
        } catch (err: any) {
            setAiError(err.message || "Failed to run AI review")
        } finally {
            setAiLoading(false)
        }
    }

    // ── Derived data ──
    const employees = aiResults || []
    const raiseCount = employees.filter(e => e.final_category === "Raise / Promote").length
    const neutralCount = employees.filter(e => e.final_category === "Neutral").length
    const atRiskCount = employees.filter(e => e.final_category === "At Risk / PIP").length

    const getCategoryBadge = (cat: string) => {
        if (cat === "Raise / Promote") return "bg-emerald-100 text-emerald-700 border-emerald-200"
        if (cat === "At Risk / PIP") return "bg-red-100 text-red-700 border-red-200"
        return "bg-blue-100 text-blue-700 border-blue-200"
    }

    const getScoreColor = (score: number) => {
        if (score >= 75) return "text-emerald-600"
        if (score >= 55) return "text-blue-600"
        return "text-red-600"
    }

    const getFilteredAndSorted = () => {
        let result = [...employees]
        if (departmentFilter !== "All") {
            result = result.filter(e => e.role === departmentFilter)
        }
        if (sortBy === "Highest Score") result.sort((a, b) => b.score - a.score)
        else if (sortBy === "Lowest Score") result.sort((a, b) => a.score - b.score)
        else if (sortBy === "Name (A-Z)") result.sort((a, b) => a.name.localeCompare(b.name))
        return result
    }

    const filteredEmployees = getFilteredAndSorted()

    // ── Pie chart data ──
    const pieData = aiResults
        ? [
            { name: "Raise / Promote", value: raiseCount },
            { name: "Neutral", value: neutralCount },
            { name: "At Risk / PIP", value: atRiskCount },
        ]
        : [
            { name: "High Performers", value: 35 },
            { name: "Average", value: 50 },
            { name: "Underperforming", value: 15 },
        ]

    // ── Bar chart ──
    const barData = aiResults
        ? (() => {
            const roles = [...new Set(employees.map(e => e.role))]
            return roles.map(r => {
                const group = employees.filter(e => e.role === r)
                const avgScore = Math.round(group.reduce((sum, e) => sum + e.score, 0) / group.length)
                const avgAtt = Math.round(group.reduce((sum, e) => sum + e.attendance * 100, 0) / group.length)
                return { name: r, performance: avgScore, attendance: avgAtt }
            })
        })()
        : [
            { name: "Engineering", performance: 92, attendance: 96 },
            { name: "Sales", performance: 88, attendance: 94 },
            { name: "Marketing", performance: 85, attendance: 97 },
            { name: "Product", performance: 90, attendance: 95 },
            { name: "HR", performance: 94, attendance: 98 },
        ]

    // ── Doc generation ──
    const handleGenerateDoc = (type: "warning" | "termination" | "promotion", employee: any) => {
        const docData: DocumentData = {
            name: employee.name,
            role: employee.role,
            department: employee.role,
            salary: "8000",
            startDate: new Date().toISOString(),
            infractionType: "Consistent failure to meet KPI targets",
            improvementPlan: "Required to attend weekly coaching sessions and meet minimum KPI targets within 30 days.",
            terminationReason: "performance",
            lastWorkingDay: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            currentRole: employee.role,
            newRole: `Senior ${employee.role}`,
            salaryIncrease: "15% base salary increase",
            notes: "Based on AI performance analysis.",
        }

        let html = ""
        let title = ""
        if (type === "warning") { html = generateWarningNoticeTemplate(docData); title = "Warning Letter" }
        else if (type === "termination") { html = generateTerminationNoticeTemplate(docData); title = "Termination Letter" }
        else if (type === "promotion") { html = generatePromotionLetterTemplate(docData); title = "Promotion Letter" }

        setPreviewContent(html)
        setCurrentDocTitle(title)
        setCurrentEmployeeName(employee.name)
        setIsPreviewOpen(true)
    }

    const handleDownloadPDF = () => {
        const blob = new Blob([previewContent], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${currentDocTitle}-${currentEmployeeName.replace(/\s+/g, "-")}.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Performance Overview</h1>
                    <p className="text-muted-foreground">Company-wide performance metrics and AI-driven insights</p>
                </div>
                <Button
                    size="lg"
                    onClick={handleRunAiReview}
                    disabled={aiLoading}
                    className="gap-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 text-white px-6"
                >
                    {aiLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Brain className="h-5 w-5" />
                            Run AI Review
                        </>
                    )}
                </Button>
            </div>

            {/* Error message */}
            {aiError && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4 text-red-700 text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {aiError}
                    </CardContent>
                </Card>
            )}

            {/* AI Summary Cards — shown after review */}
            {aiResults && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* At Risk / PIP */}
                    <Card className="border-red-100 shadow-sm">
                        <CardHeader className="bg-red-50/50 pb-4 border-b border-red-50">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-red-700 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    At Risk / PIP
                                </CardTitle>
                                <Badge variant="destructive" className="bg-red-600 hover:bg-red-700">{atRiskCount} Employees</Badge>
                            </div>
                            <CardDescription className="text-red-600/80 mt-1">
                                AI flagged employees needing immediate attention
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {employees.filter(e => e.final_category === "At Risk / PIP").map(emp => (
                                <div key={emp.employee_id} className="p-4 border rounded-lg hover:bg-red-50/30 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-semibold">{emp.name}</h4>
                                            <p className="text-sm text-muted-foreground">{emp.role} · Score: {emp.score}</p>
                                        </div>
                                        <Badge className={`${getCategoryBadge(emp.final_category)} border text-xs`}>
                                            {emp.final_category}
                                        </Badge>
                                    </div>
                                    {emp.llm_review && (
                                        <p className="text-xs text-muted-foreground mb-3 italic">"{emp.llm_review.reasoning}"</p>
                                    )}
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-50" onClick={() => handleGenerateDoc("warning", emp)}>
                                            <FileWarning className="w-4 h-4 mr-2" /> Warning
                                        </Button>
                                        <Button size="sm" variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50" onClick={() => handleGenerateDoc("termination", emp)}>
                                            <AlertTriangle className="w-4 h-4 mr-2" /> Terminate
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {atRiskCount === 0 && <p className="text-sm text-muted-foreground text-center py-4">No employees at risk</p>}
                        </CardContent>
                    </Card>

                    {/* Raise / Promote */}
                    <Card className="border-emerald-100 shadow-sm">
                        <CardHeader className="bg-emerald-50/50 pb-4 border-b border-emerald-50">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-emerald-700 flex items-center gap-2">
                                    <Zap className="h-5 w-5" />
                                    Raise / Promote
                                </CardTitle>
                                <Badge className="bg-emerald-600 hover:bg-emerald-700">{raiseCount} Employees</Badge>
                            </div>
                            <CardDescription className="text-emerald-600/80 mt-1">
                                AI identified top performers for promotion
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {employees.filter(e => e.final_category === "Raise / Promote").map(emp => (
                                <div key={emp.employee_id} className="p-4 border rounded-lg hover:bg-emerald-50/30 transition-colors flex items-center justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold">{emp.name}</h4>
                                        <p className="text-sm text-muted-foreground">{emp.role} · Score: {emp.score}</p>
                                        {emp.llm_review && (
                                            <p className="text-xs text-muted-foreground mt-1 italic">"{emp.llm_review.reasoning}"</p>
                                        )}
                                    </div>
                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleGenerateDoc("promotion", emp)}>
                                        <PromotionIcon className="w-4 h-4 mr-2" /> Promote
                                    </Button>
                                </div>
                            ))}
                            {raiseCount === 0 && <p className="text-sm text-muted-foreground text-center py-4">No employees identified for promotion</p>}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>{aiResults ? "Role Performance" : "Department Performance"}</CardTitle>
                        <CardDescription>Average scores vs Attendance</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={barData} barCategoryGap="30%">
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis type="number" domain={[0, 100]} hide />
                                <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                                <Bar dataKey="performance" name="Performance" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="attendance" name="Attendance" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Workforce Distribution</CardTitle>
                        <CardDescription>By Performance Tier</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    <Cell fill="#10b981" />
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#f59e0b" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                    <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-[-20px] pb-4">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Raise</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Neutral</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> At Risk</div>
                    </div>
                </Card>
            </div>

            {/* Employee Table — only after AI review */}
            {aiResults && (
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle>AI Performance Results</CardTitle>
                                <CardDescription>Click an employee to expand AI insights. Edge cases are reviewed by AI.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Roles</SelectItem>
                                        <SelectItem value="Developer">Developer</SelectItem>
                                        <SelectItem value="Designer">Designer</SelectItem>
                                        <SelectItem value="Analyst">Analyst</SelectItem>
                                        <SelectItem value="Manager">Manager</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Highest Score">Highest Score</SelectItem>
                                        <SelectItem value="Lowest Score">Lowest Score</SelectItem>
                                        <SelectItem value="Name (A-Z)">Name (A-Z)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {filteredEmployees.map(emp => {
                                const isExpanded = expandedEmployee === emp.employee_id
                                return (
                                    <div key={emp.employee_id}>
                                        <div
                                            className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer group ${
                                                isExpanded ? "bg-slate-50 border-primary/30 shadow-sm" : "bg-slate-50/50 hover:border-primary/50 hover:bg-slate-50 hover:shadow-sm"
                                            }`}
                                            onClick={() => setExpandedEmployee(isExpanded ? null : emp.employee_id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                    <AvatarFallback className={`text-xs font-bold text-white bg-gradient-to-br ${
                                                        emp.final_category === "Raise / Promote" ? "from-emerald-500 to-emerald-600" :
                                                        emp.final_category === "At Risk / PIP" ? "from-red-500 to-red-600" :
                                                        "from-blue-500 to-blue-600"
                                                    }`}>
                                                        {emp.name.split(" ").map(n => n[0]).join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">{emp.name}</h3>
                                                        {emp.is_edge_case && (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-purple-50 text-purple-600 border-purple-200 gap-1">
                                                                <Brain className="h-2.5 w-2.5" /> AI Reviewed
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{emp.role}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground mb-1">Score</p>
                                                    <p className={`font-bold text-lg ${getScoreColor(emp.score)}`}>{emp.score}</p>
                                                </div>
                                                <div className="text-right w-24">
                                                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                                                    <Badge className={`${getCategoryBadge(emp.final_category)} border text-xs`}>
                                                        {emp.final_category}
                                                    </Badge>
                                                </div>
                                                <div className="text-right w-16">
                                                    <p className="text-xs text-muted-foreground mb-1">Trend</p>
                                                    {emp.quality_trend > 0 ? (
                                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-xs">
                                                            <TrendingUp className="h-3 w-3" /> Up
                                                        </Badge>
                                                    ) : emp.quality_trend < 0 ? (
                                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 text-xs">
                                                            <TrendingDown className="h-3 w-3" /> Down
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs">Stable</Badge>
                                                    )}
                                                </div>
                                                {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                                            </div>
                                        </div>

                                        {/* Expanded Detail */}
                                        {isExpanded && (
                                            <div className="mt-2 p-5 border rounded-lg bg-white space-y-5 animate-in slide-in-from-top-2 duration-200">
                                                {/* Metrics Grid */}
                                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                                    {[
                                                        { label: "Tasks", value: emp.tasks_completed, suffix: "" },
                                                        { label: "On-Time", value: `${(emp.on_time_rate * 100).toFixed(0)}%`, suffix: "" },
                                                        { label: "Quality", value: `${emp.quality_score}/5`, suffix: "" },
                                                        { label: "KPI", value: `${(emp.kpi_score * 100).toFixed(0)}%`, suffix: "" },
                                                        { label: "Collab", value: `${emp.collaboration}/5`, suffix: "" },
                                                        { label: "Attendance", value: `${(emp.attendance * 100).toFixed(0)}%`, suffix: "" },
                                                    ].map(m => (
                                                        <div key={m.label} className="text-center p-3 bg-slate-50 rounded-lg border">
                                                            <p className="text-xs text-muted-foreground">{m.label}</p>
                                                            <p className="font-bold text-sm mt-0.5">{m.value}{m.suffix}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Edge Case Reasons */}
                                                {emp.edge_reasons.length > 0 && (
                                                    <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100">
                                                        <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
                                                            <Shield className="h-3.5 w-3.5" /> Flagged for AI Review
                                                        </p>
                                                        <ul className="space-y-1">
                                                            {emp.edge_reasons.map((r, i) => (
                                                                <li key={i} className="text-xs text-purple-600 flex items-start gap-2">
                                                                    <span className="mt-0.5">•</span> {r}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* LLM Review */}
                                                {emp.llm_review && (
                                                    <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
                                                                <Sparkles className="h-3.5 w-3.5" /> AI Assessment
                                                            </p>
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-indigo-200 text-indigo-600">
                                                                Confidence: {emp.llm_review.confidence}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-700 leading-relaxed">{emp.llm_review.reasoning}</p>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs font-semibold text-emerald-700 mb-1.5 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Strengths</p>
                                                                <ul className="space-y-1">
                                                                    {emp.llm_review.strengths.map((s, i) => (
                                                                        <li key={i} className="text-xs text-slate-600">• {s}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-red-700 mb-1.5 flex items-center gap-1"><XCircle className="h-3 w-3" /> Weaknesses</p>
                                                                <ul className="space-y-1">
                                                                    {emp.llm_review.weaknesses.map((w, i) => (
                                                                        <li key={i} className="text-xs text-slate-600">• {w}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>

                                                        <div className="bg-white p-3 rounded-md border">
                                                            <p className="text-xs font-semibold text-slate-700 mb-1">Recommended Action</p>
                                                            <p className="text-xs text-slate-600">{emp.llm_review.recommended_action}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex gap-2 pt-1">
                                                    {emp.final_category === "Raise / Promote" && (
                                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleGenerateDoc("promotion", emp)}>
                                                            <PromotionIcon className="w-4 h-4 mr-2" /> Generate Promotion Letter
                                                        </Button>
                                                    )}
                                                    {emp.final_category === "At Risk / PIP" && (
                                                        <>
                                                            <Button size="sm" variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50" onClick={() => handleGenerateDoc("warning", emp)}>
                                                                <FileWarning className="w-4 h-4 mr-2" /> Warning Letter
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={() => handleGenerateDoc("termination", emp)}>
                                                                <AlertTriangle className="w-4 h-4 mr-2" /> Termination Letter
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Pre-review placeholder */}
            {!aiResults && !aiLoading && (
                <Card className="border-dashed border-2 border-slate-200">
                    <CardContent className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                            <Brain className="h-10 w-10 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-1">AI Performance Review</h3>
                            <p className="text-muted-foreground text-sm max-w-md">
                                Click <strong>"Run AI Review"</strong> to analyze employee performance data.
                                The AI will score all employees, flag edge cases, and provide detailed
                                assessments using AI.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Loading state */}
            {aiLoading && (
                <Card>
                    <CardContent className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                        <div>
                            <h3 className="text-lg font-semibold mb-1">Analyzing Performance Data...</h3>
                            <p className="text-muted-foreground text-sm">Scoring employees, detecting edge cases, and running AI review</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Document Generation Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="px-6 py-4 border-b bg-slate-50">
                        <DialogTitle>AI Document Generation: {currentDocTitle}</DialogTitle>
                        <DialogDescription>
                            Review the AI-generated document for {currentEmployeeName}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
                        <div
                            className="bg-white shadow-sm border rounded-lg overflow-hidden mx-auto"
                            dangerouslySetInnerHTML={{ __html: previewContent }}
                        />
                    </div>
                    <DialogFooter className="px-6 py-4 border-t bg-slate-50 gap-2 sm:justify-between">
                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Cancel</Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleDownloadPDF}>
                                <Download className="w-4 h-4 mr-2" /> Download HTML/PDF
                            </Button>
                            <Button onClick={() => {
                                alert(`Document dispatched to ${currentEmployeeName}'s dashboard!`)
                                setIsPreviewOpen(false)
                            }}>
                                <Send className="w-4 h-4 mr-2" /> Dispatch Notice
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
