"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react"

// Schema
const formSchema = z.object({
    // Step 1: Account
    fullName: z.string().min(2, "Name required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password min 6 chars"),

    // Step 2: Company
    companyName: z.string().min(2, "Company name required"),
    companyCode: z.string().min(3, "Code required"),

    // Step 3: Policy (Optional/Mock)
    policyMode: z.string().optional(),
})

const STEPS = [
    { id: 1, title: "Account Details" },
    { id: 2, title: "Company Setup" },
    { id: 3, title: "Review & Finish" }
]

export function HRRegistrationWizard() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            companyName: "",
            companyCode: "",
            policyMode: "standard",
        },
    })

    // Auto-generate code on company name change (simple mock)
    const watchCompanyName = form.watch("companyName")
    if (step === 2 && watchCompanyName && !form.getValues("companyCode")) {
        const code = watchCompanyName.replace(/\s+/g, '-').toUpperCase().slice(0, 10) + "-2026"
        form.setValue("companyCode", code)
    }

    const nextStep = async () => {
        // Validate current step fields
        let fieldsToValidate: any[] = []
        if (step === 1) fieldsToValidate = ['fullName', 'email', 'password']
        if (step === 2) fieldsToValidate = ['companyName', 'companyCode']

        const isValid = await form.trigger(fieldsToValidate)
        if (isValid) setStep(s => s + 1)
    }

    const prevStep = () => setStep(s => s - 1)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setError(null)

        try {
            // 1. Sign up HR Admin
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                    data: {
                        full_name: values.fullName,
                        role: "hr_admin",
                    },
                },
            })

            if (authError) throw new Error(authError.message)
            if (!authData.user) throw new Error("Registration failed")

            // 2. Register Company in Backend
            const apiRes = await fetch("/api/register/hr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: values.fullName,
                    email: values.email,
                    companyName: values.companyName,
                    companyCode: values.companyCode,
                }),
            })

            const apiData = await apiRes.json()
            if (!apiData.success) throw new Error(apiData.message || "Company registration failed")

            // Success
            router.push("/login?registered=true&role=hr")
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
                <div className="flex items-center justify-between mb-4">
                    {STEPS.map((s) => (
                        <div key={s.id} className={`flex items-center gap-2 text-sm ${step >= s.id ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                            <div className={`flex items-center justify-center w-6 h-6 rounded-full border ${step >= s.id ? 'bg-primary text-primary-foreground border-primary' : 'border-muted-foreground'}`}>
                                {s.id}
                            </div>
                            <span className="hidden sm:inline">{s.title}</span>
                        </div>
                    ))}
                </div>
                <CardTitle>{STEPS[step - 1].title}</CardTitle>
                <CardDescription>Step {step} of {STEPS.length}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* STEP 1 */}
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="HR Manager Name" {...field} />
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
                                            <FormLabel>Work Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="hr@company.com" {...field} />
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
                                                <Input type="password" placeholder="Create a secure password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <FormField
                                    control={form.control}
                                    name="companyName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Acme Inc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="companyCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Code (Unique ID)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ACME-2026" {...field} />
                                            </FormControl>
                                            <FormDescription>Employees will use this code to join.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* STEP 3 */}
                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="rounded-md bg-muted p-4 space-y-2">
                                    <h4 className="font-medium">Review Details</h4>
                                    <div className="text-sm grid grid-cols-[100px_1fr] gap-1">
                                        <span className="text-muted-foreground">Name:</span>
                                        <span>{form.getValues("fullName")}</span>
                                        <span className="text-muted-foreground">Email:</span>
                                        <span>{form.getValues("email")}</span>
                                        <span className="text-muted-foreground">Company:</span>
                                        <span>{form.getValues("companyName")}</span>
                                        <span className="text-muted-foreground">Code:</span>
                                        <span className="font-mono">{form.getValues("companyCode")}</span>
                                    </div>
                                </div>
                                {error && (
                                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                                        {error}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-between pt-4">
                            {step > 1 ? (
                                <Button type="button" variant="outline" onClick={prevStep} disabled={isLoading}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                            ) : (
                                <div />
                            )}

                            {step < 3 ? (
                                <Button type="button" onClick={nextStep}>
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Workspace
                                </Button>
                            )}
                        </div>

                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
