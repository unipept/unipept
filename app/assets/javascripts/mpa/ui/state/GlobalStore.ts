import NewPeptideContainer from "../../NewPeptideContainer";
import {ActionContext, ActionTree, GetterTree, MutationTree} from "vuex";
import NewDatasetManager from "../../NewDatasetManager";
import SearchSettings from "../../SearchSettings";
import MpaAnalysisManager from "../../MpaAnalysisManager";
import {AnalysisState} from "./AnalysisStore";


export interface GlobalState {
    selectedDatasets: NewPeptideContainer[],
    storedDatasets: NewPeptideContainer[],
    analysis: boolean,
    selectedDataset: NewPeptideContainer,
    searchSettings: SearchSettings,
    activeDataset: NewPeptideContainer | null,
    selectedTerm: string,
    selectedTaxonId: number
}

const mpaState: GlobalState = {
    storedDatasets: [],
    selectedDatasets: [],
    analysis: false,
    selectedDataset: undefined,
    searchSettings: new SearchSettings(true, true, false),
    activeDataset: null,
    selectedTerm: 'Organism',
    selectedTaxonId: -1
};

const mpaGetters: GetterTree<GlobalState, any> = {
    selectedDatasets(state: GlobalState): NewPeptideContainer[] {
        return state.selectedDatasets;
    },
    storedDatasets(state: GlobalState): NewPeptideContainer[] {
        return state.storedDatasets;
    },
    isAnalysis(state: GlobalState): boolean {
        return state.analysis;
    },
    selectedDataset(state: GlobalState): NewPeptideContainer | undefined {
        return state.selectedDataset;
    },
    searchSettings(state: GlobalState): SearchSettings {
        return state.searchSettings;
    },
    activeDataset(state: GlobalState): NewPeptideContainer | null {
        return state.activeDataset;
    },
    selectedTerm(state: GlobalState): string {
        return state.selectedTerm;
    },
    selectedTaxonId(state: GlobalState): number {
        return state.selectedTaxonId;
    }
};

const mpaMutations: MutationTree<GlobalState> = {
    SELECT_DATASET(state: GlobalState, dataset: NewPeptideContainer) {
        let index: number = state.selectedDatasets.findIndex((value: NewPeptideContainer, index: number, arr: NewPeptideContainer[]) => {
            return value.getId() === dataset.getId();
        });

        if (index === -1) {
            state.selectedDatasets.push(dataset);
        }
    },
    DESELECT_DATASET(state: GlobalState, dataset: NewPeptideContainer) {
        let index: number = state.selectedDatasets.findIndex((value: NewPeptideContainer, index: number, arr: NewPeptideContainer[]) => {
            return value.getId() === dataset.getId();
        });

        if (index !== -1) {
            state.selectedDatasets.splice(index, 1);
        }

        dataset.setDataset(null);
    },
    CLEAR_SELECTED_DATASETS(state: GlobalState) {
        state.selectedDatasets.splice(0, state.selectedDatasets.length);
    },
    ADD_STORED_DATASET(state: GlobalState, dataset: NewPeptideContainer) {
        state.storedDatasets.push(dataset);
    },
    ADD_STORED_DATASET_BATCH(state: GlobalState, datasets: NewPeptideContainer[]) {
        state.storedDatasets.push(...datasets);
    },
    SET_ANALYSIS(state: GlobalState, isAnalysing: boolean) {
        state.analysis = isAnalysing;
    },
    SET_SELECTED_DATASET(state: GlobalState, dataset: NewPeptideContainer | undefined) {
        state.selectedDataset = dataset;
    },
    SET_SEARCH_SETTINGS(state: GlobalState, searchSettings: SearchSettings): void {
        this.searchSettings = searchSettings;
    },
    SET_ACTIVE_DATASET(state: GlobalState, dataset: NewPeptideContainer | null): void {
        state.activeDataset = dataset;
    },
    SET_SELECTED_TERM(state: GlobalState, value: string): void {
        state.selectedTerm = value;
    },
    SET_SELECTED_TAXON_ID(state: GlobalState, value: number): void {
        state.selectedTaxonId = value;
    }
};

const mpaActions: ActionTree<GlobalState, any> = {
    selectDataset(store: ActionContext<GlobalState, any>, dataset: NewPeptideContainer) {
        if (store.getters.selectedDatasets.indexOf(dataset) !== -1) {
            return;
        }

        store.commit('SELECT_DATASET', dataset);
        if (store.getters.isAnalysis) {
            store.dispatch('processDataset', dataset);
        }
    },
    deselectDataset(store: ActionContext<GlobalState, any>, dataset: NewPeptideContainer) {
        store.commit('DESELECT_DATASET', dataset);

        if (dataset === store.getters.activeDataset) {
            // Find first processed dataset that could replace the previous active dataset
            let newActiveDataset: NewPeptideContainer = null;

            for (let current of store.getters.selectedDatasets) {
                if (current.getProgress() === 1) {
                    newActiveDataset = current;
                }
            }

            store.commit('SET_ACTIVE_DATASET', newActiveDataset);
        }
    },
    clearSelectedDatasets(store: ActionContext<GlobalState, any>) {
        store.commit('CLEAR_SELECTED_DATASETS');
        store.commit('SET_ACTIVE_DATASET', null);
    },
    addStoredDataset(store: ActionContext<GlobalState, any>, dataset: NewPeptideContainer) {
        store.commit('ADD_STORED_DATASET', dataset);
    },
    /**
     * Load all datasets stored in the browser's local storage and update the current Vuex's store accordingly.
     */
    loadStoredDatasets(store: ActionContext<GlobalState, any>) {
        let datasetManager: NewDatasetManager = new NewDatasetManager();

        datasetManager.listDatasets()
            .then((values) => {
                store.commit('ADD_STORED_DATASET_BATCH', values);
            });
    },
    setAnalysis(store: ActionContext<GlobalState, any>, isAnalysing: boolean) {
        store.commit('SET_ANALYSIS', isAnalysing);
    },
    setSelectedDataset(store: ActionContext<GlobalState, any>, dataset: NewPeptideContainer | undefined) {
        store.commit('SET_SELECTED_DATASET', dataset);
    },
    setSearchSettings(store: ActionContext<GlobalState, any>, searchSettings: SearchSettings): void {
        store.commit('SET_SEARCH_SETTINGS', searchSettings);
    },
    setActiveDataset(store: ActionContext<GlobalState, any>, dataset: NewPeptideContainer | null): void {
        store.commit('SET_ACTIVE_DATASET', dataset);
        store.dispatch('setSelectedTerm', 'Organism');
        store.dispatch('setSelectedTaxonId', -1);
    },
    processDataset(store: ActionContext<GlobalState, any>, dataset: NewPeptideContainer): void {
        let mpaManager = new MpaAnalysisManager();
        mpaManager.processDataset(dataset, store.getters.searchSettings).then(
        () => {
            if (store.getters.activeDataset === null) {
                store.dispatch('setActiveDataset', dataset);
            }
        });
    },
    setSelectedTerm(store: ActionContext<GlobalState, any>, term: string): void {
        store.commit('SET_SELECTED_TERM', term);
    },
    setSelectedTaxonId(store: ActionContext<GlobalState, any>, taxonId: number): void {
        store.commit('SET_SELECTED_TAXON_ID', taxonId);
    }
};

export const globalStore = {
    state: mpaState,
    mutations: mpaMutations,
    getters: mpaGetters,
    actions: mpaActions
};


