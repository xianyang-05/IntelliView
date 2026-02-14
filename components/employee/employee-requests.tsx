"use client"

import { useState } from "react"
import { Calendar, DollarSign, AlertCircle, Upload, Check, Clock, ChevronDown, ArrowLeft, Sun, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight, Receipt, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useRef, useEffect } from "react"
import { Loader2, FileText, X, MessageSquare, Send } from "lucide-react"

export function EmployeeRequests() {
  const [currentView, setCurrentView] = useState<"main" | "leave" | "expense" | "action">("main")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractionStatus, setExtractionStatus] = useState<"idle" | "extracting" | "success">("idle")
  const [expenseForm, setExpenseForm] = useState({
    category: "",
    amount: "",
    date: "",
    description: ""
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      // If current view is expense, simulate extraction
      if (currentView === "expense") {
        simulateExtraction()
      }
    }
  }

  const simulateExtraction = () => {
    setExtractionStatus("extracting")
    setTimeout(() => {
      setExpenseForm({
        category: "meals",
        amount: "42.50",
        date: "2026-02-10",
        description: "Team lunch at Nando's"
      })
      setExtractionStatus("success")
    }, 1500)
  }

  const removeFile = () => {
    setUploadedFile(null)
    setExtractionStatus("idle")
    setExpenseForm({ category: "", amount: "", date: "", description: "" })
    if (fileInputRef.current) fileInputRef.current.value = ""
  }
  const [leaveDurationType, setLeaveDurationType] = useState<"continuous" | "split">("continuous")
  const [calendarMonth, setCalendarMonth] = useState(1) // 0=Jan, 1=Feb
  const [calendarYear] = useState(2026)

  // Interactive calendar state
  const [selectedDates, setSelectedDates] = useState<number[]>([]) // for split leave
  const [startDate, setStartDate] = useState<number | null>(null) // for continuous leave
  const [endDate, setEndDate] = useState<number | null>(null) // for continuous leave
  const [showSubmitAlert, setShowSubmitAlert] = useState(false) // confirmation before submit
  const [overlapDates, setOverlapDates] = useState<number[]>([]) // team overlap
  const [showOverlapAlert, setShowOverlapAlert] = useState(false) // alert for team overlap
  const [leaveType, setLeaveType] = useState("")
  const [leaveReason, setLeaveReason] = useState("")

  const [requests, setRequests] = useState<any[]>([])
  const [actionRequiredCount, setActionRequiredCount] = useState(0)
  const [selectedActionRequest, setSelectedActionRequest] = useState<any>(null)
  const [responseText, setResponseText] = useState("")

  useEffect(() => {
    const loadRequests = () => {
      // Load from shared storage
      const stored = localStorage.getItem('workflowRequests')
      if (stored) {
        const allRequests = JSON.parse(stored)
        // Filter for this employee (simulated as current user seeing all for demo, or filter by name if we had auth context)
        // For demo, we'll show all requests that match a "current user" or just all
        setRequests(allRequests)

        const actions = allRequests.filter((r: any) => r.status === 'info_requested')
        setActionRequiredCount(actions.length)
      }
    }
    loadRequests()
    const interval = setInterval(loadRequests, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmitResponse = () => {
    if (!selectedActionRequest) return

    const updatedMessages = [
      ...(selectedActionRequest.messages || []),
      { sender: "Employee", message: responseText || "Uploaded document.", timestamp: new Date().toISOString() }
    ]

    const updatedRequest = {
      ...selectedActionRequest,
      status: 'info_submitted',
      messages: updatedMessages
    }

    // Update localStorage
    const stored = JSON.parse(localStorage.getItem('workflowRequests') || '[]')
    const updatedList = stored.map((r: any) => r.id === updatedRequest.id ? updatedRequest : r)
    localStorage.setItem('workflowRequests', JSON.stringify(updatedList))

    // Save Shared Notification for HR
    const newSharedNotification = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'info_submitted',
      title: 'Information Submitted',
      message: `Employee submitted info for ${selectedActionRequest.type}`,
      timestamp: new Date().toISOString(),
      read: false,
      data: { requestId: selectedActionRequest.id }
    }
    const sharedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]')
    sharedNotifications.push(newSharedNotification)
    localStorage.setItem('notifications', JSON.stringify(sharedNotifications))

    // Reset UI
    setRequests(updatedList)
    setSelectedActionRequest(null)
    setResponseText("")
    setUploadedFile(null)
    setCurrentView("main")
    alert("Response sent to HR.")
  }

  const leaveBalances = [
    { type: "Annual Leave", days: 12, color: "bg-yellow-400", icon: <Sun className="h-4 w-4 text-yellow-400" /> },
    { type: "Sick Leave", days: 10, color: "bg-red-400", icon: <AlertCircle className="h-4 w-4 text-red-400" /> },
    { type: "Emergency Leave", days: 3, color: "bg-emerald-400", icon: <AlertTriangle className="h-4 w-4 text-orange-400" /> },
    { type: "Carry Over", days: 2, color: "bg-blue-400", icon: <RefreshCw className="h-4 w-4 text-blue-400" /> },
  ]

  const teamOnLeave = [
    { name: "Priya Sharma", dates: "Feb 16-19" },
    { name: "Marcus Johnson", dates: "Feb 17-20" }
  ]

  const monthlyLimits = [
    { category: "Travel & Transport", limit: 500, color: "bg-emerald-500" },
    { category: "Meals & Entertainment", limit: 100, color: "bg-emerald-500" },
    { category: "Accommodation", limit: 300, color: "bg-emerald-500" },
    { category: "Local Transport", limit: 50, color: "bg-emerald-500" },
  ]

  const recentExpenses = [
    { category: "Travel", amount: 450, date: "Jan 28, 2024", status: "approved" },
    { category: "Meals", amount: 85, date: "Feb 1, 2024", status: "pending" },
  ]

  // Calendar generation
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay()

  const daysInMonth = getDaysInMonth(calendarMonth, calendarYear)
  const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear)
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  const today = new Date()
  const isCurrentMonth = today.getMonth() === calendarMonth && today.getFullYear() === calendarYear
  const currentDay = today.getDate()

  // Mock data for team leave and holidays
  const teamLeaveDays = [16, 17, 18, 19, 20]
  const yourLeaveDays = [8, 9, 10]
  const holidays = [11, 14]

  const renderCalendar = () => {
    const cells = []
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

    for (let d = 0; d < 7; d++) {
      cells.push(
        <div key={`header-${d}`} className="text-center text-xs text-muted-foreground font-medium py-2">
          {dayNames[d]}
        </div>
      )
    }

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="text-center py-1.5" />)
    }

    // Determine which dates are selected by the user
    const isSelectedDay = (day: number) => {
      if (leaveDurationType === "split") return selectedDates.includes(day)
      if (startDate !== null && endDate !== null) return day >= startDate && day <= endDate
      if (startDate !== null && endDate === null) return day === startDate
      return false
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === currentDay
      const isWeekend = (firstDay + day - 1) % 7 === 0 || (firstDay + day - 1) % 7 === 6
      const isTeamLeave = teamLeaveDays.includes(day)
      const isYourLeave = yourLeaveDays.includes(day)
      const isHoliday = holidays.includes(day)
      const isSelected = isSelectedDay(day)

      const handleDayClick = () => {
        if (currentView !== "leave") return
        if (isWeekend || isHoliday) return

        // Show immediate alert if selecting a team leave day
        if (isTeamLeave) {
          setOverlapDates([day])
          setShowOverlapAlert(true)
        }

        if (leaveDurationType === "split") {
          setSelectedDates(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a, b) => a - b)
          )
        } else {
          if (startDate === null || (startDate !== null && endDate !== null)) {
            setStartDate(day)
            setEndDate(null)
          } else if (day >= startDate) {
            setEndDate(day)
          } else {
            setStartDate(day)
            setEndDate(null)
          }
        }
      }

      let bgClass = ""
      let textClass = "text-foreground"
      let ring = ""

      if (isSelected) {
        bgClass = "bg-emerald-600"
        textClass = "text-white font-bold"
      } else if (isToday) {
        ring = "ring-2 ring-emerald-500"
        textClass = "text-emerald-400 font-bold"
      }

      if (!isSelected && !isToday) {
        if (isYourLeave) {
          textClass = "text-emerald-400 font-medium"
        } else if (isTeamLeave) {
          textClass = "text-red-400 font-medium"
        } else if (isHoliday) {
          textClass = "text-blue-400 font-medium"
        } else if (isWeekend) {
          textClass = "text-red-400/60"
        }
      }

      cells.push(
        <div
          key={`day-${day}`}
          onClick={handleDayClick}
          className={`text-center py-1.5 text-sm rounded-md relative transition-all
            ${bgClass} ${textClass} ${ring}
            ${currentView === "leave" && !isWeekend && !isHoliday ? 'cursor-pointer hover:bg-secondary' : 'cursor-default'}
            ${(isWeekend || isHoliday) && currentView === "leave" ? 'cursor-not-allowed opacity-60' : ''}
          `}
        >
          {day}
          {isTeamLeave && !isSelected && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400" />
          )}
        </div>
      )
    }

    return cells
  }

  // Check for team overlap and prepare submit
  const handleSubmitClick = () => {
    let datesToCheck: number[] = []
    if (leaveDurationType === "split") {
      datesToCheck = selectedDates
    } else if (startDate !== null && endDate !== null) {
      for (let d = startDate; d <= endDate; d++) datesToCheck.push(d)
    } else if (startDate !== null) {
      datesToCheck = [startDate]
    }

    const overlap = datesToCheck.filter(d => teamLeaveDays.includes(d))
    if (overlap.length > 0) {
      setOverlapDates(overlap)
      setShowOverlapAlert(true)
    } else {
      setShowSubmitAlert(true)
    }
  }

  // Quick action: shift all selected dates by +1 day
  const shiftDatesBy1 = () => {
    if (leaveDurationType === "split") {
      setSelectedDates(prev => prev.map(d => d + 1).filter(d => d <= daysInMonth))
    } else {
      if (startDate !== null) setStartDate(startDate + 1)
      if (endDate !== null) setEndDate(endDate + 1 <= daysInMonth ? endDate + 1 : endDate)
    }
    setShowOverlapAlert(false)
  }

  const getSelectedDateString = (day: number) => {
    const date = new Date(calendarYear, calendarMonth, day)
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  // Response View
  if (currentView === "action" && selectedActionRequest) {
    const hrMessage = selectedActionRequest.messages?.find((m: any) => m.sender === 'HR')?.message

    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView("main")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Respond to Request
              <Badge variant="destructive">Action Required</Badge>
            </h1>
            <p className="text-sm text-muted-foreground">HR requires additional information for your request</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <MessageSquare className="h-5 w-5" />
                HR Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium mb-2">Message from HR:</p>
              <div className="p-4 bg-white rounded-lg border border-blue-100 text-sm leading-relaxed">
                {hrMessage || "Please provide additional details."}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Requested recently</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Your Response
                </CardTitle>
                <CardDescription>Provide text details or upload documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Response Message</Label>
                  <Textarea
                    placeholder="Type your response here..."
                    rows={4}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Attachment (Optional)</Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-emerald-500/50 transition-colors cursor-pointer bg-secondary/20"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                    />
                    {uploadedFile ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-600">
                        <FileText className="h-5 w-5" />
                        <span className="text-sm font-medium">{uploadedFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload document</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setCurrentView("main")}>Cancel</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmitResponse}>
                    Submit Response
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Submit Expense View
  if (currentView === "expense") {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView("main")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Submit Expense</h1>
            <p className="text-sm text-muted-foreground">Submit your expense reimbursement request</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Receipt className="h-4 w-4" />
                    Receipt Upload
                  </CardTitle>
                  <button className="text-xs text-muted-foreground flex items-center gap-1 hover:underline">
                    ✦ Guidelines
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.png,.jpeg" />
                {uploadedFile ? (
                  <div className="border rounded-lg p-4 flex items-center gap-4 bg-muted/20">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      {extractionStatus === "extracting" ? <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" /> : <FileText className="h-5 w-5 text-emerald-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      {extractionStatus === "extracting" && <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><Sparkles className="h-3 w-3" /> Extracting details...</p>}
                      {extractionStatus === "success" && <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><Check className="h-3 w-3" /> Data extracted successfully</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={removeFile}><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Drop receipt here or <span className="text-emerald-500">browse</span></p>
                    <p className="text-xs text-muted-foreground mt-1">Photos or PDFs • Auto-detects invalid images</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Expense Details</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Expense Category</Label>
                  <div className="relative">
                    <Select value={expenseForm.category} onValueChange={(val) => setExpenseForm({ ...expenseForm, category: val })}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="travel">Travel & Transport</SelectItem>
                        <SelectItem value="meals">Meals & Entertainment</SelectItem>
                        <SelectItem value="accommodation">Accommodation</SelectItem>
                        <SelectItem value="transport">Local Transport</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                    {extractionStatus === "success" && <div className="absolute right-8 top-1/2 -translate-y-1/2"><Badge variant="secondary" className="h-5 bg-emerald-100/50 text-emerald-600 text-[10px] px-1.5 pointer-events-none"><Sparkles className="w-2.5 h-2.5 mr-1" /> Auto-filled</Badge></div>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Amount ($)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input type="number" placeholder="0.00" className="pl-7" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                      {extractionStatus === "success" && <div className="absolute right-2 top-1/2 -translate-y-1/2"><Badge variant="secondary" className="h-5 bg-emerald-100/50 text-emerald-600 text-[10px] px-1.5 pointer-events-none"><Sparkles className="w-2.5 h-2.5 mr-1" /> Auto-filled</Badge></div>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Expense Date</Label>
                    <div className="relative">
                      <Input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
                      {extractionStatus === "success" && <div className="absolute right-8 top-1/2 -translate-y-1/2"><Badge variant="secondary" className="h-5 bg-emerald-100/50 text-emerald-600 text-[10px] px-1.5 pointer-events-none"><Sparkles className="w-2.5 h-2.5 mr-1" /> Auto-filled</Badge></div>}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <div className="relative">
                    <Textarea placeholder="Brief description of the expense..." rows={3} className="resize-none" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                    {extractionStatus === "success" && <div className="absolute right-2 top-2"><Badge variant="secondary" className="h-5 bg-emerald-100/50 text-emerald-600 text-[10px] px-1.5 pointer-events-none"><Sparkles className="w-2.5 h-2.5 mr-1" /> Auto-filled</Badge></div>}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <Button variant="outline">Save Draft</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Submit Expense</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-emerald-500/30">
              <CardContent className="p-6 text-center">
                <div className="flex items-center gap-2 justify-center mb-3"><DollarSign className="h-4 w-4 text-emerald-500" /><span className="text-sm font-semibold text-emerald-500">Reimbursement Estimate</span></div>
                <div className="text-3xl font-bold mb-1">$0.00</div>
                <p className="text-sm text-muted-foreground mb-4">Approved Amount</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Processing Time</span><span className="font-medium">3-5 days</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Payout Method</span><span className="font-medium">Direct Deposit</span></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Monthly Limits</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {monthlyLimits.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1"><span className="text-emerald-500">{item.category}</span><span className="font-medium">${item.limit}</span></div>
                    <div className="w-full bg-secondary rounded-full h-1"><div className={`${item.color} h-1 rounded-full`} style={{ width: '30%' }} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Clock className="h-4 w-4" />Recent Expenses</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {recentExpenses.map((expense, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div><p className="text-sm font-medium">{expense.category}</p><p className="text-xs text-muted-foreground">{expense.date}</p></div>
                    <div className="text-right"><p className="text-sm font-medium">${expense.amount}</p><span className={`text-xs font-medium ${expense.status === 'approved' ? 'text-emerald-500' : 'text-yellow-500'}`}>{expense.status}</span></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Request Leave View
  if (currentView === "leave") {
    const hasSelectedDates = leaveDurationType === "split" ? selectedDates.length > 0 : startDate !== null

    return (
      <div className="p-8">
        {/* Overlap Alert Modal */}
        {showOverlapAlert && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/10 rounded-full"><AlertTriangle className="h-6 w-6 text-orange-500" /></div>
                <h3 className="text-lg font-bold">Team Leave Overlap Detected</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Your selected dates overlap with team members already on leave:</p>
              <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3 mb-4">
                <div className="space-y-1.5">
                  {overlapDates.map(d => (
                    <div key={d} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{getSelectedDateString(d)}</span>
                      <Badge variant="secondary" className="bg-red-100 text-red-700 text-[10px]">Team on leave</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={shiftDatesBy1}>
                  <ChevronRight className="h-4 w-4 mr-2" />Quick Fix: Shift All Dates +1 Day
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { setShowOverlapAlert(false); setShowSubmitAlert(true) }}>Submit Anyway</Button>
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setShowOverlapAlert(false)}>Go Back & Edit</Button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Confirmation Alert */}
        {showSubmitAlert && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-full"><Check className="h-6 w-6 text-emerald-500" /></div>
                <h3 className="text-lg font-bold">Confirm Leave Request</h3>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Leave Type</span><span className="font-medium capitalize">{leaveType || "Annual Leave"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Duration</span><span className="font-medium capitalize">{leaveDurationType}</span></div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dates</span>
                  <span className="font-medium">
                    {leaveDurationType === "split"
                      ? `${selectedDates.length} day(s)`
                      : startDate && endDate
                        ? `${monthNames[calendarMonth]} ${startDate} – ${endDate}`
                        : startDate ? `${monthNames[calendarMonth]} ${startDate}` : "—"}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowSubmitAlert(false)}>Cancel</Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => {
                  setShowSubmitAlert(false); setCurrentView("main")
                  setStartDate(null); setEndDate(null); setSelectedDates([]); setLeaveType(""); setLeaveReason("")
                  alert("✅ Leave request submitted successfully!")
                }}>Confirm & Submit</Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView("main")}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold">Request Leave</h1>
            <p className="text-sm text-muted-foreground">Submit a new leave request</p>
          </div>
        </div>

        {/* Leave Balance Summary */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-4 w-4" />Leave Balance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {leaveBalances.map((bal, index) => (
                <div key={index} className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">{bal.icon}<span className="text-xs text-muted-foreground">{bal.type}</span></div>
                  <div className="text-2xl font-bold">{bal.days} <span className="text-sm font-normal text-muted-foreground">days</span></div>
                  <div className="mt-2 w-full bg-secondary rounded-full h-1"><div className={`${bal.color} h-1 rounded-full`} style={{ width: `${(bal.days / 15) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Leave Request Form</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger><SelectValue placeholder="Select leave type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="emergency">Emergency Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Leave Duration Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => { setLeaveDurationType("continuous"); setSelectedDates([]) }} className={`p-4 rounded-lg border text-left transition-all ${leaveDurationType === "continuous" ? "border-emerald-500 bg-emerald-500/10" : "border-border bg-secondary/30 hover:border-muted-foreground/30"}`}>
                      <div className="flex items-center gap-2 mb-1"><Calendar className={`h-4 w-4 ${leaveDurationType === "continuous" ? "text-emerald-400" : "text-muted-foreground"}`} /><span className="font-semibold text-sm">Continuous Leave</span></div>
                      <p className="text-xs text-muted-foreground">Select a date range</p>
                    </button>
                    <button onClick={() => { setLeaveDurationType("split"); setStartDate(null); setEndDate(null) }} className={`p-4 rounded-lg border text-left transition-all ${leaveDurationType === "split" ? "border-emerald-500 bg-emerald-500/10" : "border-border bg-secondary/30 hover:border-muted-foreground/30"}`}>
                      <div className="flex items-center gap-2 mb-1"><Calendar className={`h-4 w-4 ${leaveDurationType === "split" ? "text-emerald-400" : "text-muted-foreground"}`} /><span className="font-semibold text-sm">Split Leave</span></div>
                      <p className="text-xs text-muted-foreground">Select multiple dates</p>
                    </button>
                  </div>
                </div>

                {/* Selected Dates Display */}
                <div className="space-y-2">
                  <Label>Selected Dates</Label>
                  {leaveDurationType === "continuous" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-secondary/50 border border-border rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                        <p className="text-sm font-medium">{startDate ? getSelectedDateString(startDate) : "Click calendar to select"}</p>
                      </div>
                      <div className="bg-secondary/50 border border-border rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">End Date</p>
                        <p className="text-sm font-medium">{endDate ? getSelectedDateString(endDate) : "Click calendar to select"}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {selectedDates.length === 0 ? (
                        <div className="bg-secondary/50 border border-border rounded-lg p-3">
                          <p className="text-sm text-muted-foreground">Click dates on the calendar to select</p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {selectedDates.map(d => (
                            <div key={d} className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1.5 text-sm">
                              <span className="font-medium text-emerald-600">{getSelectedDateString(d)}</span>
                              <button onClick={() => setSelectedDates(prev => prev.filter(x => x !== d))} className="text-emerald-500 hover:text-red-500 transition-colors"><X className="h-3.5 w-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between bg-secondary/30 rounded-lg p-4 border border-border">
                  <div><p className="font-semibold text-sm">Half-day</p><p className="text-xs text-muted-foreground">Take a <span className="text-emerald-400">half-day</span> on the first or last day</p></div>
                  <Switch />
                </div>

                <div className="space-y-2">
                  <Label>Reason <span className="text-emerald-400">(optional)</span></Label>
                  <Textarea placeholder="Briefly describe the reason for your leave..." rows={3} className="resize-none" value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Attachment & Validation <span className="text-red-400">*</span></Label>
                    <button className="text-xs text-emerald-400 flex items-center gap-1 hover:underline"><span>✦</span> View Guidelines</button>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                  {uploadedFile ? (
                    <div className="border rounded-lg p-4 flex items-center gap-4 bg-secondary/30">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0"><FileText className="h-5 w-5 text-emerald-500" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                        <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><Check className="h-3 w-3" /> Document confirmed valid</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={removeFile}><X className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Drop documents here or <span className="text-emerald-400">browse</span></p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 5MB)</p>
                    </div>
                  )}
                </div>

                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" size="lg" disabled={!hasSelectedDates} onClick={handleSubmitClick}>
                  Submit Request
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Calendar</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCalendarMonth(prev => prev > 0 ? prev - 1 : 11)}><ChevronLeft className="h-4 w-4" /></Button>
                    <span className="text-sm font-medium min-w-[120px] text-center">{monthNames[calendarMonth]} {calendarYear}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCalendarMonth(prev => prev < 11 ? prev + 1 : 0)}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span>Your leave</span></div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" /><span>Team leave</span></div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400" /><span>Holiday</span></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base">👥 Team on Leave</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {teamOnLeave.map((member, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{member.name}</span>
                    <span className="text-sm text-muted-foreground">{member.dates}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Main Requests View — New Request at TOP
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Requests & Approvals</h1>
          <p className="text-muted-foreground mt-1">Manage your leave, expenses, and other inquiries</p>
        </div>
      </div>

      {actionRequiredCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="p-2 bg-orange-100 rounded-full"><AlertCircle className="h-5 w-5 text-orange-600" /></div>
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900">Action Required</h3>
            <p className="text-sm text-orange-700">You have {actionRequiredCount} request(s) waiting for your response.</p>
          </div>
          <Button variant="outline" className="bg-white border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800" onClick={() => {
            const req = requests.find(r => r.status === 'info_requested')
            if (req) { setSelectedActionRequest(req); setCurrentView('action') }
          }}>Respond Now</Button>
        </div>
      )}

      {/* New Request — MOVED TO TOP */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-500" />
          New Request
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:border-emerald-400/50 hover:shadow-md transition-all cursor-pointer group border-emerald-100/50" onClick={() => setCurrentView("leave")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Leave Request</CardTitle>
              <div className="p-2 bg-emerald-100/50 rounded-lg group-hover:bg-emerald-100 transition-colors"><Calendar className="h-4 w-4 text-emerald-600" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">12 Days</div>
              <p className="text-xs text-muted-foreground mt-1">Remaining Annual Leave</p>
              <Button variant="link" className="px-0 text-emerald-600 h-auto mt-4 group-hover:underline">Apply for Leave <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </CardContent>
          </Card>
          <Card className="hover:border-blue-400/50 hover:shadow-md transition-all cursor-pointer group border-blue-100/50" onClick={() => setCurrentView("expense")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Expense Claim</CardTitle>
              <div className="p-2 bg-blue-100/50 rounded-lg group-hover:bg-blue-100 transition-colors"><DollarSign className="h-4 w-4 text-blue-600" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">$0.00</div>
              <p className="text-xs text-muted-foreground mt-1">Pending Reimbursements</p>
              <Button variant="link" className="px-0 text-blue-600 h-auto mt-4 group-hover:underline">Submit Claim <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Requests Timeline */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Active Requests
        </h2>
        <div className="space-y-4">
          {[
            { id: 1, type: "Leave Request", title: "Annual Leave - 5 days", date: "Feb 1, 2024", status: "pending", step: 1, totalSteps: 4, badgeColor: "bg-amber-100 text-amber-700" },
            { id: 2, type: "Expense Claim", title: "Team Lunch - Nando's", date: "Today", status: "pending", step: 1, totalSteps: 4, badgeColor: "bg-amber-100 text-amber-700" }
          ].map((req) => (
            <div key={req.id} className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1"><h3 className="font-semibold text-lg">{req.type}</h3><Badge variant="secondary" className={req.badgeColor}>{req.status}</Badge></div>
                  <p className="text-muted-foreground">{req.title}</p>
                </div>
                <span className="text-sm text-muted-foreground">Submitted {req.date}</span>
              </div>
              <div className="relative pt-2 pb-6">
                <div className="absolute top-3 left-0 w-full h-1 bg-secondary rounded-full"></div>
                <div className="absolute top-3 left-0 h-1 bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(req.step / (req.totalSteps - 1)) * 100}%` }}></div>
                <div className="relative flex justify-between">
                  {['Submitted', 'Manager Review', 'HR Approval', req.id === 1 ? 'Completed' : 'Paid'].map((label, index) => {
                    const isActive = index <= req.step
                    const isCurrent = index === req.step
                    return (
                      <div key={index} className="flex flex-col items-center gap-2 relative">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${isActive ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-secondary text-muted-foreground border-2 border-background'} ${isCurrent ? 'ring-4 ring-emerald-500/20' : ''}`}>
                          {isActive ? <Check className="h-3.5 w-3.5" /> : index + 1}
                        </div>
                        <span className={`text-xs font-medium absolute -bottom-6 w-24 text-center ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}