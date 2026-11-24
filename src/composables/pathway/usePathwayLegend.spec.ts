import { describe, expect, it } from "vitest";
import { ref, nextTick } from "vue";
import { usePathwayLegend } from "./usePathwayLegend";

describe("usePathwayLegend", () => {
    it("gives each item a color and allows the differential view only for two items", async () => {
        const items = ref([{ label: "A" }, { label: "B" }]);
        const legend = usePathwayLegend({ items });

        expect(legend.legendItems.value.map(i => i.label)).toEqual(["A", "B"]);
        expect(legend.canShowDifferential.value).toBe(true);
        expect(legend.differentialLabels.value).toEqual(["A", "B"]);

        legend.showDifferential.value = true;
        items.value = [{ label: "A" }, { label: "B" }, { label: "C" }];
        await nextTick();

        expect(legend.canShowDifferential.value).toBe(false);
        expect(legend.differentialLabels.value).toBeUndefined();
        expect(legend.showDifferential.value).toBe(false);
    });

    it("repeats the colors after the last one", () => {
        const items = Array.from({ length: 11 }, (_, i) => ({ label: `S${i}` }));
        const legend = usePathwayLegend({ items });

        expect(legend.legendItems.value[10].color).toBe(legend.legendItems.value[0].color);
    });

    it("uses canDifferential when it is given", () => {
        const legend = usePathwayLegend({ items: [{ label: "A" }], canDifferential: true });

        expect(legend.canShowDifferential.value).toBe(true);
    });
});
