"use client"

import { useState } from "react"
import { Calendar, DollarSign, AlertCircle, Upload, Check, Clock, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function EmployeeRequests() {
  const [activeTab, setActiveTab] = useState("leave")

  const activeRequests = [
    {
      type: "Leave Request",
      status: "approved",
      date: "Mar 25-27, 2024",
      timeline: [
        { step: "Submitted", status: "completed", date: "Mar 10" },
        { step: "Manager Review", status: "completed", date: "Mar 11" },
        { step: "HR Approval", status: "completed", date: "Mar 12" },
        { step: "Processed", status: "current", date: "Mar 12" }
      ]
    },
    {
      type: "Expense Claim",
      status: "pending",
      date: "$450 - Conference",
      timeline: [
        { step: "Submitted", status: "completed", date: "Mar 14" },
        { step: "Manager Review", status: "current", date: "Pending" },
        { step: "Finance Approval", status: "pending", date: "-" },
        { step: "Payment", status: "pending", date: "-" }
      ]
    }
  ]

  const teamOnLeave = [
    { name: "John Smith", department: "Engineering", dates: "Mar 18-20" },
    { name: "Emma Wilson", department: "Design", dates: "Mar 22-24" },
    { name: "Michael Chen", department: "Engineering", dates: "Mar 25-29" }
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Requests</h1>
        <p className="text-muted-foreground">Submit and track your requests</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Request Leave</h3>
              <p className="text-sm text-muted-foreground">Apply for time off</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-lg bg-secondary">
              <DollarSign className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Submit Expense</h3>
              <p className="text-sm text-muted-foreground">Claim reimbursements</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-lg bg-secondary">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Action Required</h3>
              <p className="text-sm text-muted-foreground">2 pending actions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="leave">Request Leave</TabsTrigger>
          <TabsTrigger value="expense">Submit Expense</TabsTrigger>
          <TabsTrigger value="status">Request Status</TabsTrigger>
        </TabsList>

        <TabsContent value="leave" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leave Request Form</CardTitle>
              <CardDescription>Fill in the details for your leave request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="personal">Personal Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Duration Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Day</SelectItem>
                      <SelectItem value="half">Half Day</SelectItem>
                      <SelectItem value="multiple">Multiple Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea placeholder="Please provide a reason for your leave..." rows={4} />
              </div>

              <div className="space-y-2">
                <Label>Attachment (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG up to 10MB</p>
                </div>
              </div>

              <Button className="w-full" size="lg">Submit Leave Request</Button>
            </CardContent>
          </Card>

          {/* Team on Leave */}
          <Card>
            <CardHeader>
              <CardTitle>Team on Leave</CardTitle>
              <CardDescription>Upcoming leaves in your department</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {teamOnLeave.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.department}</p>
                  </div>
                  <span className="text-sm font-medium">{member.dates}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense">
          <Card>
            <CardHeader>
              <CardTitle>Expense Claim Form</CardTitle>
              <CardDescription>Submit your expense reimbursement request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Expense Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="meals">Meals & Entertainment</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="conference">Conference & Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the expense..." rows={4} />
              </div>

              <div className="space-y-2">
                <Label>Receipt</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload receipt</p>
                </div>
              </div>

              <Button className="w-full" size="lg">Submit Expense Claim</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          {activeRequests.map((request, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{request.type}</CardTitle>
                    <CardDescription>{request.date}</CardDescription>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'approved' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {request.status === 'approved' ? 'Approved' : 'Pending Review'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {request.timeline.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        step.status === 'completed' ? 'bg-green-100' :
                        step.status === 'current' ? 'bg-primary/10' :
                        'bg-secondary'
                      }`}>
                        {step.status === 'completed' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : step.status === 'current' ? (
                          <Clock className="h-4 w-4 text-primary" />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{step.step}</p>
                        <p className="text-xs text-muted-foreground">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
