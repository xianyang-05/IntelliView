import { Brain, Sparkles, ShieldCheck, ChevronRight, ThumbsUp, ThumbsDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIDecision, statusConfig, typeConfig } from "./types"

interface DecisionListProps {
    decisions: AIDecision[]
    searchQuery: string
    setSearchQuery: (val: string) => void
    activeTab: string
    setActiveTab: (val: string) => void
    onSelectDecision: (decision: AIDecision) => void
    onAction: (id: string, action: "approved" | "rejected") => void
}

export function DecisionList({
    decisions,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    onSelectDecision,
    onAction
}: DecisionListProps) {
    const filteredDecisions = decisions.filter((d) => {
        const matchesSearch =
            d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.candidate || d.employee || "").toLowerCase().includes(searchQuery.toLowerCase())
        const matchesTab = activeTab === "all" || d.type === activeTab
        return matchesSearch && matchesTab
    })

    return (
        <div className="space-y-6">
            {/* Filters & Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search decisions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Tabs + Decision Cards */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-muted/50">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="hiring">Hiring</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="compensation">Compensation</TabsTrigger>
                    <TabsTrigger value="termination">Contract</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-4 space-y-3">
                    {filteredDecisions.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <Brain className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p>No decisions found matching your criteria.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredDecisions.map((decision) => {
                            const status = statusConfig[decision.status]
                            const type = typeConfig[decision.type]
                            const StatusIcon = status.icon
                            const TypeIcon = type.icon

                            return (
                                <Card
                                    key={decision.id}
                                    className="group hover:shadow-md transition-all duration-200 cursor-pointer border-l-4"
                                    style={{ borderLeftColor: decision.status === "flagged" ? "#f97316" : decision.status === "pending" ? "#eab308" : decision.status === "approved" ? "#10b981" : "#ef4444" }}
                                    onClick={() => onSelectDecision(decision)}
                                >
                                    <CardContent className="py-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${type.gradient} text-white shrink-0 shadow-sm`}>
                                                    <TypeIcon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-sm truncate">{decision.title}</h3>
                                                        <Badge variant="outline" className={`shrink-0 text-xs ${status.color}`}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {status.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{decision.summary}</p>
                                                    <div className="flex items-center gap-4 mt-2.5">
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <Sparkles className="h-3 w-3" />
                                                            <span>Confidence: <span className="font-medium text-foreground">{decision.confidence}%</span></span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <ShieldCheck className="h-3 w-3" />
                                                            <span>Bias Score: <span className="font-medium text-foreground">{decision.biasScore}%</span></span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(decision.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {(decision.status === "pending" || decision.status === "flagged") && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                            onClick={(e) => { e.stopPropagation(); onAction(decision.id, "rejected") }}
                                                        >
                                                            <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                                                            Reject
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                            onClick={(e) => { e.stopPropagation(); onAction(decision.id, "approved") }}
                                                        >
                                                            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                                                            Approve
                                                        </Button>
                                                    </>
                                                )}
                                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
