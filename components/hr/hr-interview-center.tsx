"use client"

import { useState } from "react"
import {
    Users, Search, Calendar, Star, FileText, Send, XCircle, Eye,
    ChevronRight, Clock, CheckCircle, AlertCircle, Sparkles, Mail,
    Briefcase, GraduationCap, MapPin, Phone, ArrowLeft, X,
    UserCheck, Filter, MoreHorizontal, Award, TrendingUp
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { toast } from "sonner"

// ── Types ──
interface Candidate {
    id: string
    name: string
    email: string
    phone: string
    position: string
    department: string
    stage: string
    interviewDate: string | null
    interviewer: string | null
    status: string
    appliedDate: string
    experience: string
    education: string
    location: string
    skills: string[]
    rating: number
    notes: string
    timeline: { date: string; event: string; detail: string }[]
    aiSummary: string
}

// ── Stage definitions ──
const STAGES = [
    { id: "all", label: "All Candidates", icon: Users, color: "text-slate-500" },
    { id: "applied", label: "Applied", icon: Mail, color: "text-blue-500" },
    { id: "screening", label: "Screening", icon: Filter, color: "text-cyan-500" },
    { id: "scheduled", label: "Scheduled", icon: Calendar, color: "text-indigo-500" },
    { id: "completed", label: "Completed", icon: CheckCircle, color: "text-emerald-500" },
    { id: "final_review", label: "Final Review", icon: Star, color: "text-amber-500" },
    { id: "offer_sent", label: "Offer Sent", icon: Send, color: "text-purple-500" },
    { id: "offer_accepted", label: "Offer Accepted", icon: UserCheck, color: "text-green-600" },
    { id: "rejected", label: "Rejected", icon: XCircle, color: "text-red-500" },
]

const STAGE_BADGE_COLORS: Record<string, string> = {
    applied: "bg-blue-100 text-blue-700 border-blue-200",
    screening: "bg-cyan-100 text-cyan-700 border-cyan-200",
    scheduled: "bg-indigo-100 text-indigo-700 border-indigo-200",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    final_review: "bg-amber-100 text-amber-700 border-amber-200",
    offer_sent: "bg-purple-100 text-purple-700 border-purple-200",
    offer_accepted: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
}

// ── Mock Candidates ──
const INITIAL_CANDIDATES: Candidate[] = [
    {
        id: "cand-1",
        name: "Alex Chan",
        email: "aisha.r@email.com",
        phone: "+60 12-345-6789",
        position: "Senior Frontend Developer",
        department: "Engineering",
        stage: "final_review",
        interviewDate: "Feb 12, 2026",
        interviewer: "David Wong",
        status: "Strong Hire",
        appliedDate: "Jan 28, 2026",
        experience: "6 years",
        education: "BSc Computer Science, UM",
        location: "Kuala Lumpur",
        skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js"],
        rating: 4.5,
        notes: "Excellent technical skills. Strong system design abilities. Cultural fit is great.",
        timeline: [
            { date: "Jan 28", event: "Applied", detail: "Application received via LinkedIn" },
            { date: "Jan 30", event: "Screening", detail: "Resume reviewed by HR — shortlisted" },
            { date: "Feb 3", event: "Phone Screen", detail: "30-min call with Rachel Lim" },
            { date: "Feb 7", event: "Technical Interview", detail: "90-min coding + system design with David Wong" },
            { date: "Feb 12", event: "Final Interview", detail: "Panel interview with CTO and team leads" },
        ],
        aiSummary: "Aisha is a strong candidate with 6 years of experience in frontend development. She demonstrated excellent React/TypeScript skills during the technical round, scoring in the top 10% of candidates. Her system design approach was methodical and well-structured. Team feedback is unanimously positive. Recommended for offer."
    },
    {
        id: "cand-2",
        name: "Marcus Lee",
        email: "marcus.lee@email.com",
        phone: "+60 11-222-3333",
        position: "Data Engineer",
        department: "Engineering",
        stage: "scheduled",
        interviewDate: "Feb 18, 2026",
        interviewer: "Sarah Tan",
        status: "In Progress",
        appliedDate: "Feb 5, 2026",
        experience: "4 years",
        education: "MSc Data Science, USM",
        location: "Penang",
        skills: ["Python", "SQL", "Apache Spark", "AWS", "dbt"],
        rating: 0,
        notes: "",
        timeline: [
            { date: "Feb 5", event: "Applied", detail: "Application via company website" },
            { date: "Feb 8", event: "Screening", detail: "Resume reviewed — strong academic background" },
            { date: "Feb 10", event: "Phone Screen", detail: "Passed initial screening with Sarah Tan" },
        ],
        aiSummary: "Marcus has a solid foundation in data engineering with relevant experience in Python and cloud platforms. His MSc thesis focused on real-time data pipelines, which aligns well with our needs. Pending technical assessment."
    },
    {
        id: "cand-3",
        name: "Priya Nair",
        email: "priya.n@email.com",
        phone: "+60 17-888-9999",
        position: "HR Business Partner",
        department: "Human Resources",
        stage: "applied",
        interviewDate: null,
        interviewer: null,
        status: "New",
        appliedDate: "Feb 13, 2026",
        experience: "8 years",
        education: "MBA, Taylor's University",
        location: "Kuala Lumpur",
        skills: ["Talent Management", "Employee Relations", "HRIS", "Succession Planning", "Labor Law"],
        rating: 0,
        notes: "",
        timeline: [
            { date: "Feb 13", event: "Applied", detail: "Application received via referral" },
        ],
        aiSummary: "Priya brings 8 years of HR experience across multiple industries including tech and finance. Her MBA with HR specialization and previous role as HRBP at a mid-size tech company make her a promising candidate. Recommend moving to screening."
    },
    {
        id: "cand-4",
        name: "Kevin Tan",
        email: "kevin.tan@email.com",
        phone: "+60 16-555-7777",
        position: "Product Designer",
        department: "Design",
        stage: "completed",
        interviewDate: "Feb 10, 2026",
        interviewer: "David Wong",
        status: "Under Review",
        appliedDate: "Jan 20, 2026",
        experience: "5 years",
        education: "BFA Design, Limkokwing",
        location: "Cyberjaya",
        skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility"],
        rating: 3.5,
        notes: "Good design sense but could be stronger on design systems. Portfolio shows mostly consumer apps.",
        timeline: [
            { date: "Jan 20", event: "Applied", detail: "Application via LinkedIn" },
            { date: "Jan 23", event: "Screening", detail: "Portfolio reviewed — promising" },
            { date: "Jan 28", event: "Design Challenge", detail: "Completed take-home design exercise" },
            { date: "Feb 10", event: "Final Interview", detail: "Design review + cultural fit with team" },
        ],
        aiSummary: "Kevin demonstrates strong visual design skills with a consumer-focused portfolio. His design challenge submission was creative but lacked depth in design system thinking. Overall a good candidate for mid-level role but may need mentoring on enterprise design patterns."
    },
    {
        id: "cand-5",
        name: "Jessica Loh",
        email: "jessica.loh@email.com",
        phone: "+60 19-444-6666",
        position: "Backend Developer",
        department: "Engineering",
        stage: "screening",
        interviewDate: null,
        interviewer: null,
        status: "Resume Review",
        appliedDate: "Feb 11, 2026",
        experience: "3 years",
        education: "BSc Software Engineering, UTM",
        location: "Johor Bahru",
        skills: ["Go", "PostgreSQL", "Docker", "Kubernetes", "gRPC"],
        rating: 0,
        notes: "",
        timeline: [
            { date: "Feb 11", event: "Applied", detail: "Application via job board" },
            { date: "Feb 13", event: "Screening", detail: "Resume under review" },
        ],
        aiSummary: "Jessica has 3 years of backend experience with a strong focus on Go and cloud-native technologies. Her GitHub shows active open-source contributions to container orchestration tools. Entry-level to mid-level candidate with high growth potential."
    },
    {
        id: "cand-6",
        name: "Ahmad Zulkifli",
        email: "ahmad.z@email.com",
        phone: "+60 13-111-2222",
        position: "DevOps Engineer",
        department: "Engineering",
        stage: "offer_sent",
        interviewDate: "Feb 5, 2026",
        interviewer: "David Wong",
        status: "Awaiting Response",
        appliedDate: "Jan 15, 2026",
        experience: "7 years",
        education: "BSc IT, UNITAR",
        location: "Shah Alam",
        skills: ["AWS", "Terraform", "CI/CD", "Kubernetes", "Monitoring"],
        rating: 4.8,
        notes: "Outstanding candidate. Deep AWS expertise. Team strongly recommends.",
        timeline: [
            { date: "Jan 15", event: "Applied", detail: "Direct application" },
            { date: "Jan 18", event: "Screening", detail: "Resume reviewed — exceptional" },
            { date: "Jan 22", event: "Technical Interview", detail: "Infra design + hands-on with David Wong" },
            { date: "Jan 30", event: "Final Interview", detail: "Culture fit + VP review" },
            { date: "Feb 5", event: "Offer Sent", detail: "Offer letter sent — RM 12,000/month" },
        ],
        aiSummary: "Ahmad is an exceptional DevOps engineer with 7 years of hands-on experience. He scored 4.8/5 across all interviews. His infrastructure design skills are senior-level and he demonstrated strong leadership potential. Highly recommended — offer has been extended."
    },
    {
        id: "cand-7",
        name: "Diana Chong",
        email: "diana.c@email.com",
        phone: "+60 14-333-4444",
        position: "QA Engineer",
        department: "Engineering",
        stage: "rejected",
        interviewDate: "Feb 1, 2026",
        interviewer: "Sarah Tan",
        status: "Not Suitable",
        appliedDate: "Jan 10, 2026",
        experience: "2 years",
        education: "Diploma IT, TARC",
        location: "Petaling Jaya",
        skills: ["Manual Testing", "Selenium", "JIRA"],
        rating: 2.0,
        notes: "Limited automation experience. Did not meet technical bar for the role.",
        timeline: [
            { date: "Jan 10", event: "Applied", detail: "Application via referral" },
            { date: "Jan 14", event: "Screening", detail: "Resume screened — borderline" },
            { date: "Feb 1", event: "Technical Interview", detail: "QA assessment — below expectations" },
            { date: "Feb 3", event: "Rejected", detail: "Did not meet automation requirements" },
        ],
        aiSummary: "Diana has 2 years of QA experience primarily in manual testing. During the technical assessment, she showed limited proficiency with test automation frameworks. While she demonstrated good attention to detail, the role requires strong automation skills. Not recommended for this position."
    },
]

// ═══════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════
export function HrInterviewCenter({ onNavigate }: { onNavigate?: (page: string) => void }) {
    const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES)
    const [activeStage, setActiveStage] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
    const [showOfferModal, setShowOfferModal] = useState(false)
    const [offerCandidate, setOfferCandidate] = useState<Candidate | null>(null)
    const [showPreview, setShowPreview] = useState(false)

    // Offer form state
    const [offerForm, setOfferForm] = useState({
        position: "",
        salary: "",
        startDate: "",
        benefits: "Medical, Dental, Vision, EPF, SOCSO, Annual Leave (14 days)",
        contractType: "permanent",
        probation: "3",
    })

    // ── Filter candidates ──
    const filteredCandidates = candidates.filter(c => {
        const matchesStage = activeStage === "all" || c.stage === activeStage
        const matchesSearch = !searchQuery ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.position.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStage && matchesSearch
    })

    // ── Stage counts ──
    const getStageCounts = (stageId: string) => {
        if (stageId === "all") return candidates.length
        return candidates.filter(c => c.stage === stageId).length
    }

    // ── Star rating display ──
    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                    <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i <= Math.floor(rating) ? "fill-amber-400 text-amber-400" : i - 0.5 <= rating ? "fill-amber-400/50 text-amber-400" : "text-muted-foreground/30"}`}
                    />
                ))}
                {rating > 0 && <span className="text-xs text-muted-foreground ml-1">{rating}</span>}
            </div>
        )
    }

    // ── Get action buttons based on stage ──
    const getActions = (candidate: Candidate) => {
        const actions: { label: string; icon: any; variant: any; onClick: () => void }[] = [
            {
                label: "View",
                icon: Eye,
                variant: "outline" as const,
                onClick: () => setSelectedCandidate(candidate)
            }
        ]

        switch (candidate.stage) {
            case "applied":
            case "screening":
                actions.push({
                    label: "Schedule",
                    icon: Calendar,
                    variant: "outline" as const,
                    onClick: () => {
                        setCandidates(prev => prev.map(c =>
                            c.id === candidate.id ? {
                                ...c,
                                stage: "scheduled",
                                interviewDate: "Feb 20, 2026",
                                interviewer: "David Wong",
                                status: "Scheduled",
                                timeline: [...c.timeline, { date: "Feb 15", event: "Interview Scheduled", detail: "Scheduled for Feb 20 with David Wong" }]
                            } : c
                        ))
                        toast.success("Interview Scheduled", { description: `${candidate.name} — Feb 20, 2026 with David Wong` })
                    }
                })
                break
            case "scheduled":
                actions.push({
                    label: "Start",
                    icon: CheckCircle,
                    variant: "outline" as const,
                    onClick: () => {
                        setCandidates(prev => prev.map(c =>
                            c.id === candidate.id ? {
                                ...c,
                                stage: "completed",
                                status: "Under Review",
                                timeline: [...c.timeline, { date: "Feb 15", event: "Interview Completed", detail: "Interview conducted by " + c.interviewer }]
                            } : c
                        ))
                        toast.success("Interview marked as completed")
                    }
                })
                break
            case "completed":
            case "final_review":
                actions.push({
                    label: "Send Offer",
                    icon: Send,
                    variant: "default" as const,
                    onClick: () => {
                        setOfferCandidate(candidate)
                        setOfferForm(prev => ({ ...prev, position: candidate.position }))
                        setShowOfferModal(true)
                    }
                })
                break
        }

        if (candidate.stage !== "rejected" && candidate.stage !== "offer_accepted") {
            actions.push({
                label: "Reject",
                icon: XCircle,
                variant: "ghost" as const,
                onClick: () => {
                    setCandidates(prev => prev.map(c =>
                        c.id === candidate.id ? {
                            ...c,
                            stage: "rejected",
                            status: "Rejected",
                            timeline: [...c.timeline, { date: "Feb 15", event: "Rejected", detail: "Candidate rejected by HR" }]
                        } : c
                    ))
                    toast("Candidate rejected", { description: candidate.name })
                }
            })
        }
        return actions
    }

    // ── Send Offer ──
    const handleSendOffer = () => {
        if (!offerCandidate) return

        // Update candidate stage
        setCandidates(prev => prev.map(c =>
            c.id === offerCandidate.id ? {
                ...c,
                stage: "offer_sent",
                status: "Awaiting Response",
                timeline: [...c.timeline, {
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    event: "Offer Sent",
                    detail: `Offer letter sent — RM ${Number(offerForm.salary).toLocaleString()}/month`
                }]
            } : c
        ))

        // Store in localStorage for employee-side popup (cross-tab)
        const events = JSON.parse(localStorage.getItem('global_events') || '{}')
        localStorage.setItem('global_events', JSON.stringify({
            ...events,
            offer_letter_received: true,
            offer_letter_viewed: false,
            offer_details: {
                candidateName: offerCandidate.name,
                position: offerForm.position,
                salary: offerForm.salary,
                startDate: offerForm.startDate,
                benefits: offerForm.benefits,
                contractType: offerForm.contractType,
                probation: offerForm.probation,
                sentAt: new Date().toISOString(),
            }
        }))

        // Also push a notification
        const notifs = JSON.parse(localStorage.getItem('notifications') || '[]')
        notifs.push({
            id: Math.random().toString(36).substr(2, 9),
            type: 'document',
            employee: offerCandidate.name,
            title: `Offer Letter: ${offerForm.position}`,
            message: `You have received an offer letter for the ${offerForm.position} position. Salary: RM ${Number(offerForm.salary).toLocaleString()}/month. Please review and respond.`,
            timestamp: new Date().toISOString(),
            read: false
        })
        localStorage.setItem('notifications', JSON.stringify(notifs))

        setShowOfferModal(false)
        setShowPreview(false)
        setOfferCandidate(null)
        toast.success("Offer Letter Sent!", {
            description: `Offer sent to ${offerCandidate.name} for ${offerForm.position}`
        })
    }

    // ══════ CANDIDATE DETAIL PANEL ══════
    if (selectedCandidate) {
        return (
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedCandidate(null)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <Avatar className="h-14 w-14">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-bold">
                                {selectedCandidate.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold">{selectedCandidate.name}</h1>
                            <p className="text-muted-foreground">{selectedCandidate.position} · {selectedCandidate.department}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className={`${STAGE_BADGE_COLORS[selectedCandidate.stage]} border`}>
                            {STAGES.find(s => s.id === selectedCandidate.stage)?.label}
                        </Badge>
                        {(selectedCandidate.stage === "completed" || selectedCandidate.stage === "final_review") && (
                            <Button
                                className="gap-2"
                                onClick={() => {
                                    setOfferCandidate(selectedCandidate)
                                    setOfferForm(prev => ({ ...prev, position: selectedCandidate.position }))
                                    setShowOfferModal(true)
                                }}
                            >
                                <Send className="h-4 w-4" />
                                Send Offer
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Profile + AI Summary */}
                    <div className="space-y-6">
                        {/* Profile Card */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="truncate">{selectedCandidate.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>{selectedCandidate.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>{selectedCandidate.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>{selectedCandidate.experience} experience</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span>{selectedCandidate.education}</span>
                                </div>

                                <div className="pt-2">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Skills</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedCandidate.skills.map(s => (
                                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Summary */}
                        <Card className="border-purple-200/50 bg-purple-50/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-purple-500" />
                                    AI Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed text-muted-foreground">{selectedCandidate.aiSummary}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Middle: Timeline */}
                    <div>
                        <Card className="h-full">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Interview Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
                                    <div className="space-y-6">
                                        {selectedCandidate.timeline.map((item, i) => (
                                            <div key={i} className="flex gap-4 relative">
                                                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${i === selectedCandidate.timeline.length - 1 ? "border-blue-500 bg-blue-500" : "border-muted-foreground/30 bg-background"}`}>
                                                    {i === selectedCandidate.timeline.length - 1 && <CheckCircle className="h-3 w-3 text-white" />}
                                                </div>
                                                <div className="pb-1">
                                                    <p className="text-sm font-medium">{item.event}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                                                    <p className="text-[11px] text-muted-foreground/60 mt-1">{item.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Scorecard + Notes */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Award className="h-4 w-4 text-amber-500" />
                                    Scorecard
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedCandidate.rating > 0 ? (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Overall Rating</span>
                                            {renderStars(selectedCandidate.rating)}
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { label: "Technical Skills", score: Math.min(5, selectedCandidate.rating + 0.2) },
                                                { label: "Communication", score: Math.min(5, selectedCandidate.rating - 0.3) },
                                                { label: "Problem Solving", score: selectedCandidate.rating },
                                                { label: "Cultural Fit", score: Math.min(5, selectedCandidate.rating + 0.1) },
                                            ].map(item => (
                                                <div key={item.label}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs text-muted-foreground">{item.label}</span>
                                                        <span className="text-xs font-medium">{item.score.toFixed(1)}/5</span>
                                                    </div>
                                                    <div className="w-full bg-secondary rounded-full h-1.5">
                                                        <div
                                                            className="bg-amber-400 h-1.5 rounded-full transition-all"
                                                            style={{ width: `${(item.score / 5) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No scores yet</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Evaluation Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedCandidate.notes ? (
                                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedCandidate.notes}</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No notes added</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Offer Modal (lives here too so it can be accessed from detail view) */}
                {renderOfferModal()}
            </div>
        )
    }

    // ── Offer Modal render function ──
    function renderOfferModal() {
        return (
            <Dialog open={showOfferModal} onOpenChange={(v) => { setShowOfferModal(v); if (!v) setShowPreview(false) }}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-primary" />
                            Send Offer Letter
                        </DialogTitle>
                        <DialogDescription>
                            Prepare and send an offer letter to {offerCandidate?.name}
                        </DialogDescription>
                    </DialogHeader>

                    {!showPreview ? (
                        /* ── FORM ── */
                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Position</Label>
                                    <Input
                                        value={offerForm.position}
                                        onChange={e => setOfferForm(p => ({ ...p, position: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Monthly Salary (MYR)</Label>
                                    <Input
                                        type="number"
                                        value={offerForm.salary}
                                        onChange={e => setOfferForm(p => ({ ...p, salary: e.target.value }))}
                                        placeholder="e.g. 8000"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input
                                        type="date"
                                        value={offerForm.startDate}
                                        onChange={e => setOfferForm(p => ({ ...p, startDate: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Contract Type</Label>
                                    <Select value={offerForm.contractType} onValueChange={v => setOfferForm(p => ({ ...p, contractType: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="permanent">Permanent</SelectItem>
                                            <SelectItem value="fixed_term">Fixed Term</SelectItem>
                                            <SelectItem value="contract">Contract</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Probation Period (months)</Label>
                                    <Select value={offerForm.probation} onValueChange={v => setOfferForm(p => ({ ...p, probation: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">No Probation</SelectItem>
                                            <SelectItem value="3">3 Months</SelectItem>
                                            <SelectItem value="6">6 Months</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Benefits Package</Label>
                                <Textarea
                                    value={offerForm.benefits}
                                    onChange={e => setOfferForm(p => ({ ...p, benefits: e.target.value }))}
                                    rows={3}
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button variant="outline" onClick={() => { setShowOfferModal(false); setShowPreview(false) }}>Cancel</Button>
                                <Button
                                    onClick={() => setShowPreview(true)}
                                    disabled={!offerForm.salary || !offerForm.startDate}
                                    className="gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    Preview Offer Letter
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        /* ── PDF PREVIEW ── */
                        <div className="space-y-4 py-2">
                            <div className="border rounded-lg p-8 bg-white text-slate-800 space-y-6 shadow-inner">
                                {/* Letterhead */}
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm">Z</div>
                                        <div>
                                            <p className="font-bold text-lg">ZeroHR Sdn Bhd</p>
                                            <p className="text-xs text-slate-500">Kuala Lumpur, Malaysia</p>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-slate-500">
                                        <p>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                        <p>Ref: ZHR/OL/{new Date().getFullYear()}/{Math.floor(Math.random() * 900 + 100)}</p>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-4 text-sm">
                                    <p>Dear <strong>{offerCandidate?.name}</strong>,</p>
                                    <p>We are delighted to extend this offer of employment for the position of <strong>{offerForm.position}</strong> at ZeroHR Sdn Bhd. We were impressed with your qualifications and believe you will be a valuable addition to our team.</p>

                                    <div className="bg-slate-50 rounded-lg p-4 space-y-2 border">
                                        <p className="font-semibold text-slate-900">Terms of Employment</p>
                                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                                            <span className="text-slate-500">Position:</span>
                                            <span className="font-medium">{offerForm.position}</span>
                                            <span className="text-slate-500">Monthly Salary:</span>
                                            <span className="font-medium">RM {Number(offerForm.salary).toLocaleString()}</span>
                                            <span className="text-slate-500">Start Date:</span>
                                            <span className="font-medium">{new Date(offerForm.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                            <span className="text-slate-500">Contract Type:</span>
                                            <span className="font-medium capitalize">{offerForm.contractType.replace("_", " ")}</span>
                                            <span className="text-slate-500">Probation:</span>
                                            <span className="font-medium">{offerForm.probation === "0" ? "None" : offerForm.probation + " months"}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="font-semibold text-slate-900 mb-1">Benefits</p>
                                        <p className="text-slate-600">{offerForm.benefits}</p>
                                    </div>

                                    <p>Please indicate your acceptance of this offer by signing below or responding to this letter by <strong>{new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>.</p>

                                    <div className="pt-4 space-y-6">
                                        <div>
                                            <p className="text-slate-500 text-xs mb-1">For ZeroHR Sdn Bhd</p>
                                            <p className="font-bold">Rachel Lim</p>
                                            <p className="text-xs text-slate-500">HR Manager</p>
                                        </div>
                                        <div className="border-t pt-4">
                                            <p className="text-slate-500 text-xs mb-1">Candidate Acceptance</p>
                                            <div className="border-b border-dashed border-slate-300 w-48 h-8" />
                                            <p className="text-xs text-slate-400 mt-1">{offerCandidate?.name} · Date: ___________</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button variant="outline" onClick={() => setShowPreview(false)} className="gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Edit Details
                                </Button>
                                <Button onClick={handleSendOffer} className="gap-2 bg-green-600 hover:bg-green-700">
                                    <Send className="h-4 w-4" />
                                    Send Offer Letter
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        )
    }

    // ══════ MAIN VIEW ══════
    return (
        <div className="flex h-full">
            {/* ── Stage Sidebar ── */}
            <aside className="w-56 border-r bg-card/50 shrink-0">
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-sm text-muted-foreground">Interview Stages</h3>
                </div>
                <ScrollArea className="h-[calc(100%-52px)]">
                    <div className="p-2 space-y-0.5">
                        {STAGES.map(stage => {
                            const count = getStageCounts(stage.id)
                            const Icon = stage.icon
                            return (
                                <button
                                    key={stage.id}
                                    onClick={() => setActiveStage(stage.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${activeStage === stage.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary/80 text-muted-foreground"}`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Icon className={`h-4 w-4 ${activeStage === stage.id ? "text-primary" : stage.color}`} />
                                        <span>{stage.label}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${activeStage === stage.id ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                                        {count}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </ScrollArea>
            </aside>

            {/* ── Main Content ── */}
            <div className="flex-1 p-6 overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            {onNavigate && (
                                <Button variant="ghost" size="icon" onClick={() => onNavigate("dashboard")} className="shrink-0">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold">Interview Center</h1>
                                <p className="text-muted-foreground text-sm">Manage candidates across all interview stages</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search candidates..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total Candidates", value: candidates.length, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                        { label: "Active Interviews", value: candidates.filter(c => ["scheduled", "completed", "final_review"].includes(c.stage)).length, icon: Calendar, color: "text-indigo-500", bg: "bg-indigo-50" },
                        { label: "Offers Pending", value: candidates.filter(c => c.stage === "offer_sent").length, icon: Send, color: "text-purple-500", bg: "bg-purple-50" },
                        { label: "Hired", value: candidates.filter(c => c.stage === "offer_accepted").length, icon: UserCheck, color: "text-green-500", bg: "bg-green-50" },
                    ].map(stat => (
                        <Card key={stat.label}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Candidates Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Candidate</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Position</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Stage</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Interview</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Interviewer</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rating</th>
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCandidates.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-12 text-muted-foreground">
                                                No candidates in this stage
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCandidates.map(candidate => (
                                            <tr
                                                key={candidate.id}
                                                className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                                                onClick={() => setSelectedCandidate(candidate)}
                                            >
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 text-xs font-semibold">
                                                                {candidate.name.split(" ").map(n => n[0]).join("")}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{candidate.name}</p>
                                                            <p className="text-xs text-muted-foreground">{candidate.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-medium">{candidate.position}</p>
                                                    <p className="text-xs text-muted-foreground">{candidate.department}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge className={`${STAGE_BADGE_COLORS[candidate.stage]} border text-xs`}>
                                                        {STAGES.find(s => s.id === candidate.stage)?.label}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm">{candidate.interviewDate || "—"}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm">{candidate.interviewer || "—"}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {candidate.rating > 0 ? renderStars(candidate.rating) : <span className="text-xs text-muted-foreground">—</span>}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                                                        {getActions(candidate).map((action, i) => {
                                                            const ActionIcon = action.icon
                                                            return (
                                                                <Button
                                                                    key={i}
                                                                    variant={action.variant}
                                                                    size="sm"
                                                                    className={`gap-1.5 text-xs h-8 ${action.variant === "ghost" && action.label === "Reject" ? "text-red-500 hover:text-red-600 hover:bg-red-50" : ""}`}
                                                                    onClick={action.onClick}
                                                                >
                                                                    <ActionIcon className="h-3.5 w-3.5" />
                                                                    {action.label}
                                                                </Button>
                                                            )
                                                        })}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Offer Modal */}
            {renderOfferModal()}
        </div>
    )
}
