import { NextResponse } from "next/server"
import { mockDecisions } from "@/components/hr/ai-decision-review/data"

export async function GET() {
    // Return all decisions
    return NextResponse.json({ decisions: mockDecisions })
}
