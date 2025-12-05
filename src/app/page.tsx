import React from "react"
import {Hero} from "@/components/landing/Hero"
import {Footer} from "@/components/landing/Footer"

export default function Page() {
    return (
        <div className={"dark flex gap-32 bg-primary w-full h-full 2xl:px-48 xl:px-32 lg:px-24 md:px-12 px-4"}>
            <div className={"flex flex-col gap-8 md:gap-16 bg-primary w-full h-full"}>
                <Hero/>
                <Footer/>
            </div>
        </div>
    )
}
