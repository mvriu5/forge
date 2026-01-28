import {SignUpCard} from "@/components/cards/SignUpCard"
import {cn} from "@/lib/utils"
import {DotPattern} from "@/components/svg/DotPattern"

export default function SignUp() {
    return (
        <div className={"h-screen w-full flex items-center justify-center"}>
            <DotPattern className={cn(
                "mask-[radial-gradient(450px_circle_at_center,gray,transparent)]",
            )}/>
            <SignUpCard/>
        </div>
    )
}
