import Vue from 'vue'
import Vuex from 'vuex'
import VueClipboard from 'vue-clipboard2'
import Mpa from '../../assets/javascripts/mpa/ui/mpa.vue'
import {globalStore} from "../../assets/javascripts/mpa/ui/state/GlobalStore";
import {analysisStore} from "../../assets/javascripts/mpa/ui/state/AnalysisStore";
import "unipept-visualizations/dist/unipept-visualizations.es5.js";
import Vuetify from "vuetify";
import 'vuetify/dist/vuetify.min.css';

Vue.use(VueClipboard);
Vue.use(Vuex);

Vue.use(Vuetify, {
    theme: {
        primary: "#2196F3",
        accent: "#FFC107"
    }
});

const store = new Vuex.Store({
    modules: {
        global: globalStore,
        analysis: analysisStore
    }
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
