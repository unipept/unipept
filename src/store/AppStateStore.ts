import {defineStore} from "pinia";
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import {ref, Ref} from "vue";
import {GroupAnalysisStore} from "@/store/GroupAnalysisStore";
import useUnipeptAnalysisStore from "@/store/UnipeptAnalysisStore";

export interface ComparativePageState {
    selectedAnalyses: SingleAnalysisStore[];
    selectedGroup: GroupAnalysisStore | undefined;
}

export interface SinglePageState {
    selectedAnalyses: SingleAnalysisStore[];
    selectedGroup: GroupAnalysisStore | undefined;
}

const useAppStateStore = defineStore('appStateStore', () => {
    const { project, isDemoMode } = useUnipeptAnalysisStore();

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

    return {
        project,
        isDemoMode,

        comparativeAnalysisState,
        singleAnalysisState,

        clear
    }
});

export type AppStateStore = ReturnType<typeof useAppStateStore>;

export default useAppStateStore;
