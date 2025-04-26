import React from "react"
import {Hero} from "@/components/landing/Hero"
import {WidgetSection} from "@/components/landing/WidgetSection"
import {FeatureSection} from "@/components/landing/FeatureSection"
import {Footer} from "@/components/landing/Footer"
import {Navbar} from "@/components/landing/Navbar"

export default function Page() {
    return (
        <div className={"flex gap-16 bg-primary w-full h-full"}>
            <div className={"flex flex-col gap-4"}>
                <Navbar/>
            </div>
            <div className={"flex flex-col gap-32 pl-48 bg-primary w-full h-full"}>
                <Hero/>
                <WidgetSection/>
                <FeatureSection/>
                <Footer/>
            </div>
        </div>
    )
}
