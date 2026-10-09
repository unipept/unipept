import {describe, expect, it} from "vitest";
import {
    DEFAULT_PEPTIDE_INTENSITIES,
    mergePeptideAnnotations,
    mergePeptideCounts,
    mergePeptideIntensities
} from "@/logic/processors/peptonizer/PeptonizerInput";

describe("PeptonizerInput", () => {
    it("should sum the counts of peptides that only differ in I and L if equateIl is true", () => {
        const counts: [string, number][] = [["AIAIK", 2], ["ALALK", 3], ["AILLK", 1], ["GGGGK", 4]];

        expect(mergePeptideCounts(counts, true)).toEqual(new Map([["ALALK", 5], ["ALLLK", 1], ["GGGGK", 4]]));
        expect(mergePeptideCounts(counts, false)).toEqual(new Map(counts));
    });

    it("should keep the first intensity and add the default intensity for peptides without one", () => {
        const intensities: [string, number][] = [["AIAIK", 0.2], ["ALALK", 0.9]];

        expect(mergePeptideIntensities(intensities, ["ALALK", "GGGGK"], true)).toEqual(new Map([
            ["ALALK", 0.2],
            ["GGGGK", DEFAULT_PEPTIDE_INTENSITIES]
        ]));
        expect(mergePeptideIntensities(undefined, ["ALALK"], true)).toEqual(new Map([
            ["ALALK", DEFAULT_PEPTIDE_INTENSITIES]
        ]));
    });

    it("should combine the annotations of merged peptides without duplicates", () => {
        const annotations: [string, number[]][] = [["AIAIK", [1, 2]], ["ALALK", [2, 3]], ["GGGGK", [4]]];

        expect(mergePeptideAnnotations(annotations, true)).toEqual(new Map([["ALALK", [1, 2, 3]], ["GGGGK", [4]]]));
        expect(mergePeptideAnnotations(annotations, false)).toEqual(new Map(annotations));
    });
});
