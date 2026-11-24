export interface TreeviewItem {
    id: number
    name: string
    children: TreeviewItem[]

    nameExtra?: string
    highlighted?: boolean
    match?: { start: number, end: number }
    nameExtraMatch?: { start: number, end: number }
    selectable?: boolean
}
