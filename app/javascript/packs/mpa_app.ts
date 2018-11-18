import Vue from 'vue/dist/vue.esm'
import Vuex from 'vuex'
import Mpa from '../../assets/javascripts/mpa/ui/mpa.vue'
import NewPeptideContainer from "../../assets/javascripts/mpa/NewPeptideContainer";
import NewDatasetManager from "../../assets/javascripts/mpa/NewDatasetManager";
import {StorageType} from "../../assets/javascripts/mpa/StorageType";

Vue.use(Vuex);

// const mpaState = {
//     storedDatasets: [],
//     selectedDatasets: []
// };
//
// const mpaGetters = {
//     selectedDatasets(state) {
//         return state.selectedDatasets;
//     },
//     storedDatasets(state) {
//         return state.storedDatasets;
//     }
// };
//
// const mpaMutations = {
//     SELECT_DATASET(state, dataset) {
//         state.selectedDatasets.push(dataset);
//     },
//     ADD_STORED_DATASET(state, dataset) {
//         state.storedDatasets.push(dataset);
//     },
//     ADD_STORED_DATASET_BATCH(state, datasets) {
//         state.storedDatasets.push(...datasets);
//     }
// };
//
// const mpaActions = {
//     selectDataset(store, dataset) {
//         store.commit('SELECT_DATASET', dataset);
//     },
//     addStoredDataset(store, dataset) {
//         store.commit('ADD_STORED_DATASET', dataset);
//     },
//     /**
//      * Load all datasets stored in the browser's local storage and update the current Vuex's store accordingly.
//      */
//     loadStoredDatasets(store) {
//         let localStorageManager: NewDatasetManager = new NewDatasetManager();
//         let sessionStorageManager: NewDatasetManager = new NewDatasetManager(StorageType.SessionStorage);
//
//         Promise.all([localStorageManager.listDatasets(), sessionStorageManager.listDatasets()])
//             .then((values) => {
//                 let datasets: NewPeptideContainer[] = values[0].concat(values[1]);
//                 store.commit('ADD_STORED_DATASET_BATCH', datasets);
//             })
//     }
// };
//
// const store = new Vuex.Store({
//     state: mpaState,
//     getters: mpaGetters,
//     mutations: mpaMutations,
//     actions: mpaActions
// });

const store = new Vuex.Store({
    state: {},
    getters: {},
    mutations: {},
    actions: {}
});

document.addEventListener('DOMContentLoaded', () => {
    const app = new Vue({
        el: '#mpa-app',
        components: { Mpa },
        store,
        created: function() {
            console.log(this.$store);
            console.log(this);
            // this.$store.dispatch('loadStoredDatasets')
        }
    })
});
