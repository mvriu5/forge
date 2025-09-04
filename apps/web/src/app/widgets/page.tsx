"use client"

import {Navbar} from "@/components/landing/Navbar"
import React from "react"
import {Footer} from "@/components/landing/Footer"
import {getAllWidgetPreviews, WidgetPreview} from "../../../../widgets/src/widgets/widgetRegistry"
import Image from "next/image"

export default function Widgets() {
    return (
        <div className={"dark flex gap-32 bg-primary w-full h-full 2xl:px-48 xl:px-32 lg:px-24 md:px-12 px-4"}>
            <Navbar/>
            <div className={"flex flex-col gap-8 md:gap-24 md:pl-48 bg-primary w-full h-full pt-20 md:pt-16"}>
                <div className={"flex flex-col gap-4"}>
                    <h1 className={"text-brand text-3xl font-semibold"}>Widgets</h1>
                    <p className={"text-xl text-tertiary"}>See all the widgets for your dashboard layout.</p>
                </div>

                <div className={"flex flex-col gap-16"}>
                    {getAllWidgetPreviews().map((widget: WidgetPreview) => (
                        <WidgetItem key={widget.widgetType} widget={widget}/>
                    ))}
                </div>

                <Footer/>
            </div>
        </div>
    )
}

const WidgetItem = ({widget}: {widget: WidgetPreview}) => {
    return (
        <div className={"flex items-center gap-4"}>
            <Image src={widget.previewImage} alt={""} width={400} height={400}/>
            <div className={"flex flex-col gap-2"}>
                <p className={"text-primary font-semibold text-xl"}>{widget.title}</p>
                <p>{widget.description}</p>
            </div>
        </div>
    )
}