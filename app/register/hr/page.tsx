import { HRRegistrationWizard } from "@/components/auth/hr-registration-wizard"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "HR Registration - ZeroHR",
    description: "Set up your company workspace on ZeroHR",
}

export default function HRRegistrationPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <div className="w-full max-w-4xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome to ZeroHR</h1>
                    <p className="text-muted-foreground">Let&apos;s get your company set up in minutes.</p>
                </div>
                <HRRegistrationWizard />
            </div>
        </div>
    )
}
