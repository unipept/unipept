import { describe, expect, it } from "vitest";
import { ref, computed, nextTick } from "vue";
import { usePathwayColoring } from "./usePathwayColoring";
import type { ColoringItem } from "@/logic/pathway/PathwayColoring";

describe("usePathwayColoring", () => {
    it("shows the differential coloring only when it is turned on and possible", async () => {
        const area = { id: "1.1.1.1", info: { ecNumbers: ["1.1.1.1"] } };
        const item = (color: string, count: number): ColoringItem =>
            ({ color, hasMatch: () => count > 0, countForArea: () => count, total: count });
        const showDifferential = ref(false);
        const items = ref([item("rgb(255, 0, 0)", 1), item("rgb(0, 0, 255)", 0)]);

        const { coloredAreas } = usePathwayColoring({
            rawAreas: ref([area]),
            showDifferential,
            canShowDifferential: computed(() => items.value.length === 2),
            items: computed(() => items.value),
            defaultColoring: () => ["#default"],
        });

        expect(coloredAreas.value[0].colors).toEqual(["rgb(255, 0, 0)"]);

        showDifferential.value = true;
        await nextTick();
        // The second item has no peptides, so the differential view has no colors
        expect(coloredAreas.value[0].colors).toEqual([]);
    });
});
