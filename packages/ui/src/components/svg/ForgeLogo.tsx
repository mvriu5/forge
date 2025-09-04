
interface ForgeLogoProps {
    size?: number
    className?: string
}

const ForgeLogo = ({className, size = 30}: ForgeLogoProps) => {
    return (
        <svg width={size} height={size} viewBox="0 0 1026 598" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <title>forge</title>
            <rect x="0.682007" y="0.252441" width="1024.34" height="100" fill="url(#paint0_linear_2_41)"/>
            <path d="M836.647 497.384C753.424 342.331 753.551 255.324 836.647 100.252H936.647C851.11 255.339 849.556 342.296 936.647 497.384H836.647Z" fill="url(#paint1_linear_2_41)"/>
            <path d="M404.852 100.252C488.074 255.306 487.947 342.313 404.852 497.384L304.852 497.384C390.389 342.298 391.942 255.34 304.852 100.252L404.852 100.252Z" fill="url(#paint2_linear_2_41)"/>
            <path d="M1025.02 597.384C696.092 524.178 520.596 525.027 222.669 597.384V510.198C498.473 427.942 671.536 422.214 1025.02 510.198V597.384Z" fill="url(#paint3_linear_2_41)"/>
            <defs>
                <linearGradient id="paint0_linear_2_41" x1="0.682007" y1="50.2524" x2="1025.02" y2="50.2524" gradientUnits="userSpaceOnUse">
                    <stop offset="0.24" stopColor="#ED6631"/>
                    <stop offset="1" stopColor="#ED6631" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="paint1_linear_2_41" x1="886.647" y1="497.384" x2="886.647" y2="100.252" gradientUnits="userSpaceOnUse">
                    <stop offset="0.24" stopColor="#ED6631"/>
                    <stop offset="1" stopColor="#ED6631" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="paint2_linear_2_41" x1="354.852" y1="100.252" x2="354.852" y2="497.384" gradientUnits="userSpaceOnUse">
                    <stop offset="0.24" stopColor="#ED6631"/>
                    <stop offset="1" stopColor="#ED6631" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="paint3_linear_2_41" x1="1025.02" y1="553.791" x2="222.669" y2="553.791" gradientUnits="userSpaceOnUse">
                    <stop offset="0.235577" stopColor="#ED6631"/>
                    <stop offset="1" stopColor="#ED6631" stopOpacity="0"/>
                </linearGradient>
            </defs>
        </svg>

    )
}

export { ForgeLogo }