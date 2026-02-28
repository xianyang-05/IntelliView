"use client"

import { Briefcase, MapPin, Building2, Users, Mail, Phone, Calendar, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EmployeeHome() {
  const employeeInfo = {
    name: "Alex Chan",
    position: "Senior Product Designer",
    department: "Design",
    employeeId: "EMP-2024-0142",
    email: "alex.chan@openhire.com",
    phone: "+60 12-345 6789",
    location: "Kuala Lumpur, Malaysia",
    startDate: "March 1, 2024",
    reportingTo: "Head of Design",
    employmentType: "Full-Time",
  }

  const jobScope = [
    "Lead end-to-end product design for web and mobile applications",
    "Create wireframes, prototypes, and high-fidelity UI mockups",
    "Conduct user research and usability testing to inform design decisions",
    "Collaborate with product managers and engineers to define requirements",
    "Establish and maintain design systems and component libraries",
    "Mentor junior designers and conduct design reviews",
    "Present design concepts and rationale to stakeholders",
    "Drive UX improvements based on analytics and user feedback",
  ]

  const keyResponsibilities = [
    {
      area: "Product Design",
      description: "Own the design process from concept to delivery for core product features",
      icon: Briefcase,
    },
    {
      area: "Design System",
      description: "Maintain and evolve the company-wide design system and component library",
      icon: Award,
    },
    {
      area: "User Research",
      description: "Plan and conduct user interviews, surveys, and usability tests",
      icon: Users,
    },
    {
      area: "Cross-functional Collaboration",
      description: "Work closely with engineering, product, and marketing teams",
      icon: Building2,
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Employee Profile</h1>
        <p className="text-muted-foreground">Your role information and job scope</p>
      </div>

      {/* Employee Info Card */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">
              AC
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{employeeInfo.name}</h2>
              <p className="text-emerald-500 font-semibold text-lg mb-4">{employeeInfo.position}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{employeeInfo.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{employeeInfo.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{employeeInfo.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{employeeInfo.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {employeeInfo.startDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Reports to {employeeInfo.reportingTo}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{employeeInfo.employmentType}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Key Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-emerald-500" />
              Key Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {keyResponsibilities.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50">
                  <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
                    <Icon className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{item.area}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Job Scope */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-500" />
              Job Scope
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {jobScope.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-emerald-500">{index + 1}</span>
                  </div>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
