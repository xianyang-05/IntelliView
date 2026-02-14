"use client"

import { useState } from "react"
import { FileText, FileSignature, TrendingUp, AlertTriangle, FileWarning, Bell, Award, Download, Eye, Send } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function HrContractGeneration() {
  const [selectedDocType, setSelectedDocType] = useState("offer-letter")

  const documentTypes = [
    { id: "offer-letter", label: "Offer Letter", icon: FileText },
    { id: "contract", label: "Employment Contract", icon: FileSignature },
    { id: "promotion", label: "Promotion Letter", icon: TrendingUp },
    { id: "warning", label: "Warning Notice", icon: AlertTriangle },
    { id: "notice", label: "Termination Notice", icon: FileWarning },
    { id: "equity", label: "Equity Grant", icon: Award }
  ]

  const aiInsights = [
    "Industry standard salary for this role: $120,000 - $145,000",
    "Recommended benefits package based on similar positions",
    "Market competitive equity: 0.1% - 0.25% for this level"
  ]

  const performanceData = [
    { metric: "Offer Acceptance Rate", value: "92%", trend: "+5%" },
    { metric: "Avg. Time to Sign", value: "3.2 days", trend: "-0.8d" },
    { metric: "Contract Renewals", value: "45", trend: "+12" }
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contract Generation</h1>
        <p className="text-muted-foreground">Create and manage employment documents</p>
      </div>

      {/* Document Type Selection */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {documentTypes.map((type) => {
          const Icon = type.icon
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedDocType === type.id ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => setSelectedDocType(type.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`p-3 rounded-lg mx-auto w-fit mb-2 ${
                  selectedDocType === type.id ? 'bg-primary/10' : 'bg-secondary'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    selectedDocType === type.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <p className="text-xs font-medium">{type.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Document Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
              <CardDescription>Fill in the information for your document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Employee Name</Label>
                  <Input placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <Label>Position/Role</Label>
                  <Input placeholder="e.g., Senior Software Engineer" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Salary</Label>
                  <Input type="number" placeholder="Annual salary" />
                </div>
              </div>

              {selectedDocType === "equity" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Number of Shares</Label>
                    <Input type="number" placeholder="e.g., 10000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Vesting Period</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4year">4 years with 1-year cliff</SelectItem>
                        <SelectItem value="3year">3 years monthly vesting</SelectItem>
                        <SelectItem value="2year">2 years quarterly vesting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" />
              </div>

              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea placeholder="Any special terms or conditions..." rows={4} />
              </div>

              <div className="flex gap-3">
                <Button className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Document
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Document Actions</CardTitle>
              <CardDescription>Preview, download, or send the document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-3" />
                Preview Document
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-3" />
                Download PDF
              </Button>
              <Button className="w-full justify-start">
                <Send className="h-4 w-4 mr-3" />
                Send for E-Signature
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis & Performance */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>Insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-secondary rounded-lg">
                  <p className="text-sm leading-relaxed">{insight}</p>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-4">
                View Detailed Analysis
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Tracker</CardTitle>
              <CardDescription>Document metrics and trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {performanceData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{data.metric}</p>
                    <p className="text-2xl font-bold text-primary mt-1">{data.value}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    data.trend.startsWith('+') || data.trend.startsWith('-') && data.metric.includes('Time')
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {data.trend}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>Last 5 generated documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Offer Letter - Alex Kumar", date: "Mar 12" },
                { name: "Contract - Sophie Martinez", date: "Mar 10" },
                { name: "Promotion - Sarah Johnson", date: "Mar 8" },
                { name: "Equity Grant - Michael Chen", date: "Mar 5" },
                { name: "Offer Letter - David Park", date: "Mar 3" }
              ].map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-secondary rounded transition-colors">
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.date}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
