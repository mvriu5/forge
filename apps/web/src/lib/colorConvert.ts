export function convertToRGBA(color: string, opacity: number): string {
    if (color.startsWith('rgba')) {
        return color
    }

    if (color.startsWith('#')) {
        const r = Number.parseInt(color.slice(1, 3), 16)
        const g = Number.parseInt(color.slice(3, 5), 16)
        const b = Number.parseInt(color.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }

    return `${color.split(')')[0]})`.replace('rgb', 'rgba').replace(')', `, ${opacity})`)
}