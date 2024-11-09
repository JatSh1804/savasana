'use client'

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BotIcon, Check, ChevronDown, Menu, X } from "lucide-react"
import Profile from '../user'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { redirect } from 'next/navigation'

const tiers = [
    {
        name: "Free",
        price: "$0",
        description: "Basic access to our platform",
        features: [
            "100 tokens per month",
            "Access to basic models",
            "Standard support",
            "1 concurrent project",
        ],
        notIncluded: [
            "Advanced models",
            "Priority support",
            "Team collaboration",
        ],
        buttonText: "Get Started",
        popular: false,
    },
    {
        name: "Plus",
        price: "$10",
        description: "Enhanced features for individuals",
        features: [
            "1,000 tokens per month",
            "Access to advanced models",
            "Priority email support",
            "5 concurrent projects",
            "Custom API access",
        ],
        notIncluded: [
            "Dedicated account manager",
            "Custom model fine-tuning",
        ],
        buttonText: "Upgrade to Plus",
        popular: true,
    },
    {
        name: "Pro",
        price: "$49",
        description: "Premium features for power users",
        features: [
            "10,000 tokens per month",
            "Access to all models",
            "24/7 priority support",
            "Unlimited concurrent projects",
            "Custom API access",
            "Dedicated account manager",
            "Custom model fine-tuning",
        ],
        notIncluded: [],
        buttonText: "Upgrade to Pro",
        popular: false,
    },
]

const navItems: { name: string; href: string }[] = [
    // { name: "Home", href: "#" },
    // { name: "Features", href: "#features" },
    // { name: "Pricing", href: "#pricing" },
    // { name: "FAQ", href: "#faq" },
]

export default function EnhancedMembershipPage() {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
    const supabase = createClient();
    const [success, setSuccess] = useState<boolean | null>(null)
    const [subscription, setSubscription] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchSubscription = async () => {
            const { data, error } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('is_active', true)
                .single();
            if (error) {
                setError(error.message);
            } else {
                setSubscription(data);
            }
            setLoading(false);
        };
        fetchSubscription();
    }, [supabase]);

    const handleUpgrade = async (tier: 'Plus' | 'Pro') => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        console.log('Debug:--> Sending a upgradation request.')
        try {
            const response = await fetch('/api/subscriptions/upgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newTier: tier,
                }),
            });
            const result = await response.json();
            setSuccess(result.message);
            setTimeout(() => {
                redirect('/app/dev/chat')
            }, 1000)
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link href="/" className="flex items-center justify-center" prefetch={false}>
                                    <BotIcon className="h-6 w-6" />
                                    <span className="sr-only">Chatbot SaaS</span>
                                </Link>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {navItems?.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    >
                                        {item.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:items-center gap-2">
                            <Profile />
                        </div>
                        <div className="flex items-center sm:hidden">
                            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                                        <span className="sr-only">Open main menu</span>
                                        <Menu className="block h-6 w-6" aria-hidden="true" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left">
                                    <SheetHeader>
                                        <SheetTitle>Menu</SheetTitle>
                                        <SheetDescription>
                                            Navigate through our site
                                        </SheetDescription>
                                    </SheetHeader>
                                    <nav className="mt-5">
                                        {navItems.map((item) => (
                                            <a
                                                key={item.name}
                                                href={item.href}
                                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                                onClick={() => setSidebarOpen(false)}
                                            >
                                                {item.name}
                                            </a>
                                        ))}
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="text-center">
                            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                                Choose Your Membership
                            </h1>
                            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                                Select the plan that best fits your needs and start exploring the power of AI.
                            </p>
                        </div>

                        <div id="pricing" className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
                            {tiers.map((tier) => (
                                <Card key={tier.name} className={`flex flex-col justify-between ${tier.popular ? 'border-primary shadow-lg' : ''}`}>
                                    <CardHeader>
                                        <CardTitle>{tier.name}</CardTitle>
                                        <CardDescription>{tier.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center">
                                            <span className="text-4xl font-extrabold">{tier.price}</span>
                                            <span className="text-2xl font-medium text-gray-500">/month</span>
                                        </div>
                                        <ul className="mt-8 space-y-4">
                                            {tier.features.map((feature) => (
                                                <li key={feature} className="flex items-start">
                                                    <div className="flex-shrink-0">
                                                        <Check className="h-6 w-6 text-green-500" />
                                                    </div>
                                                    <p className="ml-3 text-base text-gray-700">{feature}</p>
                                                </li>
                                            ))}
                                            {tier.notIncluded.map((feature) => (
                                                <li key={feature} className="flex items-start">
                                                    <div className="flex-shrink-0">
                                                        <X className="h-6 w-6 text-red-500" />
                                                    </div>
                                                    <p className="ml-3 text-base text-gray-500">{feature}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button onClick={() => handleUpgrade(tier.name as 'Plus' | 'Pro')} disabled={loading} className="w-full" variant={tier.popular ? "default" : "outline"}>
                                            {tier.buttonText}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        <div id="faq" className="mt-16 text-center">
                            <h2 className="text-2xl font-extrabold text-gray-900">
                                Frequently Asked Questions
                            </h2>
                            <dl className="mt-8 space-y-8 max-w-3xl mx-auto">
                                <div>
                                    <dt className="text-lg font-medium text-gray-900">What are tokens?</dt>
                                    <dd className="mt-2 text-base text-gray-500">
                                        Tokens are the units of measurement for our AI processing. Each API request consumes a certain number of tokens based on the length and complexity of your input and the generated output.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-lg font-medium text-gray-900">Can I upgrade or downgrade my plan?</dt>
                                    <dd className="mt-2 text-base text-gray-500">
                                        Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-lg font-medium text-gray-900">What happens if I use all my tokens?</dt>
                                    <dd className="mt-2 text-base text-gray-500">
                                        If you use all your allocated tokens, you can purchase additional tokens or upgrade to a higher tier for more capacity.
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-white">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
                    <div className="flex justify-center space-x-6 md:order-2">
                        <a href="#" className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Facebook</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                            </svg>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Twitter</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                            </svg>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">GitHub</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988  1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                        </a>
                    </div>
                    <div className="mt-8 md:mt-0 md:order-1">
                        <p className="text-center text-base text-gray-400">
                            &copy; 2024 Your Company, Inc. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}