import Assay from "unipept-web-components/src/logic/data-management/assay/Assay";
import { GetterTree, MutationTree, ActionTree, ActionContext } from "vuex";

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
    analysisStarted: boolean
}

const assayState: AssayState = {
    selectedAssays: [],
    storedAssays: [],
    analysisStarted: false
}

const assayGetters: GetterTree<AssayState, any> = {
    getSelectedAssays(state: AssayState): Assay[] {
        return state.selectedAssays;
    },
    getStoredAssays(state: AssayState): Assay[] {
        return state.storedAssays
    },
    isAnalysisStarted(state: AssayState): boolean {
        return state.analysisStarted;
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
        
    }
}
