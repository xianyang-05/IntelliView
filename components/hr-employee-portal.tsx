"use client"

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import { Building2, User, Home, FileText, MessageSquare, Send, AlertCircle, BarChart3, FileSignature, BookOpen, TrendingUp, Calendar, Users, Brain, ChevronDown, Eye, Briefcase, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { EmployeeHome } from "./employee/employee-home"
import { EmployeeContracts } from "./employee/employee-contracts"
import { EmployeeChat } from "./employee/employee-chat"
import { EmployeeRequests } from "./employee/employee-requests"
import { EmployeeCompliance } from "./employee/employee-compliance"
import { EmployeeJournal } from "./employee/employee-journal"
import { HrDashboard } from "./hr/hr-dashboard"
import { HrContractGeneration } from "./hr/hr-contract-generation"
import { HrPerformance } from "./hr/hr-performance-main"
import { HrAiDecisionReview } from "./hr/hr-ai-decision-review"
import { EmployeeProfile } from "./employee/employee-profile"
import { HrInterviewCenter } from "./hr/hr-interview-center"
import { CandidateHome } from "./candidate/candidate-home"
import { JobBoard } from "./candidate/job-board"
import { AiInterview } from "./candidate/ai-interview"
import { ChatWidget } from "./chat-widget"
import { Bell, LogOut, Settings, CircleUser, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type PortalMode = "employee" | "hr" | "candidate"

function NavItem({
  item,
  activePage,
  setActivePage,
}: {
  item: { id: string; label: string; icon: any }
  activePage: string
  setActivePage: (page: string) => void
}) {
  const Icon = item.icon

  return (
    <Button
      variant={activePage === item.id ? "secondary" : "ghost"}
      className="w-full justify-start relative"
      onClick={() => setActivePage(item.id)}
    >
      <Icon className="h-4 w-4 mr-3" />
      {item.label}
    </Button>
  )
}

function getInitialMode(role?: string): PortalMode {
  if (role === "hr_admin") return "hr"
  if (role === "candidate") return "candidate"
  return "employee"
}

function getInitialPage(role?: string): string {
  if (role === "hr_admin") return "dashboard"
  if (role === "candidate") return "job-board"
  return "home"
}

export function HrEmployeePortal({ currentUser }: { currentUser: any }) {
  const [portalMode, setPortalMode] = useState<PortalMode>(getInitialMode(currentUser?.role))
  const [activePage, setActivePage] = useState(getInitialPage(currentUser?.role))
  const [navPayload, setNavPayload] = useState<any>(null)
  const [autoOpenVisa, setAutoOpenVisa] = useState(false)
  const [promotionCongrats, setPromotionCongrats] = useState(false)

  // Ensure promotion notification is always present
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]')
    // Remove any existing promotion notifications and re-add as unread
    const filtered = stored.filter((n: any) => n.type !== 'promotion')
    filtered.push({
      id: 'promo_permanent',
      type: 'promotion',
      title: '🎉 Promotion Approved!',
      message: 'Congratulations! You have been promoted to Senior Software Engineer effective March 1, 2026. Your new compensation package and updated role details are being prepared.',
      timestamp: new Date().toISOString(),
      read: false
    })
    localStorage.setItem('notifications', JSON.stringify(filtered))
  }, [])

  const handleNavigate = (page: string, payload?: any) => {
    setActivePage(page)
    if (payload) setNavPayload(payload)
    if (page !== "compliance") setAutoOpenVisa(false)
  }

  const employeeNav = [
    { id: "home", label: "Home", icon: Home },
    { id: "contracts", label: "Contract & Equity", icon: FileText },
    { id: "chat", label: "Ask HR", icon: MessageSquare },
    { id: "requests", label: "Requests", icon: Send },
    { id: "compliance", label: "Compliance & Alerts", icon: AlertCircle },
    { id: "journal", label: "Personal Journal", icon: BookOpen },
  ]

  const hrNav = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "interviews", label: "Interview Center", icon: Users },
    { id: "contract-gen", label: "Contract Generation", icon: FileSignature },
    { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "ai-decision-review", label: "AI Decision Review", icon: Brain },
  ]

  const candidateNav = [
    { id: "job-board", label: "Job Board", icon: Briefcase },
    { id: "ai-interview", label: "AI Interview", icon: Video },
  ]

  const currentNav = portalMode === "hr" ? hrNav : portalMode === "candidate" ? candidateNav : employeeNav

  // Notification State
  const [notifications, setNotifications] = useState<any[]>([])
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)

  useEffect(() => {
    const checkNotifications = () => {
      const stored = localStorage.getItem('notifications')
      if (stored) {
        const allNotifs = JSON.parse(stored)
        if (portalMode === "hr") {
          setNotifications(allNotifs.filter((n: any) => n.type === 'info_submitted' && !n.read))
        } else if (portalMode === "employee") {
          setNotifications(allNotifs.filter((n: any) => (n.type === 'document' || n.type === 'request_info' || n.type === 'compliance_alert' || n.type === 'promotion') && !n.read))
        } else {
          setNotifications([])
        }
      }
    }

    checkNotifications()
    const interval = setInterval(checkNotifications, 2000)
    return () => clearInterval(interval)
  }, [portalMode])

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
      setActivePage("dashboard")
    } else if (selectedNotification.type === 'compliance_alert') {
      setActivePage("compliance")
    } else if (selectedNotification.type === 'promotion') {
      setPromotionCongrats(true)
      setActivePage("chat")
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
  const [showOfferLetterModal, setShowOfferLetterModal] = useState(false)
  const [offerDetails, setOfferDetails] = useState<any>(null)

  useEffect(() => {
    if (portalMode === "employee") {
      const checkEvents = () => {
        const events = JSON.parse(localStorage.getItem('global_events') || '{}')

        if (events.visa_renewal_needed && !events.visa_renewal_viewed) {
          setShowVisaRenewalModal(true)
        }

        if (events.review_scheduled && !events.review_accepted) {
          setShowReviewModal(true)
        }

        if (events.offer_letter_received && !events.offer_letter_viewed) {
          setOfferDetails(events.offer_details)
          setShowOfferLetterModal(true)
        }
      }

      checkEvents()
      const interval = setInterval(checkEvents, 2000)
      return () => clearInterval(interval)
    }
  }, [portalMode])

  const handleVisaRenewalAction = () => {
    // Navigate to employee compliance page and auto-open visa renewal modal
    setShowVisaRenewalModal(false)
    setAutoOpenVisa(true)
    setActivePage("compliance")

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
    if (portalMode === "employee") {
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
            promotionCongrats={promotionCongrats}
            onPromotionCongratsHandled={() => setPromotionCongrats(false)}
          />
        case "requests":
          return <EmployeeRequests />
        case "compliance":
          return <EmployeeCompliance autoOpenVisa={autoOpenVisa} />
        case "journal":
          return <EmployeeJournal />
        case "profile":
          return <EmployeeProfile />
        default:
          return <EmployeeHome />
      }
    } else if (portalMode === "hr") {
      switch (activePage) {
        case "dashboard":
          return <HrDashboard />
        case "interviews":
          return <HrInterviewCenter onNavigate={setActivePage} currentUser={currentUser} />
        case "performance":
          return <HrPerformance />
        case "contract-gen":
          return <HrContractGeneration />
        case "ai-decision-review":
          return <HrAiDecisionReview />
        default:
          return <HrDashboard />
      }
    } else {
      // Candidate
      switch (activePage) {
        case "job-board":
          return <JobBoard onNavigate={handleNavigate} />
        case "candidate-home":
          return <CandidateHome selectedJob={navPayload} currentUser={currentUser} />
        case "ai-interview":
          return <AiInterview onEnd={() => handleNavigate("job-board")} />
        default:
          return <JobBoard onNavigate={handleNavigate} />
      }
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar — hidden on Interview Center */}
      {activePage !== "interviews" && (
        <aside className="w-64 border-r bg-card flex flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="ZeroHR Logo" className="h-8 w-8 object-contain" />
              <span className="text-xl font-semibold">ZeroHR</span>
            </div>

            {/* Portal Selector */}
            <Select
              value={portalMode}
              onValueChange={(value: PortalMode) => {
                setPortalMode(value)
                if (value === "hr") handleNavigate("dashboard")
                else if (value === "employee") handleNavigate("home")
                else handleNavigate("job-board")
              }}
            >
              <SelectTrigger className="w-full bg-secondary border-none h-11">
                <div className="flex items-center gap-2">
                  {portalMode === "employee" && <User className="h-4 w-4 text-muted-foreground" />}
                  {portalMode === "hr" && <Building2 className="h-4 w-4 text-muted-foreground" />}
                  {portalMode === "candidate" && <Eye className="h-4 w-4 text-muted-foreground" />}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Employee Portal
                  </div>
                </SelectItem>
                <SelectItem value="hr">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    HR Portal
                  </div>
                </SelectItem>
                <SelectItem value="candidate">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Candidate
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {currentNav.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                activePage={activePage}
                setActivePage={setActivePage}
              />
            ))}
          </nav>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Top Toolbar — hidden on Interview Center */}
        {activePage !== "interviews" && (
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
                            {notif.message || (portalMode === "hr" ? `${notif.employee} submitted info` : "HR sent an update")}
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

                    {selectedNotification?.type === 'promotion' && (
                      <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded">
                        <TrendingUp className="h-4 w-4" />
                        <span>Your promotion has been approved — view details in Ask HR</span>
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
                              selectedNotification?.type === 'promotion' ? 'Ask HR' :
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
                      <p className="text-sm font-medium leading-none">{currentUser?.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{currentUser?.email || ""}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize mt-1">Role: {currentUser?.role || portalMode}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setActivePage("profile"); setPortalMode("employee") }}>
                    <CircleUser className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Switch Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
        )}

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

        {/* Offer Letter Received Popup (Employee Side) */}
        <Dialog open={showOfferLetterModal} onOpenChange={setShowOfferLetterModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-600">
                <FileText className="h-5 w-5" />
                Offer Letter Received!
              </DialogTitle>
              <DialogDescription>
                You have received a new offer letter from ZeroHR.
              </DialogDescription>
            </DialogHeader>
            {offerDetails && (
              <div className="py-4 space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-muted-foreground">Position:</span>
                    <span className="font-medium">{offerDetails.position}</span>
                    <span className="text-muted-foreground">Monthly Salary:</span>
                    <span className="font-medium">RM {Number(offerDetails.salary).toLocaleString()}</span>
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium">{offerDetails.startDate ? new Date(offerDetails.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}</span>
                    <span className="text-muted-foreground">Contract Type:</span>
                    <span className="font-medium capitalize">{(offerDetails.contractType || '').replace('_', ' ')}</span>
                    <span className="text-muted-foreground">Probation:</span>
                    <span className="font-medium">{offerDetails.probation === '0' ? 'None' : offerDetails.probation + ' months'}</span>
                  </div>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Benefits</p>
                  <p className="text-sm">{offerDetails.benefits}</p>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
              <Button
                variant="outline"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => {
                  setShowOfferLetterModal(false)
                  const events = JSON.parse(localStorage.getItem('global_events') || '{}')
                  localStorage.setItem('global_events', JSON.stringify({ ...events, offer_letter_viewed: true }))
                  alert('Offer declined. HR will be notified.')
                }}
              >
                Decline
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowOfferLetterModal(false)
                  const events = JSON.parse(localStorage.getItem('global_events') || '{}')
                  localStorage.setItem('global_events', JSON.stringify({ ...events, offer_letter_viewed: true }))
                  alert('Your request for changes has been sent to HR.')
                }}
              >
                Request Changes
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  setShowOfferLetterModal(false)
                  const events = JSON.parse(localStorage.getItem('global_events') || '{}')
                  localStorage.setItem('global_events', JSON.stringify({ ...events, offer_letter_viewed: true }))
                  setActivePage('contracts')
                  alert('Congratulations! Offer accepted. Redirecting to Contracts & Equity.')
                }}
              >
                Accept Offer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>

        {/* Real-Time Chat Widget */}
        {portalMode !== "candidate" && <ChatWidget isHrMode={portalMode === "hr"} />}
      </main>
    </div>
  )
}
