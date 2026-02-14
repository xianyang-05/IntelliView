"use client"

import { useState } from "react"
import { Building2, User, Home, FileText, MessageSquare, Send, AlertCircle, BarChart3, FileSignature, Workflow, Shield, Archive, BookOpen, TrendingUp } from "lucide-react"
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
import { HrPerformance } from "./hr/hr-performance"

export function HrEmployeePortal() {
  const [isHrMode, setIsHrMode] = useState(false)
  const [activePage, setActivePage] = useState("home")

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

  const renderContent = () => {
    if (!isHrMode) {
      switch (activePage) {
        case "home":
          return <EmployeeHome />
        case "contracts":
          return <EmployeeContracts />
        case "chat":
          return <EmployeeChat />
        case "requests":
          return <EmployeeRequests />
        case "compliance":
          return <EmployeeCompliance />
        case "journal":
          return <EmployeeJournal />
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
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">PeopleHub</span>
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
                setActivePage(checked ? "dashboard" : "home")
              }}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {currentNav.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activePage === item.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActivePage(item.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  )
}
