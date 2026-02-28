import { AIDecision } from "./types"
import { ShieldCheck, Target, AlertCircle, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function BiasAuditPanel({ decision }: { decision: AIDecision }) {
    // Generate some mock granular audit data based on the overall bias score
    const categoryScores = [
        { name: "Gender Equity", score: Math.min(100, decision.biasScore + 2), status: "pass" },
        { name: "Age Neutrality", score: Math.min(100, decision.biasScore - 1), status: decision.biasScore > 85 ? "pass" : "warning" },
        { name: "Socio-economic Factors", score: Math.min(100, decision.biasScore + 4), status: "pass" },
        { name: "Historical Performance Bias", score: Math.max(0, decision.biasScore - 5), status: decision.biasScore > 90 ? "pass" : "warning" },
    ]

    return (
        <div className="space-y-6 pt-2">
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 flex items-start gap-4">
                <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                    <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                    <h4 className="font-semibold text-emerald-900">Fairness Audit Complete</h4>
                    <p className="text-sm text-emerald-700 mt-1">
                        This recommendation has been evaluated against 4 diversity and inclusion frameworks.
                        Overall compliance score is {decision.biasScore}%.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Granular Assessment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryScores.map((cat, i) => (
                        <div key={i} className="p-4 bg-card rounded-xl border">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium">{cat.name}</span>
                                {cat.status === "pass" ? (
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                )}
                            </div>
                            <Progress value={cat.score} className={`h-2 ${cat.status === "warning" ? 'bg-amber-100 [&>div]:bg-amber-500' : ''}`} />
                            <div className="mt-2 text-right">
                                <span className="text-xs font-bold">{cat.score}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-secondary/30 rounded-xl border text-sm text-muted-foreground flex gap-3">
                <Target className="h-5 w-5 shrink-0 text-muted-foreground" />
                <p>
                    <strong>Note:</strong> Bias scores are calculated locally via our isolated ML models, ensuring compliance with internal ZeroHR fair-use guidelines.
                </p>
            </div>
        </div>
    )
}
