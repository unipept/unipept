import {defineStore} from "pinia";
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import {ref, Ref} from "vue";
import {GroupAnalysisStore} from "@/store/GroupAnalysisStore";
import useUnipeptAnalysisStore from "@/store/UnipeptAnalysisStore";
import {ProjectAnalysisStore} from "@/store/ProjectAnalysisStore";

export interface ComparativePageState {
    selectedAnalyses: SingleAnalysisStore[];
    selectedGroup: GroupAnalysisStore | undefined;
}

export interface SinglePageState {
    selectedAnalyses: SingleAnalysisStore[];
    selectedGroup: GroupAnalysisStore | undefined;
}

const useAppStateStore = defineStore('appStateStore', () => {
    const { project } = useUnipeptAnalysisStore();

    const comparativeAnalysisState: Ref<ComparativePageState> = ref({
        selectedAnalyses: [],
        selectedGroup: undefined
    });

    const singleAnalysisState: Ref<SinglePageState> = ref({
        selectedAnalyses: [],
        selectedGroup: undefined
    })

    const clear = () => {
        comparativeAnalysisState.value.selectedAnalyses = [];
        comparativeAnalysisState.value.selectedGroup = undefined;

        singleAnalysisState.value.selectedAnalyses = [];
        singleAnalysisState.value.selectedGroup = undefined;
    }

    const exportStore = (): AppStateStoreImport => {
        return {
            selectedComparativeAnalysisIds: comparativeAnalysisState.value.selectedAnalyses.map((a: SingleAnalysisStore) => a.id),
            selectedComparativeGroupId: comparativeAnalysisState.value.selectedGroup?.id,
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
        singleAnalysisState,

        exportStore,
        setImportedData,

        clear
    }
});

export interface AppStateStoreImport {
    selectedComparativeAnalysisIds: string[];
    selectedComparativeGroupId: string | undefined;

    selectedSingleAnalysisIds: string[];
    selectedSingleGroupId: string | undefined;
}

export type AppStateStore = ReturnType<typeof useAppStateStore>;

export default useAppStateStore;
