import Link from "next/link"

function Footer() {
    return (
        <div className={"flex w-full justify-end gap-8 text-sm text-tertiary font-mono px-8 pb-8 cursor-default"}>
            <Link href={"/imprint"}>
                Imprint
            </Link>
            <Link href={"/privacy"}>
                Privacy policy
            </Link>
            <Link href={"/terms"}>
                Terms of use
            </Link>
        </div>
    )
}

export { Footer }