import {router} from "../trpc"
import {userRouter} from "./user/user"
import {widgetRouter} from "./widget/widget"
import {dashboardRouter} from "./dashboard/dashboard"
import {settingsRouter} from "./settings/settings"

export const trpcRouter = router({
    user: userRouter,
    widget: widgetRouter,
    dashboard: dashboardRouter,
    settings: settingsRouter
})

export type AppRouter = typeof trpcRouter
