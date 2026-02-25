"use client"

import { useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AuthPageWrapper } from "@/components/auth-page-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, Shield, Briefcase, User } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [loadingDemo, setLoadingDemo] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError("Invalid email or password")
                setIsLoading(false)
                return
            }

            router.push("/")
            router.refresh()
        } catch (error) {
            console.error(error)
            setError("Something went wrong. Please try again.")
            setIsLoading(false)
        }
    }

    const handleDemoLogin = async (role: "hr" | "employee" | "candidate") => {
        setLoadingDemo(role)
        setError(null)

        const demoCredentials = {
            hr: { email: "rachel.lim@zerohr.com", password: "demo-hr-2024" },
            employee: { email: "alex.chan@zerohr.com", password: "demo-employee-2024" },
            candidate: { email: "candidate@zerohr.com", password: "demo-candidate-2024" },
        }

        const creds = demoCredentials[role]

        try {
            const result = await signIn("credentials", {
                email: creds.email,
                password: creds.password,
                redirect: false,
            })

            if (result?.error) {
                setError(`Demo login failed for ${role}. Please try again.`)
                setLoadingDemo(null)
                return
            }

            router.push("/")
            router.refresh()
        } catch (error) {
            console.error(error)
            setError("Something went wrong with demo login.")
            setLoadingDemo(null)
        }
    }

    const anyLoading = isLoading || loadingDemo !== null

    return (
        <AuthPageWrapper>
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password or try a demo account
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {/* Demo Account Buttons */}
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">Quick Demo Access</p>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDemoLogin("hr")}
                                disabled={anyLoading}
                                className="flex flex-col items-center gap-1 h-auto py-3 border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-colors"
                            >
                                {loadingDemo === "hr" ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                                ) : (
                                    <Shield className="h-5 w-5 text-purple-600" />
                                )}
                                <span className="text-xs font-medium">HR Admin</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDemoLogin("employee")}
                                disabled={anyLoading}
                                className="flex flex-col items-center gap-1 h-auto py-3 border-blue-200 hover:bg-blue-50 hover:border-blue-400 transition-colors"
                            >
                                {loadingDemo === "employee" ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                ) : (
                                    <Briefcase className="h-5 w-5 text-blue-600" />
                                )}
                                <span className="text-xs font-medium">Employee</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDemoLogin("candidate")}
                                disabled={anyLoading}
                                className="flex flex-col items-center gap-1 h-auto py-3 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400 transition-colors"
                            >
                                {loadingDemo === "candidate" ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                                ) : (
                                    <User className="h-5 w-5 text-emerald-600" />
                                )}
                                <span className="text-xs font-medium">Candidate</span>
                            </Button>
                        </div>
                    </div>

                    {/* Google Sign-In */}
                    <Button variant="outline" onClick={() => signIn("google", { callbackUrl: "/" })} disabled={anyLoading} className="w-full">
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Continue with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or sign in with credentials
                            </span>
                        </div>
                    </div>

                    <form onSubmit={onSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={anyLoading}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={anyLoading}
                                required
                            />
                        </div>
                        {error && (
                            <div className="flex items-center p-3 text-sm text-red-500 bg-red-50 rounded-md">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {error}
                            </div>
                        )}
                        <Button type="submit" className="w-full" disabled={anyLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-wrap items-center justify-center gap-2">
                    <div className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </AuthPageWrapper>
    )
}
