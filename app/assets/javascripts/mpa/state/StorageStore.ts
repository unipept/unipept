import { GetterTree, MutationTree, ActionTree, ActionContext } from "vuex";
import ProteomicsAssay from "unipept-web-components/src/business/entities/assay/ProteomicsAssay";
import SearchConfiguration from "unipept-web-components/src/business/configuration/SearchConfiguration";
import PeptideCountTableProcessor from "unipept-web-components/src/business/processors/raw/PeptideCountTableProcessor";
import Pept2DataCommunicator from "unipept-web-components/src/business/communication/peptides/Pept2DataCommunicator";
import { CountTable } from "unipept-web-components/src/business/counts/CountTable";
import { Peptide } from "unipept-web-components/src/business/ontology/raw/Peptide";

type ProgressState = {
    progress: number,
    countTable: CountTable<Peptide>,
    errorStatus: Error,
    assay: ProteomicsAssay
};

/**
 * The AssayState keeps track of which assays are currently selected by the user for analysis, and which assays are
 * present in the browser's local storage. This store guarantees that the initial objects set in this state will only
 * be modified and will not be replaced by different objects (which might break Vue reactivity).
 */
export interface StorageState {
    selectedAssays: ProteomicsAssay[],
    activeAssay: ProteomicsAssay,
    searchConfiguration: SearchConfiguration,
    // Which assay are stored in this browser's local storage?
    storedAssays: ProteomicsAssay[],
    // Unfortunately this needs to be an array as changes to an object or map are not tracked by Vue's reactivity
    // system.
    progressStates: ProgressState[],
    inProgress: boolean
}

const storageState: StorageState = {
    selectedAssays: [],
    activeAssay: null,
    searchConfiguration: new SearchConfiguration(),
    storedAssays: [],
    progressStates: [],
    inProgress: false
};

const storageGetters: GetterTree<StorageState, any> = {
    getAssays(state: StorageState): ProteomicsAssay[] {
        return state.selectedAssays;
    },
    getStoredAssays(state: StorageState): ProteomicsAssay[] {
        return state.storedAssays
    },
    getActiveAssay(state: StorageState): ProteomicsAssay {
        return state.activeAssay;
    },
    getProgressStatesMap(state: StorageState): {} {
        return state.progressStates;
    },
    getSearchConfiguration(state: StorageState): SearchConfiguration {
        return state.searchConfiguration;
    },
    isInProgress(state: StorageState): boolean {
        return state.inProgress;
    }
}

/**
 * Find the index of an assay in the given list. Assay identity is based on ID. Assays with equal ID's are considered
 * to be equal.
 *
 * @param item The item for which it's position in the given list should be found.
 * @param list The list in which we look for the index of the given assay.
 * @return Position of the given item, in the given list. -1 if the item was not found.
 */
const findAssayIndex = function(item: ProteomicsAssay, list: ProteomicsAssay[]): number {
    if (!item) {
        return -1;
    }

    return list.findIndex((value: ProteomicsAssay) => value.getId() === item.getId() || value.getName() === item.getName());
}


const storageMutations: MutationTree<StorageState> = {
    /**
     * Add an assay to the list of selected assays. Assays will only be added if no assay with the same ID is already
     * selected. The given assay will always be added to the end of the selected assay list.
     *
     * @param state Instance of the AssayState to which the given assay should be added.
     * @param assay The assay that should be added to the selection.
     */
    SELECT_ASSAY(state: StorageState, assay: ProteomicsAssay) {
        const idx: number = findAssayIndex(assay, state.selectedAssays);

        // The new assay will only be selected if no assay with the same ID has already been selected.
        if (idx === -1) {
            state.selectedAssays.push(assay);
        }
    },

    /**
     * Remove an assay from the list of selected assays. No error is thrown when a non-existant assay is being removed.
     *
     * @param state Instance of the AssayState from which the given assay should be removed.
     * @param assay The assay that should be removed from the selection.
     */
    DESELECT_ASSAY(state: StorageState, assay: ProteomicsAssay) {
        const idx: number = findAssayIndex(assay, state.selectedAssays);

        // Assay will only be removed when it is found in the list of selected items.
        if (idx !== -1) {
            state.selectedAssays.splice(idx, 1);
        }
    },

    /**
     * Add a previously stored assay to the list of stored datasets. Note that this mutation does not persistently store
     * the assay itself. This is the responsibility of the caller. The new assay will be added to the end of the list.
     *
     * @param state Instance of the StorageState to which the given assay should be added.
     * @param assay The assay that should be added to the list of stored assays. This assay will not be persistently
     * stored by this function, it will only be marked as stored.
     */
    ADD_STORED_ASSAY(state: StorageState, assay: ProteomicsAssay) {
        const idx: number = findAssayIndex(assay, state.storedAssays);

        if (idx === -1) {
            state.storedAssays.push(assay);
        }
    },

    /**
     * Remove the given assay from the list of stored assays.
     *
     * @param state Instance of the StorageState from which the assay should be removed.
     * @param assay The assay that should be removed from the list of stored assays.
     */
    REMOVE_STORED_ASSAY(state: StorageState, assay: ProteomicsAssay) {
        const idx: number = findAssayIndex(assay, state.storedAssays);

        if (idx !== -1) {
            state.storedAssays.splice(idx, 1);
        }
    },

    /**
     * Set the given assay to be the currently active one. This mutation does not perform any additional checks. Assays
     * previously set to be active, will no longer be marked as active.
     *
     * @param state The state for which the active assay should be updated.
     * @param newActive The assay that should be marked as active. Pass null to select no assay.
     */
    SET_ACTIVE_ASSAY(state: StorageState, newActive: ProteomicsAssay) {
        state.activeAssay = newActive;
    },

    ADD_PROGRESS_STATE(state: StorageState, progress: ProgressState) {
        state.progressStates.push(progress);
    },

    REMOVE_PROGRESS_STATE(state: StorageState, assay: ProteomicsAssay) {
        const idx: number = state.progressStates.findIndex(p => p.assay.getId() === assay.getId());
        if (idx >= 0) {
            state.progressStates.splice(idx, 1);
        }
    },

    SET_SEARCH_CONFIGURATION(state: StorageState, config: SearchConfiguration) {
        state.searchConfiguration = config;
    },

    UPDATE_PROGRESS(state: StorageState, progress: boolean) {
        state.inProgress = state.progressStates.some(p => p.progress < 1);
    }
}

