import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import useProjectAnalysisStore, { DEFAULT_NEW_GROUP_NAME, useProjectAnalysisStoreImport } from "./ProjectAnalysisStore";
import useCustomFilterStore, { FilterType, UNIPROT_ID } from "./CustomFilterStore";
import type { AnalysisConfig } from "./AnalysisConfig";

// The real SingleAnalysisStore starts web workers, so the groups get small fake analyses.
const fakes = vi.hoisted(() => {
    const disposed: string[] = [];
    const make = (id: string, name: string) => ({
        id,
        name,
        dispose: () => disposed.push(id),
        exportStore: () => ({ id, name }),
    });
    return { disposed, make };
});

vi.mock("@/store/SingleAnalysisStore", () => ({
    default: (id: string, name: string) => fakes.make(id, name),
    useSingleAnalysisStoreImport: (storeImport: { id: string, name: string }) => fakes.make(storeImport.id, storeImport.name),
}));

const config: AnalysisConfig = { equate: true, filter: true, useCrap: false, database: UNIPROT_ID };

describe("ProjectAnalysisStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        fakes.disposed.length = 0;
    });

    it("sets the name and the demo mode", () => {
        const project = useProjectAnalysisStore();

        project.setName("My project");
        project.setDemoMode(true);

        expect(project.name).toBe("My project");
        expect(project.isDemoMode).toBe(true);
    });

    it("adds groups and analyses, and is empty while no group has an analysis", () => {
        const project = useProjectAnalysisStore();
        const first = project.addGroup("Group 1");
        const second = project.addGroup("Group 2");

        expect(project.empty).toBe(true);
        expect(project.getFirstGroup()?.id).toBe(first);
        expect(project.getFirstNonEmptyGroup()).toBeUndefined();

        project.addAnalysis(second, "Sample 1", "AALTER", config);

        expect(project.empty).toBe(false);
        expect(project.getFirstNonEmptyGroup()?.id).toBe(second);
        expect(project.getGroup(second).analyses.map(a => a.name)).toEqual(["Sample 1"]);
    });

    it("throws for an unknown group", () => {
        expect(() => useProjectAnalysisStore().getGroup("missing")).toThrow("Group with id missing not found.");
    });

    it("removes an analysis by its id", () => {
        const project = useProjectAnalysisStore();
        const group = project.addGroup("Group 1");
        project.addAnalysis(group, "Sample 1", "AALTER", config);
        const analysisId = project.getGroup(group).analyses[0].id;

        project.removeAnalysis(group, analysisId);

        expect(project.getGroup(group).empty).toBe(true);
        expect(fakes.disposed).toEqual([analysisId]);
    });

    it("disposes the analyses of a removed group", () => {
        const project = useProjectAnalysisStore();
        const group = project.addGroup("Group 1");
        project.addAnalysis(group, "Sample 1", "AALTER", config);

        project.removeGroup(group);

        expect(project.groups).toEqual([]);
        expect(fakes.disposed).toHaveLength(1);
    });

    it("finds the first group number that is not used yet", () => {
        const project = useProjectAnalysisStore();
        expect(project.findFirstAvailableGroupNumber()).toBe(1);

        project.addGroup(`${DEFAULT_NEW_GROUP_NAME} 1`);
        project.addGroup(`${DEFAULT_NEW_GROUP_NAME} 3`);

        expect(project.findFirstAvailableGroupNumber()).toBe(2);
    });

    it("clear removes all groups and the custom filters", () => {
        const project = useProjectAnalysisStore();
        const filters = useCustomFilterStore();
        project.addGroup("Group 1");
        filters.addFilter({ filter: FilterType.Taxon, name: "Bacteria", data: [2] });

        project.clear();

        expect(project.groups).toEqual([]);
        expect(filters.filters).toEqual([UNIPROT_ID]);
    });

    it("exports the groups, the filters and the app version, and imports them again", () => {
        const project = useProjectAnalysisStore();
        const group = project.addGroup("Group 1");
        project.addAnalysis(group, "Sample 1", "AALTER", config);
        const filterId = useCustomFilterStore().addFilter({ filter: FilterType.Taxon, name: "Bacteria", data: [2] });
        const exported = project.exportStore();

        expect(exported.version).toBe(APP_VERSION);
        expect(exported.groups.map(g => g.name)).toEqual(["Group 1"]);

        setActivePinia(createPinia());
        useProjectAnalysisStoreImport(exported);
        const imported = useProjectAnalysisStore();

        expect(imported.getGroup(group).analyses.map(a => a.name)).toEqual(["Sample 1"]);
        expect(useCustomFilterStore().getFilterNameById(filterId)).toBe("Bacteria");
    });

    it("import replaces the groups that were there before and disposes their analyses", () => {
        const project = useProjectAnalysisStore();
        const oldGroup = project.addGroup("Old group");
        project.addAnalysis(oldGroup, "Old sample", "AALTER", config);
        const oldAnalysisId = project.getGroup(oldGroup).analyses[0].id;

        project.setImportedData({ groups: [{ id: "new", name: "New group", analyses: [] }], filters: [], version: "6.6.0" });

        expect(project.groups.map(g => g.name)).toEqual(["New group"]);
        expect(fakes.disposed).toEqual([oldAnalysisId]);
    });
});
