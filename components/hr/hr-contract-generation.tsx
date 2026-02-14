"use client"

import { useState } from "react"
import { FileText, FileSignature, TrendingUp, AlertTriangle, FileWarning, Bell, Award, Download, Eye, Send, Sparkles, ChevronDown, X, Mail, BellRing } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  generateOfferLetterTemplate,
  generateEmploymentContractTemplate,
  generatePromotionLetterTemplate,
  generateWarningNoticeTemplate,
  generateTerminationNoticeTemplate,
  generateEquityGrantTemplate,
  type DocumentData
} from "@/lib/document-templates"

// Employee Database
interface Employee {
  id: number
  name: string
  role: string
  department: string
  salary: number
  joinDate: string
  performanceScore: number
  metrics: {
    tasksCompleted: number
    satisfactionScore: number
    attendance: number
  }
  performanceHistory: {
    month: string
    kpi: number
    tasksCompleted: number
    quality: number
  }[]
  email: string
}


const EMPLOYEES: Employee[] = [
  {
    id: 1, name: "Sarah Johnson", role: "Senior Engineer", department: "Engineering", salary: 145000, joinDate: "Jan 2022", performanceScore: 92,
    metrics: { tasksCompleted: 156, satisfactionScore: 4.8, attendance: 98 },
    performanceHistory: [
      { month: "Sep 2024", kpi: 94, tasksCompleted: 28, quality: 96 },
      { month: "Oct 2024", kpi: 91, tasksCompleted: 26, quality: 93 },
      { month: "Nov 2024", kpi: 93, tasksCompleted: 27, quality: 95 },
      { month: "Dec 2024", kpi: 90, tasksCompleted: 25, quality: 92 },
      { month: "Jan 2025", kpi: 92, tasksCompleted: 26, quality: 94 },
      { month: "Feb 2025", kpi: 94, tasksCompleted: 28, quality: 97 }
    ],
    email: "sarah.johnson@company.com"
  },
  {
    id: 2, name: "Michael Chen", role: "Product Manager", department: "Product", salary: 135000, joinDate: "Mar 2021", performanceScore: 88,
    metrics: { tasksCompleted: 142, satisfactionScore: 4.6, attendance: 95 },
    performanceHistory: [
      { month: "Sep 2024", kpi: 89, tasksCompleted: 24, quality: 90 },
      { month: "Oct 2024", kpi: 87, tasksCompleted: 23, quality: 88 },
      { month: "Nov 2024", kpi: 88, tasksCompleted: 24, quality: 89 },
      { month: "Dec 2024", kpi: 86, tasksCompleted: 22, quality: 87 },
      { month: "Jan 2025", kpi: 89, tasksCompleted: 25, quality: 90 },
      { month: "Feb 2025", kpi: 90, tasksCompleted: 24, quality: 92 }
    ],
    email: "michael.chen@company.com"
  },
  {
    id: 3, name: "Emma Wilson", role: "Design Lead", department: "Design", salary: 125000, joinDate: "Jun 2022", performanceScore: 95,
    metrics: { tasksCompleted: 134, satisfactionScore: 4.9, attendance: 99 },
    performanceHistory: [
      { month: "Sep 2024", kpi: 96, tasksCompleted: 23, quality: 98 },
      { month: "Oct 2024", kpi: 94, tasksCompleted: 22, quality: 96 },
      { month: "Nov 2024", kpi: 95, tasksCompleted: 23, quality: 97 },
      { month: "Dec 2024", kpi: 94, tasksCompleted: 21, quality: 95 },
      { month: "Jan 2025", kpi: 96, tasksCompleted: 23, quality: 98 },
      { month: "Feb 2025", kpi: 97, tasksCompleted: 22, quality: 99 }
    ],
    email: "emma.wilson@company.com"
  },
  {
    id: 4, name: "James Taylor", role: "Data Scientist", department: "Analytics", salary: 140000, joinDate: "Sep 2020", performanceScore: 85,
    metrics: { tasksCompleted: 128, satisfactionScore: 4.5, attendance: 92 },
    performanceHistory: [
      { month: "Sep 2024", kpi: 86, tasksCompleted: 22, quality: 87 },
      { month: "Oct 2024", kpi: 84, tasksCompleted: 21, quality: 85 },
      { month: "Nov 2024", kpi: 85, tasksCompleted: 22, quality: 86 },
      { month: "Dec 2024", kpi: 83, tasksCompleted: 20, quality: 84 },
      { month: "Jan 2025", kpi: 86, tasksCompleted: 22, quality: 88 },
      { month: "Feb 2025", kpi: 87, tasksCompleted: 21, quality: 89 }
    ],
    email: "james.taylor@company.com"
  },
  {
    id: 5, name: "Lisa Anderson", role: "Marketing Director", department: "Marketing", salary: 155000, joinDate: "Feb 2019", performanceScore: 90,
    metrics: { tasksCompleted: 167, satisfactionScore: 4.7, attendance: 97 },
    performanceHistory: [
      { month: "Sep 2024", kpi: 91, tasksCompleted: 29, quality: 92 },
      { month: "Oct 2024", kpi: 89, tasksCompleted: 27, quality: 90 },
      { month: "Nov 2024", kpi: 90, tasksCompleted: 28, quality: 91 },
      { month: "Dec 2024", kpi: 88, tasksCompleted: 26, quality: 89 },
      { month: "Jan 2025", kpi: 91, tasksCompleted: 29, quality: 92 },
      { month: "Feb 2025", kpi: 92, tasksCompleted: 28, quality: 94 }
    ],
    email: "lisa.anderson@company.com"
  },
  {
    id: 6, name: "Robert Martinez", role: "Senior Developer", department: "Engineering", salary: 138000, joinDate: "Nov 2021", performanceScore: 87,
    metrics: { tasksCompleted: 145, satisfactionScore: 4.6, attendance: 94 },
    performanceHistory: [
      { month: "Sep 2024", kpi: 88, tasksCompleted: 25, quality: 89 },
      { month: "Oct 2024", kpi: 86, tasksCompleted: 24, quality: 87 },
      { month: "Nov 2024", kpi: 87, tasksCompleted: 25, quality: 88 },
      { month: "Dec 2024", kpi: 85, tasksCompleted: 23, quality: 86 },
      { month: "Jan 2025", kpi: 88, tasksCompleted: 25, quality: 90 },
      { month: "Feb 2025", kpi: 89, tasksCompleted: 23, quality: 91 }
    ],
    email: "robert.martinez@company.com"
  },
  {
    id: 7, name: "Jessica Wong", role: "UX Designer", department: "Design", salary: 118000, joinDate: "Apr 2022", performanceScore: 91,
    metrics: { tasksCompleted: 139, satisfactionScore: 4.8, attendance: 96 },
    performanceHistory: [
      { month: "Sep 2024", kpi: 92, tasksCompleted: 24, quality: 93 },
      { month: "Oct 2024", kpi: 90, tasksCompleted: 23, quality: 91 },
      { month: "Nov 2024", kpi: 91, tasksCompleted: 24, quality: 92 },
      { month: "Dec 2024", kpi: 89, tasksCompleted: 22, quality: 90 },
      { month: "Jan 2025", kpi: 92, tasksCompleted: 24, quality: 94 },
      { month: "Feb 2025", kpi: 93, tasksCompleted: 22, quality: 95 }
    ],
    email: "jessica.wong@company.com"
  },
  {
    id: 8, name: "David Kim", role: "Sales Manager", department: "Sales", salary: 132000, joinDate: "Aug 2020", performanceScore: 83,
    metrics: { tasksCompleted: 158, satisfactionScore: 4.4, attendance: 91 },
    performanceHistory: [
      { month: "Sep 2024", kpi: 84, tasksCompleted: 27, quality: 85 },
      { month: "Oct 2024", kpi: 82, tasksCompleted: 26, quality: 83 },
      { month: "Nov 2024", kpi: 83, tasksCompleted: 27, quality: 84 },
      { month: "Dec 2024", kpi: 81, tasksCompleted: 25, quality: 82 },
      { month: "Jan 2025", kpi: 84, tasksCompleted: 27, quality: 86 },
      { month: "Feb 2025", kpi: 85, tasksCompleted: 26, quality: 87 }
    ],
    email: "david.kim@company.com"
  },
  {
    id: 9, name: "Amanda Foster", role: "HR Specialist", department: "HR", salary: 95000, joinDate: "Jan 2023", performanceScore: 78,
    metrics: { tasksCompleted: 112, satisfactionScore: 4.3, attendance: 89 },
    performanceHistory: [
      { month: "Sep 2024", kpi: 79, tasksCompleted: 19, quality: 80 },
      { month: "Oct 2024", kpi: 77, tasksCompleted: 18, quality: 78 },
      { month: "Nov 2024", kpi: 78, tasksCompleted: 19, quality: 79 },
      { month: "Dec 2024", kpi: 76, tasksCompleted: 17, quality: 77 },
      { month: "Jan 2025", kpi: 79, tasksCompleted: 20, quality: 81 },
      { month: "Feb 2025", kpi: 80, tasksCompleted: 19, quality: 82 }
    ],
    email: "amanda.foster@company.com"
  },
  {
    id: 10, name: "Christopher Lee", role: "DevOps Engineer", department: "Engineering", salary: 142000, joinDate: "May 2021", performanceScore: 89,
    metrics: { tasksCompleted: 152, satisfactionScore: 4.7, attendance: 95 },
    performanceHistory: [
      { month: "Sep 2024", kpi: 90, tasksCompleted: 26, quality: 91 },
      { month: "Oct 2024", kpi: 88, tasksCompleted: 25, quality: 89 },
      { month: "Nov 2024", kpi: 89, tasksCompleted: 26, quality: 90 },
      { month: "Dec 2024", kpi: 87, tasksCompleted: 24, quality: 88 },
      { month: "Jan 2025", kpi: 90, tasksCompleted: 27, quality: 92 },
      { month: "Feb 2025", kpi: 91, tasksCompleted: 24, quality: 93 }
    ],
    email: "christopher.lee@company.com"
  },
  {
    id: 11, name: "Rachel Green", role: "Content Writer", department: "Marketing", salary: 88000, joinDate: "Jul 2022", performanceScore: 82,
    metrics: { tasksCompleted: 124, satisfactionScore: 4.5, attendance: 93 },
    performanceHistory: [
      { month: "Sep 2024", kpi: 83, tasksCompleted: 21, quality: 84 },
      { month: "Oct 2024", kpi: 81, tasksCompleted: 20, quality: 82 },
      { month: "Nov 2024", kpi: 82, tasksCompleted: 21, quality: 83 },
      { month: "Dec 2024", kpi: 80, tasksCompleted: 19, quality: 81 },
      { month: "Jan 2025", kpi: 83, tasksCompleted: 22, quality: 85 },
      { month: "Feb 2025", kpi: 84, tasksCompleted: 21, quality: 86 }
    ],
    email: "rachel.green@company.com"
  },
  {
    id: 12, name: "Thomas Brown", role: "QA Engineer", department: "Engineering", salary: 105000, joinDate: "Oct 2021", performanceScore: 76,
    metrics: { tasksCompleted: 118, satisfactionScore: 4.2, attendance: 88 },
    performanceHistory: [
      { month: "Sep 2024", kpi: 77, tasksCompleted: 20, quality: 78 },
      { month: "Oct 2024", kpi: 75, tasksCompleted: 19, quality: 76 },
      { month: "Nov 2024", kpi: 76, tasksCompleted: 20, quality: 77 },
      { month: "Dec 2024", kpi: 74, tasksCompleted: 18, quality: 75 },
      { month: "Jan 2025", kpi: 77, tasksCompleted: 21, quality: 79 },
      { month: "Feb 2025", kpi: 78, tasksCompleted: 20, quality: 80 }
    ],
    email: "thomas.brown@company.com"
  },
  {
    id: 13, name: "Olivia Davis", role: "Business Analyst", department: "Product", salary: 115000, joinDate: "Mar 2022", performanceScore: 86,
    metrics: { tasksCompleted: 133, satisfactionScore: 4.6, attendance: 94 },
    performanceHistory: [
      { month: "Sep 2024", kpi: 87, tasksCompleted: 23, quality: 88 },
      { month: "Oct 2024", kpi: 85, tasksCompleted: 22, quality: 86 },
      { month: "Nov 2024", kpi: 86, tasksCompleted: 23, quality: 87 },
      { month: "Dec 2024", kpi: 84, tasksCompleted: 21, quality: 85 },
      { month: "Jan 2025", kpi: 87, tasksCompleted: 23, quality: 89 },
      { month: "Feb 2025", kpi: 88, tasksCompleted: 21, quality: 90 }
    ],
    email: "olivia.davis@company.com"
  },
  {
    id: 14, name: "Daniel White", role: "Backend Engineer", department: "Engineering", salary: 130000, joinDate: "Dec 2020", performanceScore: 88,
    metrics: { tasksCompleted: 147, satisfactionScore: 4.7, attendance: 96 },
    performanceHistory: [
      { month: "Sep 2024", kpi: 89, tasksCompleted: 25, quality: 90 },
      { month: "Oct 2024", kpi: 87, tasksCompleted: 24, quality: 88 },
      { month: "Nov 2024", kpi: 88, tasksCompleted: 25, quality: 89 },
      { month: "Dec 2024", kpi: 86, tasksCompleted: 23, quality: 87 },
      { month: "Jan 2025", kpi: 89, tasksCompleted: 26, quality: 91 },
      { month: "Feb 2025", kpi: 90, tasksCompleted: 24, quality: 92 }
    ],
    email: "daniel.white@company.com"
  },
  {
    id: 15, name: "Sophia Miller", role: "Product Designer", department: "Design", salary: 122000, joinDate: "Feb 2023", performanceScore: 84,
    metrics: { tasksCompleted: 108, satisfactionScore: 4.5, attendance: 92 },
    performanceHistory: [
      { month: "Sep 2024", kpi: 85, tasksCompleted: 19, quality: 86 },
      { month: "Oct 2024", kpi: 83, tasksCompleted: 18, quality: 84 },
      { month: "Nov 2024", kpi: 84, tasksCompleted: 19, quality: 85 },
      { month: "Dec 2024", kpi: 82, tasksCompleted: 17, quality: 83 },
      { month: "Jan 2025", kpi: 85, tasksCompleted: 20, quality: 87 },
      { month: "Feb 2025", kpi: 86, tasksCompleted: 18, quality: 88 }
    ],
    email: "sophia.miller@company.com"
  },
  {
    id: 16, name: "Matthew Wilson", role: "Account Executive", department: "Sales", salary: 110000, joinDate: "Jun 2021", performanceScore: 79,
    metrics: { tasksCompleted: 135, satisfactionScore: 4.3, attendance: 90 },
    performanceHistory: [
      { month: "Sep 2024", kpi: 80, tasksCompleted: 23, quality: 81 },
      { month: "Oct 2024", kpi: 78, tasksCompleted: 22, quality: 79 },
      { month: "Nov 2024", kpi: 79, tasksCompleted: 23, quality: 80 },
      { month: "Dec 2024", kpi: 77, tasksCompleted: 21, quality: 78 },
      { month: "Jan 2025", kpi: 80, tasksCompleted: 24, quality: 82 },
      { month: "Feb 2025", kpi: 81, tasksCompleted: 22, quality: 83 }
    ],
    email: "matthew.wilson@company.com"
  }
]

