import { computed } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import { colorAreas, type ColoringItem } from '@/logic/pathway/PathwayColoring';

export function usePathwayColoring(options: {
    rawAreas: Ref<any[]>;
    showDifferential: Ref<boolean>;
    canShowDifferential: ComputedRef<boolean>;
    items: ComputedRef<ColoringItem[]>;
    defaultColoring: (area: any) => string[];
}): { coloredAreas: ComputedRef<any[]> } {
    const coloredAreas = computed(() => {
        const { rawAreas, showDifferential, canShowDifferential, items, defaultColoring } = options;
        return colorAreas(rawAreas.value, items.value, showDifferential.value && canShowDifferential.value, defaultColoring);
    });

    return { coloredAreas };
}
