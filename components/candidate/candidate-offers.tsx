"use client"

import { useState, useEffect, useRef } from "react"
import {
    Send, Clock, CheckCircle, FileText, Building2,
    DollarSign, Calendar, Briefcase, Award, Sparkles,
    Loader2, Mail, PenLine, Undo2, Download, MessageCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, doc, updateDoc, getDoc, limit } from "firebase/firestore"
import { toast } from "sonner"

interface OfferLetter {
    id: string
    candidate_name: string
    candidate_email: string
    position: string
    company_name: string
    salary: string
    start_date: string
    benefits: string
    contract_type: string
    probation: string
    annual_leave?: string
    status: "pending" | "accepted" | "declined"
    sent_at: string
    resume_report_id: string
    signature?: string
    signed_at?: string
}

function getStatusBadge(status: string) {
    if (status === "accepted") return "bg-emerald-100 text-emerald-700 border-emerald-200"
    if (status === "declined") return "bg-red-100 text-red-700 border-red-200"
    return "bg-amber-100 text-amber-700 border-amber-200"
}

function getStatusLabel(status: string) {
    if (status === "accepted") return "Signed & Accepted"
    if (status === "declined") return "Declined"
    return "Pending Signature"
}

export function CandidateOffers({ currentUser }: { currentUser?: any }) {
    const [offers, setOffers] = useState<OfferLetter[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOffer, setSelectedOffer] = useState<OfferLetter | null>(null)
    const [showDetailModal, setShowDetailModal] = useState(false)

    // ── Signing state (same pattern as employee-contracts) ──
    const [isSignDialogOpen, setIsSignDialogOpen] = useState(false)
    const [signingOfferId, setSigningOfferId] = useState<string | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)

    // Initialize canvas context when dialog opens
    useEffect(() => {
        if (isSignDialogOpen && canvasRef.current) {
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.lineWidth = 2
                ctx.lineCap = 'round'
                ctx.strokeStyle = '#000000'
            }
        }
    }, [isSignDialogOpen])

    useEffect(() => {
        async function fetchOffers() {
            try {
                const email = currentUser?.email || ""
                if (!email) { setLoading(false); return }

                const q = query(
                    collection(db, "offer_letters"),
                    where("candidate_email", "==", email)
                )
                const snapshot = await getDocs(q)
                const data: OfferLetter[] = snapshot.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                })) as OfferLetter[]

                data.sort(
                    (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
                )
                setOffers(data)
            } catch (err) {
                console.error("Failed to fetch offers:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchOffers()
    }, [currentUser])

    // ── Canvas drawing functions (same as employee-contracts) ──
    const startDrawing = (e: any) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const rect = canvas.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY

        ctx.beginPath()
        ctx.moveTo(clientX - rect.left, clientY - rect.top)
        setIsDrawing(true)
    }

    const draw = (e: any) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        if (e.type === 'touchmove') e.preventDefault()

        const rect = canvas.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY

        ctx.lineTo(clientX - rect.left, clientY - rect.top)
        ctx.stroke()
    }

    const endDrawing = () => {
        setIsDrawing(false)
    }

    const clearSignature = () => {
        const canvas = canvasRef.current
        if (canvas) {
            const ctx = canvas.getContext('2d')
            ctx?.clearRect(0, 0, canvas.width, canvas.height)
        }
    }

    // ── Open signing dialog ──
    const openSignDialog = (offerId: string) => {
        setSigningOfferId(offerId)
        setIsSignDialogOpen(true)
    }

    // ── Save signature and accept offer ──
    const handleSignAndAccept = async () => {
        if (!canvasRef.current || !signingOfferId) return

        const dataUrl = canvasRef.current.toDataURL()
        const now = new Date().toISOString()

        try {
            await updateDoc(doc(db, "offer_letters", signingOfferId), {
                status: "accepted",
                signature: dataUrl,
                signed_at: now,
            })

            setOffers(prev =>
                prev.map(o => o.id === signingOfferId
                    ? { ...o, status: "accepted" as const, signature: dataUrl, signed_at: now }
                    : o
                )
            )
            if (selectedOffer?.id === signingOfferId) {
                setSelectedOffer(prev => prev
                    ? { ...prev, status: "accepted" as const, signature: dataUrl, signed_at: now }
                    : prev
                )
            }

            setIsSignDialogOpen(false)
            setSigningOfferId(null)
            toast.success("Offer Signed & Accepted!", {
                description: "Congratulations! Your signed acceptance has been recorded."
            })
        } catch (err) {
            console.error("Failed to sign offer:", err)
            toast.error("Failed to sign offer. Please try again.")
        }
    }

    const handleDecline = async (offerId: string) => {
        try {
            await updateDoc(doc(db, "offer_letters", offerId), { status: "declined" })
            setOffers(prev =>
                prev.map(o => o.id === offerId ? { ...o, status: "declined" as const } : o)
            )
            if (selectedOffer?.id === offerId) {
                setSelectedOffer(prev => prev ? { ...prev, status: "declined" as const } : prev)
            }
            toast.success("Offer Declined", {
                description: "Your response has been recorded."
            })
        } catch (err) {
            console.error("Failed to decline offer:", err)
            toast.error("Failed to submit response. Please try again.")
        }
    }

    const handleDownloadPDF = () => {
        if (!selectedOffer) return;
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error("Please allow popups to download the PDF");
            return;
        }

        const formattedDate = new Date(selectedOffer.sent_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const startDate = new Date(selectedOffer.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const probation = selectedOffer.probation === "0" ? "None" : selectedOffer.probation + " months";
        const annualLeave = selectedOffer.annual_leave ? selectedOffer.annual_leave + " days" : "Standard";
        const contractType = selectedOffer.contract_type.replace("_", " ");
        const salary = Number(selectedOffer.salary).toLocaleString();
        
        let signatureHtml = '';
        if (selectedOffer.status === 'accepted' && selectedOffer.signature) {
            const signedDate = selectedOffer.signed_at 
                ? new Date(selectedOffer.signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                : "N/A";
                
            signatureHtml = `
                <div class="signature-section">
                    <p style="font-weight: 600; margin-bottom: 5px;">Candidate Signature</p>
                    <p style="color: #64748b; font-size: 12px; margin: 0;">Signed on ${signedDate} - Verified electronically</p>
                    <img src="${selectedOffer.signature}" class="signature-img" />
                </div>
            `;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Offer Letter - ${selectedOffer.company_name}</title>
                <style>
                    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
                    h1 { font-size: 24px; margin-bottom: 5px; color: #0f172a; }
                    p { margin-bottom: 15px; }
                    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
                    .terms { background: #f8fafc; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0; }
                    .terms-grid { display: grid; grid-template-columns: 150px 1fr; gap: 12px; margin-top: 15px; }
                    .label { color: #64748b; font-weight: 500; }
                    .val { font-weight: 600; color: #0f172a; }
                    .signature-section { margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 24px; }
                    .signature-img { height: 80px; margin-top: 10px; }
                    @media print { 
                        body { padding: 0; }
                        @page { margin: 2cm; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>${selectedOffer.company_name}</h1>
                        <p style="color: #64748b; margin: 0;">Malaysia</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0;"><strong>Status:</strong> ${getStatusLabel(selectedOffer.status)}</p>
                        <p style="color: #64748b; font-size: 14px; margin: 5px 0 0;">Sent: ${formattedDate}</p>
                    </div>
                </div>
                
                <p>Dear <strong>${selectedOffer.candidate_name}</strong>,</p>
                <p>We are delighted to extend this offer of employment for the position of <strong>${selectedOffer.position}</strong> at ${selectedOffer.company_name}. We were impressed with your qualifications and believe you will be a valuable addition to our team.</p>
                
                <div class="terms">
                    <p style="font-weight: 600; font-size: 16px; margin: 0; color: #0f172a;">Terms of Employment</p>
                    <div class="terms-grid">
                        <div class="label">Position:</div>
                        <div class="val">${selectedOffer.position}</div>
                        <div class="label">Monthly Salary:</div>
                        <div class="val">RM ${salary}</div>
                        <div class="label">Start Date:</div>
                        <div class="val">${startDate}</div>
                        <div class="label">Contract Type:</div>
                        <div class="val" style="text-transform: capitalize;">${contractType}</div>
                        <div class="label">Probation:</div>
                        <div class="val">${probation}</div>
                        <div class="label">Annual Leave:</div>
                        <div class="val">${annualLeave}</div>
                    </div>
                </div>
                
                <p style="font-weight: 600; margin-bottom: 8px; color: #0f172a;">Benefits</p>
                <p style="white-space: pre-wrap;">${selectedOffer.benefits}</p>

                ${signatureHtml}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for images (like the base64 signature) to load before printing
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }

    const pendingCount = offers.filter(o => o.status === "pending").length

    return (
        <div className="p-6 space-y-8 max-w-5xl mx-auto">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
                <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-3 max-w-2xl">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                <Mail className="h-6 w-6" />
                            </div>
                            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                Offer Letters
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">My Offers</h1>
                        <p className="text-white/80 text-lg leading-relaxed">
                            Review, sign and respond to offer letters from companies.
                            {pendingCount > 0 && (
                                <span className="font-semibold"> You have {pendingCount} pending {pendingCount === 1 ? "offer" : "offers"}!</span>
                            )}
                        </p>
                    </div>
                    <div className="hidden lg:flex items-center justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-150" />
                            <div className="relative p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                                <Award className="h-20 w-20 text-white/90 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total Offers", value: offers.length, icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Pending Signature", value: pendingCount, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Signed & Accepted", value: offers.filter(o => o.status === "accepted").length, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
                ].map(stat => (
                    <Card key={stat.label}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
                    <p className="text-muted-foreground text-sm">Loading your offers...</p>
                </div>
            )}

            {/* Empty */}
            {!loading && offers.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                            <Mail className="h-8 w-8 text-emerald-400" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="font-semibold text-lg">No Offer Letters Yet</p>
                            <p className="text-muted-foreground text-sm">
                                When companies send you offer letters, they'll appear here.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Offers List */}
            {!loading && offers.length > 0 && (
                <div className="space-y-4">
                    {offers.map((offer) => (
                        <Card
                            key={offer.id}
                            className={`overflow-hidden transition-all hover:shadow-lg cursor-pointer group ${
                                offer.status === "pending" ? "ring-2 ring-amber-200" : ""
                            }`}
                            onClick={() => { setSelectedOffer(offer); setShowDetailModal(true) }}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-110 transition-transform">
                                            {offer.company_name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{offer.position}</h3>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="h-3.5 w-3.5" />
                                                    {offer.company_name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="h-3.5 w-3.5" />
                                                    RM {Number(offer.salary).toLocaleString()}/month
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    Start: {new Date(offer.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge className={`${getStatusBadge(offer.status)} border text-sm px-3 py-1`}>
                                            {getStatusLabel(offer.status)}
                                        </Badge>
                                        {offer.status === "pending" && (
                                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                <Button
                                                    size="sm"
                                                    className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 shadow-lg"
                                                    onClick={() => openSignDialog(offer.id)}
                                                >
                                                    <PenLine className="h-3.5 w-3.5" />
                                                    Sign & Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5"
                                                    onClick={() => handleDecline(offer.id)}
                                                >
                                                    Decline
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Detail Modal — Full Offer Letter Preview */}
            <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-emerald-600" />
                            Offer Letter
                        </DialogTitle>
                        <DialogDescription>
                            From {selectedOffer?.company_name} for the {selectedOffer?.position} position
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOffer && (
                        <div className="space-y-4 py-2">
                            <div className="border rounded-lg p-8 bg-white text-slate-800 space-y-6 shadow-inner">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-sm">
                                            {selectedOffer.company_name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{selectedOffer.company_name}</p>
                                            <p className="text-xs text-slate-500">Malaysia</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge className={`${getStatusBadge(selectedOffer.status)} border`}>
                                            {getStatusLabel(selectedOffer.status)}
                                        </Badge>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Sent {new Date(selectedOffer.sent_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4 text-sm">
                                    <p>Dear <strong>{selectedOffer.candidate_name}</strong>,</p>
                                    <p>We are delighted to extend this offer of employment for the position of <strong>{selectedOffer.position}</strong> at {selectedOffer.company_name}. We were impressed with your qualifications and believe you will be a valuable addition to our team.</p>
                                    <div className="bg-slate-50 rounded-lg p-4 space-y-2 border">
                                        <p className="font-semibold text-slate-900">Terms of Employment</p>
                                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                                            <span className="text-slate-500">Position:</span>
                                            <span className="font-medium">{selectedOffer.position}</span>
                                            <span className="text-slate-500">Monthly Salary:</span>
                                            <span className="font-medium">RM {Number(selectedOffer.salary).toLocaleString()}</span>
                                            <span className="text-slate-500">Start Date:</span>
                                            <span className="font-medium">{new Date(selectedOffer.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                            <span className="text-slate-500">Contract Type:</span>
                                            <span className="font-medium capitalize">{selectedOffer.contract_type.replace("_", " ")}</span>
                                            <span className="text-slate-500">Probation:</span>
                                            <span className="font-medium">{selectedOffer.probation === "0" ? "None" : selectedOffer.probation + " months"}</span>
                                            {selectedOffer.annual_leave && (
                                                <>
                                                    <span className="text-slate-500">Annual Leave:</span>
                                                    <span className="font-medium">{selectedOffer.annual_leave} days</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 mb-1">Benefits</p>
                                        <p className="text-slate-600">{selectedOffer.benefits}</p>
                                    </div>

                                    {/* Signature section — shown when accepted */}
                                    {selectedOffer.status === "accepted" && selectedOffer.signature && (
                                        <div className="border-t pt-4 mt-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-slate-900 mb-1">Candidate Signature</p>
                                                    <p className="text-xs text-slate-500">
                                                        Signed on {selectedOffer.signed_at
                                                            ? new Date(selectedOffer.signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                            : "N/A"
                                                        }
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-emerald-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-xs font-semibold">Verified</span>
                                                </div>
                                            </div>
                                            <div className="mt-2 border rounded-lg p-2 bg-slate-50 inline-block">
                                                <img
                                                    src={selectedOffer.signature}
                                                    alt="Candidate signature"
                                                    className="h-20 object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedOffer.status === "pending" && (
                                <DialogFooter className="pt-2 sm:justify-between">
                                    <Button
                                        variant="outline"
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                                        onClick={async () => {
                                            setShowDetailModal(false)
                                            let hrUserId = "IvQlCvZUVlRhWuRJ5kjmQEBpMFT2"; // fallback to Rachel Lim
                                            try {
                                                const reportDoc = await getDoc(doc(db, "resume_reports", selectedOffer.resume_report_id));
                                                const companyCode = reportDoc.data()?.company_code;
                                                if (companyCode) {
                                                    const hrQuery = query(collection(db, "users"), where("role", "==", "hr_admin"), where("company_id", "==", companyCode), limit(1));
                                                    const hrSnap = await getDocs(hrQuery);
                                                    if (!hrSnap.empty) {
                                                        hrUserId = hrSnap.docs[0].id;
                                                    }
                                                }
                                            } catch (err) {
                                                console.error("Failed to find HR admin:", err)
                                            }
                                            window.dispatchEvent(new CustomEvent('open-chat-with', { 
                                                detail: { 
                                                    userId: hrUserId, 
                                                    prefillMessage: `Hi, I would like to discuss the offer for ${selectedOffer.position}.` 
                                                }
                                            }))
                                        }}
                                    >
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        Discuss Offer
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDecline(selectedOffer.id)}
                                        >
                                            Decline Offer
                                        </Button>
                                    <Button
                                        className="bg-emerald-600 hover:bg-emerald-700 gap-2 shadow-lg"
                                        onClick={() => {
                                            setShowDetailModal(false)
                                            setTimeout(() => openSignDialog(selectedOffer.id), 200)
                                        }}
                                    >
                                        <PenLine className="h-4 w-4" />
                                        Sign & Accept Offer
                                    </Button>
                                    </div>
                                </DialogFooter>
                            )}

                            {selectedOffer.status === "accepted" && (
                                <DialogFooter className="pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowDetailModal(false)}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        className="gap-2 shadow-sm"
                                        onClick={handleDownloadPDF}
                                    >
                                        <Download className="h-4 w-4" />
                                        Download PDF
                                    </Button>
                                </DialogFooter>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Signature Dialog — Canvas signing pad */}
            <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PenLine className="h-5 w-5 text-emerald-600" />
                            Sign Offer Letter
                        </DialogTitle>
                        <DialogDescription>
                            Please sign inside the box below to accept the offer. Your signature will be recorded and attached to the offer letter.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-1 border rounded-lg bg-slate-50">
                        <canvas
                            ref={canvasRef}
                            width={400}
                            height={200}
                            className="bg-white rounded-md touch-none cursor-crosshair w-full h-[200px]"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={endDrawing}
                            onMouseLeave={endDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={endDrawing}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        Draw your signature using your mouse or touch screen
                    </p>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
                        <Button variant="ghost" onClick={clearSignature} className="text-muted-foreground hover:text-destructive gap-1.5">
                            <Undo2 className="h-3.5 w-3.5" />
                            Clear Pad
                        </Button>
                        <Button onClick={handleSignAndAccept} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg">
                            <CheckCircle className="h-4 w-4" />
                            Confirm & Accept
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