const storageActions: ActionTree<StorageState, any> = {
    addStoredAssay(store: ActionContext<StorageState, any>, assay: ProteomicsAssay) {
        store.commit("ADD_STORED_ASSAY", assay);
    },

    /**
     * Remove an assay from the list of stored assays. If the assay was also selected for analysis, it will also be
     * removed from the analysis. This action does not persistently store the assay itself, that is the responsibility
     * of the caller.
     *
     * @param store Instance of the store to which a new stored assay should be added.
     * @param assay The assay that should be added to the list of stored assays.
     */
    async removeStoredAssay(store: ActionContext<StorageState, any>, assay: ProteomicsAssay) {
        await store.dispatch("removeAssay", assay);
        store.commit("REMOVE_STORED_ASSAY", assay);
    },

    addAssay(store: ActionContext<StorageState, any>, assay: ProteomicsAssay) {
        assay.setSearchConfiguration(store.getters.getSearchConfiguration);
        if (store.getters.getProgressStatesMap.findIndex(p => p.assay.getId() === assay.getId()) === -1) {
            this.commit("ADD_PROGRESS_STATE", {
                progress: 0,
                countTable: undefined,
                errorStatus: undefined,
                assay: assay
            });
        }
        store.commit("SELECT_ASSAY", assay);
    },

    async removeAssay(store: ActionContext<StorageState, any>, assay: ProteomicsAssay) {
        store.commit("DESELECT_ASSAY", assay);
        store.commit("REMOVE_PROGRESS_STATE", assay);
        await store.dispatch("resetActiveAssay");
    },

    setActiveAssay(store: ActionContext<StorageState, any>, assay: ProteomicsAssay) {
        store.commit("SET_ACTIVE_ASSAY", assay);
    },

    setSearchConfiguration(store: ActionContext<StorageState, any>, config: SearchConfiguration) {
        for (const assay of store.getters.getAssays) {
            assay.setSearchConfiguration(config);
        }
        store.commit("SET_SEARCH_CONFIGURATION", config);
    },

    /**
     * Start the analysis for the given assay. If this assay finishes, and no active assay has been selected at that
     * point, this assay will be set to be the active one.
     *
     * @param store The store for which we are currently processing
     * @param assay
     */
    async processAssay(store: ActionContext<StorageState, any>, assay: ProteomicsAssay) {
        // First read all peptides from storage for this assay, and then process the assay.
        if (store.getters.getProgressStatesMap.findIndex(p => p.assay.getId() === assay.getId()) === -1) {
            this.commit("ADD_PROGRESS_STATE", {
                progress: 0,
                countTable: undefined,
                errorStatus: undefined,
                assay: assay
            });
        }
        const processedItem = store.getters.getProgressStatesMap.find(p => p.assay.getId() === assay.getId());

        processedItem.progress = 0;
        store.commit("UPDATE_PROGRESS");
        processedItem.errorStatus = undefined;
        processedItem.countTable = undefined;

        const countTableProcessor = new PeptideCountTableProcessor();
        const countTable = await countTableProcessor.getPeptideCountTable(
            assay.getPeptides(),
            store.getters.getSearchConfiguration
        );

        try {
            await Pept2DataCommunicator.process(countTable, store.getters.getSearchConfiguration, {
                onProgressUpdate: (progress: number) => processedItem.progress = progress
            });
        } catch (err) {
            processedItem.errorStatus = err;
        }

        processedItem.countTable = countTable;
        store.commit("UPDATE_PROGRESS");
        await store.dispatch("resetActiveAssay");
    },

    async updateSearchSettings(store: ActionContext<StorageState, any>, settings: MPAConfig) {
        store.commit("SET_SEARCH_SETTINGS", settings);
        store.commit("SET_ACTIVE_ASSAY", null);

        // Reprocess all currently selected assays.
        for (const assay of store.getters.getAssays) {
            await store.dispatch("processAssay", assay);
        }
    },

    /**
     * Sets the first fully processed assay to be the active one, only if no active assay is currently set. This
     * action checks whether the currently active assay is indeed a member of the selected assays. If not, another one
     * will be elected to be the active assay.
     *
     * @param store Instance of the store for which the active dataset should be reset.
     */
    resetActiveAssay(store: ActionContext<StorageState, any>) {
        let shouldReselect: boolean = true;
        if (!store.getters.getActiveAssay) {
            const idx: number = findAssayIndex(store.getters.getActiveAssay, store.getters.getAssays);
            shouldReselect = idx === -1;
        }

        if (shouldReselect) {
            let newActive: ProteomicsAssay = null;
            for (let current of (store.getters.getAssays as ProteomicsAssay[])) {
                if (store.getters.getProgressStatesMap.find(p => p.assay.getId() === current.getId()).progress === 1) {
                    newActive = current;
                    break;
                }
            }

            store.commit("SET_ACTIVE_ASSAY", newActive);
        }
    },
};

export const StorageStore = {
    state: storageState,
    mutations: storageMutations,
    getters: storageGetters,
    actions: storageActions
}
