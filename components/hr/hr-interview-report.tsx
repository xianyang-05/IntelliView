"use client"

import { useState } from "react"
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    FileText,
    Code,
    Shield,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReportData {
    report_id: string
    generated_at: string
    candidate: {
        session_id: string
        job_title: string
        interview_date: string
        interview_duration_minutes: number
    }
    scores: {
        final_score: number
        decision: "PASS" | "BORDERLINE" | "FAIL"
        recommendation: string
        breakdown: Record<string, { raw: number; weight: number; weighted: number }>
    }
    executive_summary: string
    qa_performance: {
        score: number
        strengths: string[]
        weaknesses: string[]
        per_question: Array<{
            question: string
            answer_summary: string
            score: number
            feedback: string
        }>
    }
    coding_assessment: {
        combined_score: number
        correctness_score: number
        quality_score: number
        time_complexity: string
        space_complexity: string
        feedback: string
    }
    integrity_report: {
        score: number
        violations_count: number
        critical_flags: string[]
        breakdown: {
            browser_deductions: number
            mediapipe_deductions: number
            vision_deductions: number
        }
    }
    communication_skills: {
        score: number
        clarity: number
        confidence: number
        professionalism: number
        feedback: string
    }
}

interface HrInterviewReportProps {
    report: ReportData
    onClose: () => void
}

