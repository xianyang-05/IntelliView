"use client"

import { DollarSign, Calendar, FileText, CheckCircle, Clock, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { Sparkles, AlertTriangle, Check, X, Info } from "lucide-react"

export function HrWorkflows() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [requestInfoChat, setRequestInfoChat] = useState<string>("")
  const [chatHistory, setChatHistory] = useState<{ sender: string, message: string }[]>([])
  const [showChat, setShowChat] = useState(false)

  // Load requests from localStorage or use initial mock data
  const [expenseClaims, setExpenseClaims] = useState<any[]>([])
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [otherRequests, setOtherRequests] = useState<any[]>([])

  useEffect(() => {
    const loadRequests = () => {
      const stored = localStorage.getItem('workflowRequests')
      if (stored) {
        const allRequests = JSON.parse(stored)
        setExpenseClaims(allRequests.filter((r: any) => r.type === "Expense Claim"))
        setLeaveRequests(allRequests.filter((r: any) => r.type.includes("Leave")))
        setOtherRequests(allRequests.filter((r: any) => !r.type.includes("Leave") && r.type !== "Expense Claim"))
      } else {
        // Initial Mock Data
        const initialRequests = [
          {
            id: "exp-1",
            employee: "Sarah Johnson",
            department: "Engineering",
            amount: "$450",
            category: "Conference",
            date: "Mar 14, 2024",
            status: "pending",
            description: "React Summit 2024 ticket",
            type: "Expense Claim"
          },
          {
            id: "exp-2",
            employee: "Michael Chen",
            department: "Product",
            amount: "$1,250",
            category: "Travel",
            date: "Mar 12, 2024",
            status: "approved",
            description: "Client meeting in New York",
            type: "Expense Claim"
          },
          {
            id: "exp-3",
            employee: "Emma Wilson",
            department: "Design",
            amount: "$89",
            category: "Software",
            date: "Mar 10, 2024",
            status: "pending",
            description: "Figma professional license",
            type: "Expense Claim"
          },
          {
            id: "leave-1",
            employee: "James Taylor",
            department: "Analytics",
            type: "Annual Leave",
            dates: "Mar 25-29, 2024",
            days: 5,
            status: "pending",
            reason: "Family vacation"
          },
          {
            id: "leave-2",
            employee: "Lisa Anderson",
            department: "Marketing",
            type: "Sick Leave",
            dates: "Mar 18, 2024",
            days: 1,
            status: "approved",
            reason: "Medical appointment"
          },
          {
            id: "other-1",
            employee: "Sophie Martinez",
            department: "Design",
            type: "Equipment Request",
            item: "MacBook Pro 16\"",
            status: "approved",
            date: "Mar 15, 2024"
          }
        ]
        localStorage.setItem('workflowRequests', JSON.stringify(initialRequests))
        setExpenseClaims(initialRequests.filter((r: any) => r.type === "Expense Claim"))
        setLeaveRequests(initialRequests.filter((r: any) => r.type.includes("Leave")))
        setOtherRequests(initialRequests.filter((r: any) => !r.type.includes("Leave") && r.type !== "Expense Claim"))
      }
    }
    loadRequests()
    // Poll for updates (e.g. from employee)
    const interval = setInterval(loadRequests, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleCardClick = (request: any) => {
    setSelectedRequest(request)
    setIsModalOpen(true)
    setShowChat(false)
    setChatHistory(request.messages || [])
    setRequestInfoChat("")
  }

  const updateLocalStorage = (updatedRequest: any) => {
    const stored = JSON.parse(localStorage.getItem('workflowRequests') || '[]')
    const updatedList = stored.map((r: any) => r.id === updatedRequest.id ? updatedRequest : r)
    localStorage.setItem('workflowRequests', JSON.stringify(updatedList))

    // Update local state immediately
    setExpenseClaims(updatedList.filter((r: any) => r.type === "Expense Claim"))
    setLeaveRequests(updatedList.filter((r: any) => r.type.includes("Leave")))
    setOtherRequests(updatedList.filter((r: any) => !r.type.includes("Leave") && r.type !== "Expense Claim"))
  }

  const handleStatusUpdate = (status: string) => {
    if (!selectedRequest) return
    const updatedRequest = { ...selectedRequest, status }
    updateLocalStorage(updatedRequest)
    setSelectedRequest(updatedRequest)
    if (status !== 'pending' && status !== 'info_requested') setIsModalOpen(false)
  }

  const handleRequestInfo = () => {
    setShowChat(true)
  }

  const handleSendRequestInfo = () => {
    if (!requestInfoChat.trim() || !selectedRequest) return

    const newMessage = { sender: "HR", message: requestInfoChat, timestamp: new Date().toISOString() }
    const updatedMessages = [...(selectedRequest.messages || []), newMessage]

    const updatedRequest = {
      ...selectedRequest,
      status: 'info_requested',
      messages: updatedMessages
    }

    updateLocalStorage(updatedRequest)

    // Save Shared Notification
    const newSharedNotification = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'request_info',
      title: 'Action Required',
      message: `HR requested info for ${selectedRequest.type}`,
      timestamp: new Date().toISOString(),
      read: false,
      data: { requestId: selectedRequest.id }
    }
    const sharedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]')
    sharedNotifications.push(newSharedNotification)
    localStorage.setItem('notifications', JSON.stringify(sharedNotifications))

    setSelectedRequest(updatedRequest)
    setChatHistory(updatedMessages)
    setRequestInfoChat("")
    setIsModalOpen(false)
    alert("Request for information sent to employee.")
  }

  const getAiAnalysis = (type: string, amount?: string) => {
    if (type === "Expense Claim" || amount) {
      return {
        status: "success",
        text: "Expense within policy limits. Receipt matches amount.",
        confidence: "High"
      }
    }
    if (type === "Annual Leave") {
      return {
        status: "warning",
        text: "Overlap with 2 team members. Project deadline during this period.",
        confidence: "Medium"
      }
    }
    return {
      status: "neutral",
      text: "No compliance issues detected.",
      confidence: "High"
    }
  }


  const stats = [
    { label: "Pending Requests", value: "12", icon: Clock, color: "text-yellow-600" },
    { label: "Approved Today", value: "8", icon: CheckCircle, color: "text-green-600" },
    { label: "Requires Action", value: "5", icon: XCircle, color: "text-red-600" }
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Workflows</h1>
        <p className="text-muted-foreground">Manage employee requests and approvals</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color === 'text-green-600' ? 'bg-green-100' :
                    stat.color === 'text-yellow-600' ? 'bg-yellow-100' :
                      'bg-red-100'
                    }`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="expenses">
            <DollarSign className="h-4 w-4 mr-2" />
            Expense Claims
          </TabsTrigger>
          <TabsTrigger value="leave">
            <Calendar className="h-4 w-4 mr-2" />
            Leave Requests
          </TabsTrigger>
          <TabsTrigger value="other">
            <FileText className="h-4 w-4 mr-2" />
            Other Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          {expenseClaims.map((claim, index) => (
            <Card key={index} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleCardClick({ ...claim, type: "Expense Claim" })}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{claim.employee}</h3>
                        <Badge variant="outline">{claim.department}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{claim.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Category: {claim.category}</span>
                        <span className="text-muted-foreground">Date: {claim.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary mb-2">{claim.amount}</p>
                    <Badge variant={claim.status === 'approved' ? 'default' : 'secondary'}>
                      {claim.status === 'approved' ? 'Approved' : 'Pending Review'}
                    </Badge>
                  </div>
                </div>
                {claim.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                      setSelectedRequest(claim)
                      setTimeout(() => handleStatusUpdate('approved'), 0)
                    }}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50" onClick={(e) => {
                      e.stopPropagation()
                      handleCardClick({ ...claim, type: "Expense Claim" })
                      setTimeout(() => handleRequestInfo(), 100)
                    }}>
                      <Info className="h-4 w-4 mr-2" />
                      Request Info
                    </Button>
                    <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => {
                      setSelectedRequest(claim)
                      setTimeout(() => handleStatusUpdate('rejected'), 0)
                    }}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          {leaveRequests.map((request, index) => (
            <Card key={index} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleCardClick(request)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{request.employee}</h3>
                        <Badge variant="outline">{request.department}</Badge>
                      </div>
                      <p className="text-sm font-medium mb-1">{request.type}</p>
                      <p className="text-sm text-muted-foreground mb-2">{request.reason}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Dates: {request.dates}</span>
                        <span className="text-muted-foreground">{request.days} days</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>
                    {request.status === 'approved' ? 'Approved' : 'Pending Review'}
                  </Badge>
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                      setSelectedRequest(request)
                      setTimeout(() => handleStatusUpdate('approved'), 0)
                    }}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50" onClick={(e) => {
                      e.stopPropagation()
                      handleCardClick(request)
                      setTimeout(() => handleRequestInfo(), 100)
                    }}>
                      <Info className="h-4 w-4 mr-2" />
                      Request Info
                    </Button>
                    <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => {
                      setSelectedRequest(request)
                      setTimeout(() => handleStatusUpdate('rejected'), 0)
                    }}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          {otherRequests.map((request, index) => (
            <Card key={index} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleCardClick(request)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{request.employee}</h3>
                        <Badge variant="outline">{request.department}</Badge>
                      </div>
                      <p className="text-sm font-medium mb-1">{request.type}</p>
                      <p className="text-sm text-muted-foreground mb-2">{request.item}</p>
                      <span className="text-sm text-muted-foreground">Submitted: {request.date}</span>
                    </div>
                  </div>
                  <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>
                    {request.status === 'approved' ? 'Approved' : 'Pending Review'}
                  </Badge>
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                      setSelectedRequest(request)
                      setTimeout(() => handleStatusUpdate('approved'), 0)
                    }}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50" onClick={(e) => {
                      e.stopPropagation()
                      handleCardClick(request)
                      setTimeout(() => handleRequestInfo(), 100)
                    }}>
                      <Info className="h-4 w-4 mr-2" />
                      Request Info
                    </Button>
                    <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => {
                      setSelectedRequest(request)
                      setTimeout(() => handleStatusUpdate('rejected'), 0)
                    }}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {selectedRequest?.type === "Expense Claim" ? <DollarSign className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
              {selectedRequest?.type || "Request Details"}
            </DialogTitle>
            <DialogDescription>
              Submitted by {selectedRequest?.employee} • {selectedRequest?.department}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-6 py-4">
            <div className="col-span-2 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-muted-foreground">Description</h4>
                <div className="p-3 bg-secondary/30 rounded-lg text-sm">
                  {selectedRequest?.description || selectedRequest?.reason || "No description provided."}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-muted-foreground">Amount/Days</h4>
                  <p className="font-medium">{selectedRequest?.amount || (selectedRequest?.days + " days")}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-muted-foreground">Date</h4>
                  <p className="font-medium">{selectedRequest?.date || selectedRequest?.dates}</p>
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-muted-foreground">Category/Type</h4>
                <Badge variant="outline">{selectedRequest?.category || selectedRequest?.type}</Badge>
              </div>
            </div>

            {/* AI Analysis Sidebar */}
            <div className="col-span-1 space-y-4">
              <div className="p-4 rounded-xl border bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                  <Sparkles className="h-4 w-4" />
                  AI Analysis
                </div>
                {selectedRequest && (() => {
                  const analysis = getAiAnalysis(selectedRequest.type || "Other", selectedRequest.amount)
                  return (
                    <>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {analysis.text}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        {analysis.status === 'success' && <Check className="h-4 w-4 text-emerald-500" />}
                        {analysis.status === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                        {analysis.status === 'neutral' && <Check className="h-4 w-4 text-blue-500" />}
                        <span className={`text-xs font-medium ${analysis.status === 'success' ? 'text-emerald-600' :
                          analysis.status === 'warning' ? 'text-amber-600' : 'text-blue-600'
                          }`}>
                          {analysis.status === 'success' ? 'Approved Likely' :
                            analysis.status === 'warning' ? 'Check Required' : 'Standard Request'}
                        </span>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
            {showChat ? (
              <div className="w-full space-y-3 pt-4 border-t">
                <div className="text-sm font-semibold flex items-center gap-2">
                  Requesting Info from {selectedRequest?.employee}
                  <Badge variant="outline">{selectedRequest?.type}</Badge>
                </div>
                <div className="bg-slate-50 border rounded-lg p-3 min-h-[100px] max-h-[200px] overflow-y-auto space-y-3">
                  {chatHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic text-center py-4">Start the conversation...</p>
                  ) : (
                    chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === 'HR' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-2 text-sm ${msg.sender === 'HR' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                          <p className="text-xs opacity-70 mb-0.5">{msg.sender}</p>
                          {msg.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your question..."
                    className="min-h-[40px] h-[40px] resize-none"
                    value={requestInfoChat}
                    onChange={(e) => setRequestInfoChat(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendRequestInfo())}
                  />
                  <Button size="icon" onClick={handleSendRequestInfo} className="shrink-0 bg-blue-600 hover:bg-blue-700">
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 mr-auto" onClick={handleRequestInfo}>
                  Request Info
                </Button>
                <div className="flex gap-2 ml-auto">
                  <Button variant="destructive" onClick={() => handleStatusUpdate('rejected')}>Reject Request</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusUpdate('approved')}>Approve Request</Button>
                </div>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
