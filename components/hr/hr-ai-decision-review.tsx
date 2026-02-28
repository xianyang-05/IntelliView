"use client"

import { useState, useEffect } from "react"
import { AIDecision } from "./ai-decision-review/types"
import { MetricsDashboard } from "./ai-decision-review/metrics-dashboard"
import { DecisionList } from "./ai-decision-review/decision-list"
import { ExplainabilityDrawer } from "./ai-decision-review/explainability-drawer"
import { HumanFeedbackDialog } from "./ai-decision-review/human-feedback-dialog"
import { Loader2 } from "lucide-react"

export function HrAiDecisionReview() {
    const [decisions, setDecisions] = useState<AIDecision[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // UI State
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("all")

    // Drawer State
    const [selectedDecision, setSelectedDecision] = useState<AIDecision | null>(null)
    const [detailOpen, setDetailOpen] = useState(false)

    // Feedback Dialog State
    const [feedbackState, setFeedbackState] = useState<{
        isOpen: boolean
        decisionId: string | null
        action: "approved" | "rejected" | null
    }>({ isOpen: false, decisionId: null, action: null })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchDecisions()
    }, [])

    const fetchDecisions = async () => {
        try {
            const res = await fetch("/api/ai-decisions")
            if (res.ok) {
                const data = await res.json()
                setDecisions(data.decisions)
            }
        } catch (error) {
            console.error("Failed to fetch AI decisions:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleActionInitiated = (id: string, action: "approved" | "rejected") => {
        if (action === "rejected") {
            // Require feedback for rejection
            setFeedbackState({ isOpen: true, decisionId: id, action })
        } else {
            // Approve directly
            submitAction(id, action)
        }
    }

    const submitAction = async (id: string, action: "approved" | "rejected", feedback?: any) => {
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/ai-decisions/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, feedback })
            })

            if (res.ok) {
                const data = await res.json()
                // Update local state
                setDecisions(prev => prev.map(d => d.id === id ? data.decision : d))
                if (selectedDecision?.id === id) {
                    setSelectedDecision(data.decision)
                }
            }
        } catch (error) {
            console.error("Failed to update AI decision:", error)
        } finally {
            setIsSubmitting(false)
            setFeedbackState({ isOpen: false, decisionId: null, action: null })
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <MetricsDashboard decisions={decisions} />

            <DecisionList
                decisions={decisions}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onSelectDecision={(d) => {
                    setSelectedDecision(d)
                    setDetailOpen(true)
                }}
                onAction={handleActionInitiated}
            />

            <ExplainabilityDrawer
                decision={selectedDecision}
                isOpen={detailOpen}
                onOpenChange={setDetailOpen}
                onAction={handleActionInitiated}
            />

            <HumanFeedbackDialog
                isOpen={feedbackState.isOpen}
                action={feedbackState.action}
                onClose={() => setFeedbackState({ isOpen: false, decisionId: null, action: null })}
                onSubmit={(feedback) => {
                    if (feedbackState.decisionId && feedbackState.action) {
                        submitAction(feedbackState.decisionId, feedbackState.action, feedback)
                    }
                }}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
