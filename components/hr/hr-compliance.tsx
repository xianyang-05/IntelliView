"use client"

import { Shield, AlertTriangle, Calendar, GraduationCap, FileCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function HrCompliance() {
  const visaRenewals = [
    {
      employee: "Alex Kumar",
      visaType: "H1-B Visa",
      expiryDate: "Apr 15, 2024",
      daysRemaining: 30,
      status: "urgent"
    },
    {
      employee: "Sophie Martinez",
      visaType: "Work Permit",
      expiryDate: "May 20, 2024",
      daysRemaining: 65,
      status: "upcoming"
    },
    {
      employee: "David Park",
      visaType: "EP Pass",
      expiryDate: "Jun 10, 2024",
      daysRemaining: 86,
      status: "upcoming"
    }
  ]

  const trainingRequirements = [
    {
      employee: "Sarah Johnson",
      training: "Data Privacy & GDPR",
      deadline: "Apr 30, 2024",
      progress: 60,
      status: "in-progress"
    },
    {
      employee: "Michael Chen",
      training: "Security Awareness",
      deadline: "Apr 25, 2024",
      progress: 0,
      status: "not-started"
    },
    {
      employee: "Emma Wilson",
      training: "Leadership Development",
      deadline: "May 15, 2024",
      progress: 30,
      status: "in-progress"
    }
  ]

  const otherCompliance = [
    {
      employee: "James Taylor",
      item: "Annual Health Check",
      type: "Health & Safety",
      deadline: "Apr 20, 2024",
      status: "pending"
    },
    {
      employee: "Lisa Anderson",
      item: "Background Verification Renewal",
      type: "Security Clearance",
      deadline: "May 5, 2024",
      status: "pending"
    },
    {
      employee: "All Staff",
      item: "Fire Safety Drill",
      type: "Safety Compliance",
      deadline: "Apr 30, 2024",
      status: "scheduled"
    }
  ]

  const stats = [
    { label: "Urgent Actions", value: "8", color: "text-red-600", bg: "bg-red-100" },
    { label: "Upcoming Deadlines", value: "15", color: "text-yellow-600", bg: "bg-yellow-100" },
    { label: "Compliant", value: "225", color: "text-green-600", bg: "bg-green-100" }
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Compliance & Audit</h1>
        <p className="text-muted-foreground">Monitor and manage compliance requirements</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Shield className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visa Renewals */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Visa & Work Permit Renewals</CardTitle>
          </div>
          <CardDescription>Employees requiring visa renewal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {visaRenewals.map((item, index) => (
            <div key={index} className={`p-4 rounded-lg border ${
              item.status === 'urgent' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{item.employee}</h3>
                    <Badge variant={item.status === 'urgent' ? 'destructive' : 'secondary'}>
                      {item.status === 'urgent' ? 'Urgent' : 'Upcoming'}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium mb-1">{item.visaType}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Expires: {item.expiryDate}</span>
                    <span>{item.daysRemaining} days remaining</span>
                  </div>
                </div>
                <AlertTriangle className={`h-6 w-6 ${
                  item.status === 'urgent' ? 'text-red-600' : 'text-yellow-600'
                }`} />
              </div>
              <div className="flex gap-3">
                <Button size="sm" variant={item.status === 'urgent' ? 'default' : 'outline'}>
                  Initiate Renewal
                </Button>
                <Button size="sm" variant="ghost">View Details</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Training Requirements */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <CardTitle>Training Requirements</CardTitle>
          </div>
          <CardDescription>Mandatory training and certifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {trainingRequirements.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{item.employee}</h3>
                      <Badge variant={
                        item.status === 'not-started' ? 'destructive' : 'secondary'
                      }>
                        {item.status === 'not-started' ? 'Not Started' : 'In Progress'}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mb-1">{item.training}</p>
                    <p className="text-sm text-muted-foreground">Deadline: {item.deadline}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button size="sm" className="flex-1">Send Reminder</Button>
                  <Button size="sm" variant="outline">View Training</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Other Compliance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <CardTitle>Other Compliance Items</CardTitle>
          </div>
          <CardDescription>Additional compliance and audit requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {otherCompliance.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-sm">{item.employee}</h3>
                  <Badge variant="outline" className="text-xs">{item.type}</Badge>
                </div>
                <p className="text-sm font-medium mb-1">{item.item}</p>
                <p className="text-xs text-muted-foreground">Deadline: {item.deadline}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{item.status === 'scheduled' ? 'Scheduled' : 'Pending'}</Badge>
                <Button size="sm" variant="ghost">Action</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
