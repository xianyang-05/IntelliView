"use client"

import { DollarSign, Calendar, FileText, CheckCircle, Clock, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function HrWorkflows() {
  const expenseClaims = [
    {
      employee: "Sarah Johnson",
      department: "Engineering",
      amount: "$450",
      category: "Conference",
      date: "Mar 14, 2024",
      status: "pending",
      description: "React Summit 2024 ticket"
    },
    {
      employee: "Michael Chen",
      department: "Product",
      amount: "$1,250",
      category: "Travel",
      date: "Mar 12, 2024",
      status: "approved",
      description: "Client meeting in New York"
    },
    {
      employee: "Emma Wilson",
      department: "Design",
      amount: "$89",
      category: "Software",
      date: "Mar 10, 2024",
      status: "pending",
      description: "Figma professional license"
    }
  ]

  const leaveRequests = [
    {
      employee: "James Taylor",
      department: "Analytics",
      type: "Annual Leave",
      dates: "Mar 25-29, 2024",
      days: 5,
      status: "pending",
      reason: "Family vacation"
    },
    {
      employee: "Lisa Anderson",
      department: "Marketing",
      type: "Sick Leave",
      dates: "Mar 18, 2024",
      days: 1,
      status: "approved",
      reason: "Medical appointment"
    },
    {
      employee: "Alex Kumar",
      department: "Engineering",
      type: "Personal Leave",
      dates: "Apr 5-7, 2024",
      days: 3,
      status: "pending",
      reason: "Personal matters"
    }
  ]

  const otherRequests = [
    {
      employee: "Sophie Martinez",
      department: "Design",
      type: "Equipment Request",
      item: "MacBook Pro 16\"",
      status: "approved",
      date: "Mar 15, 2024"
    },
    {
      employee: "David Park",
      department: "Sales",
      type: "Training Request",
      item: "Sales Leadership Course",
      status: "pending",
      date: "Mar 13, 2024"
    },
    {
      employee: "Sarah Johnson",
      department: "Engineering",
      type: "Remote Work",
      item: "Work from home setup",
      status: "approved",
      date: "Mar 11, 2024"
    }
  ]

  const stats = [
    { label: "Pending Requests", value: "12", icon: Clock, color: "text-yellow-600" },
    { label: "Approved Today", value: "8", icon: CheckCircle, color: "text-green-600" },
    { label: "Requires Action", value: "5", icon: XCircle, color: "text-red-600" }
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Workflows</h1>
        <p className="text-muted-foreground">Manage employee requests and approvals</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    stat.color === 'text-green-600' ? 'bg-green-100' :
                    stat.color === 'text-yellow-600' ? 'bg-yellow-100' :
                    'bg-red-100'
                  }`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="expenses">
            <DollarSign className="h-4 w-4 mr-2" />
            Expense Claims
          </TabsTrigger>
          <TabsTrigger value="leave">
            <Calendar className="h-4 w-4 mr-2" />
            Leave Requests
          </TabsTrigger>
          <TabsTrigger value="other">
            <FileText className="h-4 w-4 mr-2" />
            Other Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          {expenseClaims.map((claim, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{claim.employee}</h3>
                        <Badge variant="outline">{claim.department}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{claim.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Category: {claim.category}</span>
                        <span className="text-muted-foreground">Date: {claim.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary mb-2">{claim.amount}</p>
                    <Badge variant={claim.status === 'approved' ? 'default' : 'secondary'}>
                      {claim.status === 'approved' ? 'Approved' : 'Pending Review'}
                    </Badge>
                  </div>
                </div>
                {claim.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button size="sm" className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button size="sm" variant="ghost">View Receipt</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          {leaveRequests.map((request, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{request.employee}</h3>
                        <Badge variant="outline">{request.department}</Badge>
                      </div>
                      <p className="text-sm font-medium mb-1">{request.type}</p>
                      <p className="text-sm text-muted-foreground mb-2">{request.reason}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Dates: {request.dates}</span>
                        <span className="text-muted-foreground">{request.days} days</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>
                    {request.status === 'approved' ? 'Approved' : 'Pending Review'}
                  </Badge>
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button size="sm" className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button size="sm" variant="ghost">View Team Calendar</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          {otherRequests.map((request, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{request.employee}</h3>
                        <Badge variant="outline">{request.department}</Badge>
                      </div>
                      <p className="text-sm font-medium mb-1">{request.type}</p>
                      <p className="text-sm text-muted-foreground mb-2">{request.item}</p>
                      <span className="text-sm text-muted-foreground">Submitted: {request.date}</span>
                    </div>
                  </div>
                  <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>
                    {request.status === 'approved' ? 'Approved' : 'Pending Review'}
                  </Badge>
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button size="sm" className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button size="sm" variant="ghost">View Details</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
