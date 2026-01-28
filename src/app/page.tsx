import { StarsCount } from "@/components/StarsCount"
import { ForgeLogo } from "@/components/svg/ForgeLogo"
import { Discord, Github } from "@/components/svg/Icons"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import Image from "next/image"
import Link from "next/link"

export default function Page() {
    return (
        <div className={"dark flex gap-24 bg-primary max-w-screen h-full overflow-hidden"}>
            <div className={"flex flex-col items-center gap-8 bg-primary w-full h-full"}>

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

                <div className={"w-[80vw] 2xl:w-[70vw] flex flex-col gap-8"}>
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
                </div>
            </div>
        </div>
    )
}
