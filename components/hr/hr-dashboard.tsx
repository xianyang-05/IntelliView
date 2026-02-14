"use client"

import { useState } from "react"
import { Users, UserPlus, Briefcase, TrendingUp, TrendingDown, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export function HrDashboard() {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)

  const stats = [
    { label: "Total Employees", value: "248", change: "+12%", icon: Users },
    { label: "New Hires Q1", value: "24", change: "+8%", icon: UserPlus },
    { label: "Open Positions", value: "15", change: "-3", icon: Briefcase }
  ]

  const existingWorkers = [
    { id: 1, name: "Sarah Johnson", role: "Senior Engineer", department: "Engineering", salary: "$145,000", joinDate: "Jan 2022", status: "Active", performance: "Excellent" },
    { id: 2, name: "Michael Chen", role: "Product Manager", department: "Product", salary: "$135,000", joinDate: "Mar 2021", status: "Active", performance: "Good" },
    { id: 3, name: "Emma Wilson", role: "Design Lead", department: "Design", salary: "$125,000", joinDate: "Jun 2022", status: "Active", performance: "Excellent" },
    { id: 4, name: "James Taylor", role: "Data Scientist", department: "Analytics", salary: "$140,000", joinDate: "Sep 2020", status: "Active", performance: "Good" },
    { id: 5, name: "Lisa Anderson", role: "Marketing Director", department: "Marketing", salary: "$155,000", joinDate: "Feb 2019", status: "Active", performance: "Excellent" }
  ]

  const newRecruits = [
    { id: 6, name: "Alex Kumar", role: "Software Engineer", department: "Engineering", salary: "$120,000", joinDate: "Jan 2024", status: "Onboarding", performance: "New" },
    { id: 7, name: "Sophie Martinez", role: "UX Designer", department: "Design", salary: "$110,000", joinDate: "Feb 2024", status: "Onboarding", performance: "New" },
    { id: 8, name: "David Park", role: "Sales Manager", department: "Sales", salary: "$130,000", joinDate: "Mar 2024", status: "Onboarding", performance: "New" }
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">HR Dashboard</h1>
        <p className="text-muted-foreground">Overview of your workforce and hiring metrics</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const isPositive = stat.change.startsWith('+')
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-4xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Existing Workers */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Existing Workforce</CardTitle>
          <CardDescription>Current employees and their details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {existingWorkers.map((worker) => (
              <div
                key={worker.id}
                className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                onClick={() => setSelectedEmployee(worker)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {worker.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{worker.name}</h3>
                    <p className="text-sm text-muted-foreground">{worker.role} • {worker.department}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={worker.performance === 'Excellent' ? 'default' : 'secondary'}>
                      {worker.performance}
                    </Badge>
                    <span className="text-sm text-muted-foreground min-w-[100px]">Joined {worker.joinDate}</span>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
          <div className="space-y-3">
            {newRecruits.map((worker) => (
              <div
                key={worker.id}
                className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100/50 transition-colors cursor-pointer"
                onClick={() => setSelectedEmployee(worker)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-lg font-semibold text-green-700">
                      {worker.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{worker.name}</h3>
                    <p className="text-sm text-muted-foreground">{worker.role} • {worker.department}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-600">{worker.status}</Badge>
                    <span className="text-sm text-muted-foreground min-w-[100px]">Joined {worker.joinDate}</span>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
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
                <DialogTitle className="text-2xl">{selectedEmployee.name}</DialogTitle>
                <DialogDescription>{selectedEmployee.role}</DialogDescription>
              </DialogHeader>
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
              <div className="mt-6 flex gap-3">
                <Button className="flex-1">Edit Details</Button>
                <Button variant="outline" className="flex-1">View Full Profile</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
