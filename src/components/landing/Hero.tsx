import Image from "next/image"
import {Badge} from "@/components/ui/Badge"
import {Button} from "@/components/ui/Button"
import Link from "next/link"
import {Discord} from "@/components/svg/Icons"

function Hero() {
    return (
        <div className={"flex flex-col items-center sm:items-start gap-4 w-full pt-32"}>
            <div className={"flex items-center gap-4 mb-4"}>
                <Badge variant={"brand"} title={"v1.0 Alpha"}/>
            </div>

            <h1 className={"text-3xl xl:text-6xl text-center sm:text-start text-primary font-medium"}>
                Forge dashboards for fast, focused productivity
            </h1>
            <p className={"text-lg text-tertiary text-center sm:text-start"}>
                Create your own custom dashboards with a variety of widgets. Just drag and drop your widget and you are good to go! <br/>
                Personalize layouts for different teams, track your most important metrics in real time,
                and rearrange everything in seconds. <br/>
                Stay on top of your data, collaborate effortlessly, and build a workspace that grows with your needs.
            </p>
            <Link href={"https://discord.gg/yRJzEgyED4"}>
                <Button variant={"primary"} className={"gap-2"}>
                    <Discord width={20} height={20} className={"mt-0.5"}/>
                    Join our discord
                </Button>
            </Link>
            <div className={"w-full overflow-hidden rounded-md shadow-xl border border-main/40"}>
                <div className={"relative w-full aspect-video"}>
                    <Image
                        src={"/mockup.png"}
                        alt={"Example Layout"}
                        fill
                        className={"rounded-md object-contain"}
                        sizes="100vw"
                        quality={75}
                    />
                </div>
            </div>
        </div>
    )
}


export { Hero }
