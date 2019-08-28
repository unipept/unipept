import PeptideContainer from "../../PeptideContainer";
import {ActionContext, ActionTree, GetterTree, MutationTree} from "vuex";
import DatasetManager from "../../DatasetManager";
import MpaAnalysisManager from "../../MpaAnalysisManager";

export interface GlobalState {
    selectedDatasets: PeptideContainer[],
    storedDatasets: PeptideContainer[],
    analysis: boolean,
    searchSettings: MPAConfig,
    activeDataset: PeptideContainer | null,
    selectedTerm: string,
    selectedTaxonId: number,
    matchedPeptides: number,
    searchedPeptides: number,
    missedPeptides: string[]
}

const mpaState: GlobalState = {
    storedDatasets: [],
    selectedDatasets: [],
    analysis: false,
    searchSettings: {il: true, dupes: true, missed: false},
    activeDataset: null,
    selectedTerm: 'Organism',
    selectedTaxonId: -1,
    matchedPeptides: 0,
    searchedPeptides: 0,
    missedPeptides: []
};

const mpaGetters: GetterTree<GlobalState, any> = {
    selectedDatasets(state: GlobalState): PeptideContainer[] {
        return state.selectedDatasets;
    },
    storedDatasets(state: GlobalState): PeptideContainer[] {
        return state.storedDatasets;
    },
    isAnalysis(state: GlobalState): boolean {
        return state.analysis;
    },
    searchSettings(state: GlobalState): MPAConfig {
        return state.searchSettings;
    },
    activeDataset(state: GlobalState): PeptideContainer | null {
        return state.activeDataset;
    },
    selectedTerm(state: GlobalState): string {
        return state.selectedTerm;
    },
    selectedTaxonId(state: GlobalState): number {
        return state.selectedTaxonId;
    },
    searchedPeptides(state: GlobalState): number {
        return state.searchedPeptides;
    },
    matchedPeptides(state: GlobalState): number {
        return state.matchedPeptides;
    },
    missedPeptides(state: GlobalState): string[] {
        return state.missedPeptides;
    }
};

