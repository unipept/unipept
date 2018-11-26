import NewPeptideContainer from "../../NewPeptideContainer";
import {ActionContext, ActionTree, GetterTree, MutationTree} from "vuex";
import NewDatasetManager from "../../NewDatasetManager";
import DisplaySettings from "../../DisplaySettings";

export interface AnalysisState {
    datasetSelectionInProgress: boolean,
    activeDataset: NewPeptideContainer | null,
    displaySettings: DisplaySettings,
    selectedTerm: string
}

const analysisState: AnalysisState = {
    datasetSelectionInProgress: false,
    activeDataset: null,
    displaySettings: new DisplaySettings(true),
    selectedTerm: 'organism'
};

const analysisGetters: GetterTree<AnalysisState, any>  = {
    isDatasetSelectionInProgress(state: AnalysisState): boolean {
        return state.datasetSelectionInProgress;
    },
    activeDataset(state: AnalysisState): NewPeptideContainer | null {
        return state.activeDataset;
    },
    displaySettings(state: AnalysisState): DisplaySettings {
        return state.displaySettings;
    }
};

const analysisMutations: MutationTree<AnalysisState> = {
    SET_DATASET_SELECTION_IN_PROGRESS(state: AnalysisState, inProgress: boolean): void {
        state.datasetSelectionInProgress = inProgress;
    },
    SET_ACTIVE_DATASET(state: AnalysisState, dataset: NewPeptideContainer | null): void {
        state.activeDataset = dataset;
    },
    SET_DISPLAY_SETTINGS(state: AnalysisState, displaySettings: DisplaySettings): void {
        this.displaySettings = displaySettings;
    }
};

const analysisActions: ActionTree<AnalysisState, any> = {
    setDatasetSelectionInProgress(store: ActionContext<AnalysisState, any>, inProgress: boolean): void {
        store.commit('SET_DATASET_SELECTION_IN_PROGRESS', inProgress);
    },
    setActiveDataset(store: ActionContext<AnalysisState, any>, dataset: NewPeptideContainer | null): void {
        store.commit('SET_ACTIVE_DATASET', dataset);
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
