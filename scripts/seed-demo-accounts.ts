/**
 * Seed script: Creates 3 demo accounts in Firebase Auth + Firestore.
 *
 * Run with:  npx tsx scripts/seed-demo-accounts.ts
 */

import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import * as fs from "fs"
import * as path from "path"

// ── Init Firebase Admin ──
const saPath = path.resolve(__dirname, "../firebase-service-account.json")
if (!fs.existsSync(saPath)) {
    console.error("❌ firebase-service-account.json not found at", saPath)
    process.exit(1)
}
const serviceAccount = JSON.parse(fs.readFileSync(saPath, "utf-8"))

if (getApps().length === 0) {
    initializeApp({ credential: cert(serviceAccount) })
}

const auth = getAuth()
const db = getFirestore()

// ── Demo accounts definition ──
const DEMO_ACCOUNTS = [
    {
        email: "rachel.lim@zerohr.com",
        password: "demo-hr-2024",
        displayName: "Rachel Lim",
        role: "hr_admin",
        companyId: "GREENLEAF-2026",
    },
    {
        email: "alex.chan@zerohr.com",
        password: "demo-employee-2024",
        displayName: "Alex Chan",
        role: "employee",
        companyId: "zerohr-demo",
    },
    {
        email: "candidate@zerohr.com",
        password: "demo-candidate-2024",
        displayName: "Jordan Lee",
        role: "candidate",
        companyId: null,
    },
]

async function seed() {
    console.log("🌱 Seeding demo accounts...\n")

    // Create demo company first
    const companyRef = db.collection("companies").doc("zerohr-demo")
    const companySnap = await companyRef.get()
    if (!companySnap.exists) {
        await companyRef.set({
            name: "ZeroHR Demo Corp",
            company_code: "ZEROHR-2026",
            policy_mode: "standard",
            created_at: new Date().toISOString(),
        })
        console.log("✅ Created demo company: ZeroHR Demo Corp")
    } else {
        console.log("⏭️  Company 'ZeroHR Demo Corp' already exists")
    }

    for (const account of DEMO_ACCOUNTS) {
        let uid: string

        // 1. Create or get Firebase Auth user
        try {
            const existingUser = await auth.getUserByEmail(account.email)
            uid = existingUser.uid
            console.log(`⏭️  Auth user already exists: ${account.email} (${uid})`)

            // Update password to make sure it matches
            await auth.updateUser(uid, { password: account.password })
        } catch {
            // User doesn't exist, create it
            const newUser = await auth.createUser({
                email: account.email,
                password: account.password,
                displayName: account.displayName,
                emailVerified: true,
            })
            uid = newUser.uid
            console.log(`✅ Created Auth user: ${account.email} (${uid})`)
        }

        // 2. Create Firestore user profile
        await db.collection("users").doc(uid).set({
            email: account.email,
            full_name: account.displayName,
            role: account.role,
            company_id: account.companyId,
            job_title: account.role === "hr_admin" ? "HR Director" : account.role === "employee" ? "Software Engineer" : null,
            department: account.role === "hr_admin" ? "Human Resources" : account.role === "employee" ? "Engineering" : null,
            avatar_url: null,
            created_at: new Date().toISOString(),
        }, { merge: true })

        console.log(`✅ Firestore profile: ${account.displayName} (${account.role})`)
    }

    console.log("\n🎉 Done! Demo accounts are ready.\n")
    console.log("Login credentials:")
    console.log("──────────────────────────────────────")
    for (const a of DEMO_ACCOUNTS) {
        console.log(`  ${a.role.padEnd(12)} │ ${a.email.padEnd(28)} │ ${a.password}`)
    }
    console.log("──────────────────────────────────────")
}

seed().catch((err) => {
    console.error("Seed failed:", err)
    process.exit(1)
})
