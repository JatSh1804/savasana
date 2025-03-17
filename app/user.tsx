'use client'
import { Button } from "@/components/ui/button"
import { DropdownMenuTrigger, DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { createClient } from "@/utils/supabase/client"
import { AvatarIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { logout } from "./logout/actions"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const supabase = await createClient()
            const { data, error } = await supabase.auth.getUser();
            
            if (error || !data?.user) {
                console.log('Not Authenticated')
            } else {
                setUser(data.user);
                
                // Check for avatar from Google OAuth
                if (data.user.app_metadata?.provider === 'google' && data.user.user_metadata?.avatar_url) {
                    setAvatarUrl(data.user.user_metadata.avatar_url);
                }
            }
        }
        getUser();
    }, [])

    // Get user's initials for avatar fallback
    const getInitials = () => {
        if (!user) return '';
        if (user.user_metadata?.full_name) {
            return user.user_metadata.full_name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase();
        }
        return user.email ? user.email.substring(0, 2).toUpperCase() : '';
    };

    return (user ? <>
        <Link href="/dev/chat" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Chat
        </Link>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="overflow-hidden rounded-full"
                >
                    {avatarUrl ? (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={avatarUrl} alt="User avatar" />
                            <AvatarFallback>{getInitials()}</AvatarFallback>
                        </Avatar>
                    ) : (
                        <AvatarIcon className="h-4 w-4" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                    {user.user_metadata?.full_name || user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href={'/profile'}><DropdownMenuItem >Profile</DropdownMenuItem></Link>
                <Link href={'/subscription'}><DropdownMenuItem >Subscription</DropdownMenuItem></Link>
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