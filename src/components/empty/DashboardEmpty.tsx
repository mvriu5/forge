import {EmptyAddSVG} from "@/components/svg/EmptyAddSVG"
import {WidgetDialog} from "@/components/dialogs/WidgetDialog"
import React from "react"

export function DashboardEmpty() {
    return (
        <div className={"w-full h-screen flex items-center justify-center"}>
            <div className={"flex flex-col gap-4 items-center justify-center p-4 md:p-12 border border-main border-dashed rounded-md shadow-md dark:shadow-xl"}>
                <EmptyAddSVG/>
                <p className={"w-56 md:w-80 text-center text-sm"}>
                    You dont have any widgets in your dashboard. Add a new widget, by visiting the widget store.
                </p>
                <WidgetDialog
                    editMode={false}
                    isOnboarding={false}
                    title={"Widget-Store"}
                />
            </div>
        </div>
    )
}
