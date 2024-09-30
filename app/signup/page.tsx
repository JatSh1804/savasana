"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { signup } from "../login/actions"

export default function Component() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        // e.preventDefault()
        setLoading(true)
        setError("")
        try {
            // await new Promise((resolve) => setTimeout(resolve, 2000))
            // // console.log("Signup successful!")
        } catch (err) {
            setError("An error occurred. Please try again later.")
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="flex justify-center items-center h-screen">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Sign Up</CardTitle>
                    <CardDescription>Enter your details below to create a new account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" name="email" placeholder="m@example.com" required />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input id="password" type="password" name="password" required />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                </div>
                                <Input id="confirm-password" type="password" required />
                            </div>
                            <Button className="w-full" disabled={loading} formAction={signup} onClick={handleSubmit}>
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <LoaderIcon className="w-5 h-5 animate-spin" />
                                        <span className="ml-2">Signing Up...</span>
                                    </div>
                                ) : (
                                    "Sign Up"
                                )}
                            </Button>
                            {/* <Button variant="outline" className="w-full">
                            Sign Up with Google
                        </Button> */}
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="underline" prefetch={false}>
                                Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

function LoaderIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2v4" />
            <path d="m16.2 7.8 2.9-2.9" />
            <path d="M18 12h4" />
            <path d="m16.2 16.2 2.9 2.9" />
            <path d="M12 18v4" />
            <path d="m4.9 19.1 2.9-2.9" />
            <path d="M2 12h4" />
            <path d="m4.9 4.9 2.9 2.9" />
        </svg>
    )
}