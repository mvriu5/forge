import {File} from "lucide-react"

const GoogleSheets = () => {
    return (
        <svg
            role="img"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill={"#34A853"}
        >
            <title>Google Sheets</title>
            <path d="M11.318 12.545H7.91v-1.909h3.41v1.91zM14.728 0v6h6l-6-6zm1.363 10.636h-3.41v1.91h3.41v-1.91zm0 3.273h-3.41v1.91h3.41v-1.91zM20.727 6.5v15.864c0 .904-.732 1.636-1.636 1.636H4.909a1.636 1.636 0 0 1-1.636-1.636V1.636C3.273.732 4.005 0 4.909 0h9.318v6.5h6.5zm-3.273 2.773H6.545v7.909h10.91v-7.91zm-6.136 4.636H7.91v1.91h3.41v-1.91z"/>
        </svg>
    )
}

const GoogleSlides = () => {
    return (
        <svg
            role="img"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill={"#FBBC04"}
        >
            <title>Google Slides</title>
            <path d="M16.09 15.273H7.91v-4.637h8.18v4.637zm1.728-8.523h2.91v15.614c0 .904-.733 1.636-1.637 1.636H4.909a1.636 1.636 0 0 1-1.636-1.636V1.636C3.273.732 4.005 0 4.909 0h9.068v6.75h3.841zm-.363 2.523H6.545v7.363h10.91V9.273zm-2.728-5.979V6h6.001l-6-6v3.294z"/>
        </svg>
    )
}

const GoogleDocs = () => {
    return (
        <svg
            role="img"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill={"#4285F4"}
        >
            <title>Google Docs</title>
            <path d="M14.727 6.727H14V0H4.91c-.905 0-1.637.732-1.637 1.636v20.728c0 .904.732 1.636 1.636 1.636h14.182c.904 0 1.636-.732 1.636-1.636V6.727h-6zm-.545 10.455H7.09v-1.364h7.09v1.364zm2.727-3.273H7.091v-1.364h9.818v1.364zm0-3.273H7.091V9.273h9.818v1.363zM14.727 6h6l-6-6v6z"/>
        </svg>
    )
}

const Loom = () => {
    return (
        <svg
            role="img"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill={"#625DF5"}
        >
            <title>Loom</title>
            <path d="M24 10.665h-7.018l6.078-3.509-1.335-2.312-6.078 3.509 3.508-6.077L16.843.94l-3.508 6.077V0h-2.67v7.018L7.156.94 4.844 2.275l3.509 6.077-6.078-3.508L.94 7.156l6.078 3.509H0v2.67h7.017L.94 16.844l1.335 2.313 6.077-3.508-3.509 6.077 2.312 1.335 3.509-6.078V24h2.67v-7.017l3.508 6.077 2.312-1.335-3.509-6.078 6.078 3.509 1.335-2.313-6.077-3.508h7.017v-2.67H24zm-12 4.966a3.645 3.645 0 1 1 0-7.29 3.645 3.645 0 0 1 0 7.29z"/>
        </svg>
    )
}

const Youtube = () => {
    return (
        <svg
            role="img"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill={"#FF0000"}
            fillOpacity={0.8}
        >
            <title>YouTube</title>
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
    )
}

const getLogoFromLink = (link: string) => {
    switch (true) {
        case link.includes("docs.google.com/spreadsheets"): return <GoogleSheets />
        case link.includes("docs.google.com/documents"): return <GoogleDocs />
        case link.includes("docs.google.com/presentation"): return <GoogleSlides />
        case link.includes("loom.com"): return <Loom />
        case link.includes("youtube.com"): return <Youtube/>
        default: return <File size={16}/>
    }
};

export {
    getLogoFromLink,
    GoogleSheets,
    GoogleSlides,
    GoogleDocs,
    Loom,
    Youtube,
}