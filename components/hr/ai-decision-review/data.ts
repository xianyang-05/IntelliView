import { AIDecision } from "./types"

export let mockDecisions: AIDecision[] = [
    {
        id: "1",
        type: "hiring",
        title: "Senior Frontend Developer — Hiring Recommendation",
        candidate: "Sarah Chen",
        summary:
            "AI analysis of interview transcripts, coding assessment, and cultural fit scores indicates a strong match for the Senior Frontend Developer role.",
        confidence: 92,
        recommendation: "Strongly recommend hiring. Top 5% of assessed candidates.",
        status: "pending",
        biasScore: 96,
        factors: [
            { label: "Technical Skills", impact: "positive", weight: 95 },
            { label: "Communication", impact: "positive", weight: 88 },
            { label: "Cultural Fit", impact: "positive", weight: 91 },
            { label: "Experience Gap", impact: "negative", weight: 15 },
        ],
        timestamp: "2026-02-24T09:30:00Z",
    },
    {
        id: "2",
        type: "performance",
        title: "Quarterly Performance — Improvement Plan",
        employee: "Marcus Rivera",
        summary:
            "Performance metrics show a 23% decline in output over the last quarter. AI identified potential burnout patterns and workload imbalance.",
        confidence: 78,
        recommendation: "Suggest a structured improvement plan with reduced workload for 30 days.",
        status: "flagged",
        biasScore: 89,
        factors: [
            { label: "Output Decline", impact: "negative", weight: 72 },
            { label: "Attendance", impact: "neutral", weight: 50 },
            { label: "Peer Reviews", impact: "positive", weight: 80 },
            { label: "Burnout Risk", impact: "negative", weight: 68 },
        ],
        timestamp: "2026-02-23T14:15:00Z",
    },
    {
        id: "3",
        type: "compensation",
        title: "Salary Adjustment — Market Alignment",
        employee: "Priya Sharma",
        summary:
            "Market data analysis shows the current compensation is 18% below market median for comparable roles and experience levels.",
        confidence: 85,
        recommendation: "Recommend a 12% salary increase to align with market P50.",
        status: "approved",
        biasScore: 98,
        factors: [
            { label: "Market Position", impact: "negative", weight: 82 },
            { label: "Performance Rating", impact: "positive", weight: 90 },
            { label: "Tenure", impact: "positive", weight: 75 },
            { label: "Budget Impact", impact: "neutral", weight: 45 },
        ],
        timestamp: "2026-02-22T11:00:00Z",
    },
    {
        id: "4",
        type: "hiring",
        title: "Data Analyst — Hiring Recommendation",
        candidate: "James Walker",
        summary:
            "Candidate shows strong analytical skills but AI detected potential overconfidence indicators in behavioral assessment. Cultural fit score is average.",
        confidence: 64,
        recommendation: "Proceed with caution. Recommend second-round panel interview.",
        status: "pending",
        biasScore: 93,
        factors: [
            { label: "Analytical Skills", impact: "positive", weight: 88 },
            { label: "Behavioral Assessment", impact: "negative", weight: 55 },
            { label: "Cultural Fit", impact: "neutral", weight: 62 },
            { label: "References", impact: "positive", weight: 80 },
        ],
        timestamp: "2026-02-24T08:00:00Z",
    },
    {
        id: "5",
        type: "termination",
        title: "Contract Non-Renewal Assessment",
        employee: "Daniel Okafor",
        summary:
            "Contract assessment suggests non-renewal based on project completion, performance metrics, and team restructuring needs.",
        confidence: 71,
        recommendation: "AI recommends non-renewal with a transition plan. HR review required for bias audit.",
        status: "flagged",
        biasScore: 82,
        factors: [
            { label: "Project Status", impact: "neutral", weight: 60 },
            { label: "Performance", impact: "negative", weight: 55 },
            { label: "Team Redundancy", impact: "negative", weight: 70 },
            { label: "Retention Value", impact: "positive", weight: 45 },
        ],
        timestamp: "2026-02-21T16:45:00Z",
    },
]

export function updateDecisionStatus(id: string, status: "approved" | "rejected") {
    mockDecisions = mockDecisions.map(d => d.id === id ? { ...d, status } : d)
    return mockDecisions.find(d => d.id === id)
}
