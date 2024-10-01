import Link from "next/link"
import { Button } from "@/components/ui/button"
import Profile from "./user"
import Image from "next/image"

export default function Component() {
    return (
        <div className="flex flex-col min-h-[100dvh]">
            <header className="px-4 lg:px-6 h-14 flex items-center">
                <Link href="#" className="flex items-center justify-center" prefetch={false}>
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
            <main className="flex-1">
                <section className="w-full py-2 md:py-4 lg:py-8 xl:py-18">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                                        Create Custom Chatbots for Your Business
                                    </h1>
                                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                        Our SaaS platform empowers you to build, deploy, and manage custom chatbots that seamlessly
                                        integrate with your existing systems and channels.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                    <Link
                                        href="/chat"
                                        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                        prefetch={false}
                                    >
                                        Chat
                                    </Link>
                                    <Link
                                        href="#"
                                        className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                        prefetch={false}
                                    >
                                        Learn More
                                    </Link>
                                </div>
                            </div>
                            <Image
                                src="https://www.curiosityquench.com/_next/image?url=https%3A%2F%2Flh3.googleusercontent.com%2Fpw%2FAP1GczNTV486nBxfzYRbsNETqPVqAFhfH9zBypOZpu775N6bvwA8Bq1dJk2ZcW3STY8vCkp0DoCMHmYdtr_GQOtjUJZfVGIqAOb6Q5UybQLXuXkzD21f-LYVtkkXDGENxH9rlj4fnyYfG_AT-V34HmkT5TOt%3Dw945-h968-s-no-gm%3Fauthuser%3D0&w=640&q=75"
                                width="550"
                                height="550"
                                alt="Chatbot"
                                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full"
                            />
                        </div>
                    </div>
                </section>
                <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
                    <div className="container space-y-12 px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Powerful Chatbot Capabilities</h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Our SaaS platform offers a comprehensive set of features to help you create, deploy, and manage custom
                                    chatbots for your business.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
                            <div className="grid gap-1">
                                <h3 className="text-lg font-bold">Custom Chatbot Builder</h3>
                                <p className="text-sm text-muted-foreground">
                                    Easily create and customize chatbots with our intuitive drag-and-drop interface.
                                </p>
                            </div>
                            <div className="grid gap-1">
                                <h3 className="text-lg font-bold">Omnichannel Integration</h3>
                                <p className="text-sm text-muted-foreground">
                                    Integrate your chatbots with popular messaging platforms, websites, and mobile apps.
                                </p>
                            </div>
                            <div className="grid gap-1">
                                <h3 className="text-lg font-bold">Conversation Analytics</h3>
                                <p className="text-sm text-muted-foreground">
                                    Gain valuable insights into your chatbot conversations with our advanced analytics.
                                </p>
                            </div>
                            <div className="grid gap-1">
                                <h3 className="text-lg font-bold">Natural Language Processing</h3>
                                <p className="text-sm text-muted-foreground">
                                    Leverage powerful NLP capabilities to understand and respond to user queries.
                                </p>
                            </div>
                            <div className="grid gap-1">
                                <h3 className="text-lg font-bold">Seamless Integrations</h3>
                                <p className="text-sm text-muted-foreground">
                                    Connect your chatbots with your existing tools and systems for a seamless user experience.
                                </p>
                            </div>
                            <div className="grid gap-1">
                                <h3 className="text-lg font-bold">Scalable Infrastructure</h3>
                                <p className="text-sm text-muted-foreground">
                                    Our platform is designed to scale with your business, handling high volumes of conversations.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Pricing</div>
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                    Affordable Pricing for Businesses of All Sizes
                                </h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Choose the plan that best fits your business needs and budget. Get started with our free trial.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
                            <div className="rounded-lg border bg-background p-6 shadow-sm">
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold">Starter</h3>
                                    <p className="text-4xl font-bold">$19</p>
                                    <p className="text-muted-foreground">per month</p>
                                    <ul className="grid gap-2 text-sm">
                                        <li className="flex items-center gap-2">
                                            <CheckIcon className="h-4 w-4 text-green-500" />
                                            1 Chatbot
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckIcon className="h-4 w-4 text-green-500" />
                                            100 Conversations per Month
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckIcon className="h-4 w-4 text-green-500" />
                                            Basic Analytics
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckIcon className="h-4 w-4 text-green-500" />
                                            Email Support
                                        </li>
                                    </ul>
                                    <Button className="w-full">Get Started</Button>
                                </div>
                            </div>
                            <div className="rounded-lg border bg-background p-6 shadow-sm">
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold">Pro</h3>
                                    <p className="text-4xl font-bold">$49</p>
                                    <p className="text-muted-foreground">per month</p>
                                    <ul className="grid gap-2 text-sm">
                                        <li className="flex items-center gap-2">
                                            <CheckIcon className="h-4 w-4 text-green-500" />
                                            5 Chatbots
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckIcon className="h-4 w-4 text-green-500" />
                                            1,000 Conversations per Month
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckIcon className="h-4 w-4 text-green-500" />
                                            Advanced Analytics
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckIcon className="h-4 w-4 text-green-500" />
                                            Priority Email Support
                                        </li>
                                    </ul>
                                    <Button className="w-full">Get Started</Button>
                                </div>
                            </div>
                            <div className="rounded-lg border bg-background p-6 shadow-sm">
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold">Enterprise</h3>
                                    <p className="text-4xl font-bold">Custom</p>
                                    <p className="text-muted-foreground">Tailored to your needs</p>
                                    <ul className="grid gap-2 text-sm">
                                        <li className="flex items-center gap-2">
                                            <CheckIcon className="h-4 w-4 text-green-500" />
                                            Unlimited Chatbots
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckIcon className="h-4 w-4 text-green-500" />
                                            Unlimited Conversations
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckIcon className="h-4 w-4 text-green-500" />
                                            Enterprise-grade Analytics
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckIcon className="h-4 w-4 text-green-500" />
                                            Dedicated Account Manager
                                        </li>
                                    </ul>
                                    <Button className="w-full">Contact Sales</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Testimonials</div>
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What Our Customers Say</h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Hear from businesses that have transformed their customer experience with our chatbot SaaS platform.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-2 lg:gap-12">
                            <div className="rounded-lg border bg-background p-6 shadow-sm">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Image
                                            src="/placeholder.svg"
                                            width="40"
                                            height="40"
                                            alt="Avatar"
                                            className="rounded-full"
                                            style={{ aspectRatio: "40/40", objectFit: "cover" }}
                                        />
                                        <div>
                                            <h4 className="font-bold">Jane Doe</h4>
                                            <p className="text-sm text-muted-foreground">CEO, Acme Inc.</p>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground">
                                        "Our customer satisfaction has skyrocketed since we implemented the chatbot SaaS platform. The
                                        ease of use and\n powerful features have been a game-changer for our\n business."
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-lg border bg-background p-6 shadow-sm">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Image
                                            src="/placeholder.svg"
                                            width="40"
                                            height="40"
                                            alt="Avatar"
                                            className="rounded-full"
                                            style={{ aspectRatio: "40/40", objectFit: "cover" }}
                                        />
                                        <div>
                                            <h4 className="font-bold">John Smith</h4>
                                            <p className="text-sm text-muted-foreground">CTO, Widgets Inc.</p>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground">
                                        "The chatbot SaaS platform has been a game-changer for our\n business. The integration with our
                                        existing systems was a\n breeze, and the analytics have provided invaluable\n insights."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Get Started</div>
                                <h2 className="text-3xl font-bold tracking-t" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

function BotIcon(props: any) {
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
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
        </svg>
    )
}


function CheckIcon(props: any) {
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
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}