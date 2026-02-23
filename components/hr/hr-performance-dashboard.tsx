"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts"
import {
    TrendingUp, TrendingDown, Users, AlertTriangle, ArrowRight, Zap, Target, FileWarning, TrendingUp as PromotionIcon, Download, Send
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

export function HrPerformanceDashboard({ onViewDetail }: HrPerformanceDashboardProps) {
    const [previewContent, setPreviewContent] = useState<string>("")
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [currentDocTitle, setCurrentDocTitle] = useState("")
    const [currentEmployeeName, setCurrentEmployeeName] = useState("")
    const [showUnderperformingList, setShowUnderperformingList] = useState(false)
    const [showTopPerformersList, setShowTopPerformersList] = useState(false)
    const [departmentFilter, setDepartmentFilter] = useState("All")
    const [sortBy, setSortBy] = useState("Highest KPI")

    const deptPerformanceData = [
        { name: 'Engineering', performance: 92, attendance: 96 },
        { name: 'Sales', performance: 88, attendance: 94 },
        { name: 'Marketing', performance: 85, attendance: 97 },
        { name: 'Product', performance: 90, attendance: 95 },
        { name: 'HR', performance: 94, attendance: 98 },
    ]

    // Extended mock data to include salary for templates
    const employees = [
        { id: "emp-1", name: "Sarah Johnson", role: "Senior Engineer", dept: "Engineering", kpi: 96, trend: "up", salary: "145000" },
        { id: "emp-3", name: "Alex Chan", role: "UX Designer", dept: "Design", kpi: 65, trend: "down", salary: "95000" },
        { id: "emp-4", name: "James Taylor", role: "Data Scientist", dept: "Analytics", kpi: 94, trend: "up", salary: "140000" },
        { id: "emp-5", name: "David Kim", role: "Marketing Lead", dept: "Marketing", kpi: 78, trend: "stable", salary: "132000" },
        { id: "emp-2", name: "Michael Chen", role: "Product Manager", dept: "Product", kpi: 85, trend: "stable", salary: "135000" },
        { id: "emp-6", name: "Thomas Brown", role: "QA Engineer", dept: "Engineering", kpi: 74, trend: "down", salary: "105000" },
        { id: "emp-7", name: "Emma Wilson", role: "Design Lead", dept: "Design", kpi: 95, trend: "up", salary: "125000" }
    ]

    const underperforming = employees.filter(e => e.kpi < 80).sort((a, b) => a.kpi - b.kpi)
    const topPerformers = employees.filter(e => e.kpi >= 90).sort((a, b) => b.kpi - a.kpi)

    const getFilteredAndSortedEmployees = () => {
        let result = [...employees];
        if (departmentFilter !== "All") {
            result = result.filter(emp => emp.dept === departmentFilter);
        }

        if (sortBy === "Highest KPI") {
            result.sort((a, b) => b.kpi - a.kpi);
        } else if (sortBy === "Lowest KPI") {
            result.sort((a, b) => a.kpi - b.kpi);
        } else if (sortBy === "Name (A-Z)") {
            result.sort((a, b) => a.name.localeCompare(b.name));
        }

        return result;
    }

    const filteredEmployees = getFilteredAndSortedEmployees()

    const handleGenerateDoc = (type: "warning" | "termination" | "promotion", employee: any) => {
        const docData: DocumentData = {
            name: employee.name,
            role: employee.role,
            department: employee.dept,
            salary: employee.salary,
            startDate: new Date().toISOString(),
            infractionType: "Consistent failure to meet KPI targets",
            improvementPlan: "Required to attend weekly coaching sessions and meet minimum KPI targets within 30 days.",
            terminationReason: "performance",
            lastWorkingDay: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
            currentRole: employee.role,
            newRole: `Senior ${employee.role}`,
            salaryIncrease: "15% base salary increase",
            notes: "Based on AI performance analysis over the last 3 quarters."
        }

        let html = ""
        let title = ""

        if (type === "warning") {
            html = generateWarningNoticeTemplate(docData)
            title = "Warning Letter"
        } else if (type === "termination") {
            html = generateTerminationNoticeTemplate(docData)
            title = "Termination Letter"
        } else if (type === "promotion") {
            html = generatePromotionLetterTemplate(docData)
            title = "Promotion Letter"
        }

        setPreviewContent(html)
        setCurrentDocTitle(title)
        setCurrentEmployeeName(employee.name)
        setIsPreviewOpen(true)
    }

    const handleDownloadPDF = () => {
        const blob = new Blob([previewContent], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${currentDocTitle}-${currentEmployeeName.replace(/\s+/g, '-')}.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Performance Overview</h1>
                <p className="text-muted-foreground">Company-wide performance metrics and AI-driven insights</p>
            </div>

            {/* AI Insights: Top and Underperformers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Underperforming List */}
                <Card className="border-red-100 shadow-sm flex flex-col h-full">
                    <CardHeader className="bg-red-50/50 pb-4 border-b border-red-50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-red-700 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Underperforming Employees
                            </CardTitle>
                            <Badge variant="destructive" className="bg-red-600 hover:bg-red-700">Action Required</Badge>
                        </div>
                        <CardDescription className="text-red-600/80 mt-1">
                            AI detected consistent downward trends or sub-80 KPIs
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col gap-4">
                        <Button
                            variant="outline"
                            className="w-full flex justify-between items-center text-red-700 border-red-200 hover:bg-red-50"
                            onClick={() => setShowUnderperformingList(!showUnderperformingList)}
                        >
                            <span>{showUnderperformingList ? "Hide List" : `View ${underperforming.length} Employees`}</span>
                            {showUnderperformingList ? <TrendingUp className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                        </Button>

                        {showUnderperformingList && (
                            <div className="divide-y divide-red-50 border rounded-md">
                                {underperforming.map(emp => (
                                    <div key={emp.id} className="p-4 hover:bg-red-50/30 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-semibold">{emp.name}</h4>
                                                <p className="text-sm text-muted-foreground">{emp.role} • {emp.dept}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-red-600">KPI: {emp.kpi}</p>
                                                <p className="text-xs text-red-500/80 capitalize flex items-center justify-end gap-1">
                                                    <TrendingDown className="h-3 w-3" /> {emp.trend}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
                                                onClick={() => handleGenerateDoc("warning", emp)}
                                            >
                                                <FileWarning className="w-4 h-4 mr-2" /> Warning
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full border-red-200 text-red-700 hover:bg-red-50"
                                                onClick={() => handleGenerateDoc("termination", emp)}
                                            >
                                                <AlertTriangle className="w-4 h-4 mr-2" /> Terminate
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Performers List */}
                <Card className="border-emerald-100 shadow-sm flex flex-col h-full">
                    <CardHeader className="bg-emerald-50/50 pb-4 border-b border-emerald-50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-emerald-700 flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Top Performers
                            </CardTitle>
                            <Badge className="bg-emerald-600 hover:bg-emerald-700">Promotion Candidates</Badge>
                        </div>
                        <CardDescription className="text-emerald-600/80 mt-1">
                            AI detected exceptional KPIs above 90 and upward trends
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col gap-4">
                        <Button
                            variant="outline"
                            className="w-full flex justify-between items-center text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            onClick={() => setShowTopPerformersList(!showTopPerformersList)}
                        >
                            <span>{showTopPerformersList ? "Hide List" : `View ${topPerformers.length} Employees`}</span>
                            {showTopPerformersList ? <TrendingUp className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                        </Button>

                        {showTopPerformersList && (
                            <div className="divide-y divide-emerald-50 border rounded-md">
                                {topPerformers.map(emp => (
                                    <div key={emp.id} className="p-4 hover:bg-emerald-50/30 transition-colors flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{emp.name}</h4>
                                            <p className="text-sm text-muted-foreground">{emp.role} • {emp.dept}</p>
                                            <div className="mt-2 flex items-center gap-4">
                                                <p className="text-sm font-bold text-emerald-600">KPI: {emp.kpi}</p>
                                                <p className="text-xs text-emerald-600/80 capitalize flex items-center gap-1">
                                                    <PromotionIcon className="h-3 w-3" /> {emp.trend}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                size="sm"
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                                onClick={() => handleGenerateDoc("promotion", emp)}
                                            >
                                                <PromotionIcon className="w-4 h-4 mr-2" /> Promote
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Department Performance Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Department Performance</CardTitle>
                        <CardDescription>Average KPI scores vs Attendance</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={deptPerformanceData} barCategoryGap="30%">
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis type="number" domain={[0, 100]} hide />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
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
                                <Pie
                                    data={[
                                        { name: 'High Performers', value: 35 },
                                        { name: 'Average', value: 50 },
                                        { name: 'Underperforming', value: 15 },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#f59e0b" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                    <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-[-20px] pb-4">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> High</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Average</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Low</div>
                    </div>
                </Card>
            </div>

            {/* Employee Performance Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Employee Directory</CardTitle>
                            <CardDescription>Click on an employee to view detailed report</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Depts</SelectItem>
                                    <SelectItem value="Engineering">Engineering</SelectItem>
                                    <SelectItem value="Design">Design</SelectItem>
                                    <SelectItem value="Product">Product</SelectItem>
                                    <SelectItem value="Sales">Sales</SelectItem>
                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                    <SelectItem value="Analytics">Analytics</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Highest KPI">Highest KPI</SelectItem>
                                    <SelectItem value="Lowest KPI">Lowest KPI</SelectItem>
                                    <SelectItem value="Name (A-Z)">Name (A-Z)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredEmployees.map((emp) => (
                            <div
                                key={emp.id}
                                className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg border hover:border-primary/50 hover:bg-slate-50 hover:shadow-sm cursor-pointer transition-all group"
                                onClick={() => onViewDetail(emp.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                        <div className={`w-full h-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${emp.dept === 'Engineering' ? 'from-blue-500 to-blue-600' :
                                            emp.dept === 'Design' ? 'from-purple-500 to-purple-600' :
                                                emp.dept === 'Sales' ? 'from-green-500 to-green-600' :
                                                    emp.dept === 'Product' ? 'from-orange-500 to-orange-600' :
                                                        emp.dept === 'Marketing' ? 'from-pink-500 to-pink-600' :
                                                            'from-gray-500 to-gray-600'
                                            }`}>
                                            {emp.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold">{emp.name}</h3>
                                        <p className="text-sm text-muted-foreground">{emp.role} • {emp.dept}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground mb-1">KPI Score</p>
                                        <p className={`font-bold text-lg ${emp.kpi >= 90 ? 'text-emerald-600' :
                                            emp.kpi >= 80 ? 'text-blue-600' :
                                                emp.kpi >= 70 ? 'text-amber-600' : 'text-red-600'
                                            }`}>{emp.kpi}</p>
                                    </div>
                                    <div className="text-right w-24">
                                        <p className="text-xs text-muted-foreground mb-1">Trend</p>
                                        <div className="flex justify-end">
                                            {emp.trend === 'up' && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"><TrendingUp className="h-3 w-3" /> Up</Badge>}
                                            {emp.trend === 'down' && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1"><TrendingDown className="h-3 w-3" /> Down</Badge>}
                                            {emp.trend === 'stable' && <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Stable</Badge>}
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

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
                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                            Cancel
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleDownloadPDF}>
                                <Download className="w-4 h-4 mr-2" /> Download HTML/PDF
                            </Button>
                            <Button onClick={() => {
                                alert(`Document secretly routed to ${currentEmployeeName}'s dashboard/email!`)
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

