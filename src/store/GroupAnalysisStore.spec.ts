import { beforeEach, describe, expect, it, vi } from "vitest";
import { disposedAnalyses, resetFakes } from "../../tests/unit/analysisFakes";
import { createPinia, setActivePinia } from "pinia";
import useGroupAnalysisStore, { useGroupAnalysisStoreImport } from "./GroupAnalysisStore";
import type { AnalysisConfig } from "./AnalysisConfig";
import { UNIPROT_ID } from "./CustomFilterStore";

// The real SingleAnalysisStore starts web workers, so the groups get small fake analyses
vi.mock("@/store/SingleAnalysisStore", async () => (await import("../../tests/unit/analysisFakes")).fakeSingleAnalysisStoreModule);

const config: AnalysisConfig = { equate: true, filter: true, useCrap: false, database: UNIPROT_ID };

describe("GroupAnalysisStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        resetFakes();
    });

    it("starts empty", () => {
        const group = useGroupAnalysisStore("g1", "Group 1");

        expect(group.empty).toBe(true);
        expect(group.analyses).toEqual([]);
        expect(group.getFirstAnalysis()).toBeUndefined();
    });

    it("adds analyses and finds them by id", () => {
        const group = useGroupAnalysisStore("g1", "Group 1");

        const first = group.addAnalysis("Sample 1", "AALTER", config);
        const second = group.addAnalysis("Sample 2", "MDGTEYIIVK", config);

        expect(group.empty).toBe(false);
        expect(group.analyses.map(a => a.name)).toEqual(["Sample 1", "Sample 2"]);
        expect(group.getAnalysis(second)?.name).toBe("Sample 2");
        expect(group.getFirstAnalysis()?.id).toBe(first);
    });

    it("disposes an analysis when it is removed, and all of them on clear", () => {
        const group = useGroupAnalysisStore("g1", "Group 1");
        const first = group.addAnalysis("Sample 1", "AALTER", config);
        const second = group.addAnalysis("Sample 2", "AALTER", config);

        group.removeAnalysis(first);
        expect(disposedAnalyses).toEqual([first]);
        expect(group.getAnalysis(first)).toBeUndefined();

        group.clear();
        expect(disposedAnalyses).toEqual([first, second]);
        expect(group.empty).toBe(true);
    });

    it("updates its name", () => {
        const group = useGroupAnalysisStore("g1", "Group 1");

        group.updateName("Renamed");

        expect(group.name).toBe("Renamed");
    });

    it("exports its id, name and analyses, and imports them again", () => {
        const group = useGroupAnalysisStore("g1", "Group 1");
        const id = group.addAnalysis("Sample 1", "AALTER", config);
        const exported = group.exportStore();

        expect(exported).toEqual({ id: "g1", name: "Group 1", analyses: [{ id, name: "Sample 1" }] });

        setActivePinia(createPinia());
        const imported = useGroupAnalysisStoreImport(exported);

        expect(imported.id).toBe("g1");
        expect(imported.getAnalysis(id)?.name).toBe("Sample 1");
    });
});
