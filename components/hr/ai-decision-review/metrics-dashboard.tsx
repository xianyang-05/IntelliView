import { Brain, Clock, Sparkles, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AIDecision } from "./types"

interface MetricsDashboardProps {
    decisions: AIDecision[]
}

export function MetricsDashboard({ decisions }: MetricsDashboardProps) {
    const pendingCount = decisions.filter((d) => d.status === "pending" || d.status === "flagged").length
    const avgConfidence = decisions.length > 0 ? Math.round(decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length) : 0
    const avgBias = decisions.length > 0 ? Math.round(decisions.reduce((sum, d) => sum + d.biasScore, 0) / decisions.length) : 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white shadow-lg">
                            <Brain className="h-6 w-6" />
                        </div>
                        AI Decision Review
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Review and approve AI-generated recommendations across hiring, performance, and compensation decisions.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-3 py-1.5 text-sm bg-amber-50 text-amber-700 border-amber-200">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        {pendingCount} Pending
                    </Badge>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">Total Decisions</p>
                                <p className="text-3xl font-bold text-violet-900 mt-1">{decisions.length}</p>
                            </div>
                            <div className="p-3 bg-violet-100 rounded-xl">
                                <Brain className="h-5 w-5 text-violet-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Pending Review</p>
                                <p className="text-3xl font-bold text-amber-900 mt-1">{pendingCount}</p>
                            </div>
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Avg Confidence</p>
                                <p className="text-3xl font-bold text-blue-900 mt-1">{avgConfidence}%</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Sparkles className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
                    <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Bias Score</p>
                                <p className="text-3xl font-bold text-emerald-900 mt-1">{avgBias}%</p>
                            </div>
                            <div className="p-3 bg-emerald-100 rounded-xl">
                                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
