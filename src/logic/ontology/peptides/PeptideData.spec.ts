import {describe, it, expect} from "vitest";
import PeptideData from "./PeptideData";
import PeptideDataResponse from "./PeptideDataResponse";

describe("PeptideData", () => {
    it("should create a PeptideData instance from response", () => {
        const response: PeptideDataResponse = {
            lca: 1,
            lineage: [1, 2, 3, -1, null, -1, -1, null, null, -1, null, -1, -1, null, -1, null, null, -1, null, -1, -1, null, -1, -1, -1, -1, -1],
            fa: {
                counts: {
                    all: 10,
                    EC: 5,
                    GO: 3,
                    IPR: 2
                },
                data: {"EC:1.2.3.5": 2, "GO:0000001": 35, "IPR:IPR000121": 18}
            },
            taxa: [17, 45, 23]
        };

        const peptideData = PeptideData.createFromPeptideDataResponse(response);
        expect(peptideData).toBeInstanceOf(PeptideData);
        expect(peptideData.lca).toBe(1);
        expect(peptideData.lineage).toEqual([1, 2, 3, -1, null, -1, -1, null, null, -1, null, -1, -1, null, -1, null, null, -1, null, -1, -1, null, -1, -1, -1, -1, -1]);
        expect(peptideData.faCounts.all).toBe(10);
        expect(peptideData.faCounts.ec).toBe(5);
        expect(peptideData.faCounts.go).toBe(3);
        expect(peptideData.faCounts.ipr).toBe(2);
        expect(peptideData.ec["EC:1.2.3.5"]).toBe(2);
        expect(peptideData.go["GO:0000001"]).toBe(35);
        expect(peptideData.ipr["IPR:IPR000121"]).toBe(18);
        expect(peptideData.taxa[0]).toBe(17);
        expect(peptideData.taxa[1]).toBe(45);
    });

    it("should correctly serialize and deserialize data", () => {
        const response: PeptideDataResponse = {
            lca: 1,
            lineage: [1, 2, 3],
            fa: {
                counts: {
                    all: 10,
                    EC: 5,
                    GO: 3,
                    IPR: 2
                },
                data: {"EC:1.2.3.5": 2, "GO:0000001": 35, "IPR:IPR000121": 18}
            },
            taxa: [59, 47, 78]
        };

        const peptideData = PeptideData.createFromPeptideDataResponse(response);
        const deserializedData = new PeptideData(peptideData.dataView);

        expect(deserializedData.lca).toBe(peptideData.lca);
        expect(deserializedData.lineage).toEqual(peptideData.lineage);
        expect(deserializedData.faCounts).toEqual(peptideData.faCounts);
    });
});