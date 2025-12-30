import { Footer } from "@/components/landing/Footer"
import { Hero } from "@/components/landing/Hero"
import Navbar from "@/components/landing/Navigation"

export default function Page() {
    return (
        <div className={"dark flex gap-24 bg-primary max-w-screen h-full overflow-hidden"}>
            <div className={"flex flex-col items-center gap-8 bg-primary w-full h-full"}>
                <Navbar/>
                <div className={"w-[80vw] 2xl:w-[70vw] flex flex-col gap-8"}>
                    <Hero/>
                    <Footer/>
                </div>
            </div>
        </div>
    )
}
