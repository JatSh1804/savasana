"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { signup } from "../login/actions"
import GoogleLoginButton from "@/components/auth/google-login-button"
import { Loader2 } from "lucide-react"

export default function Component() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [passwordMatch, setPasswordMatch] = useState(true)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    
    const handleSignup = async (formData: FormData) => {
        // Check if passwords match
        if (password !== confirmPassword) {
            setPasswordMatch(false)
            return
        }
        
        setLoading(true)
        setError(null)
        
        const result = await signup(formData)
        
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
        // No need to handle success case as the signup action will redirect
    }

    return (
        <div className="flex justify-center items-center h-screen">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Sign Up</CardTitle>
                    <CardDescription>Enter your details below to create a new account</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm mb-4">{error}</div>}
                    {!passwordMatch && <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm mb-4">Passwords do not match</div>}
                    <form action={handleSignup}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" name="email" placeholder="m@example.com" required />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    name="password" 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                </div>
                                <Input 
                                    id="confirm-password" 
                                    type="password" 
                                    required 
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value)
                                        setPasswordMatch(true) // Reset the error when typing
                                    }}
                                />
                            </div>
                            <Button className="w-full" disabled={loading} type="submit">
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        <span>Signing Up...</span>
                                    </div>
                                ) : (
                                    "Sign Up"
                                )}
                            </Button>
                            
                            <div className="relative my-2">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                              </div>
                              <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                              </div>
                            </div>
                            
                            <GoogleLoginButton label="Sign up with Google" />
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