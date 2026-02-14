"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts"
import {
    TrendingUp, TrendingDown, Users, AlertTriangle, ArrowRight, Zap, Target
} from "lucide-react"

interface HrPerformanceDashboardProps {
    onViewDetail: (employeeId: string) => void
}

export function HrPerformanceDashboard({ onViewDetail }: HrPerformanceDashboardProps) {

    const deptPerformanceData = [
        { name: 'Engineering', performance: 92, attendance: 96 },
        { name: 'Sales', performance: 88, attendance: 94 },
        { name: 'Marketing', performance: 85, attendance: 97 },
        { name: 'Product', performance: 90, attendance: 95 },
        { name: 'HR', performance: 94, attendance: 98 },
    ]

    const employees = [
        { id: "emp-1", name: "Sarah Johnson", role: "Senior Engineer", dept: "Engineering", kpi: 96, trend: "up" },
        { id: "emp-3", name: "Alex Chan", role: "UX Designer", dept: "Design", kpi: 65, trend: "down" },
        { id: "emp-4", name: "James Taylor", role: "Data Scientist", dept: "Analytics", kpi: 94, trend: "up" },
        { id: "emp-5", name: "David Kim", role: "Marketing Lead", dept: "Marketing", kpi: 78, trend: "stable" },
        { id: "emp-2", name: "Michael Chen", role: "Product Manager", dept: "Product", kpi: 85, trend: "stable" },
    ]

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Performance Overview</h1>
                <p className="text-muted-foreground">Company-wide performance metrics and insights</p>
            </div>

            {/* Smart Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-red-50 border-red-100">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 text-red-700 font-semibold">
                                <AlertTriangle className="h-5 w-5" />
                                Burnout Risk Detected
                            </div>
                            <Badge variant="destructive">High Priority</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-red-600 mb-4">3 employees in Engineering are showing clear signs of burnout based on overtime logs.</p>
                        <Button size="sm" variant="outline" className="w-full bg-white text-red-700 border-red-200 hover:bg-red-50">View Employees</Button>
                    </CardContent>
                </Card>

                <Card className="bg-emerald-50 border-emerald-100">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                                <Zap className="h-5 w-5" />
                                Top Performers
                            </div>
                            <Badge className="bg-emerald-600 hover:bg-emerald-700">Recognition</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-emerald-600 mb-4">Sales Team exceeded quarterly targets by 15%. Recommend spot bonuses.</p>
                        <Button size="sm" variant="outline" className="w-full bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50">Approve Rewards</Button>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 text-blue-700 font-semibold">
                                <Target className="h-5 w-5" />
                                Goal Completion
                            </div>
                            <span className="text-xs font-bold text-blue-700">85%</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-blue-600 mb-4">Company-wide OKR completion is on track. Product Department is lagging slightly.</p>
                        <Button size="sm" variant="outline" className="w-full bg-white text-blue-700 border-blue-200 hover:bg-blue-50">Check Goals</Button>
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
                    <CardTitle>Employee Performance</CardTitle>
                    <CardDescription>Click on an employee to view detailed report</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {employees.map((emp) => (
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
        </div>
    )
}
