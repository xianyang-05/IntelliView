"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, DollarSign, Users, Briefcase, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react"

const PREDEFINED_ROLES = ["Engineer", "Accountant", "HR", "Marketing", "Sales", "Operations"]
const INDUSTRIES = ["Software Product", "Agency/Services", "E-commerce", "Fintech", "Healthcare", "Other"]
const STAGES = ["Early Startup", "Growing Startup", "Scale-up", "Enterprise"]

export function HrManpowerPlanning({ currentUser }: { currentUser?: any }) {
  const [budget, setBudget] = useState("500000")
  const [industry, setIndustry] = useState("Software Product")
  const [stage, setStage] = useState("Early Startup")
  const [companyDescription, setCompanyDescription] = useState("We are an innovative HR tech startup aiming to launch an AI-powered talent acquisition module by next quarter.")
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["Engineer", "Accountant"])
  
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Job Posting State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [isPostingJobs, setIsPostingJobs] = useState(false)
  const [postSuccess, setPostSuccess] = useState(false)

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  const handleAnalyze = async () => {
    if (!budget || !industry || !stage || !companyDescription || selectedRoles.length === 0) {
      setError("Please fill in all fields and select at least one role.")
      return
    }

    setIsLoading(true)
    setError(null)
    setResults(null)
    setPostSuccess(false)

    try {
      const response = await fetch("/api/hr/manpower-planning", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          budget: parseFloat(budget),
          industry,
          stage,
          company_description: companyDescription,
          selected_positions: selectedRoles,
          company_name: "ZeroHR Demo Corp",
          company_code: currentUser?.companyId || "ZHR-001"
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to analyze manpower logic")
      }

      setResults(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkPostJobs = async () => {
    if (!results || !results.role_details) return
    
    setIsPostingJobs(true)
    try {
      // Create job objects for each recommended hire
      const jobsToPost: any[] = []
      
      results.role_details.forEach((role: any) => {
        if (role.recommended_hires > 0) {
          // Create 1 job listing entry per position regardless of hires needed
          jobsToPost.push({
            title: role.role,
            company: "ZeroHR Demo Corp",
            company_code: currentUser?.companyId || "ZHR-001",
            location: "Kuala Lumpur, Malaysia (Hybrid)",
            type: "Full-time",
            salary_range: `RM ${role.salary_range.min.toLocaleString()} - RM ${role.salary_range.max.toLocaleString()}`,
            description: `We are looking for a ${role.role} to join our growing team. ${companyDescription}`,
            requirements: [
              `Proven experience as a ${role.role}`,
              "Strong analytical and problem-solving skills",
              "Excellent communication skills"
            ]
          })
        }
      })

      if (jobsToPost.length === 0) {
        setIsPostModalOpen(false)
        return
      }

      const response = await fetch("/api/hr/jobs/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: jobsToPost })
      })

      if (!response.ok) throw new Error("Failed to post jobs")
      
      setIsPostModalOpen(false)
      setPostSuccess(true)
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsPostingJobs(false)
    }
  }

  const totalRecommendedHires = results?.role_details?.reduce((sum: number, role: any) => sum + (role.recommended_hires || 0), 0) || 0

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Budget & Manpower Planning</h1>
        <p className="text-muted-foreground mt-2">
          Calculate the ideal manpower mix and allocate budget based on template ratios and mock employee data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <Card className="lg:col-span-1 border-emerald-100 shadow-sm">
          <CardHeader className="bg-emerald-50/50 rounded-t-xl pb-4">
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Planning Inputs
            </CardTitle>
            <CardDescription>Define your company profile and constraints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label>Annual Budget (MYR)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="number" 
                  placeholder="e.g. 1000000" 
                  className="pl-9"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(ind => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Company Stage</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Company Description</Label>
              <Textarea 
                placeholder="Briefly describe what your company does..."
                className="resize-none h-24"
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Required Positions (Select at least 1)</Label>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-lg border">
                {PREDEFINED_ROLES.map(role => (
                   <div key={role} className="flex items-center space-x-2">
                   <Checkbox 
                     id={`role-${role}`} 
                     checked={selectedRoles.includes(role)}
                     onCheckedChange={() => toggleRole(role)}
                   />
                   <label
                     htmlFor={`role-${role}`}
                     className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                   >
                     {role}
                   </label>
                 </div>
                ))}
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 pt-4 rounded-b-xl border-t">
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700" 
              onClick={handleAnalyze}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating Plan...
                </>
              ) : (
                "Run Gap Analysis"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
             <Card className="h-full flex flex-col items-center justify-center min-h-[400px] border-dashed">
               <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
               <h3 className="text-xl font-medium">Running Allocations...</h3>
               <p className="text-muted-foreground mt-2 max-w-sm text-center">
                 Mapping existing headcounts and optimizing budget distributions across selected roles based on relative weights.
               </p>
             </Card>
          ) : results ? (
            <>
              {/* Budget Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold">RM {parseFloat(budget).toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                      <p className="text-sm font-medium text-muted-foreground">Current Employment Cost</p>
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold">RM {results.summary.current_cost.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card className={results.summary.unallocated_buffer > 0 ? "bg-amber-50 border-amber-200" : ""}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                      <p className="text-sm font-medium text-amber-800">Unallocated Buffer</p>
                      <TrendingUp className={`h-4 w-4 ${results.summary.unallocated_buffer > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                    </div>
                    <div className={`text-2xl font-bold ${results.summary.unallocated_buffer > 0 ? 'text-amber-700' : ''}`}>
                      RM {Math.floor(results.summary.unallocated_buffer).toLocaleString()}
                    </div>
                    {results.summary.unallocated_buffer < 0 && (
                       <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                         <AlertTriangle className="h-3 w-3" /> Budget Deficit
                       </p>
                    )}
                  </CardContent>
                </Card>
              </div>

            {/* Roles Table */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle>Department Headcounts & Hiring Recommendations</CardTitle>
                    <CardDescription>
                      Analysis based on selected positions and budget constraints.
                    </CardDescription>
                  </div>
                  {totalRecommendedHires > 0 && (
                    <Button 
                      onClick={() => setIsPostModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={postSuccess}
                    >
                      {postSuccess ? (
                        <><CheckCircle2 className="mr-2 h-4 w-4" /> Jobs Posted!</>
                      ) : (
                        <><Briefcase className="mr-2 h-4 w-4" /> Post {totalRecommendedHires} Recommended Jobs</>
                      )}
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="p-3 text-left font-medium text-slate-500">Position</th>
                          <th className="p-3 text-center font-medium text-slate-500">Current</th>
                          <th className="p-3 text-center font-medium text-slate-500">Ideal</th>
                          <th className="p-3 text-center font-medium text-slate-500">Recommend Hire</th>
                          <th className="p-3 text-left font-medium text-slate-500">Status</th>
                          <th className="p-3 text-right font-medium text-slate-500">Monthly Avg Range (RM)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.role_details.map((role: any, idx: number) => (
                          <tr key={idx} className="border-b last:border-0 hover:bg-slate-50/50">
                            <td className="p-3 font-medium">{role.role}</td>
                            <td className="p-3 text-center">{role.current_headcount}</td>
                            <td className="p-3 text-center">{role.ideal_headcount}</td>
                            <td className="p-3 text-center font-bold text-emerald-600">
                              {role.recommended_hires > 0 ? `+${role.recommended_hires}` : "0"}
                            </td>
                            <td className="p-3 text-left">
                              {role.gap_status === "Critical" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <AlertTriangle className="h-3 w-3" /> Critical
                                </span>
                              ) : role.gap_status === "Understaffed" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                  <AlertTriangle className="h-3 w-3" /> Understaffed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle2 className="h-3 w-3" /> Balanced
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right text-muted-foreground whitespace-nowrap">
                              {role.salary_range.min.toLocaleString()} - {role.salary_range.max.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center min-h-[400px] border rounded-xl bg-slate-50/50 border-dashed text-slate-500">
              <Briefcase className="h-12 w-12 mb-4 opacity-20" />
              <p>Fill in the form and click run to see the manpower gap analysis.</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Recommended Jobs</DialogTitle>
            <DialogDescription>
              This will automatically create {totalRecommendedHires} job listings in your Job Postings dashboard based on the manpower analysis.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            {results?.role_details?.filter((r: any) => r.recommended_hires > 0).map((role: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border rounded-md">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium">{role.role}</span>
                </div>
                <div className="text-sm font-semibold">x{role.recommended_hires}</div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPostModalOpen(false)}>Cancel</Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700" 
              onClick={handleBulkPostJobs}
              disabled={isPostingJobs}
            >
              {isPostingJobs ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm & Post Jobs"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
