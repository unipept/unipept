import NewPeptideContainer from "../../NewPeptideContainer";
import {ActionContext, ActionTree, GetterTree, MutationTree} from "vuex";
import NewDatasetManager from "../../NewDatasetManager";
import DisplaySettings from "../../DisplaySettings";

export interface AnalysisState {
    datasetSelectionInProgress: boolean,
    displaySettings: DisplaySettings,
    selectedTerm: string,
    selectedTaxonId: number
}

const analysisState: AnalysisState = {
    datasetSelectionInProgress: false,
    displaySettings: new DisplaySettings(true),
    selectedTerm: 'Organism',
    selectedTaxonId: -1
};

const analysisGetters: GetterTree<AnalysisState, any>  = {
    isDatasetSelectionInProgress(state: AnalysisState): boolean {
        return state.datasetSelectionInProgress;
    },
    displaySettings(state: AnalysisState): DisplaySettings {
        return state.displaySettings;
    },
    selectedTerm(state: AnalysisState): string {
        return state.selectedTerm;
    },
    selectedTaxonId(state: AnalysisState): number {
        return state.selectedTaxonId;
    }
};

const analysisMutations: MutationTree<AnalysisState> = {
    SET_DATASET_SELECTION_IN_PROGRESS(state: AnalysisState, inProgress: boolean): void {
        state.datasetSelectionInProgress = inProgress;
    },
    SET_DISPLAY_SETTINGS(state: AnalysisState, displaySettings: DisplaySettings): void {
        state.displaySettings = displaySettings;
    },
    SET_SELECTED_TERM(state: AnalysisState, value: string): void {
        state.selectedTerm = value;
    },
    SET_SELECTED_TAXON_ID(state: AnalysisState, value: number): void {
        state.selectedTaxonId = value;
    }
};

const analysisActions: ActionTree<AnalysisState, any> = {
    setDatasetSelectionInProgress(store: ActionContext<AnalysisState, any>, inProgress: boolean): void {
        store.commit('SET_DATASET_SELECTION_IN_PROGRESS', inProgress);
    },
    setDisplaySettings(store: ActionContext<AnalysisState, any>, displaySettings: DisplaySettings): void {
        store.commit('SET_DISPLAY_SETTINGS', displaySettings);
    },
    setSelectedTerm(store: ActionContext<AnalysisState, any>, term: string): void {
        store.commit('SET_SELECTED_TERM', term);
    },
    setSelectedTaxonId(store: ActionContext<AnalysisState, any>, taxonId: number): void {
        store.commit('SET_SELECTED_TAXON_ID', taxonId);
    }
};

export const analysisStore = {
    state: analysisState,
    mutations: analysisMutations,
    getters: analysisGetters,
    actions: analysisActions
};
