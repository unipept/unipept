import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import usePeptideAnalysisStore from "./PeptideAnalysisStore";
import { AnalysisStatus } from "./AnalysisStatus";
import type { AnalysisConfig } from "./AnalysisConfig";
import { peptideData } from "../../tests/unit/peptideData";
import { calls, failing, pept2filteredData, proteinsToReturn, resetFakes } from "../../tests/unit/analysisFakes";

vi.mock("@/composables/communication/unipept/usePept2filtered", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakePept2filtered }));
vi.mock("@/composables/processing/protein/useProteinProcessor", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakeProteinProcessor }));
vi.mock("@/composables/processing/functional/useEcProcessor", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakeEcProcessor }));
vi.mock("@/composables/processing/functional/useGoProcessor", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakeGoProcessor }));
vi.mock("@/composables/processing/functional/useInterproProcessor", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakeInterproProcessor }));
vi.mock("@/composables/processing/taxonomic/useNcbiTreeProcessor", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakeNcbiTreeProcessor }));
vi.mock("@/store/OntologyStore", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakeOntologyStore }));

const config: AnalysisConfig = { equate: true, filter: false, useCrap: false, database: "UniProtKB" };

let storeCount = 0;
const createStore = () => usePeptideAnalysisStore(`peptide-${storeCount++}`, "MDGTEYIIVK", config);

describe("PeptideAnalysisStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        resetFakes();
    });

    it("uses the root as LCA and an empty lineage before the analysis", () => {
        const store = createStore();

        expect(store.lca).toBe(1);
        expect(store.commonLineage).toEqual([]);
        expect(store.status).toBe(AnalysisStatus.Pending);
    });

    it("analyse runs every step in order and ends as Finished", async () => {
        const store = createStore();

        await store.analyse();

        expect(calls.map(call => call.split(" ")[0])).toEqual([
            "proteins", "pept2filtered", "ec", "go", "ipr",
            "ecOntology", "goOntology", "iprOntology", "ncbiOntology", "ncbiTree",
        ]);
        expect(calls[0]).toBe(`proteins ${JSON.stringify(["MDGTEYIIVK", true])}`);
        expect(store.status).toBe(AnalysisStatus.Finished);
    });

    it("loads the LCA, the lineage and the taxa of all proteins, and counts the proteins per taxon", async () => {
        pept2filteredData.set("MDGTEYIIVK", peptideData({ lca: 816, lineage: [2, null, 976, 816] }));
        proteinsToReturn.push({ id: "P1", taxonId: 817 }, { id: "P2", taxonId: 817 }, { id: "P3", taxonId: 818 });
        const store = createStore();

        await store.analyse();

        expect(store.lca).toBe(816);
        expect(calls).toContain(`ncbiOntology ${JSON.stringify([[2, 816, 817, 818, 976]])}`);
        expect(calls).toContain(`ncbiTree ${JSON.stringify([[817, 2], [818, 1]])}`);
    });

    it("ends as Failed with the error message when a step fails, and can run again", async () => {
        failing.add("proteins");
        const store = createStore();

        await store.analyse();

        expect(store.status).toBe(AnalysisStatus.Failed);
        expect(store.analysisError).toBe("Error: proteins failed");
        expect(calls).not.toContain("pept2filtered");

        failing.clear();
        await store.analyse();

        expect(store.status).toBe(AnalysisStatus.Finished);
        expect(store.analysisError).toBe("");
    });
});
