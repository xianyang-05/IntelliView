"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle2, Clock, Globe, Shield, Stethoscope, ArrowRight, X, Upload, Download, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

type ModalType = "visa" | "training" | "appointment" | null

export function EmployeeCompliance() {
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  const stats = [
    { label: "Active Alerts", value: 3, icon: <AlertTriangle className="h-5 w-5 text-orange-500" />, color: "text-red-500" },
    { label: "Upcoming", value: 2, icon: <Clock className="h-5 w-5 text-yellow-500" />, color: "text-yellow-500" },
    { label: "All Clear", value: 8, icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, color: "text-emerald-500" },
  ]

  const alerts = [
    {
      title: "Your work visa expires in 30 days",
      severity: "Urgent",
      sevColor: "bg-red-500/20 text-red-400",
      borderColor: "border-l-red-500",
      icon: <Globe className="h-5 w-5 text-red-400" />,
      type: "EP Pass - Singapore",
      expiryDate: "Expires Apr 15, 2024",
      tip: "Start renewal now. Processing typically takes 3-4 weeks.",
      actionButton: "Start Renewal →",
      modalType: "visa" as ModalType
    },
    {
      title: "Mandatory safety training expires next month",
      severity: "Upcoming",
      sevColor: "bg-yellow-500/20 text-yellow-400",
      borderColor: "border-l-yellow-500",
      icon: <Shield className="h-5 w-5 text-yellow-500" />,
      type: "Workplace Safety & Health Certificate",
      expiryDate: "Expires Mar 20, 2024",
      tip: "Schedule a refresher course. Available slots open for next week.",
      actionButton: "Schedule Training →",
      modalType: "training" as ModalType
    },
    {
      title: "Medical certificate renewal needed",
      severity: "Upcoming",
      sevColor: "bg-yellow-500/20 text-yellow-400",
      borderColor: "border-l-emerald-500",
      icon: <Stethoscope className="h-5 w-5 text-emerald-500" />,
      type: "Annual health check",
      expiryDate: "Due by May 1, 2024",
      tip: "Book your annual health check. Partner clinic has slots available.",
      actionButton: "Book Appointment →",
      modalType: "appointment" as ModalType
    }
  ]

  // Render the renewal/training/appointment modal
  const renderModal = () => {
    if (!activeModal) return null

    const isVisa = activeModal === "visa"
    const isTraining = activeModal === "training"

    const modalConfig = {
      visa: {
        title: "Work Visa Renewal",
        icon: <Globe className="h-6 w-6 text-white" />,
        iconBg: "bg-red-500",
        ref: "#1-2026",
        docTitle: "APPLICATION FOR EXTENSION OF VISIT PASS",
        docSubtitle: "Immigration Act (Chapter 133)",
        formLabel: "FORM 14",
        aiTip: "Start renewal now. Processing typically takes 3-4 weeks.",
      },
      training: {
        title: "Safety Training Renewal",
        icon: <Shield className="h-6 w-6 text-white" />,
        iconBg: "bg-teal-500",
        ref: "#2-2026",
        docTitle: "CERTIFICATE OF COMPLETION",
        docSubtitle: "This certifies that",
        formLabel: "",
        aiTip: "Schedule a refresher course. Available slots open for next week.",
      },
      appointment: {
        title: "Medical Certificate Renewal",
        icon: <Stethoscope className="h-6 w-6 text-white" />,
        iconBg: "bg-emerald-500",
        ref: "#3-2026",
        docTitle: "MEDICAL FITNESS CERTIFICATE",
        docSubtitle: "This certifies that the employee",
        formLabel: "",
        aiTip: "Book your annual health check. Partner clinic has slots available.",
      }
    }

    const config = modalConfig[activeModal]

    return (
      <>
        <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setActiveModal(null)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.iconBg}`}>
                    {config.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{config.title}</h2>
                    <p className="text-sm text-muted-foreground">Application Portal • Ref: {config.ref}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setActiveModal(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-x">
              {/* Left: Details & Upload */}
              <ScrollArea className="h-[calc(90vh-200px)]">
                <div className="p-6 space-y-6">
                  {/* Step Indicator */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                      <span className="font-medium">Details</span>
                    </div>
                    <div className="h-px w-8 bg-border" />
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                      <span className="font-medium">Documents</span>
                    </div>
                    <div className="h-px w-8 bg-border" />
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">3</span>
                      <span className="text-muted-foreground">Review</span>
                    </div>
                  </div>

                  {/* Employee Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Employee Name</p>
                      <div className="bg-secondary/50 border rounded-lg px-3 py-2 text-sm">Alex Chen</div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Employee ID</p>
                      <div className="bg-secondary/50 border rounded-lg px-3 py-2 text-sm">EMP-2024-001</div>
                    </div>
                  </div>

                  {/* Visa-specific Details */}
                  {isVisa && (
                    <Card className="border-emerald-500/30">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center gap-2 text-emerald-500 text-sm font-semibold">
                          <Globe className="h-4 w-4" />
                          Visa Details
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Current Pass Type</p>
                            <div className="bg-secondary/50 border rounded-lg px-3 py-2 text-sm">Employment Pass (EP)</div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">FIN / NRIC</p>
                            <div className="bg-secondary/50 border rounded-lg px-3 py-2 text-sm">G1234567Z</div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Current Expiry</p>
                            <div className="bg-secondary/50 border rounded-lg px-3 py-2 text-sm text-red-400">15 Apr 2024</div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Requested Extension</p>
                            <div className="bg-secondary/50 border rounded-lg px-3 py-2 text-sm">24 Months</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Upload Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Upload Supporting Documents</h3>
                      <span className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 5MB)</span>
                    </div>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                        <Upload className="h-5 w-5 text-emerald-500" />
                      </div>
                      <p className="text-sm font-medium">Click to upload files</p>
                      <p className="text-xs text-muted-foreground">or drag and drop here</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Right: Document Guidelines */}
              <ScrollArea className="h-[calc(90vh-200px)]">
                <div className="p-6 space-y-5">
                  {/* Guidelines Header */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                      <h3 className="font-semibold">Document Guidelines</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Please ensure your uploads match the official format.</p>
                  </div>

                  {/* Required Format Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-sm">REQUIRED FORMAT</h4>
                      <button className="text-xs border rounded-full px-3 py-1 text-muted-foreground hover:bg-secondary">Preview Mode</button>
                    </div>

                    {/* Document Preview */}
                    <div className="border rounded-lg overflow-hidden bg-white text-black">
                      <div className="p-6 text-center space-y-2">
                        {isVisa ? (
                          <>
                            <div className="flex justify-end">
                              <span className="text-xs border px-2 py-0.5">FORM 14</span>
                            </div>
                            <h3 className="font-bold text-lg">APPLICATION FOR EXTENSION OF VISIT PASS</h3>
                            <p className="text-sm italic text-gray-600">Immigration Act (Chapter 133)</p>
                            <div className="border-t mt-4 pt-4 text-left">
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div>
                                  <p className="text-xs text-gray-500">PASSPORT NO</p>
                                  <p className="font-bold">E1234567X</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">FIN / NRIC</p>
                                  <p className="font-bold">G1234567Z</p>
                                </div>
                              </div>
                              <p className="text-xs font-bold mt-4 border-t pt-2">PART A: PARTICULARS OF APPLICANT</p>
                            </div>
                          </>
                        ) : isTraining ? (
                          <>
                            <div className="text-3xl mb-2">✦</div>
                            <h3 className="font-bold text-xl tracking-wide text-amber-700">CERTIFICATE OF COMPLETION</h3>
                            <div className="border-t border-amber-200 my-3" />
                            <p className="italic text-gray-600">This certifies that</p>
                            <p className="font-bold text-xl mt-2 text-amber-800">ALEX CHEN</p>
                          </>
                        ) : (
                          <>
                            <div className="text-3xl mb-2">⚕</div>
                            <h3 className="font-bold text-xl tracking-wide text-emerald-700">MEDICAL FITNESS CERTIFICATE</h3>
                            <div className="border-t border-emerald-200 my-3" />
                            <p className="italic text-gray-600">This certifies that the employee</p>
                            <p className="font-bold text-xl mt-2 text-emerald-800">ALEX CHEN</p>
                            <p className="text-sm text-gray-500 mt-1">has completed the annual health check</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button className="w-full border rounded-lg p-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-secondary transition-colors">
                    <Download className="h-4 w-4" />
                    Download Empty Template
                  </button>

                  {/* AI Tip */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-sm font-semibold text-amber-500 mb-1">AI Tip</p>
                    <p className="text-sm text-amber-400/80">{config.aiTip}</p>
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Submit Application</Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="p-8">
      {renderModal()}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Compliance Alerts</h1>
        <p className="text-muted-foreground">Stay on top of your certifications, training, and documentation</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                {stat.icon}
                <div>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Required */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Action Required</h2>
        {alerts.map((alert, index) => (
          <Card key={index} className={`border-l-4 ${alert.borderColor}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {alert.icon}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{alert.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${alert.sevColor}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {alert.type} | {alert.expiryDate}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-yellow-500" />
                      {alert.tip}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="shrink-0 gap-1 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                  onClick={() => setActiveModal(alert.modalType)}
                >
                  {alert.actionButton}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
