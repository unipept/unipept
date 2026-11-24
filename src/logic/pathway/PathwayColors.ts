import { pathwayGroups, groupColors } from '@/logic/PathwayGroups';

export const PATHWAY_COLORS = [
    '#5878a3', '#e59344', '#d1605e', '#85b6b2',
    '#6b9f59', '#e7cb60', '#a77c9f', '#f2a2a9',
    '#967762', "#b9b1ac"
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
