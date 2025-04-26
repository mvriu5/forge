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
                <div className={"col-span-1 row-span-3 bg-tertiary rounded-md border border-main/20"}>

                </div>
            </div>
        </div>
    )
}

const BentoShare = () => {
    return (
        <div className={"col-span-1 row-span-3 flex flex-col gap-4 items-center justify-center bg-secondary rounded-md border border-main/20 p-8"}>
            <div className={"flex flex-col items-center gap-2 py-4"}>
                <p className={"text-sm text-brand"}>SHARE</p>
                <p className={"text-xl text-primary font-semibold"}>Share with your friends!</p>
            </div>

            <div className={"z-30 w-full h-20 bg-tertiary rounded-xl border border-main/20 shadow-xl -mb-12"}>

            </div>
            <div className={"z-20 scale-90 w-full h-20 bg-tertiary rounded-xl border border-main/20 shadow-xl -mb-12"}>

            </div>
            <div className={"z-10 scale-80 w-full h-20 bg-tertiary rounded-xl border border-main/20 shadow-xl"}>

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
            <div className={"grid grid-cols-4 gap-2"}>
                <div className={"col-span-1 w-full h-12 bg-tertiary rounded-md shadow-md"}/>
                <div className={"col-span-1 h-12 bg-tertiary rounded-md shadow-md"}/>
                <div className={"col-span-1 h-12 bg-tertiary rounded-md shadow-md"}/>

                <div className={"col-span-1 h-12 bg-tertiary rounded-md shadow-md"}/>


            </div>
        </div>
    )
}

export {FeatureSection}