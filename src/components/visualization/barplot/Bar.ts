export interface BarItem {
    label: string,
    counts: number
}

export interface Bar {
    items: BarItem[],
    label: string
}
