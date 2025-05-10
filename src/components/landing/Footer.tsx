import Link from "next/link"

function Footer() {
    return (
        <div className={"flex w-full justify-end gap-8 text-sm text-tertiary font-mono px-8 pb-8 cursor-default"}>
            <Link href={"/privacy?allowLanding=true"}>
                Privacy policy
            </Link>
            <Link href={"/terms?allowLanding=true"}>
                Terms of use
            </Link>
        </div>
    )
}

export { Footer }