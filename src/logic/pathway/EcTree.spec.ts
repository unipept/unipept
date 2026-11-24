import { describe, expect, it } from "vitest";
import { buildEcTree, ecChipColor, EC_CLASS_CHIP_COLORS, numberEcIds, numericKeySort } from "./EcTree";
import type { TreeviewItem } from "@/types/TreeviewItem";

const names = (item: TreeviewItem): unknown => item.children.length > 0 ? [item.name, ...item.children.map(names)] : item.name;

describe("numberEcIds", () => {
    it("numbers the EC numbers from 100 in sorted order", () => {
        expect(numberEcIds(["2.7.1.1", "1.1.1.1"])).toEqual(new Map([["1.1.1.1", 100], ["2.7.1.1", 101]]));
    });
});

describe("buildEcTree", () => {
    const ecIds = ["2.7.1.1", "1.1.1.1", "1.1.1.2", "1.2.1.12"];
    const ecNames = new Map([["1.1.1.1", "alcohol dehydrogenase"]]);
    const tree = () => buildEcTree(ecIds, numberEcIds(ecIds), ec => ecNames.get(ec));

    it("groups the EC numbers per class, subclass and sub-subclass, and leaves out empty classes", () => {
        expect(tree().map(names)).toEqual([
            ["EC 1", ["1.1.-.-", ["1.1.1.-", "1.1.1.1", "1.1.1.2"]], ["1.2.-.-", ["1.2.1.-", "1.2.1.12"]]],
            ["EC 2", ["2.7.-.-", ["2.7.1.-", "2.7.1.1"]]],
        ]);
    });

    it("names the classes, gives the leaves their numeric id, and uses Unknown for an EC number without a name", () => {
        const [ec1] = tree();
        const [leaf1, leaf2] = ec1.children[0].children[0].children;

        expect(ec1).toMatchObject({ id: 1, nameExtra: "Oxidoreductases" });
        expect(leaf1).toMatchObject({ id: 100, name: "1.1.1.1", nameExtra: "alcohol dehydrogenase" });
        expect(leaf2).toMatchObject({ id: 101, nameExtra: "Unknown" });
    });

    it("sorts subclasses as numbers", () => {
        const ids = ["1.10.1.1", "1.2.1.1"];

        expect(buildEcTree(ids, numberEcIds(ids), () => undefined)[0].children.map(item => item.name)).toEqual(["1.2.-.-", "1.10.-.-"]);
    });
});

describe("ecChipColor", () => {
    it("returns the color of the EC class, or grey for an unknown class", () => {
        expect(ecChipColor("2.7.1.1")).toBe(EC_CLASS_CHIP_COLORS[1]);
        expect(ecChipColor("9.1.1.1")).toBe("#888888");
    });
});

describe("numericKeySort", () => {
    it("sorts keys as numbers and puts - last", () => {
        const entries: [string, unknown][] = [["10", 0], ["-", 0], ["2", 0]];

        expect(entries.sort(numericKeySort).map(([key]) => key)).toEqual(["2", "10", "-"]);
    });
});
