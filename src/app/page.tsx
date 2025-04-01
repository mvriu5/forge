import React from "react"
import {Navbar} from "@/components/landing/Navbar"
import {Hero} from "@/components/landing/Hero"
import {WidgetSection} from "@/components/landing/WidgetSection"
import {DownloadSection} from "@/components/landing/DownloadSection"
import {FeatureSection} from "@/components/landing/FeatureSection"
import {Footer} from "@/components/landing/Footer"

export default function Page() {
    return (
        <div className={"flex flex-col gap-72 bg-secondary w-full h-full"}>
            <Navbar/>
            <Hero/>
            <WidgetSection/>
            <FeatureSection/>
            <DownloadSection/>
            <Footer/>
        </div>
    )
}