const mpaMutations: MutationTree<GlobalState> = {
    SELECT_DATASET(state: GlobalState, dataset: PeptideContainer) {
        let index: number = state.selectedDatasets.findIndex((value: PeptideContainer, index: number, arr: PeptideContainer[]) => {
            return value.getId() === dataset.getId();
        });

        if (index === -1) {
            state.selectedDatasets.push(dataset);
        }
    },
    DESELECT_DATASET(state: GlobalState, dataset: PeptideContainer) {
        let index: number = state.selectedDatasets.findIndex((value: PeptideContainer, index: number, arr: PeptideContainer[]) => {
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
    ADD_STORED_DATASET(state: GlobalState, dataset: PeptideContainer) {
        state.storedDatasets.push(dataset);
    },
    REMOVE_STORED_DATASET(state: GlobalState, dataset: PeptideContainer) {
        let index: number = state.storedDatasets.findIndex((value: PeptideContainer, index: number) => value.getId() === dataset.getId());
        if (index !== -1) {
            state.storedDatasets.splice(index, 1);
        }
    },
    ADD_STORED_DATASET_BATCH(state: GlobalState, datasets: PeptideContainer[]) {
        state.storedDatasets.push(...datasets);
    },
    SET_ANALYSIS(state: GlobalState, isAnalysing: boolean) {
        state.analysis = isAnalysing;
    },
    SET_SEARCH_SETTINGS(state: GlobalState, searchSettings: MPAConfig): void {
        state.searchSettings = searchSettings;
    },
    SET_ACTIVE_DATASET(state: GlobalState, dataset: PeptideContainer | null): void {
        state.activeDataset = dataset;
    },
    SET_SELECTED_TERM(state: GlobalState, value: string): void {
        state.selectedTerm = value;
    },
    SET_SELECTED_TAXON_ID(state: GlobalState, value: number): void {
        state.selectedTaxonId = value;
    },
    SET_SEARCHED_PEPTIDES(state: GlobalState, value: number): void {
        state.searchedPeptides = value;
    },
    SET_MATCHED_PEPTIDES(state: GlobalState, value: number): void {
        state.matchedPeptides = value;
    },
    SET_MISSED_PEPTIDES(state: GlobalState, value: string[]): void {
        state.missedPeptides = value;
    }
};

const mpaActions: ActionTree<GlobalState, any> = {
    selectDataset(store: ActionContext<GlobalState, any>, dataset: PeptideContainer) {
        if (store.getters.selectedDatasets.indexOf(dataset) !== -1) {
            return;
        }

        store.commit('SELECT_DATASET', dataset);
        if (store.getters.isAnalysis) {
            store.dispatch('processDataset', dataset);
        }
    },
    deselectDataset(store: ActionContext<GlobalState, any>, dataset: PeptideContainer) {
        store.commit('DESELECT_DATASET', dataset);

        if (dataset === store.getters.activeDataset) {
            // Find first processed dataset that could replace the previous active dataset
            let newActiveDataset: PeptideContainer = null;

            for (let current of store.getters.selectedDatasets) {
                if (current.progress === 1) {
                    newActiveDataset = current;
                }
            }

            store.commit('SET_ACTIVE_DATASET', newActiveDataset);
        }
    },
    deleteDataset(store: ActionContext<GlobalState, any>, dataset: PeptideContainer) {
        store.dispatch('deselectDataset', dataset);
        let datasetManager: DatasetManager = new DatasetManager();
        datasetManager.deleteDatasetFromStorage(dataset).then(() => store.commit('REMOVE_STORED_DATASET', dataset));
    },
    clearSelectedDatasets(store: ActionContext<GlobalState, any>) {
        store.commit('CLEAR_SELECTED_DATASETS');
        store.commit('SET_ACTIVE_DATASET', null);
    },
    addStoredDataset(store: ActionContext<GlobalState, any>, dataset: PeptideContainer) {
        store.commit('ADD_STORED_DATASET', dataset);
    },
    /**
     * Load all datasets stored in the browser's local storage and update the current Vuex's store accordingly.
     */
    loadStoredDatasets(store: ActionContext<GlobalState, any>) {
        let datasetManager: DatasetManager = new DatasetManager();

        datasetManager.listDatasets()
            .then((values) => {
                store.commit('ADD_STORED_DATASET_BATCH', values);
            });
    },
    setAnalysis(store: ActionContext<GlobalState, any>, isAnalysing: boolean) {
        store.commit('SET_ANALYSIS', isAnalysing);
    },
    setSearchSettings(store: ActionContext<GlobalState, any>, searchSettings: MPAConfig): void {
        store.commit('SET_SEARCH_SETTINGS', searchSettings);
    },
    setActiveDataset(store: ActionContext<GlobalState, any>, dataset: PeptideContainer | null): void {
        store.commit('SET_ACTIVE_DATASET', dataset);
        if (dataset !== null) {
            store.dispatch('setSelectedTerm', 'Organism');
            store.dispatch('setSelectedTaxonId', -1);
            dataset.getDataset().dataRepository.createTaxaDataSource().then((taxaDataSource) => {
                Promise.all([
                    taxaDataSource.getAmountOfMatchedPeptides(),
                    taxaDataSource.getAmountOfSearchedPeptides(),
                    taxaDataSource.getMissedPeptides()
                ]).then((result) => {
                    store.commit('SET_MATCHED_PEPTIDES', result[0]);
                    store.commit('SET_SEARCHED_PEPTIDES', result[1]);
                    store.commit('SET_MISSED_PEPTIDES', result[2]);
                })
            });
        }
    
    },
    processDataset(store: ActionContext<GlobalState, any>, dataset: PeptideContainer): void {
        let mpaManager = new MpaAnalysisManager();
        mpaManager.processDataset(dataset, store.getters.searchSettings)
        .then(() => {
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
