import { computed, Ref } from 'vue';
import usePathwayPilotMappingStore from '@/store/PathwayPilotMappingStore';

const px = 30, py = 20, lineHeight = 22, lineDistance = 10, charWidth = 15.8, tooltipOffset = 25;

const EMPTY_TOOLTIP = { text: [] as string[], boundingX: 0, boundingY: 0, boundingWidth: 0, boundingHeight: 0, textX: 0, textY: 0, textOffset: 0 };

const buildTooltip = (text: string[], anchorX: number, anchorY: number) => {
    if (text.length === 0) return EMPTY_TOOLTIP;
    const maxChars = text.reduce((a, b) => Math.max(a, b.length), 0);
    const boundingWidth = 2 * px + charWidth * maxChars;
    const boundingHeight = 2 * py + lineHeight * text.length + lineDistance * (text.length - 1);
    const boundingX = anchorX - boundingWidth / 2;
    const boundingY = anchorY - boundingHeight - tooltipOffset;
    return {
        text,
        boundingX, boundingY, boundingWidth, boundingHeight,
        textX: boundingX + px,
        textY: boundingY + py,
        textOffset: lineHeight + lineDistance,
    };
};

export const useCalculateAreaTooltip = (
    selectableRects: Ref<any[]>,
    selectableCircles: Ref<any[]>,
) => {
    const mappingStore = usePathwayPilotMappingStore();

    const rectTooltips = computed(() =>
        selectableRects.value.map(area => {
            const ecNumbers = area.info?.ecNumbers ?? [];
            const text: string[] = ecNumbers.map((ec: any) =>
                `${ec.id}: ${mappingStore.ecMapping?.get(ec.id)?.names?.[0] ?? 'Unknown'}`
            );
            const anchorX = area.x1 + (area.x2 - area.x1) / 2;
            const anchorY = area.y1;
            return buildTooltip(text, anchorX, anchorY);
        })
    );

    const circleTooltips = computed(() =>
        selectableCircles.value.map(area => {
            const compoundId = area.info?.compounds?.[0]?.id ?? area.id;
            if (!compoundId) return EMPTY_TOOLTIP;
            const name = mappingStore.compoundMapping?.get(compoundId)?.names?.[0] ?? 'Unknown';
            const anchorX = area.x + 1;
            const anchorY = area.y + 1 - (area.r ?? 10);
            return buildTooltip([`${compoundId}: ${name}`], anchorX, anchorY);
        })
    );

    return { rectTooltips, circleTooltips };
};
