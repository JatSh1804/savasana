'use client'
import { Button } from "@/components/ui/button"
import { DropdownMenuTrigger, DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { createClient } from "@/utils/supabase/client"
import { AvatarIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { logout } from "./logout/actions"
// import { redirect } from "next/navigation"
export default function Profile() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const supabase = await createClient()
            const { data, error } = await supabase.auth.getUser();
            console.log(data)
            if (error || !data?.user) {
                console.log('Not Authenticated')
            } else {
                setUser(data?.user);
            }
        }
        getUser();
    }, [])

    return (user ? <>
        <Link href="/chat" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Chat
        </Link>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="overflow-hidden rounded-full"
                >
                    <AvatarIcon className="h-4 w-4s" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
                <Link href={'/profile'}><DropdownMenuItem >Profile</DropdownMenuItem></Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout() }}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

    </> : <>
        <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Login
        </Link>
        <Link href="/signup" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Signup
        </Link>
        <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Contact
        </Link>
    </>
    )

}