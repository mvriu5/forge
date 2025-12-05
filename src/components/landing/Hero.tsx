import {TextAnimate} from "./TextAnimate"
import Image from "next/image"
import {Grab, Layers, LayoutTemplate, Share2} from "lucide-react"
import {ForgeLogo} from "@/components/svg/ForgeLogo"
import {Badge} from "@/components/ui/Badge"
import {Input} from "@/components/ui/Input"
import {Button} from "@/components/ui/Button"

function Hero() {
    return (
        <div className={"flex flex-col items-center sm:items-start gap-8 w-full pt-20 md:pt-16"}>
            <div className={"flex items-center gap-4"}>
                <ForgeLogo/>
                <div className={"h-6 w-0.5 bg-white/10"}/>
                <Badge variant={"brand"} title={"v1.0 Alpha"}/>
            </div>

            <TextAnimate animation="blurInUp" by="character" className={"text-3xl xl:text-6xl text-center sm:text-start text-primary font-medium"} duration={0.7} once>
                Productivity needs to feel illegal
            </TextAnimate>
            <p className={"text-lg text-tertiary text-center sm:text-start"}>Create your own custom dashboards with a variety of widgets. Just drag and drop your widget and you are good to go!</p>

            <div className={"w-max flex flex-col sm:flex-row items-center gap-4"}>
                <Input className={"w-80"} placeholder={"john.doe@gmail.com"}/>
                <Button variant={"primary"}>
                    Join the waitlist
                </Button>
            </div>

            <div className={"flex items-center justify-center rounded-xl shadow-xl border border-main/40"}>
                <Image src={"/mockup.png"} alt={"Example Layout"} width={"1904"} height={"1025"} className={"rounded-xl md:rounded-md"}/>
            </div>
        </div>
    )
}


export { Hero }