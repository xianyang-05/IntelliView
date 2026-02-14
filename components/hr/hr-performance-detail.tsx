"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    BarChart, Bar
} from "recharts"
import {
    TrendingUp, TrendingDown, Award, Users, Target, Zap,
    Sparkles, AlertTriangle, FileText, Calendar, ArrowLeft,
    CheckCircle2, Clock, BarChart3
} from "lucide-react"

interface HrPerformanceDetailProps {
    onBack?: () => void
    employeeId?: string | null
}

export function HrPerformanceDetail({ onBack, employeeId }: HrPerformanceDetailProps) {
    const [selectedPeriod, setSelectedPeriod] = useState("year")
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
    const [selectedTime, setSelectedTime] = useState("fri-10")
    const [isImprovementPlanOpen, setIsImprovementPlanOpen] = useState(false)
    const [isReportOpen, setIsReportOpen] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleScheduleReview = () => {
        setIsScheduleModalOpen(true)
    }

    const confirmSchedule = () => {
        setIsScheduleModalOpen(false)

        // Trigger global event
        const events = JSON.parse(localStorage.getItem('global_events') || '{}')
        localStorage.setItem('global_events', JSON.stringify({
            ...events,
            review_scheduled: true,
            review_accepted: false
        }))

        // Add Notification
        const newNotif = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'request_info',
            title: 'Quarterly Review Scheduled',
            message: 'HR has scheduled your quarterly review. Please confirm your availability.',
            timestamp: new Date().toISOString(),
            read: false
        }
        const sharedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]')
        sharedNotifications.push(newNotif)
        localStorage.setItem('notifications', JSON.stringify(sharedNotifications))

        alert("Review scheduled. Notification sent to employee.")
    }

    // Mock Data based on ID
    const employeeData: any = {
        "emp-1": {
            name: "Sarah Johnson",
            role: "Senior Engineer",
            dept: "Engineering",
            kpi: 96,
            trend: "+12% from last year",
            tasks: 142,
            taskTrend: "Top 5% in department",
            peer: 4.8,
            peerTrend: "+0.3 from last review",
            growth: 92,
            growthText: "On track for promotion",
            performanceData: [
                { month: 'Jan', performance: 85, attendance: 98 },
                { month: 'Feb', performance: 88, attendance: 96 },
                { month: 'Mar', performance: 92, attendance: 100 },
                { month: 'Apr', performance: 90, attendance: 95 },
                { month: 'May', performance: 94, attendance: 98 },
                { month: 'Jun', performance: 96, attendance: 99 },
                { month: 'Jul', performance: 93, attendance: 97 },
                { month: 'Aug', performance: 95, attendance: 98 },
                { month: 'Sep', performance: 91, attendance: 94 },
                { month: 'Oct', performance: 97, attendance: 100 },
                { month: 'Nov', performance: 98, attendance: 99 },
                { month: 'Dec', performance: 96, attendance: 98 },
            ],
            skillsData: [
                { subject: 'Communication', A: 120, fullMark: 150 },
                { subject: 'Technical', A: 98, fullMark: 150 },
                { subject: 'Leadership', A: 86, fullMark: 150 },
                { subject: 'Teamwork', A: 99, fullMark: 150 },
                { subject: 'Punctuality', A: 85, fullMark: 150 },
                { subject: 'Innovation', A: 65, fullMark: 150 },
            ],
            strengths: "Sarah has consistently exceeded project delivery timelines by 15% this quarter. Her technical leadership in the React migration was highlighted by peers as a critical success factor.",
            risk: "Minor dip in collaboration score observed in June. Potential burnout risk detected due to 3 consecutive weekends of logged activity. Recommended to encourage time off."
        },
        "emp-3": {
            name: "Alex Chan",
            role: "UX Designer",
            dept: "Design",
            kpi: 65,
            trend: "-8% from last year",
            tasks: 89,
            taskTrend: "Bottom 10% in department",
            peer: 3.2,
            peerTrend: "-0.5 from last review",
            growth: 45,
            growthText: "Needs Improvement Plan",
            performanceData: [
                { month: 'Jan', performance: 72, attendance: 90 },
                { month: 'Feb', performance: 70, attendance: 85 },
                { month: 'Mar', performance: 68, attendance: 88 },
                { month: 'Apr', performance: 65, attendance: 82 },
                { month: 'May', performance: 62, attendance: 80 },
                { month: 'Jun', performance: 60, attendance: 78 },
                { month: 'Jul', performance: 64, attendance: 85 },
                { month: 'Aug', performance: 63, attendance: 88 },
                { month: 'Sep', performance: 61, attendance: 82 },
                { month: 'Oct', performance: 65, attendance: 85 },
                { month: 'Nov', performance: 62, attendance: 80 },
                { month: 'Dec', performance: 65, attendance: 84 },
            ],
            skillsData: [
                { subject: 'Communication', A: 60, fullMark: 150 },
                { subject: 'Technical', A: 90, fullMark: 150 },
                { subject: 'Leadership', A: 40, fullMark: 150 },
                { subject: 'Teamwork', A: 50, fullMark: 150 },
                { subject: 'Punctuality', A: 60, fullMark: 150 },
                { subject: 'Innovation', A: 70, fullMark: 150 },
            ],
            strengths: "Alex shows strong technical design skills and delivers high-quality mockups. His innovative ideas for the mobile app UI were well received by the product team.",
            risk: "Consistently missing deadlines and low attendance at team meetings. Communication scores have dropped significantly. Immediate intervention required to address engagement issues."
        }
    }

    const currentEmp = employeeData[employeeId || "emp-1"] || employeeData["emp-1"]

    // Derived colors
    const isHighPerf = currentEmp.kpi >= 80
    const kpiColor = currentEmp.kpi >= 90 ? "text-emerald-600" : currentEmp.kpi >= 70 ? "text-amber-600" : "text-red-600"
    const kpiBg = currentEmp.kpi >= 90 ? "bg-emerald-100" : currentEmp.kpi >= 70 ? "bg-amber-100" : "bg-red-100"
    const trendIcon = currentEmp.trend.includes("-") ? TrendingDown : TrendingUp

    const departmentColors: Record<string, string> = {
        'Engineering': 'from-blue-500 to-blue-600',
        'Design': 'from-purple-500 to-purple-600',
        'Sales': 'from-green-500 to-green-600',
        'Product': 'from-orange-500 to-orange-600',
        'Marketing': 'from-pink-500 to-pink-600',
    }
    const deptGradient = departmentColors[currentEmp.dept] || 'from-gray-500 to-gray-600'

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                        <div className={`w-full h-full flex items-center justify-center text-xl font-bold text-white bg-gradient-to-br ${deptGradient}`}>
                            {currentEmp.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{currentEmp.name}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <Badge variant="secondary" className="font-normal">{currentEmp.role}</Badge>
                            <span>•</span>
                            <span>{currentEmp.dept} Dept</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Select defaultValue="2024">
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2023">2023</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button>
                        <FileText className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Overall KPI Score</p>
                                <h3 className="text-3xl font-bold mt-2">{currentEmp.kpi}/100</h3>
                            </div>
                            <div className={`p-2 rounded-lg ${kpiBg}`}>
                                <Award className={`h-5 w-5 ${kpiColor}`} />
                            </div>
                        </div>
                        <div className={`flex items-center mt-4 text-xs font-medium ${kpiColor}`}>
                            {currentEmp.trend.includes("-") ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                            {currentEmp.trend}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                                <h3 className="text-3xl font-bold mt-2">{currentEmp.tasks}</h3>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Target className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div className={`flex items-center mt-4 text-xs font-medium ${currentEmp.taskTrend.includes("Bottom") ? "text-red-600" : "text-blue-600"}`}>
                            {currentEmp.taskTrend.includes("Bottom") ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                            {currentEmp.taskTrend}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Peer Review</p>
                                <h3 className="text-3xl font-bold mt-2">{currentEmp.peer}/5</h3>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Users className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div className={`flex items-center mt-4 text-xs font-medium ${currentEmp.peerTrend.includes("-") ? "text-red-600" : "text-emerald-600"}`}>
                            {currentEmp.peerTrend.includes("-") ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                            {currentEmp.peerTrend}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Growth Score</p>
                                <h3 className="text-3xl font-bold mt-2">{currentEmp.growth}%</h3>
                            </div>
                            <div className={`p-2 rounded-lg ${currentEmp.growth < 50 ? "bg-red-100" : "bg-amber-100"}`}>
                                <Zap className={`h-5 w-5 ${currentEmp.growth < 50 ? "text-red-600" : "text-amber-600"}`} />
                            </div>
                        </div>
                        <div className="flex items-center mt-4 text-xs text-muted-foreground font-medium">
                            {currentEmp.growthText}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-3 gap-6">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Performance Trends</CardTitle>
                        <CardDescription>Monthly performance vs attendance tracking</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={currentEmp.performanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="performance"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    dot={{ fill: '#2563eb', strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="attendance"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Skills Assessment</CardTitle>
                        <CardDescription>Based on recent appraisals</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={currentEmp.skillsData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} />
                                <Radar
                                    name={currentEmp.name}
                                    dataKey="A"
                                    stroke={isHighPerf ? "#8884d8" : "#ef4444"}
                                    fill={isHighPerf ? "#8884d8" : "#ef4444"}
                                    fillOpacity={0.6}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* AI Analysis & Action */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 bg-gradient-to-r from-slate-50 to-white">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            <CardTitle className="text-purple-900">AI Performance Intelligence</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-slate-700">Key Strengths</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {currentEmp.strengths}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                <h4 className="font-semibold text-sm text-slate-700">Risk Detection</h4>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {currentEmp.risk}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Recommended Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full justify-start" variant="outline" onClick={handleScheduleReview}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Quarterly Review
                        </Button>
                        <Button className="w-full justify-start" variant="outline" onClick={() => setIsImprovementPlanOpen(true)}>
                            <Target className="h-4 w-4 mr-2" />
                            Create Improvement Plan
                        </Button>
                        <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white" onClick={() => {
                            setIsReportOpen(true)
                            setIsGenerating(true)
                            setTimeout(() => setIsGenerating(false), 2000)
                        }}>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Full Report
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Schedule Quarterly Review</DialogTitle>
                        <DialogDescription>
                            Select a time slot for the performance review with Sarah Johnson.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label className="mb-3 block">Available Slots</Label>
                        <RadioGroup value={selectedTime} onValueChange={setSelectedTime} className="gap-3">
                            <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                                <RadioGroupItem value="fri-10" id="r1" />
                                <Label htmlFor="r1" className="cursor-pointer flex-1">Friday, Sep 20 • 10:00 AM</Label>
                            </div>
                            <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                                <RadioGroupItem value="mon-2" id="r2" />
                                <Label htmlFor="r2" className="cursor-pointer flex-1">Monday, Sep 23 • 2:00 PM</Label>
                            </div>
                            <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                                <RadioGroupItem value="tue-11" id="r3" />
                                <Label htmlFor="tue-11" className="cursor-pointer flex-1">Tuesday, Sep 24 • 11:00 AM</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
                        <Button onClick={confirmSchedule}>Send Invitation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Improvement Plan Modal */}
            <Dialog open={isImprovementPlanOpen} onOpenChange={setIsImprovementPlanOpen}>
                <DialogContent className="max-w-3xl p-0 overflow-hidden">
                    <DialogHeader className="sr-only"><DialogTitle>Performance Improvement Plan</DialogTitle></DialogHeader>
                    <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Target className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Performance Improvement Plan</h2>
                                <p className="text-sm text-slate-600">For {currentEmp.name} • {currentEmp.role}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">90-Day Plan</Badge>
                            <Badge variant="outline" className="text-slate-600">{currentEmp.dept} Dept</Badge>
                            <Badge variant="outline" className={currentEmp.kpi < 70 ? "text-red-600 border-red-200" : "text-amber-600 border-amber-200"}>Current KPI: {currentEmp.kpi}</Badge>
                        </div>
                    </div>

                    <div className="p-6 overflow-y-auto max-h-[55vh] space-y-6">
                        {/* Focus Areas */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500" /> Focus Areas
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {(currentEmp.kpi < 70
                                    ? ['Communication & Collaboration', 'Deadline Management', 'Team Engagement']
                                    : ['Strategic Thinking', 'Cross-Team Projects', 'Mentorship']
                                ).map((area, i) => (
                                    <div key={i} className="p-3 bg-slate-50 border rounded-lg text-center">
                                        <p className="text-sm font-medium text-slate-700">{area}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Items */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Action Items
                            </h3>
                            <div className="space-y-3">
                                {(currentEmp.kpi < 70
                                    ? [
                                        { action: 'Weekly 1-on-1 with manager to discuss progress', owner: 'Manager', due: 'Ongoing', priority: 'High' },
                                        { action: 'Complete project management certification', owner: currentEmp.name, due: '30 days', priority: 'High' },
                                        { action: 'Join cross-functional standup meetings', owner: currentEmp.name, due: '7 days', priority: 'Medium' },
                                        { action: 'Peer shadowing with senior team member', owner: 'HR', due: '14 days', priority: 'Medium' },
                                    ]
                                    : [
                                        { action: 'Lead a cross-department initiative', owner: currentEmp.name, due: '30 days', priority: 'Medium' },
                                        { action: 'Mentor a junior team member', owner: currentEmp.name, due: '14 days', priority: 'Low' },
                                        { action: 'Submit innovation proposal', owner: currentEmp.name, due: '45 days', priority: 'Medium' },
                                    ]
                                ).map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 border rounded-lg bg-white hover:bg-slate-50/50 transition-colors">
                                        <div className="mt-0.5 h-4 w-4 rounded-full border-2 border-slate-300 flex-shrink-0"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-800">{item.action}</p>
                                            <div className="flex gap-4 mt-1.5 text-xs text-slate-500">
                                                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {item.owner}</span>
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.due}</span>
                                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${item.priority === 'High' ? 'border-red-200 text-red-600' : item.priority === 'Medium' ? 'border-amber-200 text-amber-600' : 'border-slate-200 text-slate-500'}`}>{item.priority}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-500" /> Review Timeline
                            </h3>
                            <div className="flex items-center gap-0">
                                {['Day 1-30', 'Day 31-60', 'Day 61-90', 'Final Review'].map((phase, i) => (
                                    <div key={i} className="flex-1 relative">
                                        <div className={`h-2 ${i === 0 ? 'rounded-l-full' : ''} ${i === 3 ? 'rounded-r-full' : ''} ${i === 0 ? 'bg-amber-400' : 'bg-slate-200'}`}></div>
                                        <p className="text-[10px] text-slate-500 mt-1.5 text-center">{phase}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-3">Check-in reviews at 30-day intervals. KPI target: {currentEmp.kpi < 70 ? '75+' : '95+'} by end of plan.</p>
                        </div>
                    </div>

                    <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
                        <p className="text-xs text-slate-500">This plan will be shared with the employee and their manager.</p>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsImprovementPlanOpen(false)}>Cancel</Button>
                            <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => {
                                alert("Improvement Plan created and sent to " + currentEmp.name + " and their manager.")
                                setIsImprovementPlanOpen(false)
                            }}>Create & Send Plan</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Full Report Modal */}
            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden">
                    <DialogHeader className="sr-only"><DialogTitle>AI-Generated Performance Report</DialogTitle></DialogHeader>
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Sparkles className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">AI-Generated Performance Report</h2>
                                    <p className="text-sm text-slate-600">{currentEmp.name} • {currentEmp.role} • {currentEmp.dept}</p>
                                </div>
                            </div>
                            <Badge className="bg-purple-100 text-purple-700 border-0">FY 2024</Badge>
                        </div>
                    </div>

                    {isGenerating ? (
                        <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-slate-800">Generating Report...</h3>
                                <p className="text-sm text-slate-500 mt-1">AI is analyzing performance data, peer reviews, and project metrics.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 overflow-y-auto max-h-[55vh] space-y-6">
                            {/* Executive Summary */}
                            <div className="p-4 bg-slate-50 rounded-xl border">
                                <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-slate-500" /> Executive Summary
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {currentEmp.kpi >= 80
                                        ? `${currentEmp.name} has demonstrated exceptional performance throughout FY2024, consistently exceeding targets in their role as ${currentEmp.role}. With a KPI score of ${currentEmp.kpi}/100, they rank among the top performers in the ${currentEmp.dept} department. Their contributions to key projects and strong peer relationships make them a valuable asset to the organization.`
                                        : `${currentEmp.name} has shown mixed performance in FY2024 with a KPI score of ${currentEmp.kpi}/100. While demonstrating strong technical capabilities, there are clear opportunities for improvement in areas such as communication, deadline adherence, and team collaboration. An improvement plan is recommended to support their development.`
                                    }
                                </p>
                            </div>

                            {/* KPI Summary Grid */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-blue-500" /> Key Metrics
                                </h3>
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="p-3 bg-white border rounded-lg text-center">
                                        <p className="text-xs text-slate-500 mb-1">KPI Score</p>
                                        <p className={`text-2xl font-bold ${kpiColor}`}>{currentEmp.kpi}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{currentEmp.trend}</p>
                                    </div>
                                    <div className="p-3 bg-white border rounded-lg text-center">
                                        <p className="text-xs text-slate-500 mb-1">Tasks Done</p>
                                        <p className="text-2xl font-bold text-blue-600">{currentEmp.tasks}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{currentEmp.taskTrend}</p>
                                    </div>
                                    <div className="p-3 bg-white border rounded-lg text-center">
                                        <p className="text-xs text-slate-500 mb-1">Peer Review</p>
                                        <p className="text-2xl font-bold text-purple-600">{currentEmp.peer}/5</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{currentEmp.peerTrend}</p>
                                    </div>
                                    <div className="p-3 bg-white border rounded-lg text-center">
                                        <p className="text-xs text-slate-500 mb-1">Growth</p>
                                        <p className={`text-2xl font-bold ${currentEmp.growth < 50 ? 'text-red-600' : 'text-amber-600'}`}>{currentEmp.growth}%</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{currentEmp.growthText}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Breakdown */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800 mb-3">Skills Breakdown</h3>
                                <div className="space-y-2">
                                    {currentEmp.skillsData.map((skill: any, i: number) => {
                                        const pct = Math.round((skill.A / skill.fullMark) * 100)
                                        return (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="text-xs text-slate-600 w-28">{skill.subject}</span>
                                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all ${pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }}></div>
                                                </div>
                                                <span className={`text-xs font-medium w-10 text-right ${pct >= 70 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{pct}%</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* AI Insights */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                                    <h4 className="text-sm font-semibold text-emerald-800 mb-2">Strengths</h4>
                                    <p className="text-xs text-emerald-700 leading-relaxed">{currentEmp.strengths}</p>
                                </div>
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                                    <h4 className="text-sm font-semibold text-amber-800 mb-2">Areas for Improvement</h4>
                                    <p className="text-xs text-amber-700 leading-relaxed">{currentEmp.risk}</p>
                                </div>
                            </div>

                            {/* Recommendation */}
                            <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="h-4 w-4 text-purple-600" />
                                    <h4 className="text-sm font-semibold text-purple-800">AI Recommendation</h4>
                                </div>
                                <p className="text-xs text-purple-700 leading-relaxed">
                                    {currentEmp.kpi >= 80
                                        ? `Based on overall performance trajectory, ${currentEmp.name} is recommended for a promotion review. Consider expanding their scope of responsibility and enrolling them in a leadership development program.`
                                        : `${currentEmp.name} would benefit from a structured 90-day improvement plan focused on communication and deadline management. Consider pairing them with a senior mentor and scheduling bi-weekly check-ins.`
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
                        <p className="text-xs text-slate-500">Generated by ZeroHR AI • {new Date().toLocaleDateString()}</p>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsReportOpen(false)}>Close</Button>
                            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                                alert("Report exported as PDF and sent to stakeholders.")
                                setIsReportOpen(false)
                            }}>
                                <FileText className="h-4 w-4 mr-2" /> Export PDF
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
