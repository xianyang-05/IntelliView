"use client"

import { useState, useEffect, useRef } from "react"
import { AlertTriangle, CheckCircle2, Clock, Globe, Shield, Stethoscope, ArrowRight, X, Upload, Download, Sparkles, Check, FileText, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

type ModalType = "visa" | "training" | "appointment" | null

export function EmployeeCompliance({ autoOpenVisa }: { autoOpenVisa?: boolean }) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  useEffect(() => {
    if (autoOpenVisa) {
      setActiveModal("visa")
    }
  }, [autoOpenVisa])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

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
        checklist: [
          { label: "Passport validity > 6 months", status: "valid" },
          { label: "Recent passport-sized photo (white background)", status: "valid" },
          { label: "Form 14 signed by both parties", status: uploadedFile ? "valid" : "pending" }
        ]
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
        checklist: [
          { label: "Certificate from accredited provider", status: "valid" },
          { label: "Completion date within 6 months", status: "valid" },
          { label: "Employee ID matches", status: uploadedFile ? "valid" : "pending" }
        ]
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
        checklist: [
          { label: "Signed by licensed physician", status: "valid" },
          { label: "Tests completed within 30 days", status: "valid" },
          { label: "Company stamp present", status: uploadedFile ? "valid" : "pending" }
        ]
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

                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.jpg,.png,.jpeg"
                    />

                    {uploadedFile ? (
                      <div className="border rounded-lg p-4 flex items-center gap-4 bg-muted/20">
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                          <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Ready for submission
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={removeFile}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                          <Upload className="h-5 w-5 text-emerald-500" />
                        </div>
                        <p className="text-sm font-medium">Click to upload files</p>
                        <p className="text-xs text-muted-foreground">or drag and drop here</p>
                      </div>
                    )}
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

                    {/* Document Preview & Full Content */}
                    <div className="border rounded-lg overflow-hidden bg-white text-black shadow-sm relative">
                      <ScrollArea className="h-[300px] w-full">
                        <div className="p-8 space-y-6">
                          {isVisa ? (
                            <>
                              <div className="flex justify-between items-start border-b-2 border-black pb-4">
                                <div>
                                  <h3 className="font-bold text-xl">REPUBLIC OF SINGAPORE</h3>
                                  <p className="text-sm font-serif">IMMIGRATION & CHECKPOINTS AUTHORITY</p>
                                </div>
                                <div className="border-2 border-black px-2 py-1 text-xs font-bold">
                                  FORM 14
                                </div>
                              </div>

                              <div className="text-center py-2">
                                <h2 className="font-bold text-lg underline uppercase">Application for Extension of Visit Pass</h2>
                                <p className="text-xs italic">Regulation 12 of the Immigration Regulations</p>
                              </div>

                              <div className="space-y-4 text-xs">
                                <p className="font-bold border-b border-black pb-1">PART A: PARTICULARS OF APPLICANT</p>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="font-bold">Name</p>
                                    <p className="border-b border-dotted border-black">ALEX CHEN</p>
                                  </div>
                                  <div>
                                    <p className="font-bold">Sex</p>
                                    <p className="border-b border-dotted border-black">MALE</p>
                                  </div>
                                  <div>
                                    <p className="font-bold">Date of Birth</p>
                                    <p className="border-b border-dotted border-black">12/05/1990</p>
                                  </div>
                                  <div>
                                    <p className="font-bold">Nationality</p>
                                    <p className="border-b border-dotted border-black">MALAYSIAN</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="font-bold">Travel Document No.</p>
                                    <p className="border-b border-dotted border-black">E1234567X</p>
                                  </div>
                                  <div>
                                    <p className="font-bold">Expiry Date</p>
                                    <p className="border-b border-dotted border-black">15/04/2030</p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2 text-xs pt-4">
                                <p className="font-bold border-b border-black pb-1">PART B: DECLARATION</p>
                                <p>I hereby declare that all the particulars furnished by me in this application are true and correct.</p>
                                <div className="h-16 border-b border-black mt-8 flex items-end justify-between">
                                  <span>Signature of Applicant</span>
                                  <span>Date: 14/02/2026</span>
                                </div>
                              </div>
                            </>
                          ) : isTraining ? (
                            <div className="text-center border-8 border-double border-amber-900/20 p-6 h-full min-h-[400px]">
                              <div className="mb-8">
                                <div className="text-4xl mb-4 text-amber-700">✦</div>
                                <h1 className="font-serif text-3xl font-bold text-amber-900 mb-2">Certificate of Completion</h1>
                                <p className="text-amber-800 italic">Workplace Safety & Health Council</p>
                              </div>

                              <p className="text-lg mb-4 font-serif">This is to certify that</p>
                              <h2 className="text-2xl font-bold text-amber-900 border-b-2 border-amber-900/30 inline-block px-8 py-2 mb-4">ALEX CHEN</h2>

                              <p className="text-lg mb-8 font-serif">
                                has successfully completed the<br />
                                <span className="font-bold">Advanced Workplace Safety Module (Level 2)</span>
                              </p>

                              <div className="grid grid-cols-2 gap-8 mt-12 text-sm font-serif">
                                <div className="border-t border-black pt-2">
                                  <p className="font-bold">Instructor Signature</p>
                                </div>
                                <div className="border-t border-black pt-2">
                                  <p className="font-bold">Date: Feb 10, 2026</p>
                                </div>
                              </div>
                              <div className="mt-8 text-xs text-muted-foreground">Certificate ID: WSH-2026-8892</div>
                            </div>
                          ) : (
                            <div className="space-y-6 font-sans">
                              <div className="flex items-center gap-4 border-b-2 border-emerald-600 pb-4">
                                <div className="bg-emerald-600 text-white p-2 rounded">
                                  <Stethoscope className="h-6 w-6" />
                                </div>
                                <div>
                                  <h2 className="text-xl font-bold text-emerald-800">CITY MEDICAL GROUP</h2>
                                  <p className="text-xs text-emerald-600">Excellence in Healthcare</p>
                                </div>
                              </div>

                              <div className="text-center py-4 bg-emerald-50">
                                <h1 className="text-xl font-bold text-emerald-900 uppercase tracking-widest">Medical Fitness Certificate</h1>
                              </div>

                              <div className="space-y-4 text-sm">
                                <p>This is to certify that <span className="font-bold underline">MR. ALEX CHEN</span>,</p>
                                <p>Identification No: <span className="font-bold">G1234567Z</span></p>
                                <p>Has undergone a complete medical examination on <span className="font-bold">Feb 12, 2026</span>.</p>
                              </div>

                              <div className="border rounded p-4 bg-gray-50 text-sm space-y-2">
                                <div className="flex justify-between border-b pb-1">
                                  <span>Physical Examination</span>
                                  <span className="font-bold text-emerald-600">FIT</span>
                                </div>
                                <div className="flex justify-between border-b pb-1">
                                  <span>X-Ray Screening</span>
                                  <span className="font-bold text-emerald-600">NORMAL</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Blood Test Panel</span>
                                  <span className="font-bold text-emerald-600">CLEARED</span>
                                </div>
                              </div>

                              <div className="pt-8 grid grid-cols-2 gap-8">
                                <div>
                                  <div className="h-12 border-b border-black mb-1">
                                    <img src="/signature" alt="" className="h-10 opacity-0" /> {/* Placeholder */}
                                  </div>
                                  <p className="text-xs font-bold">Dr. Sarah Tan (MCR 12345)</p>
                                </div>
                                <div className="flex items-end justify-end">
                                  <div className="w-20 h-20 border-2 border-emerald-600 rounded-full flex items-center justify-center text-center text-xs text-emerald-600 rotate-12 bg-emerald-50/50">
                                    OFFICIAL<br />STAMP<br />VERIFIED
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>

                  {/* Validation Checklist */}
                  <div className="bg-secondary/20 rounded-lg p-4 border">
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Validation Checklist
                    </h4>
                    <div className="space-y-3">
                      {config.checklist.map((item, index) => (
                        <div key={index} className="flex items-start gap-2.5">
                          <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.status === 'valid' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                            }`}>
                            {item.status === 'valid' ? <Check className="h-2.5 w-2.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                          </div>
                          <span className={`text-sm ${item.status === 'valid' ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {item.label}
                          </span>
                        </div>
                      ))}
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
