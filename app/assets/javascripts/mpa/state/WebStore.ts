import { GetterTree, MutationTree, ActionTree, ActionContext } from "vuex";
import {
    ProteomicsAssay,
    SearchConfiguration,
    Ontology,
    NcbiId,
    NcbiTaxon
} from "unipept-web-components";

/**
 * This store keeps track of the state that's specifically required for the Unipept web application.
 */
export interface WebState {
    // Which assay are stored in this browser's local storage?
    storedAssays: ProteomicsAssay[],
    searchConfiguration: SearchConfiguration
}

const storageState: WebState = {
    storedAssays: [],
    searchConfiguration: new SearchConfiguration()
};

const storageGetters: GetterTree<WebState, any> = {
    storedAssays(state: WebState): ProteomicsAssay[] {
        return state.storedAssays;
    },
    searchConfiguration(state: WebState): SearchConfiguration {
        return state.searchConfiguration;
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


const storageMutations: MutationTree<WebState> = {
    /**
     * Add a previously stored assay to the list of stored datasets. Note that this mutation does not persistently store
     * the assay itself. This is the responsibility of the caller. The new assay will be added to the end of the list.
     *
     * @param state Instance of the StorageState to which the given assay should be added.
     * @param assay The assay that should be added to the list of stored assays. This assay will not be persistently
     * stored by this function, it will only be marked as stored.
     */
    ADD_STORED_ASSAY(state: WebState, assay: ProteomicsAssay) {
        const idx: number = findAssayIndex(assay, state.storedAssays);

        if (idx === -1) {
            state.storedAssays.push(assay);
        }
    },
    SET_SEARCH_CONFIGURATION(state: WebState, config: SearchConfiguration) {
        state.searchConfiguration = config;
    },
    REMOVE_STORED_ASSAY(state: WebState, assay: ProteomicsAssay) {
        const idx: number = findAssayIndex(assay, state.storedAssays);

        if (idx !== -1) {
            state.storedAssays.splice(idx, 1);
        }
    }
}

const storageActions: ActionTree<WebState, any> = {
    addStoredAssay(store: ActionContext<WebState, any>, assay: ProteomicsAssay) {
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
    async removeStoredAssay(store: ActionContext<WebState, any>, assay: ProteomicsAssay) {
        await store.dispatch("removeAssay", assay);
        store.commit("REMOVE_STORED_ASSAY", assay);
    },

    setSearchConfiguration(store: ActionContext<WebState, any>, config: SearchConfiguration) {
        store.commit("SET_SEARCH_CONFIGURATION", config);
    },

    lcaOntologyProcessed(store: ActionContext<WebState, any>, [assay, ontology]: [ProteomicsAssay, Ontology<NcbiId, NcbiTaxon>]) {}
};

export const webStore = {
    state: storageState,
    mutations: storageMutations,
    getters: storageGetters,
    actions: storageActions
}
