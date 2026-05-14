import DashboardPage from "@/components/pages/DashboardPage"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Dashboard",
}

export default function Page() {
    return <DashboardPage />
}
