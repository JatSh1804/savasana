'use client'

import { useState } from 'react'
import { login } from './actions'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'
import GoogleLoginButton from '@/components/auth/google-login-button'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)
    
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
    // No need to handle success case as the login action will redirect
  }

  return (
    <div className='h-screen flex justify-center items-center m-auto'>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm">
              {error}
            </div>
          )}
          <form action={handleLogin}>
            <div className="grid gap-2 mb-4">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name='email' type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2 mb-8">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name='password' type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <GoogleLoginButton />
            
            <div className="mt-4 text-center text-sm">
              Don't have an account? &nbsp;
              <Link href="/signup" className="underline" prefetch={false}>
                Signup
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

