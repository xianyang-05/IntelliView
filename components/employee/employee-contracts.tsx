"use client"

import { useState, useRef, useEffect } from "react"
import { FileText, Download, Eye, TrendingUp, Award, Clock, ArrowLeft, Sparkles, Copy, Undo2, AlertTriangle, CheckCircle2, PenLine } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ContractContent } from "./contract-content"
import { cn } from "@/lib/utils"

interface EmployeeContractsProps {
  highlight?: { section_id: string }
}

export function EmployeeContracts({ highlight }: EmployeeContractsProps) {
  const [activeTab, setActiveTab] = useState("contracts")
  const [viewingContract, setViewingContract] = useState<string | null>(null)

  interface Contract {
    id: string
    name: string
    version: string
    date: string
    type: string
    status: string
    statusColor: string
    signature?: string
    tempSignature?: string
  }

  const [contractsList, setContractsList] = useState<Contract[]>([
    {
      id: "c1",
      name: "Employment Contract",
      version: "v1.0",
      date: "Jan 15, 2023",
      type: "Contract",
      status: "Pending Signature",
      statusColor: "bg-yellow-500/20 text-yellow-400"
    },
    {
      id: "c2",
      name: "NDA Agreement",
      version: "v1.0",
      date: "Jan 15, 2023",
      type: "Agreement",
      status: "Signed",
      statusColor: "bg-emerald-500/20 text-emerald-400"
    },
    {
      id: "c3",
      name: "Remote Work Policy",
      version: "v1.0",
      date: "Mar 10, 2023",
      type: "Policy",
      status: "Signed",
      statusColor: "bg-emerald-500/20 text-emerald-400"
    }
  ])
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Initialize canvas context
  useEffect(() => {
    if (isSignDialogOpen && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.strokeStyle = '#000000'
      }
    }
  }, [isSignDialogOpen])

  // EFFECT: Handle Highlighting (Now handled inside ContractContent, but we still need to open the right contract)
  useEffect(() => {
    if (highlight?.section_id) {
      setViewingContract("c1")
    }
  }, [highlight])

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
    setIsDrawing(true)
  }

  const draw = (e: any) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (e.type === 'touchmove') e.preventDefault() // Prevent scrolling on touch

    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
  }

  const endDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const handleSaveSignature = () => {
    if (canvasRef.current && viewingContract) {
      const dataUrl = canvasRef.current.toDataURL()
      const contract = contractsList.find(c => c.id === viewingContract)

      // Directly finalize: set signature and update status to Signed
      setContractsList(prev => prev.map(c => {
        if (c.id === viewingContract) {
          return {
            ...c,
            signature: dataUrl,
            tempSignature: undefined,
            status: "Signed",
            statusColor: "bg-emerald-500/20 text-emerald-400"
          }
        }
        return c
      }))

      // Add to history
      if (contract) {
        const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        setHistoryList(prev => [
          { action: `${contract.name} Signed`, date: now, type: "Contract" },
          ...prev
        ])
      }

      setIsSignDialogOpen(false)
      toast.success("Contract signed successfully!", {
        description: `${contract?.name} has been signed and finalized.`
      })
    }
  }

  const handleFinalizeContract = () => {
    if (!viewingContract) return
    const contract = contractsList.find(c => c.id === viewingContract)
    if (!contract?.tempSignature) return

    // Finalize contract status and move temp signature to permanent
    setContractsList(prev => prev.map(c => {
      if (c.id === viewingContract) {
        return {
          ...c,
          status: "Signed",
          statusColor: "bg-emerald-500/20 text-emerald-400",
          signature: c.tempSignature,
          tempSignature: undefined
        }
      }
      return c
    }))

    // Update history
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    setHistoryList(prev => [
      { action: `${contract.name} Signed`, date: now, type: "Contract" },
      ...prev
    ])

    toast.success("Contract signed successfully", {
      description: `${contract.name} status updated to Signed.`
    })

    setViewingContract(null)
  }

  const equityGrants = [
    {
      type: "Initial Equity Grant",
      grantType: "Stock Options",
      status: "Signed",
      statusColor: "bg-emerald-500/20 text-emerald-400",
      date: "Jan 15, 2023",
      totalShares: 5000,
      vestedShares: 1250,
      vestingSchedule: "4 years, 1-year cliff",
      vestingType: "quarterly vesting",
      nextVest: "Oct 15, 2024",
      percentVested: 25
    },
    {
      type: "Performance Bonus Grant",
      grantType: "RSUs",
      status: "Pending",
      statusColor: "bg-yellow-500/20 text-yellow-400",
      date: "Jan 10, 2024",
      totalShares: 1200,
      vestedShares: 96,
      vestingSchedule: "3 years, quarterly vesting",
      vestingType: "quarterly vesting",
      nextVest: "Apr 1, 2024",
      percentVested: 8
    }
  ]

  const [historyList, setHistoryList] = useState([
    { action: "Contract Amendment Signed", date: "Mar 10, 2024", type: "Contract" },
    { action: "Equity Grant Received", date: "Jan 10, 2024", type: "Equity" },
    { action: "Annual Review Completed", date: "Dec 15, 2023", type: "Review" },
    { action: "Promotion Letter Issued", date: "Jul 1, 2023", type: "Contract" }
  ])

  // AI Contract Assistant state
  const [aiChatMessages, setAiChatMessages] = useState<{ sender: string; content: string }[]>([
    {
      sender: "bot",
      content: "Hi! I've analyzed the Employment Contract. Here's a quick summary:\n\n• Salary Increase: Base salary up to $145k\n• Bonus: 15% performance bonus target\n• Equity: 1,200 new stock options\n• Remote Work: 3 days/week allowed\n\nDo you have any specific questions about these clauses?"
    }
  ])
  const [aiInput, setAiInput] = useState("")
  const [showFaqButtons, setShowFaqButtons] = useState(true)
  const aiScrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages added
  useEffect(() => {
    if (aiScrollRef.current) {
      aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight
    }
  }, [aiChatMessages])

  const faqItems = [
    {
      question: "What is my new salary?",
      answer: "According to **Section 2 (Compensation)** of the amendment:\n\n**a) Base Salary:** Your annual base salary will be increased to **$145,000 per annum**, payable in accordance with the Company's standard payroll practices.\n\n**b) Performance Bonus:** You will be eligible for an annual performance bonus of up to **15%** of your base salary, subject to achievement of individual and company performance targets."
    },
    {
      question: "How many stock options do I get?",
      answer: "According to **Section 3 (Equity)** of the amendment:\n\nYou will be granted **1,200 new stock options** under the Company's Employee Stock Option Plan, vesting over **3 years** with **quarterly vesting**.\n\nThis is in addition to any existing equity grants you may hold."
    },
    {
      question: "What is the remote work policy?",
      answer: "According to **Section 4 (Remote Work)** of the amendment:\n\nYou are approved to work remotely up to **3 days per week**, subject to the Company's Remote Work Policy.\n\nThis means you're expected to be in-office for a minimum of 2 days per week."
    },
    {
      question: "What happens to my other terms?",
      answer: "According to **Section 5 (Other Terms)** of the amendment:\n\nAll other terms and conditions of your employment **remain unchanged** and continue to apply. This includes your existing benefits, leave entitlements, and any previously signed agreements like your NDA."
    },
    {
      question: "When does this take effect?",
      answer: "The amendment is effective from **March 1, 2026**, as stated in the introduction of the offer letter.\n\nThe document was issued on **February 7, 2026**, giving you time to review and sign before the effective date."
    }
  ]

  const handleFaqClick = (faq: { question: string; answer: string }) => {
    setShowFaqButtons(false)
    setAiChatMessages(prev => [
      ...prev,
      { sender: "user", content: faq.question },
      { sender: "bot", content: faq.answer }
    ])
  }

  const handleAiInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiInput.trim()) return
    const question = aiInput.trim()
    setAiInput("")
    setShowFaqButtons(false)

    // Check if it matches a FAQ
    const matchedFaq = faqItems.find(f =>
      f.question.toLowerCase().includes(question.toLowerCase()) ||
      question.toLowerCase().includes(f.question.toLowerCase().replace("?", ""))
    )

    setAiChatMessages(prev => [
      ...prev,
      { sender: "user", content: question },
      {
        sender: "bot",
        content: matchedFaq
          ? matchedFaq.answer
          : "I can help you understand the clauses in this contract. Try asking about your **salary**, **stock options**, **remote work policy**, or **effective date**."
      }
    ])
  }

  // Contract Viewer
  if (viewingContract) {
    const contract = contractsList.find(c => c.id === viewingContract)
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setViewingContract(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{contract?.name}</h1>
              <p className="text-sm text-muted-foreground">{contract?.version} • {contract?.status}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Negotiate with AI button removed */}
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            {contract?.status === "Pending Signature" && (
              <>
                {!contract?.tempSignature ? (
                  <Button
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                    onClick={() => setIsSignDialogOpen(true)}
                  >
                    Accept & Sign
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        setContractsList(prev => prev.map(c =>
                          c.id === contract.id ? { ...c, tempSignature: undefined } : c
                        ))
                      }}
                    >
                      <Undo2 className="h-4 w-4" />
                      Re-sign
                    </Button>
                    <Button
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg animate-pulse"
                      onClick={handleFinalizeContract}
                    >
                      <FileText className="h-4 w-4" />
                      Confirm & Finalize
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contract Document */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <ScrollArea className="h-[calc(100vh-280px)] bg-muted/30 p-4 rounded-lg">
                  <ContractContent
                    highlightSectionId={highlight?.section_id}
                    signatureUrl={contract?.signature || contract?.tempSignature}
                    isSigned={contract?.status === 'Signed'}
                  />

                  {/* Bottom Actions */}
                  <div className="flex justify-end pt-8 pb-12 print:hidden gap-3">
                    <Button variant="outline" onClick={() => setViewingContract(null)}>
                      Close
                    </Button>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* AI Contract Assistant */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Sparkles className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Contract Assistant</CardTitle>
                    <CardDescription>Analyzing this document</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden">
                <div ref={aiScrollRef} className="flex-1 overflow-y-auto mb-4 space-y-3 pr-1">
                  {aiChatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-3 rounded-lg text-sm leading-relaxed",
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground ml-6"
                          : "bg-secondary/50 mr-2"
                      )}
                    >
                      <p className="whitespace-pre-line"
                        dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        }}
                      />
                    </div>
                  ))}

                  {/* FAQ Buttons */}
                  {showFaqButtons && (
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
                        Frequently Asked
                      </p>
                      {faqItems.map((faq, index) => (
                        <button
                          key={index}
                          onClick={() => handleFaqClick(faq)}
                          className="w-full text-left px-3 py-2.5 rounded-lg border border-border/60 bg-card hover:bg-primary/5 hover:border-primary/30 transition-all text-sm text-foreground/80 hover:text-foreground group"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-primary/60 group-hover:text-primary text-xs">▸</span>
                            {faq.question}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <form onSubmit={handleAiInputSubmit} className="mt-auto flex gap-2">
                  <Input
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ask about a clause..."
                    className="bg-secondary border-border flex-1"
                  />
                  <Button type="submit" size="icon" variant="ghost" className="shrink-0">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Signature Dialog */}
        <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sign Contract</DialogTitle>
              <DialogDescription>
                Please sign inside the box below to accept the contract terms.
              </DialogDescription>
            </DialogHeader>
            <div className="p-1 border rounded-lg bg-slate-50">
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="bg-white rounded-md touch-none cursor-crosshair w-full h-[200px]"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={endDrawing}
              />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button variant="ghost" onClick={clearSignature} className="text-muted-foreground hover:text-destructive">Clear Pad</Button>
              <Button onClick={handleSaveSignature} className="bg-primary text-primary-foreground">Confirm & Finalize</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div >
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contracts & Equity</h1>
          <p className="text-muted-foreground">View and manage your employment documents and equity</p>
        </div>
        <Button variant="outline" className="gap-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
          <Sparkles className="h-4 w-4" />
          Ask AI About Clauses
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-muted p-1 w-full">
          <TabsTrigger value="contracts" className="rounded-md px-6 flex-1 gap-2">
            <FileText className="h-4 w-4" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="equity" className="rounded-md px-6 flex-1 gap-2">
            <TrendingUp className="h-4 w-4" />
            Equity
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-md px-6 flex-1 gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4">
          {contractsList.map((contract, index) => (
            <Card
              key={index}
              className={cn(
                "transition-all",
                contract.status === "Pending Signature" && "border-yellow-500/50 shadow-[0_0_15px_-3px_rgba(234,179,8,0.15)]"
              )}
            >
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-lg",
                    contract.status === "Pending Signature" ? "bg-yellow-500/10" : "bg-primary/10"
                  )}>
                    <FileText className={cn(
                      "h-6 w-6",
                      contract.status === "Pending Signature" ? "text-yellow-500" : "text-primary"
                    )} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{contract.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {contract.type} • {contract.status === "Signed" ? `Signed on ${contract.date}` : `Issued on ${contract.date}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {contract.status === "Pending Signature" ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                      </span>
                      <AlertTriangle className="h-3 w-3" />
                      Pending Signature
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Signed
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setViewingContract(contract.id)}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  {contract.status === "Pending Signature" && (
                    <Button
                      size="sm"
                      className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-lg"
                      onClick={() => {
                        setViewingContract(contract.id)
                        setTimeout(() => setIsSignDialogOpen(true), 100)
                      }}
                    >
                      <PenLine className="h-4 w-4" />
                      Sign Now
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="equity" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-emerald-500/10">
                    <span className="text-emerald-500 font-bold text-lg">$</span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">6,200</div>
                    <p className="text-sm text-muted-foreground">Total shares granted</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-emerald-500/10">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">1,250</div>
                    <p className="text-sm text-muted-foreground">Shares vested</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Equity Grant Cards */}
          <div className="space-y-4">
            {equityGrants.map((grant, index) => (
              <Card key={index} className="">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{grant.type}</h3>
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                            {grant.grantType}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${grant.statusColor}`}>
                            {grant.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {grant.totalShares.toLocaleString()} shares | {grant.vestingSchedule}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {grant.status === "Pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-emerald-400 border-emerald-500/30"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                  {/* Vesting Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Vested</span>
                      <span className="text-sm font-medium">{grant.percentVested}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${grant.percentVested}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Next vest: {grant.nextVest}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {historyList.map((item, index) => (
            <Card key={index} className="">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-lg bg-secondary">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.action}</h3>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium">
                  {item.type}
                </span>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Signature Dialog */}
      <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Contract</DialogTitle>
            <DialogDescription>
              Please sign inside the box below to accept the contract terms.
            </DialogDescription>
          </DialogHeader>
          <div className="p-1 border rounded-lg bg-slate-50">
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              className="bg-white rounded-md touch-none cursor-crosshair w-full h-[200px]"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button variant="ghost" onClick={clearSignature} className="text-muted-foreground hover:text-destructive">Clear Pad</Button>
            <Button onClick={handleSaveSignature} className="bg-primary text-primary-foreground">Confirm & Finalize</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
