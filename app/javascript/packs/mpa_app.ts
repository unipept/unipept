import Vue from 'vue'
import Vuex from 'vuex'
import Mpa from '../../assets/javascripts/mpa/ui/mpa.vue'
import {mpaActions, mpaGetters, mpaMutations, mpaState} from "../../assets/javascripts/mpa/ui/MpaStore";

Vue.use(Vuex);

const store = new Vuex.Store({
    state: mpaState,
    getters: mpaGetters,
    mutations: mpaMutations,
    actions: mpaActions
});

document.addEventListener('DOMContentLoaded', () => {
    const app = new Vue({
        el: '#mpa-app',
        components: { Mpa },
        store,
        created: function() {
            this.$store.dispatch('loadStoredDatasets')
        }
    })
});
