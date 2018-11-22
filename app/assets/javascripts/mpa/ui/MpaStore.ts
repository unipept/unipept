import NewPeptideContainer from "../NewPeptideContainer";
import {ActionContext, ActionTree, GetterTree, MutationTree} from "vuex";
import NewDatasetManager from "../NewDatasetManager";

export interface MpaState {
    selectedDatasets: NewPeptideContainer[],
    storedDatasets: NewPeptideContainer[],
    analysis: boolean
}

export const mpaState: MpaState = {
    storedDatasets: [],
    selectedDatasets: [],
    analysis: false
};

export const mpaGetters: GetterTree<MpaState, any> = {
    selectedDatasets(state: MpaState): NewPeptideContainer[] {
        return state.selectedDatasets;
    },
    storedDatasets(state: MpaState): NewPeptideContainer[] {
        return state.storedDatasets;
    },
    isAnalysis(state: MpaState): boolean {
        return state.analysis;
    }
};

export const mpaMutations: MutationTree<MpaState> = {
    SELECT_DATASET(state: MpaState, dataset: NewPeptideContainer) {
        let index: number = state.selectedDatasets.findIndex((value: NewPeptideContainer, index: number, arr: NewPeptideContainer[]) => {
            return value.getId() === dataset.getId();
        });

        if (index === -1) {
            state.selectedDatasets.push(dataset);
        }
    },
    DESELECT_DATASET(state: MpaState, dataset: NewPeptideContainer) {
        let index: number = state.selectedDatasets.findIndex((value: NewPeptideContainer, index: number, arr: NewPeptideContainer[]) => {
            return value.getId() === dataset.getId();
        });

        if (index !== -1) {
            state.selectedDatasets.splice(index, 1);
        }
    },
    ADD_STORED_DATASET(state: MpaState, dataset: NewPeptideContainer) {
        state.storedDatasets.push(dataset);
    },
    ADD_STORED_DATASET_BATCH(state: MpaState, datasets: NewPeptideContainer[]) {
        state.storedDatasets.push(...datasets);
    },
    SET_ANALYSIS(state: MpaState, isAnalysing: boolean) {
        state.analysis = isAnalysing;
    }
};

export const mpaActions: ActionTree<MpaState, any> = {
    selectDataset(store: ActionContext<MpaState, any>, dataset: NewPeptideContainer) {
        store.commit('SELECT_DATASET', dataset);
    },
    deselectDataset(store: ActionContext<MpaState, any>, dataset: NewPeptideContainer) {
        store.commit('DESELECT_DATASET', dataset);
    },
    addStoredDataset(store: ActionContext<MpaState, any>, dataset: NewPeptideContainer) {
        store.commit('ADD_STORED_DATASET', dataset);
    },
    /**
     * Load all datasets stored in the browser's local storage and update the current Vuex's store accordingly.
     */
    loadStoredDatasets(store: ActionContext<MpaState, any>) {
        let datasetManager: NewDatasetManager = new NewDatasetManager();

        datasetManager.listDatasets()
            .then((values) => {
                store.commit('ADD_STORED_DATASET_BATCH', values);
            });
    },
    setAnalysis(store: ActionContext<MpaState, any>, isAnalysing: boolean) {
        store.commit('SET_ANALYSIS', isAnalysing);
    }
};

