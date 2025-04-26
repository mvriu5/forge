import {LinearIcon} from "@/components/svg/LinearIcon"
import {GoogleIcon} from "@/components/svg/GoogleIcon"
import {Github} from "@/components/svg/BookmarkIcons"
import React from "react"
import {X} from "lucide-react"

function FeatureSection() {
    return (
        <div className={"flex flex-col gap-4 px-8"}>
            <p className="flex gap-1.5 font-semibold text-3xl text-brand">
                Plenty of features waiting for you
            </p>
            <div className={"h-px w-full rounded-full bg-tertiary"}/>
            <p className="text-xl text-tertiary font-normal">
                Customize, share, personalize. Make it your own.
            </p>


            <div className={"grid grid-cols-1 md:grid-cols-2 auto-rows-[minmax(120px,120px)] gap-8 pt-8"}>
                <BentoIntegrate/>
                <BentoShare/>
                <div className={"col-span-1 row-span-2 bg-tertiary rounded-md border border-main/20"}>

                </div>
            </div>
        </div>
    )
}

const BentoShare = () => {
    return (
        <div className={"col-span-1 row-span-2 flex flex-col gap-4 items-center justify-center bg-secondary rounded-md border border-main/20 p-8"}>
            <div className={"flex flex-col items-center gap-2 py-4"}>
                <p className={"text-sm text-brand"}>SHARE</p>
                <p className={"text-xl text-primary font-semibold"}>Share with your friends!</p>
            </div>

            <div className={"z-30 w-full h-20 flex items-center justify-between gap-2 px-4 bg-tertiary rounded-xl border border-main/20 shadow-[0_20px_20px_rgba(0,0,0,0.5)] -mb-12"}>
                <div className={"flex items-center gap-2"}>
                    <div className={"size-10 rounded-full bg-gradient-to-br from-purple-300 to-blue-800"}>
                    </div>
                    <p className={"text-lg text-primary font-semibold"}>Max</p>
                    <p className={"text-lg text-tertiary"}>is currently viewing your dashboard:</p>
                    <p className={"px-2 py-1 rounded-md bg-white/5 text-lg text-secondary font-mono"}>School dashboard</p>
                </div>
                <X className={"text-tertiary/60"} size={20}/>
            </div>
            <div className={"z-20 scale-90 w-full h-20 flex items-center justify-between gap-2 px-4 bg-tertiary rounded-xl border border-main/20 shadow-[0_20px_20px_rgba(0,0,0,0.5)] -mb-16"}>
                <div className={"flex items-center gap-2"}>
                    <div className={"size-10 rounded-full bg-gradient-to-br from-brand to-emerald-400"}>
                    </div>
                    <p className={"text-lg text-primary font-semibold"}>Joann</p>
                    <p className={"text-lg text-tertiary"}>is currently viewing your dashboard:</p>
                    <p className={"px-2 py-1 rounded-md bg-white/5 text-lg text-secondary font-mono"}>Financial analysis</p>
                </div>
                <X className={"text-tertiary/60"} size={20}/>
            </div>
            <div className={"z-10 scale-80 w-full h-20 flex items-center justify-between gap-2 px-4 bg-tertiary rounded-xl border border-main/20 shadow-[0_20px_20px_rgba(0,0,0,0.5)]"}>
                <div className={"flex items-center gap-2"}>
                    <div className={"size-10 rounded-full bg-gradient-to-br from-red-500 to-brand"}>
                    </div>
                    <p className={"text-lg text-primary font-semibold"}>Raphael</p>
                    <p className={"text-lg text-tertiary"}>is currently viewing your dashboard:</p>
                    <p className={"px-2 py-1 rounded-md bg-white/5 text-lg text-secondary font-mono"}>HR Team 1</p>
                </div>
                <X className={"text-tertiary/60"} size={20}/>
            </div>
        </div>
    )
}

const BentoIntegrate = () => {
    return (
        <div className={"col-span-1 md:col-span-2 row-span-2 flex flex-col gap-4 items-center justify-center bg-secondary rounded-md border border-main/20 p-8"}>
            <div className={"flex flex-col items-center gap-2 py-4"}>
                <p className={"text-sm text-brand"}>INTEGRATE</p>
                <p className={"text-xl text-primary font-semibold"}>Integrate your favorite apps!</p>
            </div>
            <div className={"w-full grid grid-cols-4 gap-4"}>
                <div className={"col-span-1 h-20 flex gap-2 items-center justify-center p-2 bg-tertiary rounded-md shadow-md"}>
                    <GoogleIcon className={"size-6"}/>
                    Google
                </div>
                <div className={"col-span-1 h-20 flex gap-2 items-center justify-center p-2 bg-tertiary rounded-md shadow-md text-lg font-semibold"}>
                    <LinearIcon className={"size-8"}/>
                    Linear
                </div>
                <div className={"col-span-1 h-20 flex gap-2 items-center justify-center p-2 bg-tertiary rounded-md shadow-md text-lg font-semibold"}>
                    <Github className={"fill-secondary size-6"}/>
                    Github
                </div>
                <div className={"col-span-1 h-20 flex gap-2 items-center justify-center p-2 bg-tertiary rounded-md shadow-md text-tertiary"}>
                    More coming soon!
                </div>
            </div>
        </div>
    )
}

export {FeatureSection}