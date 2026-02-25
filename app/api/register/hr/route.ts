import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { getAdminDb } = await import("@/lib/firebase-admin");
        const adminDb = await getAdminDb();

        if (!body.companyName || !body.companyCode) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // Create the company in Firestore
        const companyRef = await adminDb.collection("companies").add({
            name: body.companyName,
            company_code: body.companyCode,
            policy_mode: body.policyMode || "standard",
            created_at: new Date().toISOString(),
        });

        return NextResponse.json({ success: true, company_id: companyRef.id });
    } catch (error: any) {
        console.error("Register HR error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
