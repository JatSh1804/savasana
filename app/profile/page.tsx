'use client'
import { Button } from "@/components/ui/button"
import { BotIcon } from "lucide-react"
import Link from "next/link"
import Profile from "../user"
import { useEffect, useState } from "react"

export default function Component() {
    const [tokens, setTokens] = useState(null)
    useEffect(() => {
        const fetchTokens = async () => {
            try {
                const response = await fetch('/api/profile'); // Your API route

                if (!response.ok) {
                    throw new Error('Failed to fetch tokens');
                }

                const data = await response.json();
                setTokens(data.tokens);
            } catch (error) {
                console.error('Error fetching tokens:', error);
            }
        };

        fetchTokens();
    }, []);
    return (<>
        <header className="px-4 lg:px-6 h-14 flex items-center">
            <Link href="/" className="flex items-center justify-center" prefetch={false}>
                <BotIcon className="h-6 w-6" />
                <span className="sr-only">Chatbot SaaS</span>
            </Link>
            <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
                {/* <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Features
        </Link>
        <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Pricing
        </Link> */}
                <Profile />

            </nav>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background text-foreground">
            <div className="max-w-md w-full p-6 rounded-lg shadow-lg bg-card">
                <div className="flex flex-col items-center gap-4">
                    <div className="bg-primary rounded-full w-20 h-20 flex items-center justify-center text-primary-foreground text-4xl font-bold">
                        {
                            tokens !== null && (
                                <p>{tokens}</p>
                            )
                        }
                    </div>

                    {tokens !== null ? <div>
                        <h1 className="text-2xl font-bold">Your Token Balance</h1>
                        <p className="text-muted-foreground">You have {tokens} tokens remaining on your Starter plan.</p>
                    </div> :
                        <div>
                            <h1 className="text-2xl font-bold">Wait, Loading your Tokens...</h1>
                        </div>}
                    <div className="flex flex-col gap-2 w-full">
                        <Button className="w-full">Manage Subscription</Button>
                        <Button variant="secondary" className="w-full">
                            Buy More Tokens
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}