import { PanelsTopLeft } from "lucide-react"

function WidgetSection() {
    return (
        <div className={"flex flex-col gap-12 items-center px-8 md:px-52"}>
            <p className="flex flex-col md:flex-row md:items-center gap-2 text-brand text-xl font-semibold">
                <span className="flex items-center gap-1.5">
                    <PanelsTopLeft size={20} strokeWidth={2.5} />
                    Widgets
                </span>
                <span className="block md:inline text-tertiary font-normal">
                    Explore many widgets to get your own dashboard style
                </span>
            </p>
            <div className={"grid grid-cols-1 md:grid-cols-2 auto-rows-[minmax(120px,auto)] gap-4 w-full md:w-2/3"}>
                <div className={"col-span-1 row-span-1 bg-tertiary rounded-md border border-main/20"}>

                </div>
                <div className={"col-span-1 row-span-2 bg-tertiary rounded-md border border-main/20"}>

                </div>
                <div className={"col-span-1 row-span-1 bg-tertiary rounded-md border border-main/20"}>

                </div>
                <div className={"col-span-1 md:col-span-2 row-span-2 bg-tertiary rounded-md border border-main/20"}>

                </div>
            </div>
        </div>
    )
}

export {WidgetSection}