// Candidate Database
interface Candidate {
  id: number
  name: string
  appliedRole: string
  department: string
  expectedSalary: number
  applicationDate: string
  interviewStatus: string
  skillMatch: number
  resumeScore: number
  yearsExperience: number
  education: string
  email: string
}

const CANDIDATES: Candidate[] = [
  { id: 101, name: "Alex Kumar", appliedRole: "Software Engineer", department: "Engineering", expectedSalary: 120000, applicationDate: "Mar 8, 2024", interviewStatus: "Final Round", skillMatch: 92, resumeScore: 95, yearsExperience: 5, education: "Master's in Computer Science", email: "alex.kumar@gmail.com" },
  { id: 102, name: "Sophie Martinez", appliedRole: "UX Designer", department: "Design", expectedSalary: 110000, applicationDate: "Mar 10, 2024", interviewStatus: "Offer Ready", skillMatch: 88, resumeScore: 91, yearsExperience: 4, education: "Bachelor's in Design", email: "sophie.martinez@gmail.com" },
  { id: 103, name: "David Park", appliedRole: "Sales Manager", department: "Sales", expectedSalary: 130000, applicationDate: "Mar 5, 2024", interviewStatus: "Technical Round", skillMatch: 85, resumeScore: 87, yearsExperience: 6, education: "MBA", email: "david.park@gmail.com" },
  { id: 104, name: "Emily Thompson", appliedRole: "Marketing Specialist", department: "Marketing", expectedSalary: 95000, applicationDate: "Mar 12, 2024", interviewStatus: "Offer Ready", skillMatch: 90, resumeScore: 93, yearsExperience: 3, education: "Bachelor's in Marketing", email: "emily.thompson@gmail.com" },
  { id: 105, name: "Ryan O'Connor", appliedRole: "Data Engineer", department: "Analytics", expectedSalary: 135000, applicationDate: "Mar 7, 2024", interviewStatus: "Final Round", skillMatch: 87, resumeScore: 89, yearsExperience: 5, education: "Master's in Data Science", email: "ryan.oconnor@gmail.com" },
  { id: 106, name: "Priya Patel", appliedRole: "Product Manager", department: "Product", expectedSalary: 140000, applicationDate: "Mar 9, 2024", interviewStatus: "Phone Screen", skillMatch: 82, resumeScore: 84, yearsExperience: 7, education: "MBA + Engineering", email: "priya.patel@gmail.com" },
  { id: 107, name: "Marcus Johnson", appliedRole: "Frontend Developer", department: "Engineering", expectedSalary: 115000, applicationDate: "Mar 11, 2024", interviewStatus: "Offer Ready", skillMatch: 89, resumeScore: 92, yearsExperience: 4, education: "Bachelor's in CS", email: "marcus.johnson@gmail.com" },
  { id: 108, name: "Nina Ramirez", appliedRole: "HR Manager", department: "HR", expectedSalary: 105000, applicationDate: "Mar 6, 2024", interviewStatus: "Final Round", skillMatch: 84, resumeScore: 86, yearsExperience: 6, education: "Master's in HR Management", email: "nina.ramirez@gmail.com" }
]

