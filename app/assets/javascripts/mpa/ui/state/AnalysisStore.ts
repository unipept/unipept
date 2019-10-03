import {ActionContext, ActionTree, GetterTree, MutationTree} from "vuex";

export interface AnalysisState {
    datasetSelectionInProgress: boolean,
}

const analysisState: AnalysisState = {
    datasetSelectionInProgress: false,
};

const analysisGetters: GetterTree<AnalysisState, any>  = {
    isDatasetSelectionInProgress(state: AnalysisState): boolean {
        return state.datasetSelectionInProgress;
    }
};

const analysisMutations: MutationTree<AnalysisState> = {
    SET_DATASET_SELECTION_IN_PROGRESS(state: AnalysisState, inProgress: boolean): void {
        state.datasetSelectionInProgress = inProgress;
    }
};

const analysisActions: ActionTree<AnalysisState, any> = {
    setDatasetSelectionInProgress(store: ActionContext<AnalysisState, any>, inProgress: boolean): void {
        store.commit('SET_DATASET_SELECTION_IN_PROGRESS', inProgress);
    }
};

export const analysisStore = {
    state: analysisState,
    mutations: analysisMutations,
    getters: analysisGetters,
    actions: analysisActions
};
