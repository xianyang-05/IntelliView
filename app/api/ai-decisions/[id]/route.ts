import { NextResponse } from "next/server"
import { updateDecisionStatus } from "@/components/hr/ai-decision-review/data"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id
        const body = await request.json()
        const { action, feedback } = body

        if (!action || !["approved", "rejected"].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

        const updated = updateDecisionStatus(id, action as "approved" | "rejected")

        // Log the feedback
        if (feedback) {
            console.log(`[AI Feedback Recorded] Decision ${id} rejected due to ${feedback.reason}: ${feedback.notes}`)
        }

        if (!updated) {
            return NextResponse.json({ error: "Decision not found" }, { status: 404 })
        }

        return NextResponse.json({ decision: updated })
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
