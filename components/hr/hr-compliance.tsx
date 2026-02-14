"use client"

import { Shield, AlertTriangle, Calendar, GraduationCap, FileCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useState } from "react"
import { Activity, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"

export function HrCompliance() {
  const [selectedRenewal, setSelectedRenewal] = useState<any>(null)
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false)

  const [selectedUpdate, setSelectedUpdate] = useState<any>(null)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

  const handleOpenUpdate = (update: any) => {
    setSelectedUpdate(update)
    setIsUpdateModalOpen(true)
  }

  const handleInitiateRenewal = (item: any) => {
    setSelectedRenewal(item)
    setIsRenewalModalOpen(true)
  }

  const getPerformanceData = (employee: string) => {
    return {
      kpi: "96%",
      status: "Exceeds Expectations",
      projects: "Completed 12/12 projects on time",
      attendance: "98% attendance rate"
    }
  }
  const visaRenewals = [
    {
      employee: "Alex Kumar",
      visaType: "H1-B Visa",
      expiryDate: "Apr 15, 2024",
      daysRemaining: 30,
      status: "urgent",
      role: "Senior Engineer",
      department: "Engineering"
    },
    {
      employee: "Sophie Martinez",
      visaType: "Work Permit",
      expiryDate: "May 20, 2024",
      daysRemaining: 65,
      status: "upcoming"
    },
    {
      employee: "David Park",
      visaType: "EP Pass",
      expiryDate: "Jun 10, 2024",
      daysRemaining: 86,
      status: "upcoming"
    }
  ]

  const trainingRequirements = [
    {
      employee: "Sarah Johnson",
      training: "Data Privacy & GDPR",
      deadline: "Apr 30, 2024",
      progress: 60,
      status: "in-progress"
    },
    {
      employee: "Michael Chen",
      training: "Security Awareness",
      deadline: "Apr 25, 2024",
      progress: 0,
      status: "not-started"
    },
    {
      employee: "Emma Wilson",
      training: "Leadership Development",
      deadline: "May 15, 2024",
      progress: 30,
      status: "in-progress"
    }
  ]

  const complianceUpdates = [
    {
      id: 1,
      title: "Revised Labor Law Amendment 2024",
      date: "2 days ago",
      source: "Ministry of Manpower",
      summary: "New regulations regarding overtime compensation limits and hybrid work arrangements.",
      impact: "High",
      details: "The new amendment requires all companies to structure overtime pay calculation based on the new base rate formulas. It also mandates a formal policy for hybrid work requests.",
      affected: "All Employees",
      actionRequired: "Update Employee Handbook",
      image: "/compliance-images/labor-law.jpg"
    },
    {
      id: 2,
      title: "Tax Filing Deadline Extension",
      date: "5 days ago",
      source: "Inland Revenue Authority",
      summary: "Corporate tax filing deadline has been extended by 15 days due to system upgrades.",
      impact: "Medium",
      details: "The new deadline is now June 15th. This applies to Form C-S/C corporate income tax returns. No penalties will be imposed for filings within this extended period.",
      affected: "Finance Department",
      actionRequired: "Adjust Filing Schedule",
      image: "/compliance-images/tax-filing.jpg"
    },
    {
      id: 3,
      title: "Workplace Safety Guidelines v2.0",
      date: "1 week ago",
      source: "Safety Council",
      summary: "Updated protocols for fire safety and emergency evacuation procedures.",
      impact: "High",
      details: "Mandatory fire drills must now be conducted quarterly (previously semi-annually). New signage requirements for all emergency exits must be implemented immediately.",
      affected: "Facilities / All Staff",
      actionRequired: "Schedule Fire Drill",
      image: "/compliance-images/safety-guidelines.jpg"
    }
  ]

  const stats = [
    { label: "Urgent Actions", value: "8", color: "text-red-600", bg: "bg-red-100" },
    { label: "Upcoming Deadlines", value: "15", color: "text-yellow-600", bg: "bg-yellow-100" },
    { label: "Compliant", value: "225", color: "text-green-600", bg: "bg-green-100" }
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Compliance & Audit</h1>
        <p className="text-muted-foreground">Monitor and manage compliance requirements</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Shield className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visa Renewals */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Visa & Work Permit Renewals</CardTitle>
          </div>
          <CardDescription>Employees requiring visa renewal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {visaRenewals.map((item, index) => (
            <div key={index} className={`p-4 rounded-lg border ${item.status === 'urgent' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
              }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{item.employee}</h3>
                    <Badge variant={item.status === 'urgent' ? 'destructive' : 'secondary'}>
                      {item.status === 'urgent' ? 'Urgent' : 'Upcoming'}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium mb-1">{item.visaType}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Expires: {item.expiryDate}</span>
                    <span>{item.daysRemaining} days remaining</span>
                  </div>
                </div>
                <AlertTriangle className={`h-6 w-6 ${item.status === 'urgent' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
              </div>
              <div className="flex gap-3">
                <Button size="sm" variant={item.status === 'urgent' ? 'default' : 'outline'} onClick={() => handleInitiateRenewal(item)}>
                  Initiate Renewal
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleInitiateRenewal(item)}>View Details</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Training Requirements */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <CardTitle>Training Requirements</CardTitle>
          </div>
          <CardDescription>Mandatory training and certifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {trainingRequirements.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{item.employee}</h3>
                      <Badge variant={
                        item.status === 'not-started' ? 'destructive' : 'secondary'
                      }>
                        {item.status === 'not-started' ? 'Not Started' : 'In Progress'}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mb-1">{item.training}</p>
                    <p className="text-sm text-muted-foreground">Deadline: {item.deadline}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${item.progress < 30 ? 'bg-red-500' :
                        item.progress < 70 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button size="sm" className="flex-1">Send Reminder</Button>
                  <Button size="sm" variant="outline">View Training</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Compliance Updates */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-blue-600" />
        Regulatory Updates & News
      </h2>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {complianceUpdates.map((update, index) => (
          <Card key={index} className="cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group" onClick={() => handleOpenUpdate(update)}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{update.source}</Badge>
                <span className="text-xs text-muted-foreground">{update.date}</span>
              </div>
              <CardTitle className="text-lg leading-tight group-hover:text-blue-700 transition-colors">{update.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{update.summary}</p>
              <div className="flex items-center gap-2 mt-auto">
                <Badge variant="secondary" className={
                  update.impact === 'High' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                    update.impact === 'Medium' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' :
                      'bg-green-100 text-green-700 hover:bg-green-200'
                }>
                  {update.impact} Impact
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={isRenewalModalOpen} onOpenChange={setIsRenewalModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Renewal Check: {selectedRenewal?.employee}
            </DialogTitle>
            <DialogDescription>
              Review performance and approve renewal for {selectedRenewal?.visaType}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 py-4">
            {/* Employee Details */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="outline">Current Visa</Badge>
                {selectedRenewal?.visaType}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-muted-foreground mb-1">Expiry</p>
                  <p className="font-medium text-red-600">{selectedRenewal?.expiryDate}</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-muted-foreground mb-1">Status</p>
                  <Badge variant={selectedRenewal?.status === 'urgent' ? 'destructive' : 'secondary'}>
                    {selectedRenewal?.status === 'urgent' ? 'Urgent' : 'Upcoming'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* AI Performance Analysis */}
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                  <Activity className="h-4 w-4" />
                  AI Performance Insight
                </div>
                {selectedRenewal && (() => {
                  const data = getPerformanceData(selectedRenewal.employee)
                  return (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                        <span className="text-muted-foreground">KPI Score</span>
                        <span className="font-bold text-emerald-600">{data.kpi}</span>
                      </div>
                      <div className="pt-2 space-y-2">
                        <p className="text-xs text-slate-600"><span className="font-semibold text-purple-700">Suggestion:</span> Proceed with renewal. Employee is a top performer.</p>
                      </div>
                    </div>
                  )
                })()}
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setIsRenewalModalOpen(false)}>Hold Renewal</Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsRenewalModalOpen(false)}>Approve & Process</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compliance Update Detail Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedUpdate?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 mt-2">
              <span className="font-medium text-primary">{selectedUpdate?.source}</span>
              <span>•</span>
              <span>{selectedUpdate?.date}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 mb-6 rounded-lg overflow-hidden h-48 w-full bg-slate-100">
            <img
              src={selectedUpdate?.image || "/placeholder.jpg"}
              alt={selectedUpdate?.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid grid-cols-3 gap-8 pb-6">
            <div className="col-span-2 space-y-6">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Executive Summary</h4>
                <p className="leading-relaxed text-slate-700">{selectedUpdate?.summary}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Detailed Changes</h4>
                <div className="bg-slate-50 p-4 rounded-lg border text-sm text-slate-700 leading-relaxed">
                  {selectedUpdate?.details}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Affected Groups</h4>
                <div className="flex gap-2">
                  {selectedUpdate?.affected.split(',').map((group: string, i: number) => (
                    <Badge key={i} variant="secondary">{group.trim()}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Impact Analysis */}
            <div className="col-span-1 space-y-6">
              <Card className="bg-gradient-to-br from-slate-50 to-white border-blue-100 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-blue-700 font-semibold">
                    <Activity className="h-4 w-4" />
                    Impact Analysis
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Impact Level</p>
                    <Badge className={
                      selectedUpdate?.impact === 'High' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                        selectedUpdate?.impact === 'Medium' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' :
                          'bg-green-100 text-green-700 hover:bg-green-200'
                    }>{selectedUpdate?.impact}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Action Required</p>
                    <p className="text-sm font-medium">{selectedUpdate?.actionRequired}</p>
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setIsUpdateModalOpen(false)}>
                Create Action Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  )
}
