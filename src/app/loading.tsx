import {ButtonSpinner} from "@/components/ButtonSpinner"

export default function Loading() {
    return (
        <div className="flex items-center justify-center w-screen h-screen">
            <ButtonSpinner/>
        </div>
    )
}