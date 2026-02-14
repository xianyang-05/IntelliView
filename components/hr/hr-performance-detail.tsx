"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
    Sparkles, AlertTriangle, FileText, Calendar, ArrowLeft
} from "lucide-react"

interface HrPerformanceDetailProps {
    onBack?: () => void
    employeeId?: string | null
}

export function HrPerformanceDetail({ onBack, employeeId }: HrPerformanceDetailProps) {
    const [selectedPeriod, setSelectedPeriod] = useState("year")

    const performanceData = [
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
    ]

    const skillsData = [
        { subject: 'Communication', A: 120, fullMark: 150 },
        { subject: 'Technical', A: 98, fullMark: 150 },
        { subject: 'Leadership', A: 86, fullMark: 150 },
        { subject: 'Teamwork', A: 99, fullMark: 150 },
        { subject: 'Punctuality', A: 85, fullMark: 150 },
        { subject: 'Innovation', A: 65, fullMark: 150 },
    ]

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
                    <Avatar className="h-16 w-16 border-2 border-primary/10">
                        <AvatarImage src="/placeholder-user.jpg" alt="Employee" />
                        <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Sarah Johnson</h1>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <Badge variant="secondary" className="font-normal">Senior Engineer</Badge>
                            <span>•</span>
                            <span>Engineering Dept</span>
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
                                <h3 className="text-3xl font-bold mt-2">96/100</h3>
                            </div>
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Award className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                        <div className="flex items-center mt-4 text-xs text-emerald-600 font-medium">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +12% from last year
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                                <h3 className="text-3xl font-bold mt-2">142</h3>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Target className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex items-center mt-4 text-xs text-blue-600 font-medium">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Top 5% in department
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Peer Review</p>
                                <h3 className="text-3xl font-bold mt-2">4.8/5</h3>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Users className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div className="flex items-center mt-4 text-xs text-emerald-600 font-medium">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +0.3 from last review
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Growth Score</p>
                                <h3 className="text-3xl font-bold mt-2">92%</h3>
                            </div>
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Zap className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                        <div className="flex items-center mt-4 text-xs text-muted-foreground font-medium">
                            On track for promotion
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
                            <LineChart data={performanceData}>
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
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} />
                                <Radar
                                    name="Sarah"
                                    dataKey="A"
                                    stroke="#8884d8"
                                    fill="#8884d8"
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
                                Sarah has consistently exceeded project delivery timelines by 15% this quarter. Her technical leadership in the React migration was highlighted by peers as a critical success factor.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                <h4 className="font-semibold text-sm text-slate-700">Risk Detection</h4>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Minor dip in collaboration score observed in June. Potential burnout risk detected due to 3 consecutive weekends of logged activity. Recommended to encourage time off.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Recommended Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full justify-start" variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Quarterly Review
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <Target className="h-4 w-4 mr-2" />
                            Create Improvement Plan
                        </Button>
                        <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Full Report
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
