"use client"

import { useState } from "react"
import { AIDecision } from "./types"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Activity, Play, RefreshCcw } from "lucide-react"

export function AiSimulationPanel({ decision }: { decision: AIDecision }) {
    const [factors, setFactors] = useState(decision.factors.map(f => ({ ...f, simulatedWeight: f.weight })))
    const [simulatedConfidence, setSimulatedConfidence] = useState<number | null>(null)
    const [isSimulating, setIsSimulating] = useState(false)

    const handleSimulate = () => {
        setIsSimulating(true)
        // Simulate network delay for AI computation
        setTimeout(() => {
            // Rough mock calculation based on weights favoring positive impact
            let totalPos = 0
            let totalNeg = 0
            factors.forEach(f => {
                if (f.impact === 'positive') totalPos += f.simulatedWeight
                if (f.impact === 'negative') totalNeg += f.simulatedWeight
            })
            const diff = totalPos - totalNeg
            // clamp between 10 and 99
            const newConf = Math.max(10, Math.min(99, 50 + diff / 2))

            setSimulatedConfidence(Math.round(newConf))
            setIsSimulating(false)
        }, 800)
    }

    const resetSimulation = () => {
        setFactors(decision.factors.map(f => ({ ...f, simulatedWeight: f.weight })))
        setSimulatedConfidence(null)
    }

    return (
        <div className="flex flex-col h-full space-y-6 pt-2">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h3 className="text-lg font-medium">What-if Analysis</h3>
                    <p className="text-sm text-muted-foreground mt-1">Adjust the weights of key factors to see how the AI's confidence score would change.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={resetSimulation}>
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                    <Button size="sm" onClick={handleSimulate} disabled={isSimulating} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Play className="h-4 w-4 mr-2" />
                        {isSimulating ? "Simulating..." : "Run Simulation"}
                    </Button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[300px]">
                <div className="space-y-6">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Adjust Factors</h4>
                    {factors.map((factor, i) => (
                        <div key={i} className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${factor.impact === 'positive' ? 'bg-emerald-500' : factor.impact === 'negative' ? 'bg-red-500' : 'bg-slate-400'}`} />
                                    {factor.label}
                                </span>
                                <span className="text-muted-foreground">{factor.simulatedWeight}%</span>
                            </div>
                            <Slider
                                value={[factor.simulatedWeight]}
                                max={100}
                                step={1}
                                onValueChange={(vals) => {
                                    const newFactors = [...factors]
                                    newFactors[i].simulatedWeight = vals[0]
                                    setFactors(newFactors)
                                    setSimulatedConfidence(null) // invalidate previous simulation
                                }}
                            />
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-2">
                        <Activity className={`h-8 w-8 ${isSimulating ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`} />
                    </div>

                    {simulatedConfidence !== null ? (
                        <div className="space-y-2 w-full animate-in fade-in zoom-in duration-300">
                            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Projected Confidence</p>
                            <div className="flex items-center justify-center gap-3">
                                <span className={`text-4xl font-bold ${simulatedConfidence > decision.confidence ? 'text-emerald-600' :
                                    simulatedConfidence < decision.confidence ? 'text-red-600' : 'text-blue-600'
                                    }`}>
                                    {simulatedConfidence}%
                                </span>
                            </div>
                            <div className="pt-4 max-w-xs mx-auto">
                                <Progress value={simulatedConfidence} className="h-2" />
                            </div>
                            <p className="text-xs text-muted-foreground pt-4">
                                {simulatedConfidence > decision.confidence
                                    ? "Confidence increased compared to original analysis."
                                    : simulatedConfidence < decision.confidence
                                        ? "Confidence decreased compared to original analysis."
                                        : "Confidence remained the same."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-w-[200px]">
                            <p className="text-sm text-muted-foreground">Adjust factors on the left and run simulation to see projected outcome.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
