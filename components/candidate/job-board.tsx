"use client"

import { useState, useEffect } from "react"
import {
    Search,
    MapPin,
    Building2,
    Clock,
    Briefcase,
    DollarSign,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Filter,
    Loader2,
    ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"

// ─── Types ───────────────────────────────────────────
interface JobListing {
    id: string
    title: string
    company: string
    company_code: string
    location: string
    type: string
    salary_range: string
    description: string
    requirements: string[]
    posted_at: string
    is_active: boolean
}

const FILTER_OPTIONS = ["All", "Full-time", "Part-time", "Contract", "Remote"]

function getTypeBadgeStyle(type: string) {
    switch (type) {
        case "Full-time":
            return "bg-emerald-100 text-emerald-700 border-emerald-200"
        case "Part-time":
            return "bg-amber-100 text-amber-700 border-amber-200"
        case "Contract":
            return "bg-violet-100 text-violet-700 border-violet-200"
        default:
            return "bg-slate-100 text-slate-700 border-slate-200"
    }
}

function getCompanyGradient(company: string) {
    const gradients: Record<string, string> = {
        "TechNova Solutions": "from-blue-500 to-cyan-500",
        "Axiom Corp": "from-violet-500 to-purple-500",
        "GreenLeaf Ventures": "from-emerald-500 to-teal-500",
        "Pinnacle Analytics": "from-orange-500 to-amber-500",
        "CloudBridge Systems": "from-indigo-500 to-blue-500",
    }
    return gradients[company] || "from-slate-500 to-slate-600"
}

function timeAgo(dateStr: string) {
    const now = new Date()
    const past = new Date(dateStr)
    const diffMs = now.getTime() - past.getTime()
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`
}

// ═════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════
export function JobBoard({ onNavigate }: { onNavigate?: (page: string, payload?: any) => void }) {
    const [jobs, setJobs] = useState<JobListing[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeFilter, setActiveFilter] = useState("All")
    const [expandedJob, setExpandedJob] = useState<string | null>(null)

    // ─── Fetch from Firestore ───────────────────────
    useEffect(() => {
        async function fetchJobs() {
            try {
                const q = query(
                    collection(db, "job_listings"),
                    where("is_active", "==", true)
                )
                const snapshot = await getDocs(q)
                const listings: JobListing[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as JobListing[]

                // Sort by posted_at descending (newest first)
                listings.sort(
                    (a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
                )

                setJobs(listings)
            } catch (err) {
                console.error("Failed to fetch job listings:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchJobs()
    }, [])

    // ─── Filtering logic ────────────────────────────
    const filteredJobs = jobs.filter((job) => {
        const matchesSearch =
            searchQuery.trim() === "" ||
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.location.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter =
            activeFilter === "All" ||
            job.type === activeFilter ||
            (activeFilter === "Remote" && job.location.toLowerCase().includes("remote"))

        return matchesSearch && matchesFilter
    })

    // ═════════════════════════════════════════════════
    // RENDER
    // ═════════════════════════════════════════════════
    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
                <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-3 max-w-2xl">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                <Briefcase className="h-6 w-6" />
                            </div>
                            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                Job Opportunities
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Explore the Job Market</h1>
                        <p className="text-white/80 text-lg leading-relaxed">
                            Browse open positions across top companies. Find the perfect role, then submit your resume for AI-powered screening.
                        </p>
                    </div>
                    <div className="hidden lg:flex items-center justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-150" />
                            <div className="relative p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                                <Briefcase className="h-20 w-20 text-white/90 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search by job title, company, or location..."
                        className="pl-12 h-12 text-base rounded-xl border-muted-foreground/20 focus:border-indigo-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    {FILTER_OPTIONS.map((filter) => (
                        <Button
                            key={filter}
                            variant={activeFilter === filter ? "default" : "outline"}
                            size="sm"
                            className={`rounded-full transition-all ${
                                activeFilter === filter
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                                    : "hover:border-indigo-300 hover:text-indigo-600"
                            }`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                    <p className="text-muted-foreground text-sm">Loading job listings...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredJobs.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                            <Search className="h-8 w-8 text-indigo-400" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="font-semibold text-lg">No jobs found</p>
                            <p className="text-muted-foreground text-sm">
                                Try adjusting your search or filters to find more opportunities.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="rounded-full"
                            onClick={() => {
                                setSearchQuery("")
                                setActiveFilter("All")
                            }}
                        >
                            Clear Filters
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Job Listings Grid */}
            {!loading && filteredJobs.length > 0 && (
                <div className="space-y-4">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredJobs.map((job) => {
                            const isExpanded = expandedJob === job.id
                            return (
                                <Card
                                    key={job.id}
                                    className={`overflow-hidden transition-all duration-300 hover:shadow-lg group ${
                                        isExpanded ? "shadow-lg ring-2 ring-indigo-200" : ""
                                    }`}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                {/* Company Avatar */}
                                                <div
                                                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getCompanyGradient(
                                                        job.company
                                                    )} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm group-hover:scale-110 transition-transform`}
                                                >
                                                    {job.company
                                                        .split(" ")
                                                        .map((w) => w[0])
                                                        .join("")
                                                        .slice(0, 2)}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base leading-tight">
                                                        {job.title}
                                                    </CardTitle>
                                                    <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                                                        <Building2 className="h-3.5 w-3.5" />
                                                        {job.company}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`shrink-0 text-xs ${getTypeBadgeStyle(job.type)}`}
                                            >
                                                {job.type}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        {/* Meta Info */}
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="h-3.5 w-3.5" />
                                                {job.salary_range}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                {timeAgo(job.posted_at)}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                            {job.description}
                                        </p>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="space-y-3 pt-2 border-t animate-in slide-in-from-top-2 duration-200">
                                                <div>
                                                    <p className="text-sm font-semibold mb-2">Requirements</p>
                                                    <ul className="space-y-1.5">
                                                        {job.requirements.map((req, i) => (
                                                            <li
                                                                key={i}
                                                                className="flex items-start gap-2 text-sm text-muted-foreground"
                                                            >
                                                                <Sparkles className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />
                                                                {req}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <Button
                                                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg font-semibold rounded-xl gap-2"
                                                    onClick={() => onNavigate?.("candidate-home", job)}
                                                >
                                                    Apply Now
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                        {/* Toggle Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg gap-1"
                                            onClick={() =>
                                                setExpandedJob(isExpanded ? null : job.id)
                                            }
                                        >
                                            {isExpanded ? (
                                                <>
                                                    Show Less <ChevronUp className="h-4 w-4" />
                                                </>
                                            ) : (
                                                <>
                                                    View Details <ChevronDown className="h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
