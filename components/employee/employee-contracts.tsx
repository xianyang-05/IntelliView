import { useState, useEffect } from "react"
import { FileText, Download, Eye, TrendingUp, Award, Clock, ArrowLeft, Sparkles, Copy, Check, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export function EmployeeContracts() {
  const [activeTab, setActiveTab] = useState("contracts")
  const [viewingContract, setViewingContract] = useState<string | null>(null)

  const [contracts, setContracts] = useState<any[]>([
    {
      id: 'static-1',
      name: "Employment Contract",
      version: "v1.0",
      date: "Jan 15, 2023",
      type: "Contract",
      status: "Pending Signature",
      statusColor: "bg-yellow-500/20 text-yellow-400"
    },
    {
      id: 'static-2',
      name: "NDA Agreement",
      version: "v1.0",
      date: "Jan 15, 2023",
      type: "Agreement",
      status: "Signed",
      statusColor: "bg-emerald-500/20 text-emerald-400"
    },
    {
      id: 'static-3',
      name: "Remote Work Policy",
      version: "v1.0",
      date: "Mar 10, 2023",
      type: "Policy",
      status: "Signed",
      statusColor: "bg-emerald-500/20 text-emerald-400"
    }
  ])

  useEffect(() => {
    const storedDocs = JSON.parse(localStorage.getItem('employeeDocuments') || '[]')
    if (storedDocs.length > 0) {
      setContracts(prev => {
        // Filter out any duplicates if necessary, or just append distinct ones
        // For simplicity, we just keep static + stored
        // To avoid infinite loop or duplication on re-mounts if we had strict mode on dev:
        // We can check if IDs already exist.
        const existingIds = new Set(prev.map(c => c.id))
        const newDocs = storedDocs.filter((d: any) => !existingIds.has(d.id))
        return [...prev, ...newDocs]
      })
    }
  }, [])

  const handleSignContract = (id: string) => {
    // Update local state
    setContracts(prev => prev.map(c => c.id === id ? { ...c, status: 'Signed', statusColor: 'bg-emerald-500/20 text-emerald-400' } : c))

    // Update localStorage
    const storedDocs = JSON.parse(localStorage.getItem('employeeDocuments') || '[]')
    const updatedDocs = storedDocs.map((doc: any) => doc.id === id ? { ...doc, status: 'Signed', statusColor: 'bg-emerald-500/20 text-emerald-400' } : doc)
    localStorage.setItem('employeeDocuments', JSON.stringify(updatedDocs))

    setViewingContract(null) // Return to list
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

  const history = [
    { action: "Contract Amendment Signed", date: "Mar 10, 2024", type: "Contract" },
    { action: "Equity Grant Received", date: "Jan 10, 2024", type: "Equity" },
    { action: "Annual Review Completed", date: "Dec 15, 2023", type: "Review" },
    { action: "Promotion Letter Issued", date: "Jul 1, 2023", type: "Contract" }
  ]

  const aiMessages = [
    {
      sender: "bot",
      content: "Hi! I've analyzed the Employment Contract. Here's a quick summary:\n\n• Salary Increase: Base salary up to $145k\n• Bonus: 15% performance bonus target\n• Equity: 1,200 new stock options\n• Remote Work: 3 days/week allowed\n\nDo you have any specific questions about these clauses?"
    }
  ]

  // Contract Viewer
  if (viewingContract) {
    const contract = contracts.find(c => c.id === viewingContract)
    const isGenerated = contract?.content

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
            <Button variant="outline" className="gap-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
              <Sparkles className="h-4 w-4" />
              Negotiate with AI
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            {contract?.status === "Pending Signature" && (
              <Button
                onClick={() => contract && handleSignContract(contract.id)}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle className="h-4 w-4" />
                Accept & Sign
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contract Document */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                {isGenerated ? (
                  <iframe
                    srcDoc={contract.content}
                    className="w-full h-[calc(100vh-280px)] border rounded-lg bg-white"
                    title="Document Preview"
                  />
                ) : (
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="max-w-2xl mx-auto space-y-6 text-sm leading-relaxed">
                      <h2 className="text-center font-bold text-lg tracking-wider">OFFER LETTER AMENDMENT</h2>

                      <p>Date: February 7, 2026</p>
                      <p>Dear Employee,</p>

                      <p className="font-bold">RE: AMENDMENT TO EMPLOYMENT TERMS</p>

                      <p>We are pleased to confirm the following amendments to your employment terms with ZeroHR (the &quot;Company&quot;), effective from March 1, 2026.</p>

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-bold">1. POSITION AND REPORTING</h3>
                          <p>Your position remains as Senior Product Designer. You will continue to report to the Head of Design.</p>
                        </div>

                        <div>
                          <h3 className="font-bold">2. COMPENSATION</h3>
                          <p>a) Base Salary: Your annual base salary will be increased to $145,000 per annum, payable in accordance with the Company&apos;s standard payroll practices.</p>
                          <p className="mt-2">b) Performance Bonus: You will be eligible for an annual performance bonus of up to 15% of your base salary, subject to achievement of individual and company performance targets.</p>
                        </div>

                        <div>
                          <h3 className="font-bold">3. EQUITY</h3>
                          <p>You will be granted 1,200 new stock options under the Company&apos;s Employee Stock Option Plan, vesting over 3 years with quarterly vesting.</p>
                        </div>

                        <div>
                          <h3 className="font-bold">4. REMOTE WORK</h3>
                          <p>You are approved to work remotely up to 3 days per week, subject to the Company&apos;s Remote Work Policy.</p>
                        </div>

                        <div>
                          <h3 className="font-bold">5. OTHER TERMS</h3>
                          <p>All other terms and conditions of your employment remain unchanged and continue to apply.</p>
                        </div>
                      </div>

                      <div className="pt-6">
                        <p>Please confirm your acceptance by signing below.</p>
                        <div className="mt-8 space-y-4">
                          <div>
                            <p className="font-bold">For ZeroHR</p>
                            <div className="mt-2 border-b border-border w-48">&nbsp;</div>
                            <p className="text-muted-foreground text-xs mt-1">Authorized Signatory</p>
                          </div>
                          <div>
                            <p className="font-bold">Employee Acceptance</p>
                            <div className="mt-2 border-b border-border w-48">&nbsp;</div>
                            <p className="text-muted-foreground text-xs mt-1">Signature & Date</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                )}
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
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4">
                    {aiMessages.map((msg, index) => (
                      <div key={index} className="p-4 rounded-lg bg-secondary/50">
                        <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="mt-auto">
                  <Input
                    placeholder="Ask about a clause..."
                    className="bg-secondary border-border"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
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
          {contracts.map((contract, index) => (
            <Card key={index} className="">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{contract.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {contract.type} • Signed on {contract.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${contract.statusColor}`}>
                    {contract.status}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setViewingContract(contract.id)}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
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
          {history.map((item, index) => (
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
    </div>
  )
}
