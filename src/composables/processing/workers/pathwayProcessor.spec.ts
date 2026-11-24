import { describe, expect, it } from "vitest";
import { aggregatePathways } from "./pathwayProcessor";
import { countsTransferable } from "../../../../tests/unit/peptideData";
import type { EcInfo, PathwayInfo } from "@/logic/communicators/PathwayPilotCommunicator";

const ec = (...pathwayIds: string[]): EcInfo => ({ names: [], pathways: pathwayIds.map(id => ({ id, name: id })) });
const pathway = (...compoundIds: string[]): PathwayInfo => ({ name: "", category: "", subCategory: "", compoundIds });

const result = () => aggregatePathways({
    peptideCountsTransferable: countsTransferable({ AAAAA: 3, CCCCC: 2, DDDDD: 4 }),
    ecToPeptides: new Map([
        ["EC:1.1.1.1", ["AAAAA", "CCCCC"]],
        ["EC:2.7.11.1", ["DDDDD"]],
        ["EC:9.9.9.9", ["AAAAA"]],
    ]),
    ecMapping: new Map([
        ["1.1.1.1", ec("map00010", "map00071")],
        ["2.7.11.1", ec("map00010")],
    ]),
    pathwayMapping: new Map([
        ["map00010", pathway("C00031", "C00022")],
        ["map00071", pathway("C00022")],
    ]),
});

describe("aggregatePathways", () => {
    it("removes the EC: prefix and sums the peptide counts per EC number", () => {
        const { ecs, ecToPeptideCount } = result();

        expect(ecs).toEqual(new Set(["1.1.1.1", "2.7.11.1", "9.9.9.9"]));
        expect(ecToPeptideCount).toEqual(new Map([["1.1.1.1", 5], ["2.7.11.1", 4], ["9.9.9.9", 3]]));
    });

    it("maps EC numbers to pathways and sums their counts per pathway, skipping unknown EC numbers", () => {
        const { pathways, ecToPathways, pathwayToPeptideCounts } = result();

        expect(pathways).toEqual(new Set(["map00010", "map00071"]));
        expect(ecToPathways).toEqual(new Map([["1.1.1.1", new Set(["map00010", "map00071"])], ["2.7.11.1", new Set(["map00010"])]]));
        expect(pathwayToPeptideCounts).toEqual(new Map([["map00010", 9], ["map00071", 5]]));
    });

    it("maps the compounds of the found pathways to those pathways", () => {
        const { compounds, compoundToPathways } = result();

        expect(compounds).toEqual(new Set(["C00031", "C00022"]));
        expect(compoundToPathways).toEqual(new Map([["C00031", new Set(["map00010"])], ["C00022", new Set(["map00010", "map00071"])]]));
    });
});
