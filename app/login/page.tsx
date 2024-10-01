import { login } from './actions'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'

export default function LoginPage() {
  return (<>
    <div className='h-screen flex justify-center items-center m-auto'>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form>
            <div className="grid gap-2 mb-4">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name='email' type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2 mb-8">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name='password' type="password" required />
            </div>
            <Button formAction={login} className="w-full">Sign in</Button>
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
  </>
  )
}

