import {Calendar, CloudSun, GitBranch, Notebook} from "lucide-react"
import { TextAnimate } from "./TextAnimate"

function Hero() {
    return (
        <div className={"flex flex-col gap-8 w-full items-center px-52 pt-52"}>
            <div className={"rounded-full border border-brand px-4 py-1 bg-brand/10"}>
                <p className={"text-sm text-primary"}>v0.9 Closed Beta</p>
            </div>
            <TextAnimate animation="blurInUp" by="character" className={"text-6xl text-primary font-medium"} duration={0.7} once>
                A new way of building dashboards
            </TextAnimate>
            <p className={"text-xl text-center w-1/2 text-primary/90"}>Create your own custom dashboards with a variety of widgets. Just drag and drop your widget and you are good to go!</p>
            <p className={"text-2xl text-brand"}>20+ widgets</p>
            <DashboardSample/>
        </div>
    )
}

function WidgetList() {
    return (
        <div className={"flex gap-4"}>
            <div className={"flex items-center justify-center size-12 rounded-md text-primary bg-blue-500 shadow-sm shadow-blue-500"}>
                <CloudSun size={30}/>
            </div>
            <div className={"flex items-center justify-center size-12 rounded-md text-primary bg-green-600 shadow-sm shadow-green-600"}>
                <GitBranch size={30}/>
            </div>
            <div className={"flex items-center justify-center size-12 rounded-md text-primary bg-amber-500 shadow-sm shadow-amber-500"}>
                <Notebook size={30}/>
            </div>
            <div className={"flex items-center justify-center size-12 rounded-md text-primary bg-pink-600 shadow-sm shadow-pink-600"}>
                <Calendar size={30}/>
            </div>
        </div>
    )
}

function DashboardSample() {
    return (
        <div className={"grid grid-cols-4 auto-rows-[minmax(120px,auto)] gap-4 w-2/3 max-h-[568px] bg-tertiary rounded-md p-4 border border-main/40 shadow-xl"}>
            <div className={"col-span-3 row-span-2 bg-secondary rounded-md "}/>
            <div className={"col-span-1 row-span-4 bg-secondary rounded-md "}/>
            <div className={"col-span-2 row-span-2 bg-secondary rounded-md "}/>
            <div className={"col-span-1 row-span-1 bg-secondary rounded-md "}/>
            <div className={"col-span-1 row-span-1 bg-secondary rounded-md "}/>
        </div>
    )
}

export { Hero }