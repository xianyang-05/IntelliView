import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface ContractContentProps {
    highlightSectionId?: string
    signatureUrl?: string | null
    isSigned?: boolean
}

export function ContractContent({ highlightSectionId, signatureUrl, isSigned }: ContractContentProps) {

    // Handle Highlighting
    useEffect(() => {
        if (highlightSectionId) {
            setTimeout(() => {
                const element = document.getElementById(`section-${highlightSectionId}`)
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    // Add temporary highlight effect
                    element.classList.add('bg-yellow-200/50', 'transition-colors', 'duration-1000')
                    setTimeout(() => {
                        element.classList.remove('bg-yellow-200/50')
                    }, 3000)
                }
            }, 300) // Small delay to ensure render
        }
    }, [highlightSectionId])

    return (
        <div className={cn(
            "max-w-2xl mx-auto space-y-6 text-sm leading-relaxed p-8 shadow-sm border border-slate-200 select-text transition-colors duration-500",
            isSigned ? "bg-slate-100/80 text-slate-700" : "bg-white text-slate-900"
        )}>
            <h2 className="text-center font-bold text-lg tracking-wider">OFFER LETTER AMENDMENT</h2>

            <p>Date: February 7, 2026</p>
            <p>Dear Employee,</p>

            <p className="font-bold">RE: AMENDMENT TO EMPLOYMENT TERMS</p>

            <p>We are pleased to confirm the following amendments to your employment terms with ZeroHR (the &quot;Company&quot;), effective from March 1, 2026.</p>

            <div className="space-y-4">
                <div>
                    <h3 className="font-bold">1. POSITION AND REPORTING</h3>
                    <p id="section-position">Your position remains as Senior Product Designer. You will continue to report to the Head of Design.</p>
                </div>

                <div>
                    <h3 className="font-bold">2. COMPENSATION</h3>
                    <div id="section-compensation">
                        <p>a) Base Salary: Your annual base salary will be increased to $145,000 per annum, payable in accordance with the Company&apos;s standard payroll practices.</p>
                        <p className="mt-2">b) Performance Bonus: You will be eligible for an annual performance bonus of up to 15% of your base salary, subject to achievement of individual and company performance targets.</p>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold">3. EQUITY</h3>
                    <p id="section-equity">You will be granted 1,200 new stock options under the Company&apos;s Employee Stock Option Plan, vesting over 3 years with quarterly vesting.</p>
                </div>

                <div>
                    <h3 className="font-bold">4. REMOTE WORK</h3>
                    <p id="section-remote-work">You are approved to work remotely up to 3 days per week, subject to the Company&apos;s Remote Work Policy.</p>
                </div>

                <div>
                    <h3 className="font-bold">5. OTHER TERMS</h3>
                    <p>All other terms and conditions of your employment remain unchanged and continue to apply.</p>
                </div>
            </div>

            <div className="pt-6">
                <p>Please confirm your acceptance by signing below.</p>
                <div className="mt-8 space-y-4">
                    <div>
                        <p className="font-bold">For ZeroHR</p>
                        <div className="mt-2 border-b border-border w-48">&nbsp;</div>
                        <p className="text-muted-foreground text-xs mt-1">Authorized Signatory</p>
                    </div>
                    <div>
                        <p className="font-bold">Employee Acceptance</p>
                        <div className="mt-2 border-b border-slate-300 w-48 relative h-12 flex items-center justify-center">
                            {/* Display Signature */}
                            {signatureUrl && (
                                <img
                                    src={signatureUrl}
                                    alt="Signature"
                                    className="max-h-12 w-auto mix-blend-multiply opacity-90"
                                />
                            )}
                        </div>
                        <p className="text-muted-foreground text-xs mt-1">Signature & Date</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
