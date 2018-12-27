import PeptideContainer from "../../PeptideContainer";
import {ActionContext, ActionTree, GetterTree, MutationTree} from "vuex";
import DatasetManager from "../../DatasetManager";
import DisplaySettings from "../../DisplaySettings";

export interface AnalysisState {
    datasetSelectionInProgress: boolean,
    displaySettings: DisplaySettings
}

const analysisState: AnalysisState = {
    datasetSelectionInProgress: false,
    displaySettings: new DisplaySettings(true)
};

const analysisGetters: GetterTree<AnalysisState, any>  = {
    isDatasetSelectionInProgress(state: AnalysisState): boolean {
        return state.datasetSelectionInProgress;
    },
    displaySettings(state: AnalysisState): DisplaySettings {
        return state.displaySettings;
    }
};

const analysisMutations: MutationTree<AnalysisState> = {
    SET_DATASET_SELECTION_IN_PROGRESS(state: AnalysisState, inProgress: boolean): void {
        state.datasetSelectionInProgress = inProgress;
    },
    SET_DISPLAY_SETTINGS(state: AnalysisState, displaySettings: DisplaySettings): void {
        state.displaySettings = displaySettings;
    }
};

const analysisActions: ActionTree<AnalysisState, any> = {
    setDatasetSelectionInProgress(store: ActionContext<AnalysisState, any>, inProgress: boolean): void {
        store.commit('SET_DATASET_SELECTION_IN_PROGRESS', inProgress);
    },
    setDisplaySettings(store: ActionContext<AnalysisState, any>, displaySettings: DisplaySettings): void {
        store.commit('SET_DISPLAY_SETTINGS', displaySettings);
    }
};

export const analysisStore = {
    state: analysisState,
    mutations: analysisMutations,
    getters: analysisGetters,
    actions: analysisActions
};
