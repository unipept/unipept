import Assay from "unipept-web-components/src/logic/data-management/assay/Assay";
import { GetterTree, MutationTree, ActionTree, ActionContext } from "vuex";
import MpaAnalysisManager from "unipept-web-components/src/logic/data-management/MpaAnalysisManager";
import MPAConfig from "unipept-web-components/src/logic/data-management/MPAConfig";
import BrowserStorageDataReader from "unipept-web-components/src/logic/data-management/assay/browser/BrowserStorageDataReader";
import AssayVisitor from "unipept-web-components/src/logic/data-management/assay/AssayVisitor";

/**
 * The AssayState keeps track of which assays are currently selected by the user for analysis, and which assays are
 * present in the browser's local storage. This store guarantees that the initial objects set in this state will only
 * be modified and will not be replaced by different objects (which might break Vue reactivity).
 */
export interface AssayState {
    // Which assays are currently selected by the user for analysis?
    selectedAssays: Assay[],
    // Which assay are stored in this browser's local storage?
    storedAssays: Assay[],
    // Did the user already start with the analysis of the samples?
    analysisStarted: boolean,
    // The assay that's currently set to be active. Null when no assay is currently set to be active.
    activeAssay: Assay,
    // What settings did the user choose to perform analysis?
    searchSettings: MPAConfig
}

const assayState: AssayState = {
    selectedAssays: [],
    storedAssays: [],
    analysisStarted: false,
    activeAssay: null,
    searchSettings: {
        il: true,
        dupes: true,
        missed: false,
    },
};

const assayGetters: GetterTree<AssayState, any> = {
    getSelectedAssays(state: AssayState): Assay[] {
        return state.selectedAssays;
    },
    getStoredAssays(state: AssayState): Assay[] {
        return state.storedAssays
    },
    isAnalysisStarted(state: AssayState): boolean {
        return state.analysisStarted;
    },
    getActiveAssay(state: AssayState): Assay {
        return state.activeAssay;
    },
    getSearchSettings(state: AssayState): MPAConfig {
        return state.searchSettings;
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
const findAssayIndex = function(item: Assay, list: Assay[]): number {
    if (!item) {
        return -1;
    }

    return list.findIndex((value: Assay) => value.getId() === item.getId());
}


const assayMutations: MutationTree<AssayState> = {
    /**
     * Add an assay to the list of selected assays. Assays will only be added if no assay with the same ID is already
     * selected. The given assay will always be added to the end of the selected assay list.
     *
     * @param state Instance of the AssayState to which the given assay should be added.
     * @param assay The assay that should be added to the selection.
     */
    SELECT_ASSAY(state: AssayState, assay: Assay) {
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
    DESELECT_ASSAY(state: AssayState, assay: Assay) {
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
     * @param state Instance of the AssayState to which the given assay should be added.
     * @param assay The assay that should be added to the list of stored assays. This assay will not be persistently
     * stored by this function, it will only be marked as stored.
     */
    ADD_STORED_ASSAY(state: AssayState, assay: Assay) {
        const idx: number = findAssayIndex(assay, state.storedAssays);

        if (idx === -1) {
            state.storedAssays.push(assay);
        }
    },

    /**
     * Remove the given assay from the list of stored assays.
     *
     * @param state Instance of the AssayState from which the assay should be removed.
     * @param assay The assay that should be removed from the list of stored assays.
     */
    REMOVE_STORED_ASSAY(state: AssayState, assay: Assay) {
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
    SET_ACTIVE_ASSAY(state: AssayState, newActive: Assay) {
        state.activeAssay = newActive;
    },

    /**
     * Update the currently active search settings for assay analysis. Reprocessing of assays is not handled by this
     * mutation.
     *
     * @param state The state for which the search settings should be updated.
     * @param settings A new set of settings that replace the previously set.
     */
    SET_SEARCH_SETTINGS(state: AssayState, settings: MPAConfig) {
        state.searchSettings = settings;
    }
}

const assayActions: ActionTree<AssayState, any> = {
    selectAssay(store: ActionContext<AssayState, any>, assay: Assay) {
        store.commit("SELECT_ASSAY", assay);
        if (store.getters.isAnalysisStarted) {
            store.dispatch("processDataset", assay);
        }
    },

    deselectAssay(store: ActionContext<AssayState, any>, assay: Assay) {
        store.commit("DESELECT_ASSAY", assay);
        store.dispatch("resetActiveAssay", assay);
    },

    /**
     * Sets the first fully processed assay to be the active one, only if no active assay is currently set. This
     * action checks whether the currently active assay is indeed a member of the selected assays. If not, another one
     * will be elected to be the active assay.
     *
     * @param store Instance of the store for which the active dataset should be reset.
     */
    resetActiveAssay(store: ActionContext<AssayState, any>) {
        let shouldReselect: boolean = true;
        if (!store.getters.activeAssay) {
            const idx: number = findAssayIndex(store.getters.getActiveAssay, store.getters.getSelectedAssays);
            shouldReselect = idx === -1;
        }

        if (shouldReselect) {
            let newActive: Assay = null;
            for (let current of store.getters.getSelectedAssays) {
                if (current.progress == 1) {
                    newActive = current;
                    break;
                }
            }

            store.commit("SET_ACTIVE_ASSAY", newActive);
        }
    },

    addStoredAssay(store: ActionContext<AssayState, any>, assay: Assay) {
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
    removeStoredAssay(store: ActionContext<AssayState, any>, assay: Assay) {
        store.dispatch("deselectAssay", assay);
        store.commit("REMOVE_STORED_ASSAY", assay);
    },

    setActiveAssay(store: ActionContext<AssayState, any>, assay: Assay) {
        store.commit("SET_ACTIVE_ASSAY", assay);
    },

    /**
     * Start the analysis for the given assay. If this assay finishes, and no active assay has been selected at that
     * point, this assay will be set to be the active one.
     *
     * @param store The store for which we are currently processing
     * @param assay
     */
    processAssay(store: ActionContext<AssayState, any>, assay: Assay) {
        // First read all peptides from storage for this assay, and then process the assay.
        const dataReader: AssayVisitor = new BrowserStorageDataReader();
        assay.accept(dataReader).then(() => {
            const mpaManager = new MpaAnalysisManager();

            mpaManager.processDataset(assay, store.getters.searchSettings, store.getters.baseUrl)
                .then(() => {
                    store.dispatch("resetActiveAssay");
                });
        });
    },

    updateSearchSettings(store: ActionContext<AssayState, any>, settings: MPAConfig) {
        store.commit("SET_SEARCH_SETTINGS", settings);
        store.commit("SET_ACTIVE_ASSAY", null);

        // Reprocess all currently selected assays.
        for (const assay of store.getters.getSelectedAssays) {
            store.dispatch("processAssay", assay);
        }
    },
};

export const AssayStore = {
    state: assayState,
    mutations: assayMutations,
    getters: assayGetters,
    actions: assayActions
}
