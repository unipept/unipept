import { describe, expect, it } from "vitest";
import { ref, computed, nextTick } from "vue";
import { categoryColor, isSelectable } from "./usePathwayColors";
import { usePathwayLegend } from "./usePathwayLegend";
import { usePathwayColoring, type ColoringItem } from "./usePathwayColoring";
import { groupColors } from "@/logic/PathwayGroups";

describe("usePathwayColors", () => {
    it("categoryColor returns the color of the group, or grey for an unknown group", () => {
        expect(categoryColor("Carbohydrate metabolism")).toBe(groupColors[1].toString());
        expect(categoryColor("Unknown")).toBe("#888888");
    });

    it("isSelectable is true only for areas with EC, KO, compound or reaction information", () => {
        expect(isSelectable({ info: { ecNumbers: ["1.1.1.1"] } })).toBe(true);
        expect(isSelectable({ info: { reactions: ["R00001"] } })).toBe(true);
        expect(isSelectable({ info: { ecNumbers: [] } })).toBe(false);
        expect(isSelectable({})).toBe(false);
        expect(isSelectable(undefined)).toBe(false);
    });
});

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

describe("usePathwayColoring", () => {
    const area = (ec: string) => ({ id: ec, info: { ecNumbers: [ec] } });
    const areas = [area("1.1.1.1"), area("2.2.2.2"), { id: "empty", info: {} }];

    const item = (color: string, counts: Record<string, number>, total: number): ColoringItem => ({
        color,
        hasMatch: a => (counts[a.id] ?? 0) > 0,
        countForArea: a => counts[a.id] ?? 0,
        total,
    });

    const setup = (items: ColoringItem[], differential = false) => usePathwayColoring({
        rawAreas: ref(areas),
        showDifferential: ref(differential),
        canShowDifferential: computed(() => items.length === 2),
        items: computed(() => items),
        defaultColoring: () => ["#default"],
    });

    it("uses the default coloring for selectable areas when there are no items", () => {
        const colors = setup([]).coloredAreas.value.map(a => a.colors);

        expect(colors).toEqual([["#default"], ["#default"], []]);
    });

    it("gives each area the colors of the items that match it", () => {
        const colors = setup([
            item("#aa0000", { "1.1.1.1": 1 }, 1),
            item("#0000aa", { "1.1.1.1": 1, "2.2.2.2": 1 }, 2),
        ]).coloredAreas.value.map(a => a.colors);

        expect(colors).toEqual([["#aa0000", "#0000aa"], ["#0000aa"], []]);
    });

    it("colors the difference between two items on a diverging scale", () => {
        const colors = setup([
            item("rgb(255, 0, 0)", { "1.1.1.1": 4 }, 4),
            item("rgb(0, 0, 255)", { "2.2.2.2": 4 }, 4),
        ], true).coloredAreas.value.map(a => a.colors);

        expect(colors).toEqual([["rgb(255, 0, 0)"], ["rgb(0, 0, 255)"], []]);
    });

    it("gives no colors in the differential view when an item has no matches", () => {
        const colors = setup([
            item("#aa0000", { "1.1.1.1": 1 }, 1),
            item("#0000aa", {}, 0),
        ], true).coloredAreas.value.map(a => a.colors);

        expect(colors).toEqual([[], [], []]);
    });
});