// Department Performance Data
interface DepartmentPerformance {
  department: string
  employeeCount: number
  avgPerformanceScore: number
  avgSalary: number
  salaryRange: { min: number, max: number }
  seasonalMetrics: {
    quarter: string
    avgKPI: number
    productivity: number
    satisfaction: number
  }[]
  yearlyTrend: "Up" | "Stable" | "Down"
  topPerformers: number
  insights: string
}

const DEPARTMENT_ANALYTICS: DepartmentPerformance[] = [
  {
    department: "Engineering",
    employeeCount: 78,
    avgPerformanceScore: 87,
    avgSalary: 128000,
    salaryRange: { min: 95000, max: 165000 },
    seasonalMetrics: [
      { quarter: "Q1 2024", avgKPI: 85, productivity: 88, satisfaction: 82 },
      { quarter: "Q4 2023", avgKPI: 84, productivity: 86, satisfaction: 81 },
      { quarter: "Q3 2023", avgKPI: 87, productivity: 89, satisfaction: 84 },
      { quarter: "Q2 2023", avgKPI: 83, productivity: 85, satisfaction: 80 }
    ],
    yearlyTrend: "Up",
    topPerformers: 12,
    insights: "Engineering team showing consistent growth with strong delivery in Q1 2024. High satisfaction scores indicate good team morale."
  },
  {
    department: "Design",
    employeeCount: 45,
    avgPerformanceScore: 89,
    avgSalary: 115000,
    salaryRange: { min: 85000, max: 145000 },
    seasonalMetrics: [
      { quarter: "Q1 2024", avgKPI: 90, productivity: 92, satisfaction: 88 },
      { quarter: "Q4 2023", avgKPI: 89, productivity: 91, satisfaction: 87 },
      { quarter: "Q3 2023", avgKPI: 88, productivity: 89, satisfaction: 85 },
      { quarter: "Q2 2023", avgKPI: 87, productivity: 88, satisfaction: 84 }
    ],
    yearlyTrend: "Up",
    topPerformers: 8,
    insights: "Design team maintains excellent performance with highest satisfaction scores across all departments. Strong leadership impact visible."
  },
  {
    department: "Product",
    avgPerformanceScore: 84,
    employeeCount: 32,
    avgSalary: 132000,
    salaryRange: { min: 100000, max: 155000 },
    seasonalMetrics: [
      { quarter: "Q1 2024", avgKPI: 83, productivity: 85, satisfaction: 79 },
      { quarter: "Q4 2023", avgKPI: 84, productivity: 86, satisfaction: 80 },
      { quarter: "Q3 2023", avgKPI: 85, productivity: 87, satisfaction: 81 },
      { quarter: "Q2 2023", avgKPI: 84, productivity: 85, satisfaction: 80 }
    ],
    yearlyTrend: "Stable",
    topPerformers: 5,
    insights: "Product team maintains stable performance. Recent dip in Q1 2024 suggests need for process optimization or additional resources."
  },
  {
    department: "Analytics",
    employeeCount: 28,
    avgPerformanceScore: 86,
    avgSalary: 125000,
    salaryRange: { min: 90000, max: 150000 },
    seasonalMetrics: [
      { quarter: "Q1 2024", avgKPI: 88, productivity: 90, satisfaction: 85 },
      { quarter: "Q4 2023", avgKPI: 86, productivity: 88, satisfaction: 83 },
      { quarter: "Q3 2023", avgKPI: 85, productivity: 87, satisfaction: 82 },
      { quarter: "Q2 2023", avgKPI: 84, productivity: 85, satisfaction: 81 }
    ],
    yearlyTrend: "Up",
    topPerformers: 6,
    insights: "Analytics team on positive trajectory with strong Q1 performance. Data-driven culture contributing to productivity gains."
  },
  {
    department: "Marketing",
    employeeCount: 38,
    avgPerformanceScore: 82,
    avgSalary: 108000,
    salaryRange: { min: 75000, max: 140000 },
    seasonalMetrics: [
      { quarter: "Q1 2024", avgKPI: 81, productivity: 83, satisfaction: 78 },
      { quarter: "Q4 2023", avgKPI: 82, productivity: 84, satisfaction: 79 },
      { quarter: "Q3 2023", avgKPI: 83, productivity: 85, satisfaction: 80 },
      { quarter: "Q2 2023", avgKPI: 82, productivity: 84, satisfaction: 79 }
    ],
    yearlyTrend: "Stable",
    topPerformers: 4,
    insights: "Marketing team performance steady with opportunities for satisfaction improvement. Consider team engagement initiatives."
  },
  {
    department: "Sales",
    employeeCount: 27,
    avgPerformanceScore: 85,
    avgSalary: 118000,
    salaryRange: { min: 80000, max: 160000 },
    seasonalMetrics: [
      { quarter: "Q1 2024", avgKPI: 87, productivity: 89, satisfaction: 84 },
      { quarter: "Q4 2023", avgKPI: 85, productivity: 87, satisfaction: 82 },
      { quarter: "Q3 2023", avgKPI: 84, productivity: 86, satisfaction: 81 },
      { quarter: "Q2 2023", avgKPI: 86, productivity: 88, satisfaction: 83 }
    ],
    yearlyTrend: "Up",
    topPerformers: 5,
    insights: "Sales team showing strong Q1 performance with improved morale. Seasonal variations align with business cycles."
  }
]

