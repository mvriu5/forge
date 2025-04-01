import {PanelsTopLeft} from "lucide-react"

function FeatureSection() {
    return (
        <div className={"flex flex-col gap-12 items-center px-52"}>

            <p className={"flex items-center gap-1.5 text-brand text-xl font-semibold text-wrap"}>
                <PanelsTopLeft size={20} strokeWidth={2.5}/>
                Features
                <span className={"inline break-words text-tertiary font-normal"}>Customize, share, personalize. Make it your own.</span>
            </p>
            <div className={"grid grid-cols-2 auto-rows-[minmax(120px,auto)] gap-4 w-2/3"}>
                <div className={"col-span-2 row-span-2 bg-tertiary rounded-md border border-main/20"}>

                </div>
                <div className={"col-span-1 row-span-3 bg-tertiary rounded-md border border-main/20"}>

                </div>
                <div className={"col-span-1 row-span-3 bg-tertiary rounded-md border border-main/20"}>

                </div>
            </div>
        </div>
    )
}

export {FeatureSection}