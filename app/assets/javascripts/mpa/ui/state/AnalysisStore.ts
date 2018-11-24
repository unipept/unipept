import NewPeptideContainer from "../../NewPeptideContainer";
import {ActionContext, ActionTree, GetterTree, MutationTree} from "vuex";
import NewDatasetManager from "../../NewDatasetManager";

export interface AnalysisState {
    datasetSelectionInProgress: boolean,
    activeDataset: NewPeptideContainer | null
}

const analysisState: AnalysisState = {
    datasetSelectionInProgress: false,
    activeDataset: null
};

const analysisGetters: GetterTree<AnalysisState, any>  = {
    isDatasetSelectionInProgress(state: AnalysisState): boolean {
        return state.datasetSelectionInProgress;
    },
    activeDataset(state: AnalysisState): NewPeptideContainer | null {
        return state.activeDataset;
    }
};

const analysisMutations: MutationTree<AnalysisState> = {
    SET_DATASET_SELECTION_IN_PROGRESS(state: AnalysisState, inProgress: boolean): void {
        state.datasetSelectionInProgress = inProgress;
    },
    SET_ACTIVE_DATASET(state: AnalysisState, dataset: NewPeptideContainer | null): void {
        state.activeDataset = dataset;
    }
};

const analysisActions: ActionTree<AnalysisState, any> = {
    setDatasetSelectionInProgress(store: ActionContext<AnalysisState, any>, inProgress: boolean): void {
        store.commit('SET_DATASET_SELECTION_IN_PROGRESS', inProgress);
    },
    setActiveDataset(store: ActionContext<AnalysisState, any>, dataset: NewPeptideContainer | null): void {
        store.commit('SET_ACTIVE_DATASET', dataset);
    }
};

export const analysisStore = {
    state: analysisState,
    mutations: analysisMutations,
    getters: analysisGetters,
    actions: analysisActions
};
