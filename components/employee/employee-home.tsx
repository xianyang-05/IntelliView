"use client"

import { FileText, Send, Calendar, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function EmployeeHome() {
  const quickActions = [
    {
      title: "View My Contract",
      description: "Access your employment agreement",
      icon: FileText,
      action: "View Contract"
    },
    {
      title: "Submit Expense",
      description: "Submit reimbursement requests",
      icon: Send,
      action: "Submit"
    },
    {
      title: "Request Leave",
      description: "Apply for time off",
      icon: Calendar,
      action: "Request"
    }
  ]

  const recentActivity = [
    { action: "Leave request approved", time: "2 hours ago", status: "success" },
    { action: "Expense claim submitted", time: "1 day ago", status: "pending" },
    { action: "Contract viewed", time: "3 days ago", status: "info" },
    { action: "Performance review completed", time: "1 week ago", status: "success" }
  ]

  const aiSuggestions = [
    "Your Q1 performance review is due in 5 days",
    "Consider reviewing your equity vesting schedule",
    "3 team members on leave next week - plan accordingly"
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Sarah</h1>
        <p className="text-muted-foreground">{"Here's what's happening with your account today"}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {quickActions.map((item, index) => {
          const Icon = item.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">{item.action}</Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Suggestions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>AI Suggestions</CardTitle>
            </div>
            <CardDescription>Personalized recommendations for you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="p-3 bg-secondary rounded-lg text-sm">
                {suggestion}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'success' ? 'bg-green-500' :
                    item.status === 'pending' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
