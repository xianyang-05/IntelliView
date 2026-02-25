import { CandidateRegistrationForm } from "@/components/auth/candidate-registration-form"
import { AuthPageWrapper } from "@/components/auth-page-wrapper"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CandidateRegistrationPage() {
    return (
        <AuthPageWrapper>
            <div className="w-full max-w-md mx-auto space-y-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/signup" className="flex items-center gap-1 hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to roles
                    </Link>
                </div>
                <CandidateRegistrationForm />
            </div>
        </AuthPageWrapper>
    )
}
