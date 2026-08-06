import {describe, it, expect, vi, beforeEach} from "vitest";
import {ShareableMap} from "shared-memory-datastructures";
import CountTable from "@/logic/processors/CountTable";
import FunctionalPeptonizerProcessor from "./FunctionalPeptonizerProcessor";

const peptonizeMock = vi.fn();
const cancelMock = vi.fn();

// Hoisted by vitest above the imports above, so FunctionalPeptonizerProcessor (and the PeptonizerProcessor
// constants it reuses) picks up this mocked "peptonizer" module.
vi.mock("peptonizer", () => ({
    // Must be a regular function (not an arrow function) so it can be invoked with `new`.
    Peptonizer: vi.fn().mockImplementation(function () {
        return {
            peptonize: peptonizeMock,
            cancel: cancelMock
        };
    })
}));

const buildCountTable = (peptideCounts: Record<string, number>): CountTable<string> => {
    const map = new ShareableMap<string, number>();
    for (const [peptide, count] of Object.entries(peptideCounts)) {
        map.set(peptide, count);
    }
    return new CountTable(map);
};

describe("FunctionalPeptonizerProcessor", () => {
    beforeEach(() => {
        peptonizeMock.mockReset();
        cancelMock.mockReset();
    });

    it("encodes terms to numeric ids before calling peptonize and decodes the result back to term strings", async () => {
        peptonizeMock.mockImplementation(async (peptidesCategories: Map<string, number[]>) => {
            const ids = new Set<number>();
            for (const categoryIds of peptidesCategories.values()) {
                categoryIds.forEach((id) => ids.add(id));
            }

            const result = new Map<string, number>();
            for (const id of ids) {
                result.set(id.toString(), id / 10);
            }
            return result;
        });

        const countTable = buildCountTable({ PEPTIDEA: 1, PEPTIDEB: 1 });
        const peptideTerms = new Map<string, string[]>([
            ["PEPTIDEA", ["EC:1.1.1.1", "EC:2.2.2.2"]],
            ["PEPTIDEB", ["EC:2.2.2.2"]],
        ]);

        const processor = new FunctionalPeptonizerProcessor();
        const result = await processor.run(peptideTerms, countTable, true);

        expect(result).toBeDefined();
        expect(result!.size).toBe(2);
        expect(result!.has("EC:1.1.1.1")).toBe(true);
        expect(result!.has("EC:2.2.2.2")).toBe(true);

        const [passedPeptidesCategories, , , , , , itemsInGraph] = peptonizeMock.mock.calls[0];
        for (const ids of passedPeptidesCategories.values()) {
            for (const id of ids) {
                expect(typeof id).toBe("number");
            }
        }
        expect(itemsInGraph).toBe(2);
    });

    it("works the same way for terms from a different functional category (e.g. GO terms)", async () => {
        peptonizeMock.mockImplementation(async (peptidesCategories: Map<string, number[]>) => {
            const ids = new Set<number>();
            for (const categoryIds of peptidesCategories.values()) {
                categoryIds.forEach((id) => ids.add(id));
            }
            const result = new Map<string, number>();
            for (const id of ids) {
                result.set(id.toString(), 0.5);
            }
            return result;
        });

        const countTable = buildCountTable({ PEPTIDEA: 1 });
        const processor = new FunctionalPeptonizerProcessor();
        const result = await processor.run(new Map([["PEPTIDEA", ["GO:0008150"]]]), countTable, true);

        expect(result).toEqual(new Map([["GO:0008150", 0.5]]));
    });

    it("defaults peptide intensities to 0.7 when none are provided", async () => {
        peptonizeMock.mockResolvedValue(new Map());

        const countTable = buildCountTable({ PEPTIDEA: 1 });
        const processor = new FunctionalPeptonizerProcessor();
        await processor.run(new Map([["PEPTIDEA", ["EC:1.1.1.1"]]]), countTable, true);

        const [, peptidesScores] = peptonizeMock.mock.calls[0];
        expect(peptidesScores.get("PEPTIDEA")).toBe(0.7);
    });

    it("uses the provided peptide intensities when given", async () => {
        peptonizeMock.mockResolvedValue(new Map());

        const countTable = buildCountTable({ PEPTIDEA: 1 });
        const processor = new FunctionalPeptonizerProcessor();
        await processor.run(
            new Map([["PEPTIDEA", ["EC:1.1.1.1"]]]),
            countTable,
            true,
            new Map([["PEPTIDEA", 0.42]])
        );

        const [, peptidesScores] = peptonizeMock.mock.calls[0];
        expect(peptidesScores.get("PEPTIDEA")).toBe(0.42);
    });

    it("returns undefined when peptonize resolves to undefined (cancelled)", async () => {
        peptonizeMock.mockResolvedValue(undefined);

        const countTable = buildCountTable({ PEPTIDEA: 1 });
        const processor = new FunctionalPeptonizerProcessor();
        const result = await processor.run(new Map([["PEPTIDEA", ["EC:1.1.1.1"]]]), countTable, true);

        expect(result).toBeUndefined();
    });

    it("delegates cancelPeptonizer to the underlying Peptonizer instance", () => {
        const processor = new FunctionalPeptonizerProcessor();
        processor.cancelPeptonizer();
        expect(cancelMock).toHaveBeenCalled();
    });
});
