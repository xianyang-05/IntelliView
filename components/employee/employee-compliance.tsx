"use client"

import { AlertTriangle, CheckCircle2, Clock, Upload, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function EmployeeCompliance() {
  const alerts = [
    {
      title: "Work Visa Expiring Soon",
      description: "Your work visa expires in 30 days",
      severity: "urgent",
      type: "EP Pass - Singapore",
      expiryDate: "Apr 15, 2024",
      action: "Start renewal now. Processing typically takes 3-4 weeks.",
      actionButton: "Start Renewal"
    },
    {
      title: "Annual Health Check Due",
      description: "Your annual health screening is due",
      severity: "warning",
      type: "Health & Safety Compliance",
      expiryDate: "May 1, 2024",
      action: "Schedule your appointment with approved healthcare providers.",
      actionButton: "Schedule Now"
    },
    {
      title: "Security Training Required",
      description: "Complete mandatory security awareness training",
      severity: "warning",
      type: "Training & Certification",
      expiryDate: "Apr 30, 2024",
      action: "Complete the online training module before the deadline.",
      actionButton: "Start Training"
    }
  ]

  const completedCompliance = [
    {
      title: "Data Privacy Training",
      completedDate: "Feb 15, 2024",
      validUntil: "Feb 15, 2025"
    },
    {
      title: "Workplace Safety Certification",
      completedDate: "Jan 10, 2024",
      validUntil: "Jan 10, 2025"
    },
    {
      title: "Background Verification",
      completedDate: "Dec 20, 2023",
      validUntil: "Permanent"
    }
  ]

  const stats = [
    { label: "Active Alerts", value: 3, color: "text-red-600" },
    { label: "Upcoming", value: 2, color: "text-yellow-600" },
    { label: "All Clear", value: 8, color: "text-green-600" }
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Compliance Alerts</h1>
        <p className="text-muted-foreground">Stay up to date with your compliance requirements</p>
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
                <div className={`p-3 rounded-lg ${
                  stat.color === 'text-red-600' ? 'bg-red-100' :
                  stat.color === 'text-yellow-600' ? 'bg-yellow-100' :
                  'bg-green-100'
                }`}>
                  {stat.color === 'text-green-600' ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertTriangle className={`h-6 w-6 ${stat.color}`} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Alerts */}
      <div className="space-y-6 mb-8">
        <h2 className="text-xl font-bold">Action Required</h2>
        {alerts.map((alert, index) => (
          <Card key={index} className={`${
            alert.severity === 'urgent' ? 'border-red-200 bg-red-50/50' : 'border-yellow-200 bg-yellow-50/50'
          }`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={alert.severity === 'urgent' ? 'destructive' : 'secondary'}>
                      {alert.severity === 'urgent' ? 'Urgent' : 'Warning'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{alert.type}</span>
                  </div>
                  <CardTitle className="text-lg mb-1">{alert.title}</CardTitle>
                  <CardDescription className="text-base">{alert.description}</CardDescription>
                </div>
                <div className={`p-3 rounded-lg ${
                  alert.severity === 'urgent' ? 'bg-red-100' : 'bg-yellow-100'
                }`}>
                  {alert.severity === 'urgent' ? (
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  ) : (
                    <Clock className="h-6 w-6 text-yellow-600" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Expires:</span>
                <span className="text-muted-foreground">{alert.expiryDate}</span>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm leading-relaxed">{alert.action}</p>
              </div>
              <div className="flex gap-3">
                <Button className={alert.severity === 'urgent' ? 'bg-red-600 hover:bg-red-700' : ''}>
                  {alert.actionButton}
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completed Compliance */}
      <div>
        <h2 className="text-xl font-bold mb-4">Completed & Up to Date</h2>
        <div className="space-y-3">
          {completedCompliance.map((item, index) => (
            <Card key={index}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-100">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Completed on {item.completedDate} • Valid until {item.validUntil}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Certificate
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
