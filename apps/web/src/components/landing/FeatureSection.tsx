import {LinearIcon} from "@forge/ui/components/svg/LinearIcon"
import {GoogleIcon} from "@forge/ui/components/svg/GoogleIcon"
import {Github} from "@forge/ui/components/svg/BookmarkIcons"
import React from "react"
import {Check, X} from "lucide-react"

function FeatureSection() {
    return (
        <div className={"flex flex-col gap-4 md:px-8"}>
            <p className="flex gap-1.5 font-semibold text-3xl text-brand">
                Plenty of features waiting for you
            </p>
            <div className={"h-px w-full rounded-full bg-tertiary"}/>
            <p className="text-xl text-tertiary font-normal">
                Customize, share, personalize. Make it your own.
            </p>


            <div className={"grid grid-cols-1 2xl:grid-cols-2 auto-rows-[minmax(auto,120px)] gap-8 pt-8"}>
                <BentoIntegrate/>
                <BentoShare/>
                <BentoDashboards/>
            </div>
        </div>
    )
}

const BentoShare = () => {
    return (
        <div className={"col-span-1 row-span-2 flex flex-col gap-4 items-center justify-center bg-secondary rounded-md border border-main/20 p-2 xl:p-8"}>
            <div className={"flex flex-col items-center gap-2 py-4"}>
                <p className={"text-sm text-brand"}>SHARE</p>
                <p className={"text-xl text-primary font-semibold"}>Share with your friends!</p>
            </div>

            <div className={"z-[12] w-full h-20 flex items-center justify-between gap-2 px-2 bg-primary rounded-xl border border-main/20 shadow-[0_20px_20px_rgba(0,0,0,0.5)] -mb-12"}>
                <div className={"flex items-center gap-2"}>
                    <div className={"size-8 rounded-full bg-gradient-to-br from-purple-300 to-blue-800"}/>
                    <p className={"text-sm text-primary font-semibold"}>Max</p>
                    <p className={"flex text-sm text-tertiary text-nowrap"}>is viewing:</p>
                    <p className={"px-2 py-1 rounded-md bg-info/10 border border-info/20 text-xs text-info font-mono text-nowrap truncate"}>School dashboard</p>
                </div>
                <X className={"min-w-5 min-h-5 text-tertiary/60"}/>
            </div>
            <div className={"z-[11] scale-90 w-full h-20 flex items-center justify-between gap-2 px-2 bg-primary rounded-xl border border-main/20 shadow-[0_20px_20px_rgba(0,0,0,0.5)] -mb-16"}>
                <div className={"flex items-center gap-2"}>
                    <div className={"size-8 rounded-full bg-gradient-to-br from-brand to-emerald-400"}/>
                    <p className={"text-sm text-primary font-semibold"}>Joann</p>
                    <p className={"flex text-sm text-tertiary text-nowrap"}>is viewing:</p>
                    <p className={"px-2 py-1 rounded-md bg-info/10 border border-info/20 text-xs text-info font-mono text-nowrap truncate"}>Finance analysis</p>
                </div>
                <X className={"text-tertiary/60"} size={20}/>
            </div>
            <div className={"z-10 scale-80 w-full h-20 flex items-center justify-between gap-2 px-2 bg-primary rounded-xl border border-main/20 shadow-[0_20px_20px_rgba(0,0,0,0.5)]"}>
                <div className={"flex items-center gap-2"}>
                    <div className={"size-8 rounded-full bg-gradient-to-br from-red-500 to-brand"}/>
                    <p className={"text-sm text-primary font-semibold"}>Raphael</p>
                    <p className={"flex text-sm text-tertiary text-nowrap"}>is viewing:</p>
                    <p className={"px-2 py-1 rounded-md bg-info/10 border border-info/20 text-xs text-info font-mono text-nowrap truncate"}>HR Team 1</p>
                </div>
                <X className={"text-tertiary/60"} size={20}/>
            </div>
        </div>
    )
}

const BentoIntegrate = () => {
    return (
        <div className={"col-span-1 2xl:col-span-2 row-span-2 flex flex-col gap-4 items-center justify-center bg-secondary rounded-md border border-main/20 p-2 xl:p-8"}>
            <div className={"flex flex-col items-center gap-2 py-4"}>
                <p className={"text-sm text-brand"}>INTEGRATE</p>
                <p className={"text-xl text-primary font-semibold"}>Integrate your favorite apps!</p>
            </div>
            <div className={"w-full grid grid-cols-4 gap-4"}>
                <div className={"col-span-1 h-20 flex gap-2 items-center justify-center p-2 bg-radial from-brand/5 to-tertiary rounded-md shadow-md"}>
                    <GoogleIcon className={"size-6"}/>
                    <p className={"hidden xl:flex"}>Google</p>
                </div>
                <div className={"col-span-1 flex gap-2 items-center justify-center p-2 bg-radial from-brand/5 to-tertiary rounded-md shadow-md text-lg font-semibold"}>
                    <LinearIcon className={"size-8"}/>
                    <p className={"hidden xl:flex"}>Linear</p>
                </div>
                <div className={"col-span-1 h-20 flex gap-2 items-center justify-center p-2 bg-radial from-brand/5 to-tertiary rounded-md shadow-md text-lg font-semibold"}>
                    <Github className={"fill-secondary size-6"}/>
                    <p className={"hidden xl:flex"}>Github</p>
                </div>
                <div className={"text-xs xl:text-base col-span-1 h-20 flex gap-2 items-center justify-center p-2 bg-radial from-brand/5 to-tertiary rounded-md shadow-md text-tertiary"}>
                    <p className={"text-center"}>More coming soon!</p>
                </div>
            </div>
        </div>
    )
}

const BentoDashboards = () => {
    return (
        <div className={"col-span-1 row-span-2 flex flex-col gap-4 items-center bg-secondary rounded-md border border-main/20 p-2 xl:p-8 overflow-hidden"}>
            <div className={"flex flex-col items-center gap-2 py-4"}>
                <p className={"text-sm text-brand"}>COLLABORATE</p>
                <p className={"text-xl text-primary font-semibold text-center"}>Create dashboards & work together!</p>
            </div>

            <div className={"w-72 flex flex-col gap-2 bg-primary rounded-md border border-main/60 p-1 shadow-[0px_0px_20px_rgba(0,0,0,0.7)]"}>
                <div className={"flex items-center gap-2 px-4 py-1"}>
                    Finance Overview
                </div>
                <div className={"border-b border-main/60 -mx-1"}/>
                <p className={"px-1 text-xs text-tertiary"}>Workspaces</p>
                <div className={"flex items-center justify-between gap-2 px-2 py-1 rounded-md bg-tertiary text-primary"}>
                    Development Team Issues
                    <Check size={20 }/>
                </div>
                <div className={"flex items-center gap-2 px-4 py-1"}>
                    HR Team
                </div>

            </div>
        </div>
    )
}

export {FeatureSection}