import {Navbar} from "@/components/landing/Navbar"
import React from "react"
import {Footer} from "@/components/landing/Footer"
import {Check, Hammer} from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function Pricing() {
    return (
        <div className={"flex gap-32 bg-primary w-full h-full 2xl:px-48 xl:px-32 lg:px-24 md:px-12 px-4"}>
            <Navbar/>
            <div className={"flex flex-col gap-8 md:gap-24 md:pl-48 bg-primary w-full h-full pt-20 md:pt-16"}>
                <div className={"flex flex-col gap-4"}>
                    <h1 className={"text-brand text-3xl font-semibold"}>Pricing</h1>
                    <p className={"text-xl text-tertiary"}>Start your journey today. No credit card required.</p>
                </div>

                <div className={"flex flex-col gap-8 md:gap-0 md:flex-row items-center pb-32"}>
                    <div className={"w-full h-[320px] flex flex-col justify-between gap-4 rounded-l-md bg-primary border border-main/40 p-4 shadow-[0_20px_20px_rgba(0,0,0,0.5)] z-10"}>
                        <div className={"flex flex-col gap-4"}>
                            <p className={"text-3xl font-mono font-semibold text-primary"}>Free Tier</p>
                            <FeatureItem text={"Access to 10 widgets"}/>
                            <FeatureItem text={"Create up to 3 dashboards"}/>
                        </div>
                        <div className={"flex flex-col gap-1"}>
                            <p className={"font-mono font-bold text-primary text-4xl"}>$0</p>
                            <p className={"text-tertiary"}>billed monthly</p>
                        </div>
                        <Button variant={"default"}>
                            Get started
                        </Button>
                    </div>
                    <div className={"w-full h-[400px] flex flex-col justify-between gap-4 rounded-md bg-primary border border-brand/20 ring-4 ring-brand/5 p-4 shadow-[0_20px_20px_rgba(0,0,0,0.5)] z-20"}>
                        <div className={"flex flex-col gap-4"}>
                            <p className={"text-3xl font-mono font-semibold text-brand"}>Plus Tier</p>
                            <div className={"flex items-center gap-2 px-2 py-0.5 w-max rounded-md bg-tertiary border border-main/20"}>
                                <Hammer size={16}/>
                                Everything in free tier and ...
                            </div>
                            <FeatureItem text={"Access to all widgets"}/>
                            <FeatureItem text={"Unlimited dashboards"}/>
                            <FeatureItem text={"Create workspaces"}/>
                        </div>
                        <div className={"flex flex-col gap-1"}>
                            <p className={"font-mono font-bold text-primary text-4xl"}>$10</p>
                            <p className={"text-tertiary"}>billed monthly</p>
                        </div>
                        <Button variant={"brand"}>
                            Get started
                        </Button>
                    </div>
                    <div className={"w-full h-[320px] flex flex-col justify-between gap-4 rounded-r-md bg-primary border border-main/40 p-4 shadow-[0_20px_20px_rgba(0,0,0,0.5)] z-10"}>
                        <div className={"flex flex-col gap-4"}>
                            <p className={"text-3xl font-mono font-semibold text-primary"}>Selfhost</p>
                            <FeatureItem text={"Full access to everything"}/>
                        </div>
                        <Button variant={"default"}>
                            Read the docs
                        </Button>
                    </div>
                </div>
                <Footer/>
            </div>
        </div>
    )
}

const FeatureItem = ({text}: {text: string}) => {
    return (
        <div className={"flex items-center gap-2"}>
            <Check size={20} className={"mt-0.5 text-brand"}/>
            <p>{text}</p>
        </div>
    )
}