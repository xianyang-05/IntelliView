"use client"

import { useState, useEffect } from "react"
import { Building2, User, Home, FileText, MessageSquare, Send, AlertCircle, BarChart3, FileSignature, Workflow, Shield, Archive, BookOpen, TrendingUp, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { EmployeeHome } from "./employee/employee-home"
import { EmployeeContracts } from "./employee/employee-contracts"
import { EmployeeChat } from "./employee/employee-chat"
import { EmployeeRequests } from "./employee/employee-requests"
import { EmployeeCompliance } from "./employee/employee-compliance"
import { EmployeeJournal } from "./employee/employee-journal"
import { HrDashboard } from "./hr/hr-dashboard"
import { HrContractGeneration } from "./hr/hr-contract-generation"
import { HrWorkflows } from "./hr/hr-workflows"
import { HrCompliance } from "./hr/hr-compliance"
import { HrVersionControl } from "./hr/hr-version-control"
import { HrPerformance } from "./hr/hr-performance-main"
import { EmployeeProfile } from "./employee/employee-profile"
import { Bell, LogOut, Settings, CircleUser, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function HrEmployeePortal({ currentUser }: { currentUser: any }) {
  const [isHrMode, setIsHrMode] = useState(false)
  const [activePage, setActivePage] = useState("home")
  const [navPayload, setNavPayload] = useState<any>(null)

  const handleNavigate = (page: string, payload?: any) => {
    setActivePage(page)
    if (payload) setNavPayload(payload)
  }

  const employeeNav = [
    { id: "home", label: "Home", icon: Home },
    { id: "contracts", label: "Contract & Equity", icon: FileText },
    { id: "chat", label: "Ask HR", icon: MessageSquare },
    { id: "requests", label: "Requests", icon: Send },
    { id: "journal", label: "Personal Journal", icon: BookOpen },
    { id: "compliance", label: "Compliance Alerts", icon: AlertCircle },
  ]

  const hrNav = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "contract-gen", label: "Contract Generation", icon: FileSignature },
    { id: "workflows", label: "Workflows", icon: Workflow },
    { id: "compliance", label: "Compliance & Audit", icon: Shield },
    { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "version-control", label: "Version Control", icon: Archive },
  ]

  const currentNav = isHrMode ? hrNav : employeeNav

  // Notification State
  const [notifications, setNotifications] = useState<any[]>([])
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)

  useEffect(() => {
    const checkNotifications = () => {
      const stored = localStorage.getItem('notifications')
      if (stored) {
        const allNotifs = JSON.parse(stored)
        // Filter based on mode
        // In a real app, we'd filter by recipientId. Here we filter by type/context
        if (isHrMode) {
          // HR sees 'info_submitted' or system alerts
          setNotifications(allNotifs.filter((n: any) => n.type === 'info_submitted' && !n.read))
        } else {
          // Employee sees 'document', 'request_info', or 'compliance_alert'
          setNotifications(allNotifs.filter((n: any) => (n.type === 'document' || n.type === 'request_info' || n.type === 'compliance_alert') && !n.read))
        }
      }
    }

    checkNotifications()
    const interval = setInterval(checkNotifications, 2000)
    return () => clearInterval(interval)
  }, [isHrMode])

  const handleViewNotification = (notif: any) => {
    // Mark as read
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]')
    const updated = stored.map((n: any) => n.id === notif.id ? { ...n, read: true } : n)
    localStorage.setItem('notifications', JSON.stringify(updated))

    // Open Modal
    setSelectedNotification(notif)
    setIsNotificationModalOpen(true)
  }

  const handleRedirect = () => {
    if (!selectedNotification) return

    if (selectedNotification.type === 'document') {
      setActivePage("contracts")
    } else if (selectedNotification.type === 'request_info') {
      setActivePage("requests")
    } else if (selectedNotification.type === 'info_submitted') {
      setActivePage("workflows")
    } else if (selectedNotification.type === 'compliance_alert') {
      setActivePage("compliance")
    }
    setIsNotificationModalOpen(false)
  }

  const handleDeleteNotification = (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation() // Prevent navigation

    // Update State
    setNotifications(prev => prev.filter(n => n.id !== notifId))

    // Update LocalStorage
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]')
    const updated = stored.filter((n: any) => n.id !== notifId)
    localStorage.setItem('notifications', JSON.stringify(updated))
  }

  // Global Popup State
  const [showVisaRenewalModal, setShowVisaRenewalModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    // Check for global events when not in HR mode
    if (!isHrMode) {
      const checkEvents = () => {
        const events = JSON.parse(localStorage.getItem('global_events') || '{}')

        if (events.visa_renewal_needed && !events.visa_renewal_viewed) {
          setShowVisaRenewalModal(true)
        }

        if (events.review_scheduled && !events.review_accepted) {
          setShowReviewModal(true)
        }
      }

      checkEvents()
      const interval = setInterval(checkEvents, 2000)
      return () => clearInterval(interval)
    }
  }, [isHrMode])

  const handleVisaRenewalAction = () => {
    // Navigate to requests or specifically visa page
    setShowVisaRenewalModal(false)
    setActivePage("requests") // Assuming Requests page handles this

    // Mark as viewed
    const events = JSON.parse(localStorage.getItem('global_events') || '{}')
    localStorage.setItem('global_events', JSON.stringify({ ...events, visa_renewal_viewed: true }))
  }

  const handleReviewAction = (accepted: boolean) => {
    setShowReviewModal(false)

    // Mark as handled
    const events = JSON.parse(localStorage.getItem('global_events') || '{}')
    localStorage.setItem('global_events', JSON.stringify({ ...events, review_accepted: true }))

    // Send notification back to HR
    const newNotif = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'info_submitted',
      employee: 'Alex Chan',
      title: accepted ? 'Review Accepted' : 'Review Reschedule Requested',
      message: accepted ? 'Alex Chan accepted the quarterly review time.' : 'Alex Chan requested to reschedule the review.',
      timestamp: new Date().toISOString(),
      read: false
    }
    const sharedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]')
    sharedNotifications.push(newNotif)
    localStorage.setItem('notifications', JSON.stringify(sharedNotifications))

    alert(accepted ? "You have accepted the review time." : "Reschedule request sent.")
  }

  const renderContent = () => {
    if (!isHrMode) {
      switch (activePage) {
        case "home":
          return <EmployeeHome />
        case "contracts":
          return <EmployeeContracts highlight={navPayload} />
        case "chat":
          return <EmployeeChat
            onNavigate={handleNavigate}
            userEmail={currentUser?.email}
            userRole={currentUser?.role}
          />
        case "requests":
          return <EmployeeRequests />
        case "compliance":
          return <EmployeeCompliance />
        case "journal":
          return <EmployeeJournal />
        case "profile":
          return <EmployeeProfile />
        default:
          return <EmployeeHome />
      }
    } else {
      switch (activePage) {
        case "dashboard":
          return <HrDashboard />
        case "performance":
          return <HrPerformance />
        case "contract-gen":
          return <HrContractGeneration />
        case "workflows":
          return <HrWorkflows />
        case "compliance":
          return <HrCompliance />
        case "version-control":
          return <HrVersionControl />
        default:
          return <HrDashboard />
      }
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="ZeroHR Logo" className="h-8 w-8 object-contain" />
            <span className="text-xl font-semibold">ZeroHR</span>
          </div>

          {/* Portal Toggle */}
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="portal-toggle" className="text-sm font-medium cursor-pointer">
                {isHrMode ? "HR Portal" : "Employee"}
              </Label>
            </div>
            <Switch
              id="portal-toggle"
              checked={isHrMode}
              onCheckedChange={(checked) => {
                setIsHrMode(checked)
                handleNavigate(checked ? "dashboard" : "home")
              }}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {currentNav.map((item) => {
            const Icon = item.icon
            // Red dot logic: Show if notifications exist OR if it's the first time visiting compliance (localStorage check needed)
            // We use a state for the first-visit check to ensure hydration matches
            const [isFirstVisit, setIsFirstVisit] = useState(false)

            useEffect(() => {
              if (item.id === 'compliance' && isHrMode) {
                const hasVisited = localStorage.getItem('has_visited_compliance')
                if (!hasVisited) setIsFirstVisit(true)
              }
            }, [item.id, isHrMode])

            const showRedDot = (isHrMode && item.id === 'compliance' && notifications.some(n => n.type === 'compliance_alert' && !n.read)) || isFirstVisit

            return (
              <Button
                key={item.id}
                variant={activePage === item.id ? "secondary" : "ghost"}
                className="w-full justify-start relative"
                onClick={() => {
                  setActivePage(item.id)
                  if (item.id === 'compliance') {
                    // Clear red dot logic immediate visual feedback
                    const stored = JSON.parse(localStorage.getItem('notifications') || '[]')
                    const updated = stored.map((n: any) => n.type === 'compliance_alert' ? { ...n, read: true } : n)
                    localStorage.setItem('notifications', JSON.stringify(updated))
                    setNotifications(prev => prev.map(n => n.type === 'compliance_alert' ? { ...n, read: true } : n))

                    // Clear first visit flag
                    localStorage.setItem('has_visited_compliance', 'true')
                    setIsFirstVisit(false)
                  }
                }}
              >
                <div className="relative">
                  <Icon className="h-4 w-4 mr-3" />
                  {showRedDot && (
                    <span className="absolute top-0 right-2 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                  )}
                </div>
                {item.label}
              </Button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Top Toolbar */}
        <header className="h-16 border-b bg-background flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-semibold">
            {currentNav.find(n => n.id === activePage)?.label || "Dashboard"}
          </h2>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">No new notifications</div>
                ) : (
                  notifications.map((notif, i) => (
                    <DropdownMenuItem key={i} onClick={() => handleViewNotification(notif)} className="cursor-pointer flex justify-between items-start group">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm">{notif.title || notif.type + ' Update'}</span>
                        <span className="text-xs text-muted-foreground">
                          {notif.message || (isHrMode ? `${notif.employee} submitted info` : "HR sent an update")}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600 -mr-2"
                        onClick={(e) => handleDeleteNotification(e, notif.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notification Details Modal */}
            <Dialog open={isNotificationModalOpen} onOpenChange={setIsNotificationModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    {selectedNotification?.title || 'Notification Details'}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedNotification?.timestamp && new Date(selectedNotification.timestamp).toLocaleString()}
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                  <div className="p-4 bg-secondary/30 rounded-lg border">
                    <p className="text-sm leading-relaxed">{selectedNotification?.message}</p>
                  </div>

                  {selectedNotification?.type === 'document' && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded">
                      <FileText className="h-4 w-4" />
                      <span>Document available for review</span>
                    </div>
                  )}

                  {selectedNotification?.type === 'request_info' && (
                    <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded">
                      <AlertCircle className="h-4 w-4" />
                      <span>Action required from you</span>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNotificationModalOpen(false)}>Close</Button>
                  <Button onClick={handleRedirect}>
                    Go to {
                      selectedNotification?.type === 'document' ? 'Contracts' :
                        selectedNotification?.type === 'request_info' ? 'Requests' :
                          selectedNotification?.type === 'info_submitted' ? 'Workflows' :
                            'Section'
                    }
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-white/20 shadow-sm">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                    <AvatarFallback>AC</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Alex Chan</p>
                    <p className="text-xs leading-none text-muted-foreground">alex.chan@zerohr.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setActivePage("profile"); setIsHrMode(false) }}>
                  <CircleUser className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Visa Renewal Required Modal */}
        <Dialog open={showVisaRenewalModal} onOpenChange={setShowVisaRenewalModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-5 w-5" />
                Visa Renewal Action Required
              </DialogTitle>
              <DialogDescription>
                We need your NID to proceed with your visa renewal application.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-slate-600">Please provide your National ID details to complete the H1-B Visa renewal process initiate by HR.</p>
            </div>
            <DialogFooter>
              <Button onClick={handleVisaRenewalAction}>Provide NID Now</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Performance Review Schedule Modal */}
        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-600">
                <Calendar className="h-5 w-5" />
                Quarterly Review Scheduled
              </DialogTitle>
              <DialogDescription>
                HR has scheduled your quarterly performance review.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded border">
                <span className="text-sm text-slate-500">Proposed Time:</span>
                <span className="font-medium">Friday, 10:00 AM</span>
              </div>
              <p className="text-xs text-muted-foreground">Please confirm if you are available at this time.</p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => handleReviewAction(false)}>Decline / Reschedule</Button>
              <Button onClick={() => handleReviewAction(true)}>Accept Invoice</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
