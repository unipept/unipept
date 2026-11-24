import * as d3 from 'd3';
import { isSelectable } from '@/logic/pathway/PathwayColors';

export interface ColoringItem {
    color: string;
    hasMatch: (area: any) => boolean;
    countForArea: (area: any) => number;
    total: number;
}

function applyDefaultColoring(areas: any[], defaultColoring: (area: any) => string[]): any[] {
    return areas.map(area => ({
        ...area,
        colors: isSelectable(area) ? defaultColoring(area) : [],
    }));
}

function applyDifferentialColoring(areas: any[], item1: ColoringItem, item2: ColoringItem): any[] {
    const p1 = item1.total;
    const p2 = item2.total;

    if (p1 === 0 || p2 === 0) {
        return areas.map(area => ({ ...area, colors: [] }));
    }

    let min = 0, max = 0;
    const withValues = areas.map(area => {
        if (!isSelectable(area)) return { area, value: null as number | null };
        const x = item1.countForArea(area);
        const y = item2.countForArea(area);
        if (x > 0 || y > 0) {
            const diff = y / p2 - x / p1;
            min = Math.min(min, diff);
            max = Math.max(max, diff);
            return { area, value: diff };
        }
        return { area, value: null as number | null };
    });

    // Guard: d3.scaleDiverging([0, 0, 0], ...) is degenerate — return empty colors
    if (min === 0 && max === 0) {
        return areas.map(area => ({ ...area, colors: [] }));
    }

    const colorScale = d3.scaleDiverging(
        [min, 0, max],
        d3.interpolateRgbBasis([item1.color, '#ffffe0', item2.color])
    );

    return withValues.map(({ area, value }) => ({
        ...area,
        colors: value !== null ? [colorScale(value)] : [],
    }));
}

function applyMultiItemColoring(areas: any[], items: ColoringItem[]): any[] {
    return areas.map(area => {
        if (!isSelectable(area)) return { ...area, colors: [] };
        const colors: string[] = [];
        for (const item of items) {
            if (item.hasMatch(area)) colors.push(item.color);
        }
        return { ...area, colors };
    });
}

// Colors the areas of a pathway map. Without items each selectable area gets the default coloring. With exactly two
// items and the differential view, the areas show the difference between the items. Otherwise each area gets the
// colors of the items that match it.
export function colorAreas(
    areas: any[],
    items: ColoringItem[],
    differential: boolean,
    defaultColoring: (area: any) => string[]
): any[] {
    if (items.length === 0) {
        return applyDefaultColoring(areas, defaultColoring);
    }

    if (differential && items.length === 2) {
        return applyDifferentialColoring(areas, items[0], items[1]);
    }

    return applyMultiItemColoring(areas, items);
}
