import {defineStore} from "pinia";
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import {ref, Ref} from "vue";
import {GroupAnalysisStore} from "@/store/GroupAnalysisStore";
import useUnipeptAnalysisStore from "@/store/UnipeptAnalysisStore";
import {ProjectAnalysisStore} from "@/store/ProjectAnalysisStore";
import {PathwayItem} from "@/store/PathwayPilotStore";

export interface ComparativePageState {
    selectedAnalyses: SingleAnalysisStore[];
    selectedGroup: GroupAnalysisStore | undefined;
    selectedComparativePathway: PathwayItem | undefined;
}

export interface SinglePageState {
    selectedAnalyses: SingleAnalysisStore[];
    selectedGroup: GroupAnalysisStore | undefined;
}

const useAppStateStore = defineStore('appStateStore', () => {
    const { project } = useUnipeptAnalysisStore();

    const comparativeAnalysisState: Ref<ComparativePageState> = ref({
        selectedAnalyses: [],
        selectedGroup: undefined,
        selectedComparativePathway: undefined
    });

    // Holds a pathway ID that was imported from a session and needs to be resolved
    // into a full PathwayItem once the pathway mapping has been loaded.
    const pendingComparativePathwayId = ref<string | undefined>(undefined);

    const singleAnalysisState: Ref<SinglePageState> = ref({
        selectedAnalyses: [],
        selectedGroup: undefined
    })

    const clear = () => {
        comparativeAnalysisState.value.selectedAnalyses = [];
        comparativeAnalysisState.value.selectedGroup = undefined;
        comparativeAnalysisState.value.selectedComparativePathway = undefined;
        pendingComparativePathwayId.value = undefined;

        singleAnalysisState.value.selectedAnalyses = [];
        singleAnalysisState.value.selectedGroup = undefined;
    }

    const exportStore = (): AppStateStoreImport => {
        return {
            selectedComparativeAnalysisIds: comparativeAnalysisState.value.selectedAnalyses.map((a: SingleAnalysisStore) => a.id),
            selectedComparativeGroupId: comparativeAnalysisState.value.selectedGroup?.id,
            selectedComparativePathwayId: comparativeAnalysisState.value.selectedComparativePathway?.id,
            selectedSingleAnalysisIds: singleAnalysisState.value.selectedAnalyses.map((a: SingleAnalysisStore) => a.id),
            selectedSingleGroupId: singleAnalysisState.value.selectedGroup?.id
        }
    }

    const setImportedData = (
        storeImport: AppStateStoreImport,
        project: ProjectAnalysisStore
    ) => {
        const allAnalysesOfProject = project.groups.flatMap(group => group.analyses as SingleAnalysisStore[]);

        for (const analysisId of storeImport.selectedComparativeAnalysisIds) {
            comparativeAnalysisState.value.selectedAnalyses.push(allAnalysesOfProject.find(a => a.id === analysisId) as SingleAnalysisStore);
        }

        if (storeImport.selectedComparativeGroupId !== undefined) {
            comparativeAnalysisState.value.selectedGroup = project.getGroup(storeImport.selectedComparativeGroupId);
        }

        if (storeImport.selectedComparativePathwayId) {
            pendingComparativePathwayId.value = storeImport.selectedComparativePathwayId;
        }

        for (const analysisId of storeImport.selectedSingleAnalysisIds) {
            singleAnalysisState.value.selectedAnalyses.push(allAnalysesOfProject.find(a => a.id === analysisId) as SingleAnalysisStore);
        }

        if (storeImport.selectedSingleGroupId !== undefined) {
            singleAnalysisState.value.selectedGroup = project.getGroup(storeImport.selectedSingleGroupId);
        }
    }

    return {
        project,

        comparativeAnalysisState,
        pendingComparativePathwayId,
        singleAnalysisState,

        exportStore,
        setImportedData,

        clear
    }
});

export interface AppStateStoreImport {
    selectedComparativeAnalysisIds: string[];
    selectedComparativeGroupId: string | undefined;
    selectedComparativePathwayId?: string;

    selectedSingleAnalysisIds: string[];
    selectedSingleGroupId: string | undefined;
}

export type AppStateStore = ReturnType<typeof useAppStateStore>;

export default useAppStateStore;
