/**
 * Seed script: Populates Firestore with mock job listings.
 *
 * Run with:  npx tsx scripts/seed-job-listings.ts
 */

import { initializeApp, cert, getApps } from "firebase-admin/app"
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

const db = getFirestore()

// ── Mock job listings ──
const JOB_LISTINGS = [
    {
        title: "Senior Frontend Developer",
        company: "TechNova Solutions",
        location: "Kuala Lumpur, Malaysia",
        type: "Full-time",
        salary_range: "RM 8,000 – RM 14,000",
        description:
            "Build and maintain modern web applications using React, Next.js, and TypeScript. Collaborate with designers and backend engineers to deliver pixel-perfect, performant user interfaces.",
        requirements: [
            "5+ years of frontend experience",
            "Proficient in React & TypeScript",
            "Experience with Next.js and TailwindCSS",
            "Strong understanding of web performance optimization",
        ],
        posted_at: new Date("2026-02-20").toISOString(),
        is_active: true,
    },
    {
        title: "Backend Engineer",
        company: "Axiom Corp",
        location: "Singapore",
        type: "Full-time",
        salary_range: "SGD 6,500 – SGD 11,000",
        description:
            "Design and implement scalable REST and GraphQL APIs. Work with cloud-native services on GCP and manage PostgreSQL / Firestore databases.",
        requirements: [
            "3+ years backend development (Node.js or Python)",
            "Experience with GCP or AWS",
            "Solid understanding of SQL and NoSQL databases",
            "Familiarity with CI/CD pipelines",
        ],
        posted_at: new Date("2026-02-18").toISOString(),
        is_active: true,
    },
    {
        title: "UI/UX Designer",
        company: "GreenLeaf Ventures",
        location: "Remote",
        type: "Contract",
        salary_range: "RM 5,000 – RM 9,000",
        description:
            "Create intuitive and visually stunning user experiences for web and mobile applications. Conduct user research, build wireframes, and deliver high-fidelity prototypes in Figma.",
        requirements: [
            "3+ years of UI/UX design experience",
            "Expert-level Figma proficiency",
            "Portfolio demonstrating mobile and web design",
            "Understanding of accessibility standards",
        ],
        posted_at: new Date("2026-02-22").toISOString(),
        is_active: true,
    },
    {
        title: "Data Analyst",
        company: "Pinnacle Analytics",
        location: "Penang, Malaysia",
        type: "Full-time",
        salary_range: "RM 5,500 – RM 9,500",
        description:
            "Transform raw data into actionable business insights. Build dashboards, automate reporting pipelines, and collaborate with stakeholders across departments.",
        requirements: [
            "2+ years of data analytics experience",
            "Proficient in SQL and Python (pandas, numpy)",
            "Experience with BI tools (Tableau, Power BI, or Looker)",
            "Strong communication and presentation skills",
        ],
        posted_at: new Date("2026-02-15").toISOString(),
        is_active: true,
    },
    {
        title: "DevOps Engineer",
        company: "CloudBridge Systems",
        location: "Kuala Lumpur, Malaysia",
        type: "Full-time",
        salary_range: "RM 9,000 – RM 15,000",
        description:
            "Architect and maintain CI/CD pipelines, container orchestration (Kubernetes), and infrastructure-as-code for a high-traffic SaaS platform.",
        requirements: [
            "4+ years DevOps / SRE experience",
            "Kubernetes, Docker, Terraform expertise",
            "Experience with GCP or AWS at scale",
            "Strong scripting skills (Bash, Python)",
        ],
        posted_at: new Date("2026-02-21").toISOString(),
        is_active: true,
    },
    {
        title: "Mobile Developer (React Native)",
        company: "TechNova Solutions",
        location: "Remote",
        type: "Full-time",
        salary_range: "RM 7,000 – RM 12,000",
        description:
            "Develop cross-platform mobile applications using React Native. Integrate with REST APIs, implement push notifications, and ensure smooth animations.",
        requirements: [
            "3+ years React Native experience",
            "Published apps on App Store and/or Google Play",
            "Understanding of native modules (iOS/Android)",
            "Experience with state management (Redux, Zustand)",
        ],
        posted_at: new Date("2026-02-23").toISOString(),
        is_active: true,
    },
    {
        title: "HR Operations Intern",
        company: "GreenLeaf Ventures",
        location: "Johor Bahru, Malaysia",
        type: "Part-time",
        salary_range: "RM 1,200 – RM 1,800",
        description:
            "Support the HR team with onboarding workflows, employee records management, and payroll preparation. Great opportunity for fresh graduates.",
        requirements: [
            "Currently pursuing or recently completed a degree in HR / Business",
            "Proficient in Microsoft Office / Google Workspace",
            "Strong organizational skills",
            "Eagerness to learn",
        ],
        posted_at: new Date("2026-02-24").toISOString(),
        is_active: true,
    },
    {
        title: "AI / ML Engineer",
        company: "Axiom Corp",
        location: "Singapore",
        type: "Contract",
        salary_range: "SGD 8,000 – SGD 14,000",
        description:
            "Research, develop, and deploy machine learning models for natural language processing and computer vision use cases. Collaborate closely with product and data teams.",
        requirements: [
            "3+ years ML engineering experience",
            "Proficient in Python, PyTorch or TensorFlow",
            "Experience deploying models to production (MLOps)",
            "Strong background in statistics and linear algebra",
        ],
        posted_at: new Date("2026-02-19").toISOString(),
        is_active: true,
    },
]

async function seed() {
    console.log("🌱 Seeding job listings...\n")

    const batch = db.batch()

    for (const job of JOB_LISTINGS) {
        const docRef = db.collection("job_listings").doc()
        batch.set(docRef, job)
    }

    await batch.commit()

    console.log(`✅ Created ${JOB_LISTINGS.length} job listings in Firestore`)
    console.log("\nListings:")
    console.log("──────────────────────────────────────")
    for (const j of JOB_LISTINGS) {
        console.log(`  ${j.title.padEnd(35)} │ ${j.company.padEnd(22)} │ ${j.type}`)
    }
    console.log("──────────────────────────────────────")
    console.log("\n🎉 Done!")
}

seed().catch((err) => {
    console.error("Seed failed:", err)
    process.exit(1)
})
