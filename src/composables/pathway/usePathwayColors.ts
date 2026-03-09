import { pathwayGroups, groupColors } from '@/logic/PathwayGroups';

export const PATHWAY_COLORS = [
    '#4c8cbf', '#e74c3c', '#2ecc71', '#f39c12',
    '#9b59b6', '#1abc9c', '#e67e22', '#3498db'
];

export function categoryColor(subCategory: string): string {
    const idx = pathwayGroups.indexOf(subCategory);
    return idx >= 0 ? groupColors[idx].toString() : '#888888';
}

export function isSelectable(area: any): boolean {
    if (!area?.info) return false;
    return (area.info.ecNumbers?.length ?? 0)
         + (area.info.koNumbers?.length ?? 0)
         + (area.info.compounds?.length ?? 0)
         + (area.info.reactions?.length ?? 0) > 0;
}
