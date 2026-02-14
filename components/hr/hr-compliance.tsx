"use client"

import { Shield, AlertTriangle, Calendar, GraduationCap, FileCheck, MessageSquare, ArrowRight, Send } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { Activity, TrendingUp, AlertCircle, CheckCircle2, Sparkles, Users } from "lucide-react"

export function HrCompliance() {
  const [selectedRenewal, setSelectedRenewal] = useState<any>(null)
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false)
  const [isReadOnly, setIsReadOnly] = useState(false)

  const [selectedUpdate, setSelectedUpdate] = useState<any>(null)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isActionPlanModalOpen, setIsActionPlanModalOpen] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<any>(null)
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([])

  const handleChatSubmit = (message?: string) => {
    const msgToSend = message || chatInput
    if (!msgToSend.trim()) return

    const newHistory = [...chatHistory, { role: 'user', content: msgToSend }]
    setChatHistory(newHistory as any)
    setChatInput("")

    // Simulate AI response
    setTimeout(() => {
      let reply = `Based on the ${selectedUpdate?.title}, here is the relevant information.`
      if (msgToSend.toLowerCase().includes('overtime')) {
        reply = "The new amendment changes the base rate calculation for overtime. You will need to adjust the payroll formula to (Basic / 170) * 1.5 * Hours."
      } else if (msgToSend.toLowerCase().includes('handbook')) {
        reply = "Yes, the Employee Handbook needs to be updated to reflect the new hybrid work policy requirements mandated by the amendment."
      } else if (msgToSend.toLowerCase().includes('memo')) {
        reply = "I can draft a memo for the Department Heads. Would you like me to focus on the immediate changes or the timeline for implementation?"
      } else {
        reply = `The updates specifically target ${selectedUpdate?.affected}. I recommend initiating a review of your current policies to ensure alignment.`
      }

      setChatHistory(prev => [...prev, { role: 'assistant', content: reply }])
    }, 1000)
  }

  const handleFAQClick = (question: string) => {
    handleChatSubmit(question)
  }

  // Auto-open first news item (Once per session)
  useEffect(() => {
    const hasViewed = sessionStorage.getItem('has_viewed_compliance_news')
    if (complianceUpdates.length > 0 && !hasViewed) {
      setTimeout(() => {
        handleOpenUpdate(complianceUpdates[0])
        sessionStorage.setItem('has_viewed_compliance_news', 'true')
      }, 500)
    }
  }, [])

  const handleOpenUpdate = (update: any) => {
    setSelectedUpdate(update)
    setIsUpdateModalOpen(true)
    //Reset chat on new update open
    setChatHistory([])
    setChatInput("")
  }

  const handleInitiateRenewal = (item: any, readOnly = false) => {
    setSelectedRenewal(item)
    setIsReadOnly(readOnly)
    setIsRenewalModalOpen(true)
  }

  const handleApproveRenewal = () => {
    setIsRenewalModalOpen(false)

    // Trigger global event for employee side
    const events = JSON.parse(localStorage.getItem('global_events') || '{}')
    localStorage.setItem('global_events', JSON.stringify({
      ...events,
      visa_renewal_needed: true,
      visa_renewal_viewed: false
    }))

    // Add Notification
    const newNotif = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'compliance_alert',
      title: 'Action Required: Visa Renewal',
      message: 'Please provide your NID to proceed with the visa renewal application.',
      timestamp: new Date().toISOString(),
      read: false
    }
    const sharedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]')
    sharedNotifications.push(newNotif)
    localStorage.setItem('notifications', JSON.stringify(sharedNotifications))

    alert(`Renewal process initiated for ${selectedRenewal.employee}`)
  }

  const handleSendReminder = (item: any) => {
    // Save Shared Notification
    const newSharedNotification = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'compliance_alert',
      title: 'Compliance Reminder',
      message: `Reminder: ${item.training} is due on ${item.deadline}`,
      timestamp: new Date().toISOString(),
      read: false,
      data: { trainingId: item.id } // Assuming item has ID or we just use it for context
    }
    const sharedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]')
    sharedNotifications.push(newSharedNotification)
    localStorage.setItem('notifications', JSON.stringify(sharedNotifications))

    alert(`Reminder sent to ${item.employee} for ${item.training}`)
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
      employee: "Alex Chan",
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



  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Compliance & Audit</h1>
        <p className="text-muted-foreground">Monitor and manage compliance requirements</p>
      </div>

      {/* Compliance Updates (Moved to Top) */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-blue-600" />
        Regulatory Updates & News
      </h2>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {complianceUpdates.map((update, index) => (
          <Card key={index} className="cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group overflow-hidden" onClick={() => handleOpenUpdate(update)}>
            {/* Added Image Header */}
            <div className="h-40 w-full bg-slate-100 relative">
              <img src={update.image} alt={update.title} className="w-full h-full object-cover" />
            </div>
            <CardHeader className="pb-3 pt-4">
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
            <div key={index} className={`p-4 rounded-lg border-2 shadow-sm ${item.status === 'urgent' ? 'bg-white border-red-400' : 'bg-white border-yellow-400'
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
                <Button size="sm" variant="ghost" className="bg-slate-100/50 hover:bg-slate-200" onClick={() => handleInitiateRenewal(item, true)}>View Details</Button>
                <Button size="sm" variant={item.status === 'urgent' ? 'default' : 'outline'} onClick={() => handleInitiateRenewal(item, false)}>
                  Initiate Renewal
                </Button>
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
                  <Button size="sm" className="flex-1" onClick={() => handleSendReminder(item)}>Send Reminder</Button>
                  <Button size="sm" variant="outline" onClick={() => { setSelectedTraining(item); setIsTrainingModalOpen(true); }}>View Training</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>


      <Dialog open={isRenewalModalOpen} onOpenChange={setIsRenewalModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              <div className="flex flex-col">
                <span className="text-xs font-normal text-muted-foreground uppercase tracking-wider">Manager View</span>
                <span>Renewal Check: {selectedRenewal?.employee}</span>
              </div>
            </DialogTitle>
            <DialogDescription>
              Review performance and approve renewal for {selectedRenewal?.visaType}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 py-4">
            {/* Employee Details & Note (Left Column) */}
            <div className="space-y-6">
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

              {/* Note Section Moved Here */}
              {!isReadOnly && (
                <div className="w-full">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Leave a note</label>
                  <textarea
                    className="w-full min-h-[100px] p-3 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 bg-slate-50"
                    placeholder="Add comments for the renewal process..."
                  />
                </div>
              )}
            </div>

            {/* AI Performance Analysis & Actions (Right Column) */}
            <div className="space-y-4 flex flex-col h-full">
              <div className="p-4 bg-slate-50 border rounded-xl space-y-3 flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                  <Activity className="h-4 w-4" />
                  AI Performance Insight
                </div>
                {selectedRenewal && (() => {
                  const data = getPerformanceData(selectedRenewal.employee)
                  return (
                    <div className="space-y-4 text-sm mt-3">
                      <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                        <span className="text-muted-foreground">KPI Score</span>
                        <Badge className={`${parseInt(data.kpi) > 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'} hover:bg-emerald-200 border-0`}>
                          {data.kpi}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 bg-purple-50 rounded border border-purple-100 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Retention Risk</p>
                          <p className="font-semibold text-green-600">Low</p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded border border-purple-100 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Growth</p>
                          <p className="font-semibold text-blue-600">High Potential</p>
                        </div>
                      </div>

                      <div className="pt-2 space-y-2">
                        <p className="text-xs text-slate-600 leading-relaxed">
                          <span className="font-semibold text-purple-700 block mb-1">AI Analysis:</span>
                          {selectedRenewal.employee} has consistently exceeded project deliverables. Peer feedback indicates strong leadership qualities.
                          <span className="block mt-2 font-medium text-emerald-700">Recommendation: Renew immediately with 2-year extension.</span>
                        </p>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Actions Repositioned */}
              <div className="flex gap-3 pt-2 mt-auto">
                {!isReadOnly ? (
                  <>
                    <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setIsRenewalModalOpen(false)}>Hold Renewal</Button>
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleApproveRenewal}>Approve & Process</Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground w-full justify-center bg-slate-50 p-2 rounded">
                    <Shield className="h-4 w-4" />
                    Viewing in Read-Only Mode
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compliance Update Detail Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden">

          {/* Header */}
          <div className="p-6 border-b shrink-0">
            <DialogTitle className="text-2xl mb-2">{selectedUpdate?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-base">
              <span className="font-medium text-primary">{selectedUpdate?.source}</span>
              <span>•</span>
              <span>{selectedUpdate?.date}</span>
            </DialogDescription>
          </div>

          <div className="flex-1 overflow-hidden grid grid-cols-5">
            {/* Left Column: Details (3 cols) */}
            <div className="col-span-3 overflow-y-auto p-6 space-y-8 border-r">
              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-slate-500" /> Executive Summary
                </h4>
                <p className="leading-relaxed text-slate-700 text-lg">{selectedUpdate?.summary}</p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-3">Detailed Changes</h4>
                <div className="bg-slate-50 p-6 rounded-xl border text-slate-700 leading-relaxed text-base">
                  {selectedUpdate?.details}
                </div>
              </div>

              {/* Enhanced Impact Analysis */}
              <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-blue-800">
                  <Activity className="h-5 w-5" /> Impact Analysis
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Impact Level</p>
                    <Badge className={`text-base px-3 py-1 ${selectedUpdate?.impact === 'High' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                      selectedUpdate?.impact === 'Medium' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' :
                        'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}>{selectedUpdate?.impact}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Affected Departments</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUpdate?.affected.split(',').map((group: string, i: number) => (
                        <Badge key={i} variant="secondary" className="bg-white">{group.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 mb-1">Recommended Action</p>
                      <p className="font-medium">{selectedUpdate?.actionRequired}</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={() => setIsActionPlanModalOpen(true)}>
                      <TrendingUp className="h-4 w-4" /> Create Action Plan
                    </Button>
                  </div>
                </div>
              </div>

              {/* Source Link at Bottom */}
              <div className="pt-8 mt-auto">
                <a href="#" className="text-blue-600 hover:underline flex items-center gap-2 text-sm">
                  Read full source document from {selectedUpdate?.source} <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Right Column: Chatbot (2 cols) */}
            <div className="col-span-2 flex flex-col bg-slate-50 h-full">
              <div className="p-4 bg-white border-b flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Compliance Assistant</h4>
                  <p className="text-xs text-muted-foreground">Ask based on this update</p>
                </div>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border shadow-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatHistory.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8 px-4">
                    <p>Ask questions like:</p>
                    <ul className="mt-2 text-left space-y-2 bg-white/50 p-4 rounded-lg text-xs">
                      <li className="cursor-pointer hover:text-blue-600" onClick={() => handleFAQClick("How does this affect our overtime budget?")}>• How does this affect our overtime budget?</li>
                      <li className="cursor-pointer hover:text-blue-600" onClick={() => handleFAQClick("Do we need to update our handbook immediately?")}>• Do we need to update our handbook immediately?</li>
                      <li className="cursor-pointer hover:text-blue-600" onClick={() => handleFAQClick("Draft a memo for the affected departments.")}>• Draft a memo for the affected departments.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                  <input
                    placeholder="Ask a question..."
                    className="flex-1 text-sm border rounded-md px-3 py-2 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                  />
                  <Button size="icon" onClick={() => handleChatSubmit()} disabled={!chatInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Plan Modal */}
      <Dialog open={isActionPlanModalOpen} onOpenChange={setIsActionPlanModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-950 text-slate-50 border-slate-800">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex justify-between items-start">
            <div>
              <div className="flex gap-2 mb-3">
                <Badge variant="outline" className="text-slate-400 border-slate-700">Singapore</Badge>
                <Badge variant="outline" className="text-red-400 border-red-900 bg-red-950/30">High Risk</Badge>
                <Badge variant="outline" className="text-slate-400 border-slate-700">Effective: 1 September 2026</Badge>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">New COMPASS Framework Scoring Updates for EP Renewals</h2>
              <p className="text-slate-400 max-w-2xl">MOM has updated the scoring criteria for the Complementarity Assessment Framework (COMPASS) affecting all Employment Pass renewals.</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm mb-1">Action Completion</p>
              <p className="text-3xl font-bold text-emerald-500">0%</p>
              <div className="w-32 h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-emerald-500 w-0"></div>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-8">
            {/* Required Actions */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" /> Required HR Actions
                </h3>
                <span className="text-xs text-slate-500">0 of 3 completed</span>
              </div>
              <div className="space-y-3">
                {['Audit current EP holders against new criteria', 'Adjust hiring plans for diversity scores', 'Prepare salary adjustments if necessary'].map((action, i) => (
                  <div key={i} className="p-4 border border-slate-800 bg-slate-900/50 rounded-lg flex items-start gap-4">
                    <div className="mt-1 h-4 w-4 rounded-full border border-slate-600"></div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-200">{action}</p>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Owner: HR Admin</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due: Within 7 days</span>
                        <span className="text-amber-500">Priority: High</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline & Impact Grid */}
            <div className="grid grid-cols-2 gap-8">
              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-200">
                  <Calendar className="h-5 w-5 text-slate-400" /> Implementation Timeline
                </h3>
                <div className="space-y-6 relative pl-4 border-l border-slate-800 ml-2">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-emerald-500"></div>
                    <h4 className="font-medium text-white">Immediate Action</h4>
                    <p className="text-sm text-slate-400 mt-1">Review policy & notify stakeholders</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-slate-600"></div>
                    <h4 className="font-medium text-slate-300">Before Effective Date</h4>
                    <p className="text-sm text-slate-400 mt-1">Update handbooks & configure payroll</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-slate-600"></div>
                    <h4 className="font-medium text-white">1 September 2026</h4>
                    <p className="text-sm text-slate-400 mt-1">Go-live & enforcement starts</p>
                  </div>
                </div>
              </div>

              {/* Department Impact */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-200">
                  <Users className="h-5 w-5 text-slate-400" /> Department Impact
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'HR Dept', desc: 'Policy updates, handbook revision' },
                    { name: 'Payroll', desc: 'System logic updates, tax calc' },
                    { name: 'IT / Systems', desc: 'ZeroHR configuration, audit logs' },
                    { name: 'Management', desc: 'Budget approval, risk oversight' }
                  ].map((dept, i) => (
                    <div key={i} className="p-3 border border-slate-800 rounded bg-slate-900/30">
                      <div className="flex items-center gap-2 mb-2 text-slate-300 font-medium text-sm">
                        <div className="h-2 w-2 rounded-full bg-slate-500"></div> {dept.name}
                      </div>
                      <p className="text-xs text-slate-500 leading-tight">{dept.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Automation Banner */}
            <div className="p-5 rounded-xl border border-indigo-900/50 bg-indigo-950/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-indigo-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
                    <Sparkles className="h-5 w-5 text-indigo-400" /> ZeroHR Automation Available
                  </h3>
                  <p className="text-slate-400 text-sm mb-3">We can handle some of these tasks for you.</p>
                  <p className="text-slate-300 max-w-lg">ZeroHR's Workforce Analytics can simulate COMPASS scores for current employees and candidates.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20">Auto-Apply Changes</Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
            <div className="flex items-center gap-2 text-red-400 text-sm cursor-pointer hover:text-red-300">
              <AlertTriangle className="h-4 w-4" /> Legal Penalties & References
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-900" onClick={() => setIsActionPlanModalOpen(false)}>Close</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Save Plan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Training Modal */}
      <Dialog open={isTrainingModalOpen} onOpenChange={setIsTrainingModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              {selectedTraining?.training}
            </DialogTitle>
            <DialogDescription>
              Assigned to {selectedTraining?.employee} • Due {selectedTraining?.deadline}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {/* Timeline */}
            <div className="relative mb-8 px-4">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0"></div>
              <div className="relative z-10 flex justify-between">
                {/* Steps: Assigned, In Progress, Assessment, Certified */}
                {['Assigned', 'In Progress', 'Assessment', 'Certified'].map((step, i) => {
                  const status = selectedTraining?.status === 'not-started' ? 0 :
                    selectedTraining?.progress < 50 ? 1 :
                      selectedTraining?.progress < 100 ? 2 : 3;
                  const isCompleted = i <= status;
                  const isCurrent = i === status;

                  return (
                    <div key={i} className="flex flex-col items-center gap-2 bg-white px-2">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-300'
                        }`}>
                        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className={`text-xs font-medium ${isCurrent ? 'text-blue-600' : 'text-slate-500'}`}>{step}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Modules */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Course Modules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {['Introduction & Principles', 'Legal Frameworks', 'Case Studies', 'Final Assessment'].map((module, i) => (
                  <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${i === 0 || (selectedTraining?.progress > i * 25) ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {i === 0 || (selectedTraining?.progress > i * 25) ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{module}</span>
                    </div>
                    <Badge variant="outline" className="text-xs font-normal">
                      {i === 3 ? '30 mins' : '15 mins'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTrainingModalOpen(false)}>Close</Button>
            <Button onClick={() => {
              // Simulate sending reminder
              const newNotif = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'alert',
                title: 'Training Reminder',
                message: 'Please complete your mandatory compliance training by Oct 15.',
                timestamp: new Date().toISOString(),
                read: false
              }
              const sharedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]')
              sharedNotifications.push(newNotif)
              localStorage.setItem('notifications', JSON.stringify(sharedNotifications))

              alert("Reminder sent to employee!")
              setIsTrainingModalOpen(false)
            }}>
              <Users className="h-4 w-4 mr-2" /> Remind
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
