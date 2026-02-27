"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Briefcase, MapPin, DollarSign, Clock } from "lucide-react"

export function HrJobPostings({ companyCode, companyName }: { companyCode?: string, companyName?: string }) {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [type, setType] = useState("Full-time")
  const [salaryRange, setSalaryRange] = useState("")
  const [description, setDescription] = useState("")
  const [requirementsText, setRequirementsText] = useState("")

  const fetchJobs = async () => {
    if (!companyCode) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/hr/jobs?company_code=${companyCode}`)
      const data = await response.json()
      if (response.ok) {
        setJobs(data.jobs)
      } else {
        throw new Error(data.detail || "Failed to fetch jobs")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [companyCode])

  const handleCreateJob = async () => {
    if (!title || !location || !salaryRange || !description) {
      setError("Please fill in all required fields.")
      return
    }

    setIsSubmitLoading(true)
    setError(null)
    try {
      const requirements = requirementsText.split("\n").filter(r => r.trim() !== "")
      
      const payload = {
        title,
        company: companyName || "My Company",
        company_code: companyCode || "UNKNOWN",
        location,
        type,
        salary_range: salaryRange,
        description,
        requirements
      }

      const response = await fetch("/api/hr/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Failed to create job")
      
      setIsModalOpen(false)
      setTitle("")
      setLocation("")
      setSalaryRange("")
      setDescription("")
      setRequirementsText("")
      
      fetchJobs() // Refresh the list
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
          <p className="text-muted-foreground mt-2">Manage all active job listings for {companyName || "your company"}.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Post New Job
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
      ) : jobs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <Briefcase className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-xl font-medium">No Active Jobs</h3>
          <p className="text-muted-foreground mt-2">Get started by creating your first job posting.</p>
          <Button variant="outline" className="mt-6" onClick={() => setIsModalOpen(true)}>Post a Job</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="flex flex-col hover:border-emerald-200 transition-colors">
              <CardHeader>
                <CardTitle className="line-clamp-1">{job.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${job.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {job.is_active ? 'Active' : 'Closed'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {job.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /> {job.type}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" /> {job.salary_range}
                </div>
                <p className="text-sm line-clamp-3 mt-4 pt-4 border-t">{job.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post a New Job</DialogTitle>
            <DialogDescription>Fill out the details below to create a new job listing.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer" />
              </div>
              <div className="space-y-2">
                <Label>Location *</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote, Kuala Lumpur" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Salary Range *</Label>
                <Input value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="e.g. RM 5000 - RM 8000" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea 
                className="h-32 resize-none" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Briefly describe the role and responsibilities..." 
              />
            </div>

            <div className="space-y-2">
              <Label>Requirements (One per line)</Label>
              <Textarea 
                className="h-32 resize-none" 
                value={requirementsText} 
                onChange={(e) => setRequirementsText(e.target.value)} 
                placeholder="3+ years of React experience&#10;Strong communication skills&#10;Familiarity with Git" 
              />
            </div>
            
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateJob} disabled={isSubmitLoading}>
              {isSubmitLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Post Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
