"use client"

import {Download} from "lucide-react"
import { Button } from "@/components/ui/Button"

function DownloadSection() {
    return (
        <div className={"flex gap-12 justify-center items-center px-52"}>
            <p className={"text-4xl text-tertiary underline underline-offset-5"}>Here is what you are looking for</p>
            <Button variant="brand" className={"gap-2 pr-8 pl-6 text-2xl h-12 shadow-xl"}>
                <Download size={26} strokeWidth={2.5}/>
                Download
            </Button>
        </div>
    )
}

export { DownloadSection }