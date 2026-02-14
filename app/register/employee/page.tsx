"use client"

import { EmployeeRegistrationForm } from "@/components/auth/employee-registration-form"

export default function EmployeeRegistrationPage() {
    return (
        <div className="relative min-h-screen grid lg:grid-cols-2">
            {/* Left: Image Panel */}
            <div className="relative hidden lg:flex flex-col p-10 text-white" style={{ backgroundColor: "#18181b" }}>
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-6 w-6"
                    >
                        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                    </svg>
                    ZeroHR
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;ZeroHR has completely transformed how I manage my employment details. It&apos;s seamless and intuitive.&rdquo;
                        </p>
                        <footer className="text-sm">Sofia Davis</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right: Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-[550px] space-y-6">
                    <EmployeeRegistrationForm />
                </div>
            </div>
        </div>
    )
}
