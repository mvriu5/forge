"use client"

import {Avatar, AvatarFallback, AvatarImage, Button} from "lunalabs-ui"
import {Plus} from "lucide-react"
import {useSession} from "@/lib/auth-client"

function Header() {
    const { data: session } = useSession()

    console.log(session)


    return (
        <div className={"w-full top-0 left-0 h-12 px-2 flex justify-between items-center bg-primary border-b border-main/40"}>
            <Button className={"bg-brand hover:bg-brand/80 text-primary border-0 h-6"}>
                <Plus size={16} className={"mr-2"}/>
                Widget
            </Button>
            <div className={"flex items-center gap-2"}>
                <p>{session?.user?.name}</p>
                <Avatar className={"size-8 border border-main/20"}>
                    <AvatarImage src={session?.user?.image ?? ""}/>
                    <AvatarFallback className={"bg-gradient-to-br from-green-400 to-brand"}></AvatarFallback>
                </Avatar>
            </div>

        </div>

    )
}

export {Header}