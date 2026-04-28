import { ref, computed, watch, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { PATHWAY_COLORS } from '@/composables/pathway/usePathwayColors';

export function usePathwayLegend(options: {
    items: MaybeRefOrGetter<{ label: string }[]>;
    canDifferential?: MaybeRefOrGetter<boolean>;
}) {
    const showDifferential = ref(false);

    const legendItems = computed(() =>
        toValue(options.items).map((item, i) => ({
            label: item.label,
            color: PATHWAY_COLORS[i % PATHWAY_COLORS.length],
        }))
    );

    const canShowDifferential = computed(() =>
        options.canDifferential !== undefined
            ? toValue(options.canDifferential)
            : legendItems.value.length === 2
    );

    const differentialLabels = computed<[string, string] | undefined>(() =>
        canShowDifferential.value
            ? [legendItems.value[0].label, legendItems.value[1].label]
            : undefined
    );

    const differentialColors = computed<[string, string] | undefined>(() =>
        canShowDifferential.value
            ? [legendItems.value[0].color, legendItems.value[1].color]
            : undefined
    );

    watch(canShowDifferential, (can) => {
        if (!can) showDifferential.value = false;
    });

    return { legendItems, showDifferential, canShowDifferential, differentialLabels, differentialColors };
}
