import { Skeleton } from "@/components/ui/Skeleton"

export const WidgetLoading = () => (
    <div className="flex h-full w-full flex-col gap-2 p-2" role="status" aria-label="Loading widget">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-full w-full" />
    </div>
)
