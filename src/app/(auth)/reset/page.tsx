import {DotPattern} from "@/components/svg/DotPattern"
import {cn} from "@/lib/utils"
import {ResetPasswordCard} from "@/components/cards/ResetPasswordCard"

export default function ResetPasswordPage() {
    return (
        <div className={"h-screen w-full flex items-center justify-center"}>
            <DotPattern className={cn(
                "mask-image:radial-gradient(450px_circle_at_center,gray,transparent)",
            )}/>
            <ResetPasswordCard />
        </div>
    )
}
