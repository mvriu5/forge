import Link from "next/link"
import {Github} from "@/components/svg/Icons"
import {Button} from "@/components/ui/Button"
import {ForgeLogo} from "@/components/svg/ForgeLogo"
import {StarsCount} from "@/components/landing/StarsCount"

export default function Navbar() {
    return (
        <header className="z-50 fixed top-0 left-0 right-0 max-w-screen border-b border-main/20 backdrop-blur-2xl">
            <div className="flex items-center gap-2 justify-between p-4 bg-secondary/40">
                <div className="flex items-center gap-4">
                    <ForgeLogo/>
                    <div className={"h-6 w-0.5 bg-white/10"}/>
                    <span className={"text-xl text-primary font-mono font-semibold"}>forge</span>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={`https://github.com/mvriu5/forge`}
                        rel="noreferrer"
                    >
                        <Button variant={"ghost"} className={"gap-2"}>
                            <Github height={20} width={20} aria-hidden="true" />
                            <StarsCount />
                        </Button>
                    </Link>
                    <Link href="/signup">
                        <Button variant={"brand"}>
                            Get started
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}
