"use client"

import { useState } from "react"
import { Users, UserPlus, Briefcase, TrendingUp, TrendingDown, Eye, Filter, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export function HrDashboard() {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [departmentFilter, setDepartmentFilter] = useState<string>("All")
  const [retrievedIds, setRetrievedIds] = useState<number[]>([])
  const [showDocsModal, setShowDocsModal] = useState(false)
  const [isRetrieving, setIsRetrieving] = useState(false)

  const stats = [
    { label: "Total Employees", value: "248", change: "+12%", icon: Users },
    { label: "New Hires Q1", value: "24", change: "+8%", icon: UserPlus },
    { label: "Open Positions", value: "15", change: "-3", icon: Briefcase }
  ]

  // Department leads (shown in circular avatars)
  const departmentLeads = [
    { id: 1, name: "Sarah Johnson", role: "Senior Engineer", department: "Engineering", salary: "$145,000", joinDate: "Jan 2022", status: "Active", performance: "Excellent", isLead: true },
    { id: 2, name: "Michael Chen", role: "Product Manager", department: "Product", salary: "$135,000", joinDate: "Mar 2021", status: "Active", performance: "Good", isLead: true },
    { id: 3, name: "Emma Wilson", role: "Design Lead", department: "Design", salary: "$125,000", joinDate: "Jun 2022", status: "Active", performance: "Excellent", isLead: true },
    { id: 4, name: "James Taylor", role: "Data Scientist", department: "Analytics", salary: "$140,000", joinDate: "Sep 2020", status: "Active", performance: "Good", isLead: true },
    { id: 5, name: "Lisa Anderson", role: "Marketing Director", department: "Marketing", salary: "$155,000", joinDate: "Feb 2019", status: "Active", performance: "Excellent", isLead: true }
  ]

  // Full employee list (shown in table below)
  const allEmployees = [
    ...departmentLeads,
    { id: 9, name: "Robert Martinez", role: "Software Engineer", department: "Engineering", salary: "$125,000", joinDate: "May 2021", status: "Active", performance: "Excellent" },
    { id: 10, name: "Jennifer Kim", role: "Backend Developer", department: "Engineering", salary: "$118,000", joinDate: "Aug 2022", status: "Active", performance: "Good" },
    { id: 11, name: "Daniel Lee", role: "Product Designer", department: "Design", salary: "$115,000", joinDate: "Nov 2021", status: "Active", performance: "Excellent" },
    { id: 12, name: "Amanda Foster", role: "UX Researcher", department: "Design", salary: "$110,000", joinDate: "Jan 2023", status: "Active", performance: "Good" },
    { id: 13, name: "Chris Thompson", role: "Data Analyst", department: "Analytics", salary: "$105,000", joinDate: "Apr 2022", status: "Active", performance: "Good" },
    { id: 14, name: "Michelle Wong", role: "BI Specialist", department: "Analytics", salary: "$112,000", joinDate: "Jul 2021", status: "Active", performance: "Excellent" },
    { id: 15, name: "Kevin Brown", role: "Product Owner", department: "Product", salary: "$128,000", joinDate: "Dec 2020", status: "Active", performance: "Good" },
    { id: 16, name: "Rachel Green", role: "Marketing Manager", department: "Marketing", salary: "$120,000", joinDate: "Mar 2022", status: "Active", performance: "Excellent" },
    { id: 17, name: "Tom Anderson", role: "Content Strategist", department: "Marketing", salary: "$95,000", joinDate: "Sep 2022", status: "Active", performance: "Good" },
    { id: 18, name: "Jessica White", role: "Frontend Developer", department: "Engineering", salary: "$122,000", joinDate: "Feb 2023", status: "Active", performance: "Excellent" }
  ]

  // Filter employees by department
  const filteredEmployees = departmentFilter === "All"
    ? allEmployees
    : allEmployees.filter(emp => emp.department === departmentFilter)

  // Get unique departments
  const departments = ["All", ...Array.from(new Set(allEmployees.map(emp => emp.department)))]

  const existingWorkers = departmentLeads

  const newRecruits = [
    { id: 6, name: "Alex Chan", role: "Software Engineer", department: "Engineering", salary: "$120,000", joinDate: "Jan 2024", status: "Onboarding", performance: "New" },
    { id: 7, name: "Sophie Martinez", role: "UX Designer", department: "Design", salary: "$110,000", joinDate: "Feb 2024", status: "Onboarding", performance: "New" },
    { id: 8, name: "David Park", role: "Sales Manager", department: "Sales", salary: "$130,000", joinDate: "Mar 2024", status: "Onboarding", performance: "New" }
  ]

  const handleRetrieveData = () => {
    setIsRetrieving(true)
    // Simulate API call
    setTimeout(() => {
      if (selectedEmployee) {
        setRetrievedIds(prev => [...prev, selectedEmployee.id])
        setIsRetrieving(false)
      }
    }, 1500)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">HR Dashboard</h1>
        <p className="text-muted-foreground">Overview of your workforce and hiring metrics</p>
      </div>

      {/* Stats - Simplified & Clean */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const isPositive = stat.change.startsWith('+')
          return (
            <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                      <span className={`text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>


      {/* Workforce Grid - Side by Side */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Existing Workforce */}
        <Card>
          <CardHeader>
            <CardTitle>Department Lead</CardTitle>
            <CardDescription>Leadership team by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Circular Avatar Grid */}
              <div className="flex-1">
                <div className="grid grid-cols-3 gap-6 place-items-center">
                  {existingWorkers.map((worker) => {
                    const departmentColors: Record<string, string> = {
                      'Engineering': 'from-blue-500 to-blue-600',
                      'Design': 'from-purple-500 to-purple-600',
                      'Sales': 'from-green-500 to-green-600',
                      'Product': 'from-orange-500 to-orange-600',
                      'Marketing': 'from-pink-500 to-pink-600',
                      'Analytics': 'from-cyan-500 to-cyan-600',
                    }
                    const gradient = departmentColors[worker.department] || 'from-gray-500 to-gray-600'
                    const performanceIcon = worker.performance === 'Excellent' ? '⭐' : '✓'

                    return (
                      <div
                        key={worker.id}
                        className="flex flex-col items-center gap-3 cursor-pointer group transition-transform hover:scale-110"
                        onClick={() => setSelectedEmployee(worker)}
                      >
                        <div className="relative">
                          {/* Outer ring */}
                          <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${gradient} p-1 shadow-lg group-hover:shadow-xl transition-shadow`}>
                            {/* Inner circle */}
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                              <span className="text-3xl font-bold bg-gradient-to-br text-transparent bg-clip-text" style={{
                                backgroundImage: `linear-gradient(to bottom right, ${gradient.includes('blue') ? '#3b82f6, #2563eb' : gradient.includes('purple') ? '#a855f7, #9333ea' : gradient.includes('green') ? '#22c55e, #16a34a' : gradient.includes('orange') ? '#f97316, #ea580c' : gradient.includes('pink') ? '#ec4899, #db2777' : gradient.includes('cyan') ? '#06b6d4, #0891b2' : '#6b7280, #4b5563'})`
                              }}>
                                {worker.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          {/* Performance badge */}
                          <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
                            <span className="text-xs">{performanceIcon}</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <h3 className="font-semibold text-sm">{worker.name}</h3>
                          <p className="text-xs text-muted-foreground">{worker.role}</p>
                          <p className="text-xs font-medium mt-1" style={{
                            color: gradient.includes('blue') ? '#3b82f6' : gradient.includes('purple') ? '#a855f7' : gradient.includes('green') ? '#22c55e' : gradient.includes('orange') ? '#f97316' : gradient.includes('pink') ? '#ec4899' : gradient.includes('cyan') ? '#06b6d4' : '#6b7280'
                          }}>{worker.department}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Department Distribution Chart */}
              <div className="lg:w-64 flex flex-col items-center justify-center">
                <h4 className="font-semibold mb-4 text-sm text-muted-foreground">Department Split</h4>
                <div className="relative w-48 h-48">
                  {/* SVG Donut Chart */}
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {/* Engineering - 20% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="20"
                      strokeDasharray="50.24 251.2"
                      strokeDashoffset="0"
                      className="transition-all hover:stroke-[22]"
                    />
                    {/* Product - 20% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="20"
                      strokeDasharray="50.24 251.2"
                      strokeDashoffset="-50.24"
                      className="transition-all hover:stroke-[22]"
                    />
                    {/* Design - 20% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="20"
                      strokeDasharray="50.24 251.2"
                      strokeDashoffset="-100.48"
                      className="transition-all hover:stroke-[22]"
                    />
                    {/* Analytics - 20% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="20"
                      strokeDasharray="50.24 251.2"
                      strokeDashoffset="-150.72"
                      className="transition-all hover:stroke-[22]"
                    />
                    {/* Marketing - 20% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="20"
                      strokeDasharray="50.24 251.2"
                      strokeDashoffset="-200.96"
                      className="transition-all hover:stroke-[22]"
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold">{existingWorkers.length}</span>
                    <span className="text-xs text-muted-foreground">Employees</span>
                  </div>
                </div>
                {/* Legend */}
                <div className="mt-4 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-muted-foreground">Engineering</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-muted-foreground">Product</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-muted-foreground">Design</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    <span className="text-muted-foreground">Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                    <span className="text-muted-foreground">Marketing</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Recruits */}
        <Card>
          <CardHeader>
            <CardTitle>New Recruits (Q1 2024)</CardTitle>
            <CardDescription>Recently onboarded employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Circular Avatar Grid */}
              <div className="flex-1">
                <div className="grid grid-cols-3 gap-6 place-items-center">
                  {newRecruits.map((worker) => {
                    const departmentColors: Record<string, string> = {
                      'Engineering': 'from-blue-500 to-blue-600',
                      'Design': 'from-purple-500 to-purple-600',
                      'Sales': 'from-green-500 to-green-600',
                      'Product': 'from-orange-500 to-orange-600',
                      'Marketing': 'from-pink-500 to-pink-600',
                    }
                    const gradient = departmentColors[worker.department] || 'from-gray-500 to-gray-600'

                    return (
                      <div
                        key={worker.id}
                        className="flex flex-col items-center gap-3 cursor-pointer group transition-transform hover:scale-110"
                        onClick={() => setSelectedEmployee(worker)}
                      >
                        <div className="relative">
                          {/* Outer ring */}
                          <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${gradient} p-1 shadow-lg group-hover:shadow-xl transition-shadow`}>
                            {/* Inner circle */}
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                              <span className="text-3xl font-bold bg-gradient-to-br text-transparent bg-clip-text" style={{
                                backgroundImage: `linear-gradient(to bottom right, ${gradient.includes('blue') ? '#3b82f6, #2563eb' : gradient.includes('purple') ? '#a855f7, #9333ea' : gradient.includes('green') ? '#22c55e, #16a34a' : gradient.includes('orange') ? '#f97316, #ea580c' : gradient.includes('pink') ? '#ec4899, #db2777' : '#6b7280, #4b5563'})`
                              }}>
                                {worker.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          {/* Status badge */}
                          <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
                            <UserPlus className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div className="text-center">
                          <h3 className="font-semibold text-sm">{worker.name}</h3>
                          <p className="text-xs text-muted-foreground">{worker.role}</p>
                          <p className="text-xs font-medium mt-1" style={{
                            color: gradient.includes('blue') ? '#3b82f6' : gradient.includes('purple') ? '#a855f7' : gradient.includes('green') ? '#22c55e' : gradient.includes('orange') ? '#f97316' : gradient.includes('pink') ? '#ec4899' : '#6b7280'
                          }}>{worker.department}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Department Distribution Pie Chart */}
              <div className="lg:w-64 flex flex-col items-center justify-center">
                <h4 className="font-semibold mb-4 text-sm text-muted-foreground">Department Distribution</h4>
                <div className="relative w-48 h-48">
                  {/* SVG Pie Chart */}
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {/* Engineering - 33.33% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="20"
                      strokeDasharray="83.73 251.2"
                      strokeDashoffset="0"
                      className="transition-all hover:stroke-[22]"
                    />
                    {/* Design - 33.33% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="20"
                      strokeDasharray="83.73 251.2"
                      strokeDashoffset="-83.73"
                      className="transition-all hover:stroke-[22]"
                    />
                    {/* Sales - 33.33% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="20"
                      strokeDasharray="83.73 251.2"
                      strokeDashoffset="-167.46"
                      className="transition-all hover:stroke-[22]"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{newRecruits.length}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-4 space-y-2 w-full">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-muted-foreground">Engineering</span>
                    <span className="ml-auto font-semibold">1</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-muted-foreground">Design</span>
                    <span className="ml-auto font-semibold">1</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-muted-foreground">Sales</span>
                    <span className="ml-auto font-semibold">1</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Employee List with Filter */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Employees</CardTitle>
              <CardDescription>Complete employee directory</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm bg-background"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <Badge variant="secondary">{filteredEmployees.length} employees</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Header Row for Alignment */}
            <div className="hidden md:flex justify-end gap-6 px-4 pb-2 text-xs font-semibold text-muted-foreground">
              <div className="w-24 text-right">SALARY</div>
              <div className="w-24 text-right">JOINED</div>
              <div className="w-32 text-center">PERFORMANCE</div>
              <div className="w-16"></div> {/* Spacer for View button */}
            </div>

            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group"
                onClick={() => setSelectedEmployee(employee)}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center ${employee.department === 'Engineering' ? 'from-blue-500 to-blue-600' :
                      employee.department === 'Design' ? 'from-purple-500 to-purple-600' :
                        employee.department === 'Sales' ? 'from-green-500 to-green-600' :
                          employee.department === 'Product' ? 'from-orange-500 to-orange-600' :
                            employee.department === 'Marketing' ? 'from-pink-500 to-pink-600' :
                              employee.department === 'Analytics' ? 'from-cyan-500 to-cyan-600' :
                                'from-gray-500 to-gray-600'
                    }`}>
                    <span className="text-lg font-semibold text-white">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold">{employee.name}</h3>
                    <p className="text-sm text-muted-foreground">{employee.role} • {employee.department}</p>
                  </div>

                  {/* Details - Aligned Columns */}
                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-right w-24">
                      <p className="font-semibold text-sm">{employee.salary}</p>
                    </div>
                    <div className="text-right w-24">
                      <p className="font-semibold text-sm">{employee.joinDate}</p>
                    </div>
                    <div className="w-32 flex justify-center">
                      <Badge variant={employee.performance === 'Excellent' ? 'default' : employee.performance === 'New' ? 'outline' : 'secondary'}>
                        {employee.performance}
                      </Badge>
                    </div>
                    <div className="w-16 flex justify-end">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employee Detail Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-2xl">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl">{selectedEmployee.name}</DialogTitle>
                    <DialogDescription>{selectedEmployee.role}</DialogDescription>
                  </div>
                  {/* New Recruit Tag */}
                  {selectedEmployee.performance === 'New' && (
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">New Recruit</Badge>
                  )}
                </div>
              </DialogHeader>

              {selectedEmployee.performance === 'New' && !retrievedIds.includes(selectedEmployee.id) ? (
                // State 1: Data Missing, Show Retrieve Button
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 bg-slate-100 rounded-full">
                    <UserPlus className="h-8 w-8 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Employee Data Pending</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Full profile data from the onboarding system has not been synced for this new recruit.
                    </p>
                  </div>
                  <Button onClick={handleRetrieveData} className="gap-2 mt-2" disabled={isRetrieving}>
                    {isRetrieving ? (
                      <>
                        <Filter className="h-4 w-4 animate-spin" /> Retrieving...
                      </>
                    ) : (
                      <>
                        <Filter className="h-4 w-4" /> Retrieve Data
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                // State 2: Data Present (Normal View)
                <>
                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Department</p>
                      <p className="font-semibold">{selectedEmployee.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Salary</p>
                      <p className="font-semibold">{selectedEmployee.salary}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Join Date</p>
                      <p className="font-semibold">{selectedEmployee.joinDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <Badge>{selectedEmployee.status}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Performance</p>
                      <p className="font-semibold">{selectedEmployee.performance}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Employee ID</p>
                      <p className="font-semibold">EMP-{selectedEmployee.id.toString().padStart(4, '0')}</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-4">Additional Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Email</p>
                        <p className="text-sm">{selectedEmployee.name.toLowerCase().replace(' ', '.')}@company.com</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Reports To</p>
                        <p className="text-sm">Department Head</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Contract Type</p>
                        <p className="text-sm">Full-time Permanent</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-6 flex gap-3">
                    {selectedEmployee.performance === 'New' ? (
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowDocsModal(true)}>
                        <FileText className="h-4 w-4 mr-2" /> Generate All Documents
                      </Button>
                    ) : (
                      <>
                        <Button className="flex-1">Edit Details</Button>
                        <Button variant="outline" className="flex-1">View Full Profile</Button>
                      </>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Documents Modal */}
      <Dialog open={showDocsModal} onOpenChange={setShowDocsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Onboarding Documents
            </DialogTitle>
            <DialogDescription>
              Required documents for Interviewer & Employee Packet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
              <h4 className="font-semibold text-emerald-800 mb-2 text-sm uppercase">For Employee</h4>
              <ul className="list-disc list-inside text-sm text-emerald-700 space-y-1">
                <li>Offer Letter (Signed)</li>
                <li>Employee Handbook</li>
                <li>Benefits Summary</li>
                <li>IT Policy Agreement</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2 text-sm uppercase">For Interviewer / HR</h4>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li>Interview Feedback Forms</li>
                <li>Resume & Portfolio</li>
                <li>Reference Check Report</li>
                <li>Background Check Clearance</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDocsModal(false)}>Close</Button>
            <Button onClick={() => {
              alert("Documents generated and sent to relevant parties.")
              setShowDocsModal(false)
            }}>
              Send to Employee
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

