import type {ReactNode} from "react"

export interface ItemType {
    type: 'item'
    label: string
    shortcut?: string
    icon?: ReactNode
    onSelect?: () => void
}

export interface SubType {
    type: 'sub'
    label: string
    items: MenuItem[]
    icon?: ReactNode
}

export interface LabelType {
    type: 'label'
    label: string
}

export interface CheckboxType {
    type: 'checkbox'
    label: string
    checked: boolean
    onCheckedChange?: (checked: boolean) => void
}

export interface SeparatorType {
    type: 'separator'
}

export type MenuItem = ItemType | SubType | LabelType | CheckboxType | SeparatorType

