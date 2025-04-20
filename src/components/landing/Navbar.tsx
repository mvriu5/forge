"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import type React from "react"
import {useEffect, useRef, useState} from "react"
import {cn} from "@/lib/utils"
import {Anvil} from "lucide-react"
import { Button } from "@/components/ui/Button"
import {ForgeLogo} from "@/components/svg/ForgeLogo"

type NavItem = {
    title: string
    href: string
}

interface TabProps {
    setPosition: React.Dispatch<React.SetStateAction<{ left: number; width: number; opacity: number }>>
    onClick: () => void
    title: string
    textColor?: string
}

function Navbar() {
    const router = useRouter()
    const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 })
    const [isScrolled, setIsScrolled] = useState(false)

    const headerItems: NavItem[] = [
        {title: "Home", href: ""},
        {title: "Widgets", href: ""},
        {title: "Pricing", href: ""},
    ]

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 5)
        }
        window.addEventListener("scroll", handleScroll)

        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleRoute = (item: NavItem) => {
        if (item.href) router.push(item.href)
        else router.replace("/")
    }

    return (
        <div className={"fixed z-50 w-full overflow-hidden"} id={"header"}>
            <motion.div
                className={cn(
                    "my-4 p-1.5 pl-4 flex items-center justify-between top-0 left-0 rounded-lg shadow-sm",
                    "bg-primary border border-main/40 text-secondary backdrop-blur-xl overflow-hidden"
                )}
                initial={{
                    marginLeft: "15%",
                    marginRight: "15%",
                }}
                animate={{
                    marginLeft: isScrolled ? "20%" : "15%",
                    marginRight: isScrolled ? "20%" : "15%",
                }}
                transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 20,
                }}
            >
                <motion.div className={cn("flex gap-2 items-center text-primary")}
                            initial={{opacity: 0, filter: 'blur(10px)', y: -30}}
                            animate={{opacity: 1, filter: 'blur(0px)', y: 0}}
                            transition={{duration: 0.65}}
                >
                    <ForgeLogo/>
                    <p className={cn("font-semibold text-xl font-mono")}>forge</p>
                </motion.div>

                <div className={"relative flex flex-row items-center pl-4"}
                     onMouseLeave={() => setPosition({ left: position.left, width: position.width, opacity: 0 })}
                >
                    <div className={"hidden md:flex gap-4"}>
                        {headerItems.map((item) => (
                            <Tab key={item.title}
                                 title={item.title}
                                 setPosition={setPosition}
                                 onClick={() => handleRoute(item)}
                            />
                        ))}
                    </div>
                    <Cursor position={position}/>
                </div>
                <div className={"flex gap-2"}>
                    <Button variant={"default"} className={"px-2 border-main/60"} onClick={() => router.push("/signin")}>
                        Login
                    </Button>
                    <Button variant={"brand"} className={"px-2"} onClick={() => router.push("/signup")}>
                        Sign up
                    </Button>
                </div>

            </motion.div>
        </div>
    )
}


const Tab: React.FC<TabProps> = ({ setPosition, onClick, title }) => {
    const ref = useRef<HTMLDivElement>(null)

    return (
        <motion.div
            className={cn("relative z-50 px-4 py-1 font-medium text-md rounded-lg cursor-pointer")}
            ref={ref}
            onClick={onClick}
            initial={{opacity: 0, filter: 'blur(10px)', y: -30}}
            animate={{opacity: 1, filter: 'blur(0px)', y: 0}}
            transition={{duration: 0.65}}
            onMouseEnter={() => {
                if (!ref?.current) return

                const { width } = ref.current.getBoundingClientRect()

                setPosition({
                    left: ref.current.offsetLeft,
                    width,
                    opacity: 1
                })
            }}
        >
            {title}
        </motion.div>
    )
}

const Cursor: React.FC<{ position: {left: number, width: number, opacity: number} }> = ({ position }) => {
    return (
        <motion.div
            animate={{...position}}
            className={cn("absolute z-40 h-8 rounded-lg bg-tertiary")}
        />
    )
}

export { Navbar }