import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { getAdminDb } = await import("@/lib/firebase-admin");
        const adminDb = await getAdminDb();

        // Save candidate profile to Firestore
        if (!body.uid || !body.email || !body.fullName) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        await adminDb.collection("users").doc(body.uid).set({
            email: body.email,
            full_name: body.fullName,
            role: "candidate",
            company_id: null,
            created_at: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Register candidate error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
