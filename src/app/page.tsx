import React from "react"
import {Hero} from "@/components/landing/Hero"
import {Footer} from "@/components/landing/Footer"
import Navbar from "@/components/landing/Navigation"

export default function Page() {
    return (
        <div className={"dark flex gap-24 bg-primary max-w-screen h-full overflow-hidden"}>
            <div className={"flex flex-col gap-8 bg-primary w-full h-full"}>
                <Navbar/>
                <div className={"w-full flex flex-col gap-8 2xl:px-48 xl:px-32 lg:px-24 md:px-12 px-4"}>
                    <Hero/>
                    <Footer/>
                </div>
            </div>
        </div>
    )
}
