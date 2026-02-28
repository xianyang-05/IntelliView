"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthPageWrapper } from "@/components/auth-page-wrapper"
import { Building2, User, ArrowRight, Shield } from "lucide-react"

export default function SignupPage() {
    return (
        <AuthPageWrapper>
            <Card className="w-full max-w-lg bg-card/95 backdrop-blur-sm shadow-xl">
                <CardHeader className="space-y-1 text-center pb-4">
                    <div className="flex justify-center mb-2">
                        <div className="rounded-lg bg-primary p-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-6 w-6 text-primary-foreground"
                            >
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Join OpenHire</CardTitle>
                    <CardDescription>
                        Select your role to get started
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 pt-0 px-6">
                    {/* Employee Option */}
                    <Link href="/register/employee" className="group">
                        <div className="rounded-xl border border-border bg-secondary/30 p-5 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer">
                            <div className="flex items-start gap-4">
                                <div className="rounded-lg bg-emerald-500/10 p-2.5 group-hover:bg-emerald-500/20 transition-colors">
                                    <User className="h-6 w-6 text-emerald-500" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-base">I&apos;m an Employee</h3>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Join your company&apos;s workspace using a Company Code provided by your HR department.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Candidate Option */}
                    <Link href="/register/candidate" className="group">
                        <div className="rounded-xl border border-border bg-secondary/30 p-5 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer">
                            <div className="flex items-start gap-4">
                                <div className="rounded-lg bg-orange-500/10 p-2.5 group-hover:bg-orange-500/20 transition-colors">
                                    <User className="h-6 w-6 text-orange-500" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-base">I&apos;m a Candidate</h3>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Apply for jobs and take AI-driven interview assessments.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* HR / Admin Option */}
                    <Link href="/register/hr" className="group">
                        <div className="rounded-xl border border-border bg-secondary/30 p-5 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer">
                            <div className="flex items-start gap-4">
                                <div className="rounded-lg bg-blue-500/10 p-2.5 group-hover:bg-blue-500/20 transition-colors">
                                    <Shield className="h-6 w-6 text-blue-500" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-base">I&apos;m HR / Admin</h3>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Set up your company workspace, configure policies, and invite your team.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </CardContent>
                <CardFooter className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <div className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </AuthPageWrapper>
    )
}
