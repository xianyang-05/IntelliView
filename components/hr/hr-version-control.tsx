"use client"

import { Archive, FileText, Award, Scale, Briefcase, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function HrVersionControl() {
  const employmentPolicies = [
    {
      title: "Employment Contract Template",
      version: "v3.2",
      lastUpdated: "Mar 1, 2024",
      updatedBy: "Legal Team",
      changes: "Updated termination clauses",
      status: "current"
    },
    {
      title: "Remote Work Policy",
      version: "v2.1",
      lastUpdated: "Feb 15, 2024",
      updatedBy: "HR Director",
      changes: "Added hybrid work guidelines",
      status: "current"
    },
    {
      title: "Code of Conduct",
      version: "v1.5",
      lastUpdated: "Jan 20, 2024",
      updatedBy: "Compliance Team",
      changes: "Enhanced DEI policies",
      status: "current"
    }
  ]

  const equityAgreements = [
    {
      title: "Stock Option Plan 2024",
      version: "v2.0",
      lastUpdated: "Jan 1, 2024",
      updatedBy: "Finance Team",
      changes: "New vesting schedules",
      totalGrants: 156
    },
    {
      title: "ESOP Agreement Template",
      version: "v1.8",
      lastUpdated: "Dec 15, 2023",
      updatedBy: "Legal Team",
      changes: "Tax implications updated",
      totalGrants: 248
    },
    {
      title: "Performance Equity Grant",
      version: "v1.2",
      lastUpdated: "Nov 10, 2023",
      updatedBy: "HR Director",
      changes: "Performance metrics revised",
      totalGrants: 45
    }
  ]

  const companyRules = [
    {
      title: "Information Security Policy",
      version: "v4.1",
      lastUpdated: "Mar 10, 2024",
      updatedBy: "Security Team",
      changes: "Added AI usage guidelines",
      category: "Security"
    },
    {
      title: "Expense Reimbursement Policy",
      version: "v2.3",
      lastUpdated: "Feb 20, 2024",
      updatedBy: "Finance Team",
      changes: "Updated spending limits",
      category: "Finance"
    },
    {
      title: "Leave & Absence Policy",
      version: "v3.0",
      lastUpdated: "Jan 15, 2024",
      updatedBy: "HR Team",
      changes: "Added parental leave extension",
      category: "Benefits"
    }
  ]

  const ndaAgreements = [
    {
      title: "Standard NDA Agreement",
      version: "v2.5",
      lastUpdated: "Mar 5, 2024",
      updatedBy: "Legal Team",
      signedCount: 248
    },
    {
      title: "Consultant NDA",
      version: "v1.9",
      lastUpdated: "Feb 10, 2024",
      updatedBy: "Legal Team",
      signedCount: 45
    },
    {
      title: "Partner NDA",
      version: "v2.2",
      lastUpdated: "Jan 25, 2024",
      updatedBy: "Business Development",
      signedCount: 18
    }
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Version Control</h1>
        <p className="text-muted-foreground">Track and manage all major company agreements and policies</p>
      </div>

      <Tabs defaultValue="policies" className="space-y-6">
        <TabsList>
          <TabsTrigger value="policies">
            <FileText className="h-4 w-4 mr-2" />
            Employment Policies
          </TabsTrigger>
          <TabsTrigger value="equity">
            <Award className="h-4 w-4 mr-2" />
            Equity Agreements
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Scale className="h-4 w-4 mr-2" />
            Company Rules
          </TabsTrigger>
          <TabsTrigger value="nda">
            <Briefcase className="h-4 w-4 mr-2" />
            NDA & Confidentiality
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          {employmentPolicies.map((policy, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{policy.title}</h3>
                        <Badge>{policy.version}</Badge>
                        <Badge variant="outline">{policy.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground">Last Updated</p>
                          <p className="font-medium">{policy.lastUpdated}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Updated By</p>
                          <p className="font-medium">{policy.updatedBy}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-sm"><span className="font-medium">Recent Changes:</span> {policy.changes}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button size="sm">View Current Version</Button>
                  <Button size="sm" variant="outline">View History</Button>
                  <Button size="sm" variant="ghost">Download PDF</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="equity" className="space-y-4">
          {equityAgreements.map((agreement, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{agreement.title}</h3>
                        <Badge>{agreement.version}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground">Last Updated</p>
                          <p className="font-medium">{agreement.lastUpdated}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Updated By</p>
                          <p className="font-medium">{agreement.updatedBy}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Grants</p>
                          <p className="font-medium">{agreement.totalGrants}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-sm"><span className="font-medium">Recent Changes:</span> {agreement.changes}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button size="sm">View Agreement</Button>
                  <Button size="sm" variant="outline">View Grants</Button>
                  <Button size="sm" variant="ghost">Download</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          {companyRules.map((rule, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Scale className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{rule.title}</h3>
                        <Badge>{rule.version}</Badge>
                        <Badge variant="outline">{rule.category}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground">Last Updated</p>
                          <p className="font-medium">{rule.lastUpdated}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Updated By</p>
                          <p className="font-medium">{rule.updatedBy}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-sm"><span className="font-medium">Recent Changes:</span> {rule.changes}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button size="sm">View Policy</Button>
                  <Button size="sm" variant="outline">View History</Button>
                  <Button size="sm" variant="ghost">Notify Staff</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="nda" className="space-y-4">
          {ndaAgreements.map((nda, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{nda.title}</h3>
                        <Badge>{nda.version}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground">Last Updated</p>
                          <p className="font-medium">{nda.lastUpdated}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Updated By</p>
                          <p className="font-medium">{nda.updatedBy}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Signed Count</p>
                          <p className="font-medium">{nda.signedCount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button size="sm">View Template</Button>
                  <Button size="sm" variant="outline">View Signatories</Button>
                  <Button size="sm" variant="ghost">Download</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Version History Summary */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Recent Updates</CardTitle>
          </div>
          <CardDescription>Latest changes across all documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { doc: "Employment Contract Template", action: "Updated to v3.2", date: "Mar 1, 2024", user: "Legal Team" },
            { doc: "Information Security Policy", action: "Updated to v4.1", date: "Mar 10, 2024", user: "Security Team" },
            { doc: "Standard NDA Agreement", action: "Updated to v2.5", date: "Mar 5, 2024", user: "Legal Team" },
            { doc: "Remote Work Policy", action: "Updated to v2.1", date: "Feb 15, 2024", user: "HR Director" }
          ].map((update, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <p className="font-medium text-sm">{update.doc}</p>
                <p className="text-xs text-muted-foreground">{update.action} by {update.user}</p>
              </div>
              <span className="text-xs text-muted-foreground">{update.date}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
