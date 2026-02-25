import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { getAdminDb } = await import("@/lib/firebase-admin");
        const adminDb = await getAdminDb();

        if (!body.email || !body.fullName || !body.companyCode) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // Lookup company by code
        const companiesSnap = await adminDb.collection("companies")
            .where("company_code", "==", body.companyCode)
            .limit(1)
            .get();

        if (companiesSnap.empty) {
            return NextResponse.json({ success: false, message: "Invalid company code" }, { status: 400 });
        }

        const companyDoc = companiesSnap.docs[0];
        const companyId = companyDoc.id;

        return NextResponse.json({ success: true, company_id: companyId });
    } catch (error: any) {
        console.error("Register employee error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