export function HrContractGeneration() {
  const [selectedDocType, setSelectedDocType] = useState("offer-letter")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<Employee | Candidate | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    department: "",
    salary: "",
    startDate: "",
    notes: "",
    // Equity specific
    shares: "",
    vestingPeriod: "",
    // Warning specific
    infractionType: "",
    improvementPlan: "",
    // Termination specific
    terminationReason: "",
    lastWorkingDay: "",
    // Promotion specific
    currentRole: "",
    newRole: "",
    salaryIncrease: ""
  })

  // Generated document state
  const [generatedDocument, setGeneratedDocument] = useState<string>("")
  const [showPreview, setShowPreview] = useState(false)
  const [showCandidateModal, setShowCandidateModal] = useState(false)
  const [showPerformanceModal, setShowPerformanceModal] = useState(false)
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)


  const documentTypes = [
    { id: "offer-letter", label: "Offer Letter", icon: FileText },
    { id: "contract", label: "Employment Contract", icon: FileSignature },
    { id: "promotion", label: "Promotion Letter", icon: TrendingUp },
    { id: "warning", label: "Warning Notice", icon: AlertTriangle },
    { id: "termination", label: "Termination Notice", icon: FileWarning },
    { id: "equity", label: "Equity Grant", icon: Award }
  ]

  // Filter suggestions based on document type
  const getSuggestions = () => {
    if (!searchQuery) return []

    const query = searchQuery.toLowerCase()

    if (selectedDocType === "offer-letter") {
      // Only show candidates for offer letters
      return CANDIDATES.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.appliedRole.toLowerCase().includes(query)
      ).slice(0, 5)
    } else {
      // Show employees for all other document types
      return EMPLOYEES.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.role.toLowerCase().includes(query) ||
        e.department.toLowerCase().includes(query)
      ).slice(0, 5)
    }
  }

  const handleSelectPerson = (person: Employee | Candidate) => {
    setSelectedPerson(person)
    setSearchQuery(person.name)
    setShowSuggestions(false)

    // Auto-populate form fields
    if ('performanceScore' in person) {
      // Employee
      setFormData({
        ...formData,
        name: person.name,
        role: person.role,
        department: person.department,
        salary: person.salary.toString(),
        currentRole: person.role
      })
    } else {
      // Candidate
      setFormData({
        ...formData,
        name: person.name,
        role: person.appliedRole,
        department: person.department,
        salary: person.expectedSalary.toString()
      })
    }
  }


  // AI Analysis - Performance-based suggestions
  const getAISuggestions = () => {
    let rawSuggestions: (Candidate | Employee)[] = []

    // Get base suggestions based on document type
    if (selectedDocType === "offer-letter") {
      rawSuggestions = CANDIDATES
        .filter(c => c.resumeScore >= 90 || c.interviewStatus === "Offer Ready")
        .sort((a, b) => b.resumeScore - a.resumeScore)
    } else if (selectedDocType === "contract") {
      rawSuggestions = CANDIDATES
        .filter(c => c.interviewStatus === "Offer Ready" || c.interviewStatus === "Final Round")
        .sort((a, b) => b.skillMatch - a.skillMatch)
    } else if (selectedDocType === "promotion") {
      rawSuggestions = EMPLOYEES
        .filter(e => e.performanceScore >= 85)
        .sort((a, b) => b.performanceScore - a.performanceScore)
    } else if (selectedDocType === "warning") {
      rawSuggestions = EMPLOYEES
        .filter(e => e.performanceScore < 80)
        .sort((a, b) => a.performanceScore - b.performanceScore)
    } else if (selectedDocType === "termination") {
      rawSuggestions = EMPLOYEES
        .filter(e => e.performanceScore < 75 && e.metrics.attendance < 90)
        .sort((a, b) => a.performanceScore - b.performanceScore)
    } else if (selectedDocType === "equity") {
      rawSuggestions = EMPLOYEES
        .filter(e => e.performanceScore >= 85)
        .sort((a, b) => b.performanceScore - a.performanceScore)
    }

    // Filter by department if selected
    if (selectedDepartment && selectedDepartment !== "All") {
      rawSuggestions = rawSuggestions.filter(p => p.department === selectedDepartment)
    }

    // Map to suggestion format with salary info
    return rawSuggestions.slice(0, 3).map(p => {
      const isCandidate = 'expectedSalary' in p
      const salary = isCandidate ? (p as Candidate).expectedSalary : (p as Employee).salary
      const formattedSalary = typeof salary === 'string' ? salary : `$${salary.toLocaleString()}`

      let reason = ""
      if (selectedDocType === "offer-letter") reason = `Resume: ${(p as Candidate).resumeScore}/100. Exp. Salary: ${formattedSalary}`
      else if (selectedDocType === "contract") reason = `Match: ${(p as Candidate).skillMatch}%. Exp. Salary: ${formattedSalary}`
      else if (selectedDocType === "promotion") reason = `Score: ${(p as Employee).performanceScore}/100. Current: ${formattedSalary}`
      else if (selectedDocType === "warning") reason = `Score: ${(p as Employee).performanceScore}/100. Current: ${formattedSalary}`
      else if (selectedDocType === "termination") reason = `Score: ${(p as Employee).performanceScore}. Current: ${formattedSalary}`
      else if (selectedDocType === "equity") reason = `Score: ${(p as Employee).performanceScore}. Current: ${formattedSalary}`

      return { person: p, reason }
    })
  }

  // Generate document based on type
  const handleGenerateDocument = () => {
    const documentData: DocumentData = {
      name: formData.name,
      role: formData.role,
      department: formData.department,
      salary: formData.salary,
      startDate: formData.startDate,
      notes: formData.notes,
      shares: formData.shares,
      vestingPeriod: formData.vestingPeriod,
      infractionType: formData.infractionType,
      improvementPlan: formData.improvementPlan,
      terminationReason: formData.terminationReason,
      lastWorkingDay: formData.lastWorkingDay,
      currentRole: formData.currentRole,
      newRole: formData.newRole,
      salaryIncrease: formData.salaryIncrease
    }

    let html = ""

    switch (selectedDocType) {
      case "offer-letter":
        html = generateOfferLetterTemplate(documentData)
        break
      case "contract":
        html = generateEmploymentContractTemplate(documentData)
        break
      case "promotion":
        html = generatePromotionLetterTemplate(documentData)
        break
      case "warning":
        html = generateWarningNoticeTemplate(documentData)
        break
      case "termination":
        html = generateTerminationNoticeTemplate(documentData)
        break
      case "equity":
        html = generateEquityGrantTemplate(documentData)
        break
      default:
        html = "<p>Invalid document type</p>"
    }

    setGeneratedDocument(html)
    setShowPreview(true)
  }

  const handleDownloadPDF = () => {
    // Create a blob from the HTML
    const blob = new Blob([generatedDocument], { type: 'text/html' })
    const url = URL.createObjectURL(blob)

    // Create download link
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedDocType}-${formData.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSendEmail = () => {
    const recipientEmail = selectedPerson && 'email' in selectedPerson ? selectedPerson.email : ''
    const docLabel = documentTypes.find(t => t.id === selectedDocType)?.label || 'Document'
    const subject = encodeURIComponent(`${docLabel} - ${formData.name}`)
    const body = encodeURIComponent(`Please find your ${docLabel} attached.`)
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&su=${subject}&body=${body}`, '_blank')
  }

  const handleSendDashboard = () => {
    const notification = {
      id: Date.now(),
      recipientId: selectedPerson?.id,
      recipientName: formData.name,
      documentType: selectedDocType,
      documentTitle: documentTypes.find(t => t.id === selectedDocType)?.label || 'Document',
      message: `Your ${documentTypes.find(t => t.id === selectedDocType)?.label} has been generated`,
      date: new Date().toISOString(),
      read: false
    }
    const existingNotifications = JSON.parse(localStorage.getItem('dashboardNotifications') || '[]')
    existingNotifications.push(notification)
    localStorage.setItem('dashboardNotifications', JSON.stringify(existingNotifications))
    alert('Notification sent to employee dashboard!')
  }

  const suggestions = getSuggestions()
  const aiSuggestions = getAISuggestions()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contract Generation</h1>
        <p className="text-muted-foreground">Create and manage employment documents</p>
      </div>

      {/* Department Filter */}
      <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
        {["All", ...Array.from(new Set(EMPLOYEES.map(e => e.department)))].map((dept) => (
          <Badge
            key={dept}
            variant={selectedDepartment === dept || (dept === "All" && !selectedDepartment) ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-sm whitespace-nowrap hover:bg-primary/90 transition-colors"
            onClick={() => setSelectedDepartment(dept === "All" ? null : dept)}
          >
            {dept}
          </Badge>
        ))}
      </div>

      {/* Document Type Selection */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {documentTypes.map((type) => {
          const Icon = type.icon
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${selectedDocType === type.id ? 'border-primary bg-primary/5' : ''
                }`}
              onClick={() => {
                setSelectedDocType(type.id)
                setSearchQuery("")
                setSelectedPerson(null)
                setFormData({
                  name: "",
                  role: "",
                  department: "",
                  salary: "",
                  startDate: "",
                  notes: "",
                  shares: "",
                  vestingPeriod: "",
                  infractionType: "",
                  improvementPlan: "",
                  terminationReason: "",
                  lastWorkingDay: "",
                  currentRole: "",
                  newRole: "",
                  salaryIncrease: ""
                })
              }}
            >
              <CardContent className="p-4 text-center">
                <div className={`p-3 rounded-lg mx-auto w-fit mb-2 ${selectedDocType === type.id ? 'bg-primary/10' : 'bg-secondary'
                  }`}>
                  <Icon className={`h-5 w-5 ${selectedDocType === type.id ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                </div>
                <p className="text-xs font-medium">{type.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Document Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
              <CardDescription>Fill in the information for your document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Autocomplete Name Field */}
              <div className="space-y-2 relative">
                <Label>
                  {selectedDocType === "offer-letter" ? "Candidate Name" : "Employee Name"}
                </Label>
                <Input
                  placeholder={selectedDocType === "offer-letter" ? "Search candidates..." : "Search employees..."}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowSuggestions(true)
                    if (!e.target.value) setSelectedPerson(null)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />

                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((person) => (
                      <div
                        key={person.id}
                        className="p-3 hover:bg-secondary cursor-pointer border-b last:border-b-0"
                        onClick={() => handleSelectPerson(person)}
                      >
                        <p className="font-semibold">{person.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {'appliedRole' in person ? person.appliedRole : person.role} • {person.department}
                        </p>
                        {('performanceScore' in person) && (
                          <Badge variant="secondary" className="mt-1">
                            Performance: {person.performanceScore}/100
                          </Badge>
                        )}
                        {('skillMatch' in person) && (
                          <Badge variant="secondary" className="mt-1">
                            Skill Match: {person.skillMatch}%
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Common Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Position/Role</Label>
                  <Input
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={formData.department} onValueChange={(val) => setFormData({ ...formData, department: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Analytics">Analytics</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Document-Specific Fields */}
              {(selectedDocType === "offer-letter" || selectedDocType === "contract") && (
                <div className="space-y-2">
                  <Label>Annual Salary</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 120000"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  />
                </div>
              )}

              {selectedDocType === "promotion" && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Current Role</Label>
                      <Input
                        placeholder="Current position"
                        value={formData.currentRole}
                        onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>New Role</Label>
                      <Input
                        placeholder="Promoted position"
                        value={formData.newRole}
                        onChange={(e) => setFormData({ ...formData, newRole: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Salary Increase</Label>
                    <Input
                      placeholder="e.g., $15,000 or 12%"
                      value={formData.salaryIncrease}
                      onChange={(e) => setFormData({ ...formData, salaryIncrease: e.target.value })}
                    />
                  </div>
                </>
              )}

              {selectedDocType === "warning" && (
                <>
                  <div className="space-y-2">
                    <Label>Infraction Type</Label>
                    <Select value={formData.infractionType} onValueChange={(val) => setFormData({ ...formData, infractionType: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select infraction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="attendance">Attendance Issues</SelectItem>
                        <SelectItem value="performance">Performance Below Standard</SelectItem>
                        <SelectItem value="conduct">Misconduct</SelectItem>
                        <SelectItem value="policy">Policy Violation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Improvement Plan</Label>
                    <Textarea
                      placeholder="Required improvements and timeline..."
                      rows={3}
                      value={formData.improvementPlan}
                      onChange={(e) => setFormData({ ...formData, improvementPlan: e.target.value })}
                    />
                  </div>
                </>
              )}

              {selectedDocType === "termination" && (
                <>
                  <div className="space-y-2">
                    <Label>Termination Reason</Label>
                    <Select value={formData.terminationReason} onValueChange={(val) => setFormData({ ...formData, terminationReason: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="restructuring">Restructuring</SelectItem>
                        <SelectItem value="misconduct">Misconduct</SelectItem>
                        <SelectItem value="resignation">Voluntary Resignation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Last Working Day</Label>
                    <Input
                      type="date"
                      value={formData.lastWorkingDay}
                      onChange={(e) => setFormData({ ...formData, lastWorkingDay: e.target.value })}
                    />
                  </div>
                </>
              )}

              {selectedDocType === "equity" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Number of Shares</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 10000"
                      value={formData.shares}
                      onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vesting Period</Label>
                    <Select value={formData.vestingPeriod} onValueChange={(val) => setFormData({ ...formData, vestingPeriod: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4year">4 years with 1-year cliff</SelectItem>
                        <SelectItem value="3year">3 years monthly vesting</SelectItem>
                        <SelectItem value="2year">2 years quarterly vesting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{selectedDocType === "offer-letter" ? "Start Date" : "Effective Date"}</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  placeholder="Any special terms or conditions..."
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>


              <div className="flex gap-3">
                <Button className="flex-1" onClick={handleGenerateDocument}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Document
                </Button>
                <Button variant="outline" onClick={() => generatedDocument && setShowPreview(true)} disabled={!generatedDocument}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>


          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Document Actions</CardTitle>
              <CardDescription>Preview, download, or send the document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => generatedDocument && setShowPreview(true)}
                disabled={!generatedDocument}
              >
                <Eye className="h-4 w-4 mr-3" />
                Preview Document
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleDownloadPDF}
                disabled={!generatedDocument}
              >
                <Download className="h-4 w-4 mr-3" />
                Download PDF
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full justify-start" disabled={!generatedDocument}>
                    <Send className="h-4 w-4 mr-3" />
                    Send Document
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onClick={handleSendEmail}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send to Email (Gmail)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSendDashboard}>
                    <BellRing className="h-4 w-4 mr-2" />
                    Send to Dashboard Notification
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis & Performance */}
        <div className="space-y-6">


          {/* Analysis Section - Dynamically changes based on Department Selection */}
          {selectedDepartment && selectedDepartment !== "All" ? (
            // Department Analytics Card
            (() => {
              const deptAnalytics = DEPARTMENT_ANALYTICS.find(d => d.department === selectedDepartment)
              if (!deptAnalytics) return null
              return (
                <Card
                  className="border-blue-200 dark:border-blue-800 cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setShowDepartmentModal(true)}
                >
                  <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                    <CardTitle className="flex items-center justify-between text-blue-900 dark:text-blue-100">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        {selectedDepartment} Analytics
                      </div>
                      <Badge variant="secondary" className="bg-blue-200 text-blue-800 hover:bg-blue-300">
                        {deptAnalytics.yearlyTrend === "Up" ? "📈 Trending Up" : "📉 Trending Down"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Avg Performance: {deptAnalytics.avgPerformanceScore}/100 • {deptAnalytics.employeeCount} Employees
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Top Performer Count: {deptAnalytics.topPerformers}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{deptAnalytics.insights}</p>
                      </div>
                      <Button variant="outline" size="sm">View Report →</Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })()
          ) : (
            // AI Candidate Analysis Summary Card - Available for all document types (Fallback)
            aiSuggestions.length > 0 && (
              <Card
                className="border-purple-200 dark:border-purple-800 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setShowCandidateModal(true)}
              >
                <CardHeader className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <CardTitle className="flex items-center justify-between text-purple-900 dark:text-purple-100">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      AI Candidate Analysis
                    </div>
                    <Badge variant="secondary">{aiSuggestions.length} candidates</Badge>
                  </CardTitle>
                  <CardDescription>Click to view detailed candidate insights and recommendations</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium mb-1">Top Candidate: {aiSuggestions[0]?.person.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {'resumeScore' in aiSuggestions[0]?.person ? `Resume Score: ${aiSuggestions[0]?.person.resumeScore}/100` : ''}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View All →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          )}


          <Card
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setShowPerformanceModal(true)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {selectedDepartment && selectedDepartment !== "All" ? `${selectedDepartment} Performance` : "Employee Performance Tracker"}
                </div>
                <Badge variant="secondary">
                  {selectedPerson && 'performanceScore' in selectedPerson ? '1' :
                    (selectedDepartment && selectedDepartment !== "All" ?
                      EMPLOYEES.filter(e => e.department === selectedDepartment).length :
                      '3'
                    )
                  } employees
                </Badge>
              </CardTitle>
              <CardDescription>Click to view comprehensive performance history and KPI tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {(() => {
                    const filteredEmployees = EMPLOYEES.filter(e => !selectedDepartment || selectedDepartment === "All" || e.department === selectedDepartment)
                    const topPerformer = selectedPerson && 'performanceScore' in selectedPerson
                      ? selectedPerson as Employee
                      : filteredEmployees.sort((a, b) => b.performanceScore - a.performanceScore)[0]

                    if (!topPerformer) return <p className="text-sm text-muted-foreground">No data available</p>

                    return (
                      <>
                        <p className="text-sm font-medium mb-1">Top Performer: {topPerformer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Score: {topPerformer.performanceScore}/100 • {topPerformer.department}
                        </p>
                      </>
                    )
                  })()}
                </div>
                <Button variant="outline" size="sm">
                  View All →
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>


      {/* Department Analytics Modal */}
      <Dialog open={showDepartmentModal} onOpenChange={setShowDepartmentModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              {selectedDepartment} Department Analytics
            </DialogTitle>
            <DialogDescription>
              Performance metrics, salary data, and seasonal trends
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const analytics = DEPARTMENT_ANALYTICS.find(d => d.department === selectedDepartment)
            if (!analytics) return null

            return (
              <div className="mt-4 space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                    <p className="text-xs text-muted-foreground uppercase">Avg Performance</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics.avgPerformanceScore}/100</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                    <p className="text-xs text-muted-foreground uppercase">Employee Count</p>
                    <p className="text-2xl font-bold">{analytics.employeeCount}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                    <p className="text-xs text-muted-foreground uppercase">Avg Salary</p>
                    <p className="text-2xl font-bold">${(analytics.avgSalary / 1000).toFixed(0)}k</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                    <p className="text-xs text-muted-foreground uppercase">Top Performers</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.topPerformers}</p>
                  </div>
                </div>

                {/* Seasonal Trends */}
                <div>
                  <h4 className="font-semibold mb-3">Seasonal Performance Trends</h4>
                  <div className="space-y-3">
                    {analytics.seasonalMetrics.map((sm, idx) => (
                      <div key={idx} className="flex items-center gap-4 text-sm">
                        <div className="w-20 font-medium">{sm.quarter}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>KPI: {sm.avgKPI}</span>
                            <span>Prod: {sm.productivity}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                            <div className="bg-blue-500 h-full" style={{ width: `${sm.avgKPI}%` }} title="KPI" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insights */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="text-sm italic text-blue-800 dark:text-blue-200">
                    <span className="font-bold">AI Insight:</span> {analytics.insights}
                  </p>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* AI Candidate Analysis Modal */}
      <Dialog open={showCandidateModal} onOpenChange={setShowCandidateModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                AI Candidate Analysis
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCandidateModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              Complete list of AI-recommended candidates for {selectedDocType === "offer-letter" ? "Offer Letter" : "Employment Contract"}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            {aiSuggestions.map((suggestion, index) => {
              const candidate = suggestion.person as Candidate
              const trend = candidate.skillMatch >= 90 ? 'Up' : candidate.skillMatch >= 80 ? 'Stable' : 'Down'
              const seasonalScore = candidate.resumeScore

              return (
                <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-900 dark:to-slate-800 rounded-lg border hover:border-purple-400 transition-all cursor-pointer" onClick={() => { handleSelectPerson(candidate as any); setShowCandidateModal(false); }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                        {candidate.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{candidate.name}</h4>
                        <p className="text-sm text-muted-foreground">{candidate.appliedRole} • {candidate.department}</p>
                      </div>
                    </div>
                    <Badge
                      variant={trend === 'Up' ? 'default' : trend === 'Stable' ? 'secondary' : 'outline'}
                      className={
                        trend === 'Up' ? 'bg-green-600 text-white' :
                          trend === 'Stable' ? 'bg-blue-600 text-white' :
                            'bg-orange-600 text-white'
                      }
                    >
                      📈 Trend: {trend}
                    </Badge>
                  </div>

                  {/* Resume Score */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground font-medium">Resume Score</span>
                      <span className="font-bold text-purple-600">{seasonalScore}/100</span>
                    </div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all"
                        style={{ width: `${seasonalScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Skills Match</p>
                      <p className="text-sm font-semibold">{candidate.skillMatch}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Interview Status</p>
                      <p className="text-sm font-semibold">{candidate.interviewStatus}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <p className="text-sm font-semibold">{candidate.yearsExperience} years</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Expected Salary</p>
                      <p className="text-sm font-semibold">${candidate.expectedSalary?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* AI Insight */}
                  <div className="pt-3 border-t border-dashed">
                    <p className="text-sm italic text-purple-700 dark:text-purple-400">
                      <span className="font-bold not-italic">AI Insight:</span> {suggestion.reason}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Performance Tracker Modal */}
      <Dialog open={showPerformanceModal} onOpenChange={setShowPerformanceModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Employee Performance Tracker
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowPerformanceModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              Comprehensive performance history and monthly KPI tracking for all employees
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {(() => {
              const isDeptSelected = selectedDepartment && selectedDepartment !== "All"
              const employeesToShow = selectedPerson && 'performanceScore' in selectedPerson
                ? [selectedPerson as Employee]
                : EMPLOYEES
                  .filter(e => isDeptSelected ? e.department === selectedDepartment : e.performanceScore >= 85)
                  .sort((a, b) => b.performanceScore - a.performanceScore)
                  .slice(0, isDeptSelected ? 20 : 3)

              return employeesToShow.map((employee, index) => {
                const avgKPI = employee.performanceHistory.reduce((sum, month) => sum + month.kpi, 0) / employee.performanceHistory.length
                const trend = employee.performanceHistory[employee.performanceHistory.length - 1].kpi > employee.performanceHistory[0].kpi ? 'Up' : 'Down'
                const trendColor = trend === 'Up' ? 'text-green-600' : 'text-orange-600'
                const recentMonths = employee.performanceHistory.slice(-3)

                return (
                  <div key={employee.id} className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg border">
                    {/* Header with name and score */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center font-bold text-2xl">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{employee.name}</h4>
                          <p className="text-sm text-muted-foreground">{employee.role} • {employee.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold text-primary">{employee.performanceScore}</p>
                        <p className="text-xs text-muted-foreground uppercase">Current Score</p>
                      </div>
                    </div>

                    {/* Recent Monthly Performance */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Recent Monthly KPI</p>
                        <Badge variant={trend === 'Up' ? 'default' : 'secondary'} className={trendColor}>
                          Trend: {trend}
                        </Badge>
                      </div>
                      {recentMonths.map((month, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">{month.month}</span>
                            <span className="text-muted-foreground">{month.kpi}/100 • {month.tasksCompleted} tasks • Quality: {month.quality}%</span>
                          </div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${month.kpi >= 90 ? 'bg-green-500' :
                                month.kpi >= 80 ? 'bg-blue-500' :
                                  month.kpi >= 70 ? 'bg-yellow-500' : 'bg-orange-500'
                                }`}
                              style={{ width: `${month.kpi}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Latest Summary */}
                    <div className="pt-3 border-t border-dashed">
                      <p className="text-sm italic text-muted-foreground">
                        <span className="font-bold not-italic">Latest:</span> {
                          employee.performanceScore >= 90 ? `Exceptional delivery on core ${employee.department} tasks. Outstanding work quality.` :
                            employee.performanceScore >= 80 ? `Strong performance with consistent results. Above expectations.` :
                              employee.performanceScore >= 70 ? `Meeting expectations with room for improvement.` :
                                `Performance review recommended for improvement planning.`}
                      </p>
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Document Preview</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              Review your generated {documentTypes.find(t => t.id === selectedDocType)?.label}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {generatedDocument && (
              <iframe
                srcDoc={generatedDocument}
                className="w-full h-[600px] border rounded-lg"
                title="Document Preview"
              />
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <Button onClick={handleDownloadPDF} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={() => setShowPreview(false)} className="flex-1">
              Close Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
