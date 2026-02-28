import {
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Users,
    TrendingUp,
    BarChart3,
    FileText,
} from "lucide-react"

export type DecisionStatus = "pending" | "approved" | "rejected" | "flagged"

export interface AIDecision {
    id: string
    type: "hiring" | "performance" | "compensation" | "termination"
    title: string
    employee?: string
    candidate?: string
    summary: string
    confidence: number
    recommendation: string
    status: DecisionStatus
    biasScore: number
    factors: { label: string; impact: "positive" | "negative" | "neutral"; weight: number }[]
    timestamp: string
}

export const statusConfig: Record<DecisionStatus, { label: string; color: string; icon: any }> = {
    pending: { label: "Pending Review", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
    flagged: { label: "Flagged for Review", color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertTriangle },
}

export const typeConfig: Record<string, { label: string; gradient: string; icon: any }> = {
    hiring: { label: "Hiring", gradient: "from-blue-500 to-indigo-600", icon: Users },
    performance: { label: "Performance", gradient: "from-amber-500 to-orange-600", icon: TrendingUp },
    compensation: { label: "Compensation", gradient: "from-emerald-500 to-teal-600", icon: BarChart3 },
    termination: { label: "Contract", gradient: "from-rose-500 to-red-600", icon: FileText },
}
