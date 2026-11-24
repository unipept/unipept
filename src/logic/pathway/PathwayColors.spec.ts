import { describe, expect, it } from "vitest";
import { categoryColor, isSelectable } from "./PathwayColors";
import { groupColors } from "@/logic/pathway/PathwayGroups";

describe("PathwayColors", () => {
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
