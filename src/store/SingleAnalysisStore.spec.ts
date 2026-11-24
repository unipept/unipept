import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import useSingleAnalysisStore, { useSingleAnalysisStoreImport } from "./SingleAnalysisStore";
import { AnalysisStatus } from "./AnalysisStatus";
import type { AnalysisConfig } from "./AnalysisConfig";
import useCustomFilterStore, { FilterType } from "./CustomFilterStore";
import { calls, failing, gate, resetFakes } from "../../tests/unit/analysisFakes";

vi.mock("@/composables/communication/unipept/usePept2filtered", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakePept2filtered }));
vi.mock("@/composables/communication/unipept/useMetaData", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakeMetaData }));
vi.mock("@/composables/processing/peptide/usePeptideProcessor", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakePeptideProcessor }));
vi.mock("@/composables/processing/peptide/usePeptideTrustProcessor", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakePeptideTrustProcessor }));
vi.mock("@/composables/processing/functional/useEcProcessor", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakeEcProcessor }));
vi.mock("@/composables/processing/functional/useGoProcessor", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakeGoProcessor }));
vi.mock("@/composables/processing/functional/useInterproProcessor", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakeInterproProcessor }));
vi.mock("@/composables/processing/taxonomic/useTaxonomicProcessor", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakeTaxonomicProcessor }));
vi.mock("@/composables/processing/taxonomic/useNcbiTreeProcessor", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakeNcbiTreeProcessor }));
vi.mock("@/composables/processing/functional/usePeptonizerScoreProcessor", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakePeptonizerScoreProcessor }));
vi.mock("@/store/OntologyStore", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakeOntologyStore }));
vi.mock("@/store/PeptonizerAnalysisStore", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakeSubStore("peptonizer") }));
vi.mock("@/store/PathwayPilotStore", async () => ({ default: (await import("../../tests/unit/analysisFakes")).fakeSubStore("pathwayPilot") }));

const config: AnalysisConfig = { equate: true, filter: false, useCrap: true, database: "UniProtKB" };

let storeCount = 0;
const createStore = (rawPeptides = "AAAAA\nCCCCC\nDDDDD", intensities?: Map<string, number>) =>
    useSingleAnalysisStore(`analysis-${storeCount++}`, "Sample", rawPeptides, config, intensities);

