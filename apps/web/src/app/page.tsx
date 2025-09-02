import React from "react"
import {Hero} from "@/components/landing/Hero"
import {WidgetSection} from "@/components/landing/WidgetSection"
import {FeatureSection} from "@/components/landing/FeatureSection"
import {Footer} from "@/components/landing/Footer"
import {Navbar} from "@/components/landing/Navbar"

export const metadata = {
    title: "Forge - Building dashboards made easy",
};

export default function Page() {
    return (
        <div className={"dark flex gap-32 bg-primary w-full h-full 2xl:px-48 xl:px-32 lg:px-24 md:px-12 px-4"}>
            <Navbar/>
            <div className={"flex flex-col gap-8 md:gap-16 md:pl-48 bg-primary w-full h-full"}>
                <Hero/>
                <WidgetSection/>
                <FeatureSection/>
                <Footer/>
            </div>
        </div>
    )
}
