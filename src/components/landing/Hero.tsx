import {TextAnimate} from "./TextAnimate"
import Image from "next/image"
import {ForgeLogo} from "@/components/svg/ForgeLogo"
import {Badge} from "@/components/ui/Badge"
import {Input} from "@/components/ui/Input"
import {Button} from "@/components/ui/Button"

function Hero() {
    return (
        <div className={"flex flex-col items-center sm:items-start gap-4 w-full pt-16"}>
            <div className={"flex items-center gap-4 mb-4"}>
                <Badge variant={"brand"} title={"v1.0 Alpha"}/>
            </div>

            <TextAnimate animation="blurInUp" by="character" className={"text-3xl xl:text-6xl text-center sm:text-start text-primary font-medium"} duration={0.7} once>
                Productivity needs to feel illegal
            </TextAnimate>
            <p className={"text-lg text-tertiary text-center sm:text-start"}>
                Create your own custom dashboards with a variety of widgets. Just drag and drop your widget and you are good to go! <br/>
                Personalize layouts for different teams, track your most important metrics in real time,
                and rearrange everything in seconds. <br/>
                Stay on top of your data, collaborate effortlessly, and build a workspace that grows with your needs.
            </p>
            <div className={"flex items-center justify-center rounded-xl shadow-xl border border-main/40"}>
                <Image src={"/mockup.png"} alt={"Example Layout"} width={"1904"} height={"1025"} className={"rounded-xl md:rounded-md"}/>
            </div>
        </div>
    )
}


export { Hero }