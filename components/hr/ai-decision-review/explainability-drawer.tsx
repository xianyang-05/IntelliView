import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThumbsDown, ThumbsUp } from "lucide-react"

import { AIDecision, statusConfig, typeConfig } from "./types"
import { BiasAuditPanel } from "./bias-audit-panel"
import { AiSimulationPanel } from "./ai-simulation-panel"

interface ExplainabilityDrawerProps {
    decision: AIDecision | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onAction: (id: string, action: "approved" | "rejected") => void
}

export function ExplainabilityDrawer({ decision, isOpen, onOpenChange, onAction }: ExplainabilityDrawerProps) {
    if (!decision) return null

    const status = statusConfig[decision.status]
    const type = typeConfig[decision.type]
    const StatusIcon = status.icon
    const TypeIcon = type.icon

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
                <div className="p-6 pb-2">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-lg">
                            <div className={`p-2 rounded-xl bg-gradient-to-br ${type.gradient} text-white`}>
                                <TypeIcon className="h-5 w-5" />
                            </div>
                            {decision.title}
                        </DialogTitle>
                        <div className="flex items-center gap-3 pt-1 text-sm text-muted-foreground">
                            <Badge variant="outline" className={`${status.color}`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                            </Badge>
                            <span>{new Date(decision.timestamp).toLocaleString()}</span>
                        </div>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-hidden px-6">
                    <Tabs defaultValue="summary" className="h-full flex flex-col">
                        <TabsList className="grid w-full grid-cols-3 mb-4 shrink-0">
                            <TabsTrigger value="summary">Summary & Factors</TabsTrigger>
                            <TabsTrigger value="bias">Bias Audit</TabsTrigger>
                            <TabsTrigger value="simulate">What-if</TabsTrigger>
                        </TabsList>

                        <ScrollArea className="flex-1 -mx-6 px-6 pb-6">
                            <TabsContent value="summary" className="space-y-5 mt-0">
                                {/* Person */}
                                <div className="p-4 bg-secondary/30 rounded-xl border">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                        {decision.candidate ? "Candidate" : "Employee"}
                                    </p>
                                    <p className="font-semibold">{decision.candidate || decision.employee}</p>
                                </div>

                                {/* Summary */}
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">AI Summary</p>
                                    <p className="text-sm leading-relaxed">{decision.summary}</p>
                                </div>

                                {/* Recommendation */}
                                <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                                    <p className="text-xs font-medium text-violet-600 uppercase tracking-wider mb-2">AI Recommendation</p>
                                    <p className="text-sm font-medium text-violet-900">{decision.recommendation}</p>
                                </div>

                                {/* Scores */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border bg-card">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Confidence Score</p>
                                        <div className="flex items-center gap-3">
                                            <Progress value={decision.confidence} className="flex-1 h-2.5" />
                                            <span className="font-bold text-lg">{decision.confidence}%</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl border bg-card">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Bias Fairness Score</p>
                                        <div className="flex items-center gap-3">
                                            <Progress value={decision.biasScore} className="flex-1 h-2.5" />
                                            <span className="font-bold text-lg">{decision.biasScore}%</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Decision Factors */}
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Decision Factors</p>
                                    <div className="space-y-2.5">
                                        {decision.factors.map((factor, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                                                <div className="flex items-center gap-2">
                                                    {factor.impact === "positive" ? (
                                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                    ) : factor.impact === "negative" ? (
                                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                                    ) : (
                                                        <div className="h-2 w-2 rounded-full bg-slate-400" />
                                                    )}
                                                    <span className="text-sm font-medium">{factor.label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={factor.weight} className="w-24 h-1.5" />
                                                    <span className="text-xs font-medium w-8 text-right">{factor.weight}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="bias" className="mt-0">
                                <BiasAuditPanel decision={decision} />
                            </TabsContent>

                            <TabsContent value="simulate" className="mt-0">
                                <AiSimulationPanel decision={decision} />
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>
                </div>

                <div className="px-6 py-4 border-t bg-background shrink-0 rounded-b-lg">
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                        {(decision.status === "pending" || decision.status === "flagged") && (
                            <>
                                <Button
                                    variant="outline"
                                    className="text-red-600 hover:bg-red-50"
                                    onClick={() => { onAction(decision.id, "rejected"); onOpenChange(false); }}
                                >
                                    <ThumbsDown className="h-4 w-4 mr-1.5" />
                                    Reject
                                </Button>
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => { onAction(decision.id, "approved"); onOpenChange(false); }}
                                >
                                    <ThumbsUp className="h-4 w-4 mr-1.5" />
                                    Approve
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
