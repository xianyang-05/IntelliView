"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, Building2 } from "lucide-react"

const formSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    companyCode: z.string().min(3, "Company code is required"),
    employeeId: z.string().optional(),
    jobTitle: z.string().optional(),
    department: z.string().optional(),
})

export function EmployeeRegistrationForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isValidating, setIsValidating] = useState(false)
    const [companyDetails, setCompanyDetails] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            companyCode: "",
            employeeId: "",
            jobTitle: "",
            department: "",
        },
    })

    // Validate company code
    async function validateCompanyCode(code: string) {
        if (!code) return
        setIsValidating(true)
        setError(null)
        setCompanyDetails(null)

        try {
            const res = await fetch(`/api/validate-company-code/${code}`)
            const data = await res.json()

            if (data.valid) {
                setCompanyDetails(data.company)
            } else {
                form.setError("companyCode", { message: "Invalid company code" })
            }
        } catch (err) {
            console.error(err)
            form.setError("companyCode", { message: "Validation failed" })
        } finally {
            setIsValidating(false)
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setError(null)

        try {
            // 1. Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                    data: {
                        full_name: values.fullName,
                        role: "employee",
                        // We'll update company_id after backend confirmation or here if known
                    },
                },
            })

            if (authError) throw new Error(authError.message)
            if (!authData.user) throw new Error("Registration failed")

            // 2. Call Backend API to link employee to company
            const apiRes = await fetch("/api/register/employee", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: values.fullName,
                    email: values.email,
                    companyCode: values.companyCode,
                    employeeId: values.employeeId,
                    jobTitle: values.jobTitle,
                    department: values.department,
                }),
            })

            const apiData = await apiRes.json()
            if (!apiData.success) throw new Error(apiData.message || "Backend registration failed")

            // 3. Update local user metadata with company_id if needed (optional)

            router.push("/login?registered=true")
        } catch (err: any) {
            console.error(err)
            setError(err.message || "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Employee Registration</CardTitle>
                <CardDescription>Enter your details and company code to join.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="companyCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Code</FormLabel>
                                    <div className="flex gap-2">
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. ACME-2024"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    if (e.target.value.length >= 3) {
                                                        // Debounce could be added here
                                                    }
                                                }}
                                                onBlur={() => validateCompanyCode(field.value)}
                                            />
                                        </FormControl>
                                        {companyDetails && <CheckCircle2 className="h-10 w-10 text-emerald-500" />}
                                    </div>
                                    {companyDetails && (
                                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                            <Building2 className="h-3 w-3" />
                                            <span>Joining: <span className="font-medium text-foreground">{companyDetails.name}</span></span>
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john@company.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Create a password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="jobTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Software Engineer" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Engineering" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading || isValidating}>
                            {isLoading || isValidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Create Account
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
