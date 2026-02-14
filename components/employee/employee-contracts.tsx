"use client"

import { useState } from "react"
import { FileText, Download, Eye, TrendingUp, Award, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function EmployeeContracts() {
  const [activeTab, setActiveTab] = useState("contracts")

  const contracts = [
    { name: "Employment Contract", date: "Jan 15, 2023", type: "Contract", status: "Active" },
    { name: "NDA Agreement", date: "Jan 15, 2023", type: "Agreement", status: "Active" },
    { name: "Remote Work Policy", date: "Mar 10, 2023", type: "Policy", status: "Active" }
  ]

  const equityGrants = [
    {
      type: "Initial Equity Grant",
      date: "Jan 15, 2023",
      totalShares: 10000,
      vestedShares: 2500,
      vestingSchedule: "4 years with 1-year cliff"
    },
    {
      type: "Performance Bonus Grant",
      date: "Jan 10, 2024",
      totalShares: 2000,
      vestedShares: 0,
      vestingSchedule: "2 years monthly vesting"
    }
  ]

  const history = [
    { action: "Contract Amendment Signed", date: "Mar 10, 2024", type: "Contract" },
    { action: "Equity Grant Received", date: "Jan 10, 2024", type: "Equity" },
    { action: "Annual Review Completed", date: "Dec 15, 2023", type: "Review" },
    { action: "Promotion Letter Issued", date: "Jul 1, 2023", type: "Contract" }
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contracts & Equity</h1>
        <p className="text-muted-foreground">Manage your employment documents and equity details</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-muted p-1">
          <TabsTrigger value="contracts" className="rounded-md px-6">Contracts</TabsTrigger>
          <TabsTrigger value="equity" className="rounded-md px-6">Equity</TabsTrigger>
          <TabsTrigger value="history" className="rounded-md px-6">History</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4">
          {contracts.map((contract, index) => (
            <Card key={index}>
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
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    {contract.status}
                  </span>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
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
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Shares Granted</CardTitle>
                <CardDescription>Across all equity grants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">12,000</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Shares Vested</CardTitle>
                <CardDescription>Currently available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">2,500</div>
                <div className="text-sm text-muted-foreground mt-2">20.8% of total</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {equityGrants.map((grant, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{grant.type}</CardTitle>
                      <CardDescription>Granted on {grant.date}</CardDescription>
                    </div>
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Shares</p>
                      <p className="text-2xl font-bold">{grant.totalShares.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vested Shares</p>
                      <p className="text-2xl font-bold">{grant.vestedShares.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Vesting Schedule</p>
                    <p className="text-sm font-medium">{grant.vestingSchedule}</p>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${(grant.vestedShares / grant.totalShares) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {history.map((item, index) => (
            <Card key={index}>
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