export function HrInterviewReport({ report, onClose }: HrInterviewReportProps) {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        qa: true,
        coding: false,
        integrity: false,
        communication: false,
    })

    const toggleSection = (key: string) => {
        setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    const decisionConfig = {
        PASS: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", label: "PASS" },
        BORDERLINE: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", label: "BORDERLINE" },
        FAIL: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", label: "FAIL" },
    }

    const dc = decisionConfig[report.scores.decision] || decisionConfig.FAIL

    const ScoreBar = ({ score, label }: { score: number; label: string }) => (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-gray-400">{label}</span>
                <span className="text-white font-medium">{score}/100</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${
                        score >= 70 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    )

    const SectionHeader = ({ title, icon: Icon, sectionKey, score }: {
        title: string; icon: any; sectionKey: string; score: number
    }) => (
        <button
            onClick={() => toggleSection(sectionKey)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors rounded-lg"
        >
            <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-blue-400" />
                <span className="text-white font-medium">{title}</span>
            </div>
            <div className="flex items-center gap-3">
                <span className={`text-sm font-semibold ${
                    score >= 70 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-red-400"
                }`}>
                    {score}/100
                </span>
                {expandedSections[sectionKey] ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
            </div>
        </button>
    )

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Interview Report</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {report.candidate.job_title} &middot; {report.candidate.interview_date}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-300 border-gray-600"
                        onClick={() => {
                            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
                            window.open(`${backendUrl}/api/report/${report.report_id}`, "_blank")
                        }}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>

            {/* Decision Card */}
            <div className={`${dc.bg} ${dc.border} border rounded-xl p-6`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <dc.icon className={`h-12 w-12 ${dc.color}`} />
                        <div>
                            <div className={`text-3xl font-bold ${dc.color}`}>
                                {report.scores.final_score}/100
                            </div>
                            <div className={`text-sm font-semibold ${dc.color}`}>
                                {dc.label}
                            </div>
                        </div>
                    </div>
                    <div className="text-right max-w-xs">
                        <p className="text-gray-300 text-sm">{report.scores.recommendation}</p>
                    </div>
                </div>
            </div>

            {/* Executive Summary */}
            <div className="bg-[#292b2e] rounded-xl p-5">
                <h3 className="text-white font-semibold mb-2">Executive Summary</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{report.executive_summary}</p>
            </div>

            {/* Score Breakdown */}
            <div className="bg-[#292b2e] rounded-xl p-5 space-y-4">
                <h3 className="text-white font-semibold">Score Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                    <ScoreBar score={report.qa_performance.score} label="Q&A (40%)" />
                    <ScoreBar score={report.coding_assessment.combined_score} label="Coding (30%)" />
                    <ScoreBar score={report.integrity_report.score} label="Integrity (20%)" />
                    <ScoreBar score={report.communication_skills.score} label="Communication (10%)" />
                </div>
            </div>

            {/* Expandable Sections */}
            <div className="bg-[#292b2e] rounded-xl divide-y divide-gray-700">
                {/* Q&A Section */}
                <div>
                    <SectionHeader title="Interview Q&A" icon={FileText} sectionKey="qa" score={report.qa_performance.score} />
                    {expandedSections.qa && (
                        <div className="px-4 pb-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-green-400 text-xs font-semibold mb-2">Strengths</h4>
                                    {report.qa_performance.strengths.map((s, i) => (
                                        <p key={i} className="text-gray-300 text-xs mb-1">• {s}</p>
                                    ))}
                                </div>
                                <div>
                                    <h4 className="text-red-400 text-xs font-semibold mb-2">Weaknesses</h4>
                                    {report.qa_performance.weaknesses.map((w, i) => (
                                        <p key={i} className="text-gray-300 text-xs mb-1">• {w}</p>
                                    ))}
                                </div>
                            </div>
                            {report.qa_performance.per_question.map((q, i) => (
                                <div key={i} className="bg-[#202124] rounded-lg p-3">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-white text-xs font-medium">Q{i + 1}: {q.question}</p>
                                        <span className={`text-xs font-semibold ${
                                            q.score >= 70 ? "text-green-400" : q.score >= 50 ? "text-yellow-400" : "text-red-400"
                                        }`}>{q.score}</span>
                                    </div>
                                    <p className="text-gray-400 text-xs mb-1">{q.answer_summary}</p>
                                    <p className="text-blue-400 text-xs">{q.feedback}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Coding Section */}
                <div>
                    <SectionHeader title="Coding Assessment" icon={Code} sectionKey="coding" score={report.coding_assessment.combined_score} />
                    {expandedSections.coding && (
                        <div className="px-4 pb-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#202124] rounded-lg p-3">
                                    <p className="text-gray-400 text-xs">Correctness</p>
                                    <p className="text-white text-lg font-bold">{report.coding_assessment.correctness_score}/100</p>
                                </div>
                                <div className="bg-[#202124] rounded-lg p-3">
                                    <p className="text-gray-400 text-xs">Code Quality</p>
                                    <p className="text-white text-lg font-bold">{report.coding_assessment.quality_score}/100</p>
                                </div>
                                <div className="bg-[#202124] rounded-lg p-3">
                                    <p className="text-gray-400 text-xs">Time Complexity</p>
                                    <p className="text-white text-sm font-mono">{report.coding_assessment.time_complexity}</p>
                                </div>
                                <div className="bg-[#202124] rounded-lg p-3">
                                    <p className="text-gray-400 text-xs">Space Complexity</p>
                                    <p className="text-white text-sm font-mono">{report.coding_assessment.space_complexity}</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-xs">{report.coding_assessment.feedback}</p>
                        </div>
                    )}
                </div>

                {/* Integrity Section */}
                <div>
                    <SectionHeader title="Proctoring & Integrity" icon={Shield} sectionKey="integrity" score={report.integrity_report.score} />
                    {expandedSections.integrity && (
                        <div className="px-4 pb-4 space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-[#202124] rounded-lg p-3 text-center">
                                    <p className="text-gray-400 text-xs">Violations</p>
                                    <p className="text-white text-lg font-bold">{report.integrity_report.violations_count}</p>
                                </div>
                                <div className="bg-[#202124] rounded-lg p-3 text-center">
                                    <p className="text-gray-400 text-xs">Browser</p>
                                    <p className="text-red-400 text-lg font-bold">-{report.integrity_report.breakdown.browser_deductions}</p>
                                </div>
                                <div className="bg-[#202124] rounded-lg p-3 text-center">
                                    <p className="text-gray-400 text-xs">Vision AI</p>
                                    <p className="text-red-400 text-lg font-bold">-{report.integrity_report.breakdown.vision_deductions}</p>
                                </div>
                            </div>
                            {report.integrity_report.critical_flags.length > 0 && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                    <h4 className="text-red-400 text-xs font-semibold mb-2">Critical Flags</h4>
                                    {report.integrity_report.critical_flags.map((f, i) => (
                                        <p key={i} className="text-red-300 text-xs mb-1">🔴 {f}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Communication Section */}
                <div>
                    <SectionHeader title="Communication Skills" icon={MessageSquare} sectionKey="communication" score={report.communication_skills.score} />
                    {expandedSections.communication && (
                        <div className="px-4 pb-4 space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <ScoreBar score={report.communication_skills.clarity} label="Clarity" />
                                <ScoreBar score={report.communication_skills.confidence} label="Confidence" />
                                <ScoreBar score={report.communication_skills.professionalism} label="Professionalism" />
                            </div>
                            <p className="text-gray-300 text-xs">{report.communication_skills.feedback}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <p className="text-gray-500 text-xs text-center">
                Report generated by IntelliView AI &middot; {report.report_id}
            </p>
        </div>
    )
}
