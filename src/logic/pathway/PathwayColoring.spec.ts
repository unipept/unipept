import { describe, expect, it } from "vitest";
import { colorAreas, type ColoringItem } from "./PathwayColoring";

describe("colorAreas", () => {
    const area = (ec: string) => ({ id: ec, info: { ecNumbers: [ec] } });
    const areas = [area("1.1.1.1"), area("2.2.2.2"), { id: "empty", info: {} }];

    const item = (color: string, counts: Record<string, number>, total: number): ColoringItem => ({
        color,
        hasMatch: a => (counts[a.id] ?? 0) > 0,
        countForArea: a => counts[a.id] ?? 0,
        total,
    });

    const colors = (items: ColoringItem[], differential = false) =>
        colorAreas(areas, items, differential, () => ["#default"]).map(a => a.colors);

    it("uses the default coloring for selectable areas when there are no items", () => {
        const result = colors([]);

        expect(result).toEqual([["#default"], ["#default"], []]);
    });

    it("gives each area the colors of the items that match it", () => {
        const result = colors([
            item("#aa0000", { "1.1.1.1": 1 }, 1),
            item("#0000aa", { "1.1.1.1": 1, "2.2.2.2": 1 }, 2),
        ]);

        expect(result).toEqual([["#aa0000", "#0000aa"], ["#0000aa"], []]);
    });

    it("colors the difference between two items on a diverging scale", () => {
        const result = colors([
            item("rgb(255, 0, 0)", { "1.1.1.1": 4 }, 4),
            item("rgb(0, 0, 255)", { "2.2.2.2": 4 }, 4),
        ], true);

        expect(result).toEqual([["rgb(255, 0, 0)"], ["rgb(0, 0, 255)"], []]);
    });

    it("uses the item colors in the differential view when there are not exactly two items", () => {
        const result = colors([item("#aa0000", { "1.1.1.1": 1 }, 1)], true);

        expect(result).toEqual([["#aa0000"], [], []]);
    });

    it("gives no colors in the differential view when an item has no matches", () => {
        const result = colors([
            item("#aa0000", { "1.1.1.1": 1 }, 1),
            item("#0000aa", {}, 0),
        ], true);

        expect(result).toEqual([[], [], []]);
    });
});
