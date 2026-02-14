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
import { useRef } from "react"
import { Loader2, FileText, X } from "lucide-react"

export function EmployeeRequests() {
  const [currentView, setCurrentView] = useState<"main" | "leave" | "expense">("main")
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

  const activeRequests = [
    {
      type: "Leave Request",
      status: "pending",
      description: "Annual Leave - 5 days",
      submittedDate: "Submitted Feb 1, 2024",
      steps: [
        { label: "Submitted", status: "completed" },
        { label: "Manager Review", status: "current" },
        { label: "HR Approval", status: "pending" },
        { label: "Completed", status: "pending" }
      ]
    },
    {
      type: "Expense Claim",
      status: "pending",
      description: "Team Lunch - Nando's",
      submittedDate: "Submitted Today",
      steps: [
        { label: "Submitted", status: "completed" },
        { label: "Manager Review", status: "current" },
        { label: "HR Approval", status: "pending" },
        { label: "Paid", status: "pending" }
      ]
    }
  ]

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

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === currentDay
      const isWeekend = (firstDay + day - 1) % 7 === 0 || (firstDay + day - 1) % 7 === 6
      const isTeamLeave = teamLeaveDays.includes(day)
      const isYourLeave = yourLeaveDays.includes(day)
      const isHoliday = holidays.includes(day)

      cells.push(
        <div
          key={`day-${day}`}
          className={`text-center py-1.5 text-sm rounded-md cursor-pointer relative
            ${isToday ? 'bg-emerald-600 text-white font-bold' : ''}
            ${isWeekend && !isToday ? 'text-red-400' : ''}
            ${isYourLeave && !isToday ? 'text-blue-400 font-medium' : ''}
            ${isTeamLeave && !isToday && !isYourLeave ? 'text-emerald-400' : ''}
            ${isHoliday && !isToday ? 'text-red-400 font-medium' : ''}
            ${!isToday && !isWeekend && !isYourLeave && !isTeamLeave && !isHoliday ? 'text-foreground hover:bg-secondary' : ''}
          `}
        >
          {day}
        </div>
      )
    }

    return cells
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
            {/* Receipt Upload */}
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
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.png,.jpeg"
                />

                {uploadedFile ? (
                  <div className="border rounded-lg p-4 flex items-center gap-4 bg-muted/20">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      {extractionStatus === "extracting" ? (
                        <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
                      ) : (
                        <FileText className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      {extractionStatus === "extracting" && (
                        <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Extracting details...
                        </p>
                      )}
                      {extractionStatus === "success" && (
                        <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Data extracted successfully
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={removeFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer"
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drop receipt here or <span className="text-emerald-500">browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Photos or PDFs • Auto-detects invalid images</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expense Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Expense Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Expense Category</Label>
                  <div className="relative">
                    <Select value={expenseForm.category} onValueChange={(val) => setExpenseForm({ ...expenseForm, category: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="travel">Travel & Transport</SelectItem>
                        <SelectItem value="meals">Meals & Entertainment</SelectItem>
                        <SelectItem value="accommodation">Accommodation</SelectItem>
                        <SelectItem value="transport">Local Transport</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                    {extractionStatus === "success" && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2">
                        <Badge variant="secondary" className="h-5 bg-emerald-100/50 text-emerald-600 text-[10px] px-1.5 pointer-events-none">
                          <Sparkles className="w-2.5 h-2.5 mr-1" /> Auto-filled
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Amount ($)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="pl-7"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      />
                      {extractionStatus === "success" && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <Badge variant="secondary" className="h-5 bg-emerald-100/50 text-emerald-600 text-[10px] px-1.5 pointer-events-none">
                            <Sparkles className="w-2.5 h-2.5 mr-1" /> Auto-filled
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Expense Date</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={expenseForm.date}
                        onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                      />
                      {extractionStatus === "success" && (
                        <div className="absolute right-8 top-1/2 -translate-y-1/2">
                          <Badge variant="secondary" className="h-5 bg-emerald-100/50 text-emerald-600 text-[10px] px-1.5 pointer-events-none">
                            <Sparkles className="w-2.5 h-2.5 mr-1" /> Auto-filled
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <div className="relative">
                    <Textarea
                      placeholder="Brief description of the expense..."
                      rows={3}
                      className="resize-none"
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    />
                    {extractionStatus === "success" && (
                      <div className="absolute right-2 top-2">
                        <Badge variant="secondary" className="h-5 bg-emerald-100/50 text-emerald-600 text-[10px] px-1.5 pointer-events-none">
                          <Sparkles className="w-2.5 h-2.5 mr-1" /> Auto-filled
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button variant="outline">Save Draft</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Submit Expense</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Reimbursement Estimate */}
            <Card className="border-emerald-500/30">
              <CardContent className="p-6 text-center">
                <div className="flex items-center gap-2 justify-center mb-3">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-500">Reimbursement Estimate</span>
                </div>
                <div className="text-3xl font-bold mb-1">$0.00</div>
                <p className="text-sm text-muted-foreground mb-4">Approved Amount</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing Time</span>
                    <span className="font-medium">3-5 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payout Method</span>
                    <span className="font-medium">Direct Deposit</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Limits */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Monthly Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {monthlyLimits.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-emerald-500">{item.category}</span>
                      <span className="font-medium">${item.limit}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1">
                      <div className={`${item.color} h-1 rounded-full`} style={{ width: '30%' }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Recent Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentExpenses.map((expense, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{expense.category}</p>
                      <p className="text-xs text-muted-foreground">{expense.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${expense.amount}</p>
                      <span className={`text-xs font-medium ${expense.status === 'approved' ? 'text-emerald-500' : 'text-yellow-500'
                        }`}>
                        {expense.status}
                      </span>
                    </div>
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
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView("main")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Request Leave</h1>
            <p className="text-sm text-muted-foreground">Submit a new leave request</p>
          </div>
        </div>

        {/* Leave Balance Summary */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Leave Balance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {leaveBalances.map((bal, index) => (
                <div key={index} className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {bal.icon}
                    <span className="text-xs text-muted-foreground">{bal.type}</span>
                  </div>
                  <div className="text-2xl font-bold">{bal.days} <span className="text-sm font-normal text-muted-foreground">days</span></div>
                  <div className="mt-2 w-full bg-secondary rounded-full h-1">
                    <div className={`${bal.color} h-1 rounded-full`} style={{ width: `${(bal.days / 15) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Leave Request Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Leave Request Form
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Leave Type */}
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="emergency">Emergency Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Leave Duration Type */}
                <div className="space-y-2">
                  <Label>Leave Duration Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setLeaveDurationType("continuous")}
                      className={`p-4 rounded-lg border text-left transition-all ${leaveDurationType === "continuous"
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-border bg-secondary/30 hover:border-muted-foreground/30"
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className={`h-4 w-4 ${leaveDurationType === "continuous" ? "text-emerald-400" : "text-muted-foreground"}`} />
                        <span className="font-semibold text-sm">Continuous Leave</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Select a date range</p>
                    </button>
                    <button
                      onClick={() => setLeaveDurationType("split")}
                      className={`p-4 rounded-lg border text-left transition-all ${leaveDurationType === "split"
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-border bg-secondary/30 hover:border-muted-foreground/30"
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className={`h-4 w-4 ${leaveDurationType === "split" ? "text-emerald-400" : "text-muted-foreground"}`} />
                        <span className="font-semibold text-sm">Split Leave</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Select multiple dates</p>
                    </button>
                  </div>
                </div>

                {/* Selected Dates */}
                <div className="space-y-2">
                  <Label>Selected Dates</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/50 border border-border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                      <p className="text-sm">Click calendar to select</p>
                    </div>
                    <div className="bg-secondary/50 border border-border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">End Date</p>
                      <p className="text-sm">Click calendar to select</p>
                    </div>
                  </div>
                </div>

                {/* Half-day Toggle */}
                <div className="flex items-center justify-between bg-secondary/30 rounded-lg p-4 border border-border">
                  <div>
                    <p className="font-semibold text-sm">Half-day</p>
                    <p className="text-xs text-muted-foreground">
                      Take a <span className="text-emerald-400">half-day</span> on the first or last day
                    </p>
                  </div>
                  <Switch />
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <Label>Reason <span className="text-emerald-400">(optional)</span></Label>
                  <Textarea
                    placeholder="Briefly describe the reason for your leave..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Attachment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Attachment & Validation <span className="text-red-400">*</span></Label>
                    <button className="text-xs text-emerald-400 flex items-center gap-1 hover:underline">
                      <span>✦</span> View Guidelines
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  {uploadedFile ? (
                    <div className="border rounded-lg p-4 flex items-center gap-4 bg-secondary/30">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                        <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Document confirmed valid
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={removeFile}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer"
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drop documents here or <span className="text-emerald-400">browse</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 5MB)</p>
                    </div>
                  )}
                </div>

                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" size="lg">
                  Submit Request
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Calendar + Team on Leave */}
          <div className="space-y-6">
            {/* Calendar */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Calendar</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setCalendarMonth(prev => prev > 0 ? prev - 1 : 11)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[120px] text-center">
                      {monthNames[calendarMonth]} {calendarYear}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setCalendarMonth(prev => prev < 11 ? prev + 1 : 0)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Your leave</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Team leave</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span>Holiday</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team on Leave */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  👥 Team on Leave
                </CardTitle>
              </CardHeader>
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

  // Main Requests View
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Requests</h1>
          <p className="text-muted-foreground">Track and manage your HR requests</p>
        </div>
        <div className="relative">
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            + New Request
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card
          className="hover:shadow-lg transition-all cursor-pointer"
          onClick={() => setCurrentView("leave")}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-lg bg-secondary">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Request Leave</h3>
              <p className="text-xs text-muted-foreground">Annual, sick, or personal leave</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-all cursor-pointer"
          onClick={() => setCurrentView("expense")}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-lg bg-secondary">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Submit Expense</h3>
              <p className="text-xs text-muted-foreground">Reimbursement requests</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 hover:shadow-lg transition-all cursor-pointer">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-lg bg-red-500/10">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-red-400">Action Required</h3>
              <p className="text-xs text-muted-foreground">2 New Messages from HR</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-red-500" />
          </CardContent>
        </Card>
      </div>

      {/* Active Requests */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Active Requests
        </h2>
      </div>

      <div className="space-y-4">
        {activeRequests.map((request, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{request.type}</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-600">
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                </div>
                <span className="text-sm text-muted-foreground">{request.submittedDate}</span>
              </div>

              {/* Horizontal Step Tracker */}
              <div className="flex items-center">
                {request.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-2 ${step.status === "completed" ? "bg-emerald-500" :
                        step.status === "current" ? "bg-yellow-500" :
                          "bg-muted"
                        }`}>
                        {step.status === "completed" ? (
                          <Check className="h-3 w-3 text-white" />
                        ) : (
                          <span className="text-xs text-white font-medium">{stepIndex + 1}</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground text-center">{step.label}</span>
                    </div>
                    {stepIndex < request.steps.length - 1 && (
                      <div className={`h-0.5 flex-1 -mt-5 mx-1 ${step.status === "completed" ? "bg-emerald-500" : "bg-muted"
                        }`} />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
