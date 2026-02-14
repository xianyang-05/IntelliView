import Link from "next/link"

interface AuthPageWrapperProps {
    children: React.ReactNode
}

export function AuthPageWrapper({ children }: AuthPageWrapperProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 lg:p-8">
            <div className="w-full max-w-[450px] space-y-6">
                <div className="flex justify-center">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <span>ZeroHR</span>
                    </Link>
                </div>
                {children}
            </div>
        </div>
    )
}
