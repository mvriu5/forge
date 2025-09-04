export type Widget = {
    id: string
    userId: string
    dashboardId: string
    widgetType: string
    height: number
    width: number
    config: Record<string, any>
    positionX: number
    positionY: number
    createdAt: Date
    updatedAt: Date
}