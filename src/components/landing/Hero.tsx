import {TextAnimate} from "./TextAnimate"
import Image from "next/image"

function Hero() {
    return (
        <div className={"flex flex-col gap-8 w-full items-center px-8 md:px-52 pt-32 md:pt-52"}>
            <div className={"flex items-center gap-4"}>
                <div className={"rounded-full border border-brand/40 px-4 py-1 bg-brand/10 text-brand text-sm"}>
                    v0.2 Closed Beta
                </div>
            </div>

            <TextAnimate animation="blurInUp" by="character" className={"text-4xl md:text-6xl text-primary font-medium"} duration={0.7} once >
                A new way of building dashboards
            </TextAnimate>
            <p className={"text-xl text-center md:w-1/2 text-primary/90"}>Create your own custom dashboards with a variety of widgets. Just drag and drop your widget and you are good to go!</p>
            <p className={"text-2xl text-brand font-semibold font-mono"}>20+ widgets</p>
            <div className={"md:w-2/3 flex items-center justify-center md:p-2 rounded-xl bg-white/10 shadow-xl border border-main/40"}>
                <Image src={"/example_layout.png"} alt={"Example Layout"} width={"1904"} height={"1025"} className={"rounded-xl md:rounded-md"}/>
            </div>
        </div>
    )
}


export { Hero }