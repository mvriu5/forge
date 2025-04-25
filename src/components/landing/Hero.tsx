import {TextAnimate} from "./TextAnimate"
import Image from "next/image"
import {Grab, Layers, LayoutTemplate, Share2} from "lucide-react"

function Hero() {
    return (
        <div className={"flex flex-col gap-8 w-full px-8 pt-16"}>
            <TextAnimate animation="blurInUp" by="character" className={"text-4xl md:text-6xl text-primary font-medium"} duration={0.7} once >
                Building dashboards made easy
            </TextAnimate>
            <p className={"text-xl text-tertiary"}>Create your own custom dashboards with a variety of widgets. Just drag and drop your widget and you are good to go!</p>
           <div className={"flex items-center justify-between gap-4"}>
               <div className={"flex items-center gap-2 text-primary text-xl font-semibold"}>
                   <LayoutTemplate size={18}/>
                   <p>20+ widgets</p>
               </div>

               <div className={"flex items-center gap-2 text-primary text-xl font-semibold"}>
                   <Layers size={18}/>
                   <p>Multiple dashboards</p>
               </div>

               <div className={"flex items-center gap-2 text-primary text-xl font-semibold"}>
                   <Share2 size={18}/>
                   <p>Share with your friends</p>
               </div>

               <div className={"flex items-center gap-2 text-primary text-xl font-semibold"}>
                   <Grab size={18}/>
                   <p>Drag'n drop</p>
               </div>

           </div>
            <div className={"flex items-center justify-center md:p-2 rounded-xl bg-white/10 shadow-xl border border-main/40"}>
                <Image src={"/example_layout.png"} alt={"Example Layout"} width={"1904"} height={"1025"} className={"rounded-xl md:rounded-md"}/>
            </div>
        </div>
    )
}


export { Hero }