describe("SingleAnalysisStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        resetFakes();
    });

    it("splits the raw peptides into trimmed lines and drops empty lines", () => {
        const store = createStore(" AAAAA \n\nCCCCC\n");

        expect(store.peptides).toEqual(["AAAAA", "CCCCC"]);
        expect(store.status).toBe(AnalysisStatus.Pending);
        expect(store.lastAnalysedString).toBe("");
    });

    it("analyse runs every step in order and ends as Finished", async () => {
        const store = createStore();

        await store.analyse();

        expect(calls).toEqual([
            // Scores of a previous analysis are stopped first
            "cancel ecScores", "cancel goScores", "cancel iprScores",
            `peptides ${JSON.stringify([["AAAAA", "CCCCC", "DDDDD"], true, false])}`,
            `pept2filtered ${JSON.stringify([["AAAAA", "CCCCC", "DDDDD"], true, true, { filter: FilterType.UniProtKB, name: "UniProtKB" }])}`,
            "metadata",
            "trust",
            "lca",
            `ec ${JSON.stringify([["AAAAA", "CCCCC", "DDDDD"], 5])}`,
            `go ${JSON.stringify([["AAAAA", "CCCCC", "DDDDD"], 5])}`,
            `ipr ${JSON.stringify([["AAAAA", "CCCCC", "DDDDD"], 5])}`,
            `ecOntology ${JSON.stringify([[]])}`,
            `goOntology ${JSON.stringify([[]])}`,
            `iprOntology ${JSON.stringify([[]])}`,
            `ncbiOntology ${JSON.stringify([[2, 816]])}`,
            `ncbiTree ${JSON.stringify([[2, 2], [816, 1]])}`,
            "ecScores", "goScores", "iprScores",
        ]);
        expect(store.status).toBe(AnalysisStatus.Finished);
        expect(store.databaseVersion).toBe("2026.04");
        expect(store.lastAnalysedString).not.toBe("");
    });

    it("analyse(false) does not call the API", async () => {
        const store = createStore();

        await store.analyse(false);

        expect(calls.some(call => call.startsWith("pept2filtered") || call === "metadata")).toBe(false);
        expect(store.lastAnalysedString).toBe("");
    });

    it("sends the filter of the selected database to pept2filtered", async () => {
        const filter = { filter: FilterType.Taxon, name: "Bacteria", data: [2] };
        const filterId = useCustomFilterStore().addFilter(filter);
        const store = useSingleAnalysisStore(`analysis-${storeCount++}`, "Sample", "AAAAA", { ...config, database: filterId });

        await store.analyse();

        expect(calls).toContain(`pept2filtered ${JSON.stringify([["AAAAA"], true, true, filter])}`);
    });

    it("is Running while the analysis runs", async () => {
        const store = createStore();
        const open = gate("lca");

        const analysis = store.analyse();
        await vi.waitFor(() => expect(calls).toContain("lca"));
        expect(store.status).toBe(AnalysisStatus.Running);

        open();
        await analysis;
        expect(store.status).toBe(AnalysisStatus.Finished);
    });

    it("ends as Failed with the error message when a step fails", async () => {
        const store = createStore();
        failing.add("pept2filtered");

        await store.analyse();

        expect(store.status).toBe(AnalysisStatus.Failed);
        expect(store.analysisError).toBe("Error: pept2filtered failed");
        expect(calls).not.toContain("lca");
    });

    it("runs the analyses of different samples one at a time", async () => {
        const first = createStore("AAAAA");
        const second = createStore("CCCCC");
        const open = gate("lca");

        const firstAnalysis = first.analyse(false);
        const secondAnalysis = second.analyse(false);
        await vi.waitFor(() => expect(calls).toContain("lca"));

        expect(second.status).toBe(AnalysisStatus.Pending);
        expect(calls.filter(call => call.startsWith("peptides"))).toHaveLength(1);

        open();
        await Promise.all([firstAnalysis, secondAnalysis]);
        expect(second.status).toBe(AnalysisStatus.Finished);
        expect(calls.filter(call => call.startsWith("peptides"))).toHaveLength(2);
    });

    it("does not start Peptonizer scores for an analysis that was disposed", async () => {
        const store = createStore();
        store.dispose();
        calls.length = 0;

        await store.analyse(false);

        expect(store.status).toBe(AnalysisStatus.Finished);
        expect(calls.filter(call => ["ecScores", "goScores", "iprScores"].includes(call))).toEqual([]);
    });

    it("updateTaxonomicFilter analyses the peptides of the taxon and its descendants", async () => {
        const store = createStore();
        await store.analyse(false);
        calls.length = 0;

        await store.updateTaxonomicFilter(2);

        const steps = calls.filter(call => !call.startsWith("cancel"));
        expect(JSON.parse(steps[0].slice("peptides ".length))[0].sort()).toEqual(["AAAAA", "CCCCC", "DDDDD"]);
        expect(steps.slice(1).map(call => call.split(" ")[0])).toEqual(["ec", "go", "ipr"]);
        expect(store.taxonomicFilter).toBe(2);
        expect(store.filteringStatus).toBe(AnalysisStatus.Finished);
        expect(store.scoresOutdated).toBe(true);
    });

    it("updateTaxonomicFilter stops running Peptonizer runs for the previous filter", async () => {
        const store = createStore();
        await store.analyse(false);
        calls.length = 0;

        await store.updateTaxonomicFilter(816);

        expect(calls.slice(0, 3)).toEqual(["cancel ecScores", "cancel goScores", "cancel iprScores"]);
        expect(JSON.parse(calls[3].slice("peptides ".length))[0]).toEqual(["DDDDD"]);
    });

    it("updateTaxonomicFilter keeps finished Peptonizer scores and marks them as outdated", async () => {
        const store = createStore();
        await store.analyse(false);
        // The score runs have finished
        store.ecScoresLoading = false;
        store.goScoresLoading = false;
        store.iprScoresLoading = false;
        calls.length = 0;

        await store.updateTaxonomicFilter(816);

        expect(calls.some(call => call.startsWith("cancel"))).toBe(false);
        expect(store.scoresOutdated).toBe(true);
    });

    it("updateFunctionalFilter reprocesses the functions with the new percentage", async () => {
        const store = createStore();
        await store.analyse(false);
        calls.length = 0;

        await store.updateFunctionalFilter(50, 0.3);

        expect(calls.map(call => JSON.parse(call.slice(call.indexOf(" ") + 1))[1])).toEqual([50, 50, 50]);
        expect(store.functionalFilter).toBe(50);
        expect(store.functionalProbabilityThreshold).toBe(0.3);
        expect(store.filteringStatus).toBe(AnalysisStatus.Finished);
    });

    it("updateConfig and updateName change the analysis, and a new config makes it Pending", async () => {
        const store = createStore();
        await store.analyse(false);

        store.updateName("Renamed");
        store.updateConfig({ ...config, equate: false });

        expect(store.name).toBe("Renamed");
        expect(store.config.equate).toBe(false);
        expect(store.status).toBe(AnalysisStatus.Pending);
    });

    it("exports its state and imports it again", async () => {
        const store = createStore("AAAAA", new Map([["AAAAA", 2.5]]));
        await store.analyse();
        await store.updateFunctionalFilter(10, 0.5);
        const exported = store.exportStore();

        expect(exported).toMatchObject({
            name: "Sample",
            rawPeptides: "AAAAA",
            config,
            intensities: JSON.stringify({ AAAAA: 2.5 }),
            taxonomicFilter: 1,
            functionalFilter: 10,
            functionalProbabilityThreshold: 0.5,
            databaseVersion: "2026.04",
            peptonizer: { store: "peptonizer" },
            pathwayPilot: { store: "pathwayPilot" },
        });
        expect(exported.peptideToDataTransferable).toBeDefined();

        setActivePinia(createPinia());
        const imported = useSingleAnalysisStoreImport(exported);

        expect(imported.id).toBe(exported.id);
        expect(imported.intensities).toEqual(new Map([["AAAAA", 2.5]]));
        expect(imported.functionalFilter).toBe(10);
        expect(imported.functionalProbabilityThreshold).toBe(0.5);
        expect(imported.databaseVersion).toBe("2026.04");
        expect(imported.lastAnalysedString).toBe(store.lastAnalysedString);
        expect(imported.peptideToData).toBeDefined();
        expect(imported.status).toBe(AnalysisStatus.Pending);
        expect(calls).toContain(`peptonizer import ${JSON.stringify({ store: "peptonizer" })}`);
    });

    it("imports projects without a probability threshold, and empty intensities as no intensities", () => {
        const imported = useSingleAnalysisStoreImport({
            id: "old", name: "Old", rawPeptides: "AAAAA", config, intensities: "{}",
            taxonomicFilter: 1, functionalFilter: 5, lastAnalysed: undefined, databaseVersion: "2025.01",
            peptideToDataTransferable: undefined, peptonizer: undefined, pathwayPilot: undefined,
        });

        expect(imported.functionalProbabilityThreshold).toBe(0);
        expect(imported.intensities).toBeUndefined();
        expect(imported.peptideToData).toBeUndefined();
    });

    it("importStore fetches the data again when the project has none, and imports missing intensities as none", async () => {
        const imported = useSingleAnalysisStoreImport({
            id: "no-data", name: "Old", rawPeptides: "AAAAA", config, intensities: undefined,
            taxonomicFilter: 1, functionalFilter: 5, lastAnalysed: undefined, databaseVersion: "2025.01",
            peptideToDataTransferable: undefined, peptonizer: undefined, pathwayPilot: undefined,
        });

        await imported.importStore();

        expect(calls.some(call => call.startsWith("pept2filtered"))).toBe(true);
        expect(imported.status).toBe(AnalysisStatus.Finished);
        expect(imported.intensities).toBeUndefined();
    });
});
