"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    User, Mail, Phone, MapPin, Building2, Calendar, FileText,
    Shield, Lock, CreditCard, Upload, File, X, MessageSquare
} from "lucide-react"

export function EmployeeProfile() {
    const [uploadedDocuments, setUploadedDocuments] = useState([
        { name: "Passport_Copy.pdf", size: "2.4 MB", date: "Jan 10, 2024" },
        { name: "University_Degree.pdf", size: "1.8 MB", date: "Feb 15, 2022" },
    ])
    const [isUploading, setIsUploading] = useState(false)

    const handleFileUpload = () => {
        setIsUploading(true)
        // Simulate upload delay
        setTimeout(() => {
            const newDoc = {
                name: `Document_${Math.floor(Math.random() * 1000)}.pdf`,
                size: "1.2 MB",
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            }
            setUploadedDocuments([...uploadedDocuments, newDoc])
            setIsUploading(false)
        }, 1500)
    }

    const removeDocument = (index: number) => {
        const newDocs = [...uploadedDocuments]
        newDocs.splice(index, 1)
        setUploadedDocuments(newDocs)
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Profile Header */}
            <div className="bg-slate-900 text-white p-8 rounded-xl shadow-lg flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <User className="h-64 w-64" />
                </div>

                <Avatar className="h-24 w-24 border-4 border-slate-700 shadow-xl z-10">
                    <AvatarImage src="/placeholder-user.jpg" alt="Alex Chan" />
                    <AvatarFallback className="bg-emerald-600 text-xl font-bold">AC</AvatarFallback>
                </Avatar>

                <div className="flex-1 z-10 text-center md:text-left">
                    <h1 className="text-3xl font-bold">Alex Chan</h1>
                    <p className="text-slate-300 text-lg mb-4">Data Analyst</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-3 py-1">Engineering</Badge>
                        <Badge variant="outline" className="text-slate-300 border-slate-600">San Francisco Office</Badge>
                        <Badge variant="outline" className="text-slate-300 border-slate-600">Full-time</Badge>
                    </div>
                </div>

                <div className="z-10 text-right hidden md:block">
                    <p className="text-xs text-slate-400 mb-1">Employee ID</p>
                    <p className="font-mono text-xl font-bold tracking-wider">EMP-2024-001</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Personal Info */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Personal Information */}
                    <Card className="bg-[#1e1e1e] border-slate-800 text-slate-200">
                        <CardHeader className="border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-2 text-emerald-500">
                                <User className="h-5 w-5" />
                                <CardTitle className="text-lg">Personal Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
                            <div className="space-y-1">
                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Full Name</Label>
                                <p className="font-medium">Alex Chan</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Email</Label>
                                <p className="font-medium text-blue-400">alex.chan@company.com</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Phone</Label>
                                <p className="font-medium">+1 (555) 123-4567</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Address</Label>
                                <p className="font-medium">123 Tech Street, San Francisco, CA 94102</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Emergency Contact */}
                    <Card className="bg-[#1e1e1e] border-slate-800 text-slate-200">
                        <CardHeader className="border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-2 text-red-400">
                                <PhysicsHeart className="h-5 w-5" />
                                <CardTitle className="text-lg">Emergency Contact</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-3 gap-6 pt-6">
                            <div className="space-y-1">
                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Name</Label>
                                <p className="font-medium">Sarah Chan</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Phone</Label>
                                <p className="font-medium">+1 (555) 987-6543</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Relationship</Label>
                                <p className="font-medium">Spouse</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Employment Information */}
                    <Card className="bg-[#1e1e1e] border-slate-800 text-slate-200">
                        <CardHeader className="border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-2 text-emerald-500">
                                <Building2 className="h-5 w-5" />
                                <CardTitle className="text-lg">Employment Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
                            <div className="space-y-1">
                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Department</Label>
                                <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-500" /> <p className="font-medium">Engineering</p></div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Manager</Label>
                                <div className="flex items-center gap-2"><User className="h-4 w-4 text-slate-500" /> <p className="font-medium">David Wilson</p></div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Start Date</Label>
                                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-500" /> <p className="font-medium">March 15, 2022</p></div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-slate-500 text-xs uppercase tracking-wider">Work Location</Label>
                                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-500" /> <p className="font-medium">San Francisco Office</p></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Documents */}
                    <Card className="bg-[#1e1e1e] border-slate-800 text-slate-200">
                        <CardHeader className="border-b border-slate-800 pb-4 flex flex-row justify-between items-center">
                            <div className="flex items-center gap-2 text-blue-400">
                                <FileText className="h-5 w-5" />
                                <CardTitle className="text-lg">Personal Documents</CardTitle>
                            </div>
                            <Button size="sm" onClick={handleFileUpload} disabled={isUploading} className="bg-blue-600 hover:bg-blue-700">
                                {isUploading ? "Uploading..." : <><Upload className="h-4 w-4 mr-2" /> Upload</>}
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-3">
                            {uploadedDocuments.map((doc, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-700 rounded-md">
                                            <File className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-slate-200">{doc.name}</p>
                                            <p className="text-xs text-slate-500">{doc.size} • {doc.date}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-400 hover:bg-slate-700" onClick={() => removeDocument(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Contract Summary */}
                    <Card className="bg-[#0f291e] border-emerald-900/50 text-emerald-50">
                        <CardHeader className="border-b border-emerald-900/50 pb-4">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <FileText className="h-5 w-5" />
                                <CardTitle className="text-lg">Contract Summary</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="flex justify-between items-center">
                                <span className="text-emerald-400/70 text-sm">Base Salary</span>
                                <span className="font-bold text-lg">$145,000</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-emerald-400/70 text-sm">Annual Bonus</span>
                                <span className="font-bold">15%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-emerald-400/70 text-sm">Equity</span>
                                <span className="font-bold">2,500 RSUs</span>
                            </div>

                            <div className="pt-4 mt-4 border-t border-emerald-900/50 flex justify-between items-center">
                                <span className="text-emerald-400/70 text-sm">Next Review</span>
                                <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">March 2025</Badge>
                            </div>

                            <Button variant="outline" className="w-full mt-2 border-emerald-700 text-emerald-400 hover:bg-emerald-900 hover:text-emerald-300">
                                <FileText className="h-4 w-4 mr-2" /> View Full Contract
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Security */}
                    <Card className="bg-[#1e1e1e] border-slate-800 text-slate-200">
                        <CardHeader className="border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-2 text-emerald-500">
                                <Shield className="h-5 w-5" />
                                <CardTitle className="text-lg">Security</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-3">
                            <Button variant="outline" className="w-full justify-start border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800">
                                <Lock className="h-4 w-4 mr-3" /> Change Password
                            </Button>
                            <Button variant="outline" className="w-full justify-start border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800">
                                <CreditCard className="h-4 w-4 mr-3" /> Payment Methods
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Data Privacy */}
                    <Card className="bg-[#1e1e1e] border-slate-800 text-slate-200">
                        <CardHeader className="border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Shield className="h-5 w-5" />
                                <CardTitle className="text-lg">Data Privacy</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-sm text-slate-500 leading-relaxed mb-4">
                                Your personal data is protected under company policy and GDPR regulations. Contact HR for data access or deletion requests.
                            </p>
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                                <MessageSquare className="h-4 w-4 mr-2" /> Contact Data Officer
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function PhysicsHeart(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
    )
}
