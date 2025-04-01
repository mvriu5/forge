import { PanelsTopLeft } from "lucide-react"

function WidgetSection() {
    return (
        <div className={"flex flex-col gap-12 items-center px-52"}>

            <p className={"flex items-center gap-1.5 text-brand text-xl font-semibold text-wrap"}>
                <PanelsTopLeft size={20} strokeWidth={2.5}/>
                Widgets
                <span className={"inline break-words text-tertiary font-normal"}>Explore many widgets to get your own dashboard style</span>
            </p>
            <div className={"grid grid-cols-2 auto-rows-[minmax(120px,auto)] gap-4 w-2/3"}>
                <div className={"col-span-1 row-span-1 bg-tertiary rounded-md border border-main/20"}>

                </div>
                <div className={"col-span-1 row-span-2 bg-tertiary rounded-md border border-main/20"}>

                </div>
                <div className={"col-span-1 row-span-1 bg-tertiary rounded-md border border-main/20"}>

                </div>
                <div className={"col-span-2 row-span-2 bg-tertiary rounded-md border border-main/20"}>

                </div>
            </div>
        </div>
    )
}

export {WidgetSection}