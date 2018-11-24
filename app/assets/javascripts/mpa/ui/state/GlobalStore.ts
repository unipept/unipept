import NewPeptideContainer from "../../NewPeptideContainer";
import {ActionContext, ActionTree, GetterTree, MutationTree} from "vuex";
import NewDatasetManager from "../../NewDatasetManager";


export interface GlobalState {
    selectedDatasets: NewPeptideContainer[],
    storedDatasets: NewPeptideContainer[],
    analysis: boolean,
    selectedDataset: NewPeptideContainer
}

const mpaState: GlobalState = {
    storedDatasets: [],
    selectedDatasets: [],
    analysis: false,
    selectedDataset: undefined
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
    getSelectedDataset(state: GlobalState): NewPeptideContainer | undefined {
        return state.selectedDataset;
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
    }
};

const mpaActions: ActionTree<GlobalState, any> = {
    selectDataset(store: ActionContext<GlobalState, any>, dataset: NewPeptideContainer) {
        store.commit('SELECT_DATASET', dataset);
    },
    deselectDataset(store: ActionContext<GlobalState, any>, dataset: NewPeptideContainer) {
        store.commit('DESELECT_DATASET', dataset);
    },
    clearSelectedDatasets(store: ActionContext<GlobalState, any>) {
        store.commit('CLEAR_SELECTED_DATASETS');
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
    }
};

export const globalStore = {
    state: mpaState,
    mutations: mpaMutations,
    getters: mpaGetters,
    actions: mpaActions
};


