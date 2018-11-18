import NewPeptideContainer from "../NewPeptideContainer";
import {ActionContext, ActionTree, GetterTree, MutationTree, StoreOptions} from "vuex";
import NewDatasetManager from "../NewDatasetManager";
import {StorageType} from "../StorageType";
import Vuex from "vuex";

export interface MpaState {
    selectedDatasets: NewPeptideContainer[],
    storedDatasets: NewPeptideContainer[]
}

export const mpaState: MpaState = {
    storedDatasets: [],
    selectedDatasets: []
};

export const mpaGetters: GetterTree<MpaState, any> = {
    selectedDatasets(state: MpaState): NewPeptideContainer[] {
        return state.selectedDatasets;
    },
    storedDatasets(state: MpaState): NewPeptideContainer[] {
        return state.storedDatasets;
    }
};

export const mpaMutations: MutationTree<MpaState> = {
    SELECT_DATASET(state: MpaState, dataset: NewPeptideContainer) {
        state.selectedDatasets.push(dataset);
    },
    ADD_STORED_DATASET(state: MpaState, dataset: NewPeptideContainer) {
        state.storedDatasets.push(dataset);
    },
    ADD_STORED_DATASET_BATCH(state: MpaState, datasets: NewPeptideContainer[]) {
        state.storedDatasets.push(...datasets);
        console.log(state.storedDatasets);
    }
};

export const mpaActions: ActionTree<MpaState, any> = {
    selectDataset(store: ActionContext<MpaState, any>, dataset: NewPeptideContainer) {
        store.commit('SELECT_DATASET', dataset);
    },
    addStoredDataset(store: ActionContext<MpaState, any>, dataset: NewPeptideContainer) {
        store.commit('ADD_STORED_DATASET', dataset);
    },
    /**
     * Load all datasets stored in the browser's local storage and update the current Vuex's store accordingly.
     */
    loadStoredDatasets(store: ActionContext<MpaState, any>) {
        let localStorageManager: NewDatasetManager = new NewDatasetManager();
        let sessionStorageManager: NewDatasetManager = new NewDatasetManager(StorageType.SessionStorage);

        Promise.all([localStorageManager.listDatasets(), sessionStorageManager.listDatasets()])
            .then((values) => {
                let datasets: NewPeptideContainer[] = values[0].concat(values[1]);
                store.commit('ADD_STORED_DATASET_BATCH', datasets);
            })
    }
};

