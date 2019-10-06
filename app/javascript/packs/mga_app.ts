import Vue from 'vue'
import Vuex from 'vuex'
import VueClipboard from 'vue-clipboard2'
import Mga from '../../assets/javascripts/mga/ui/mga.vue'
import {globalStore} from "../../assets/javascripts/mpa/ui/state/GlobalStore";
import {analysisStore} from "../../assets/javascripts/mpa/ui/state/AnalysisStore";
import "unipept-visualizations/dist/unipept-visualizations.es5.js";
import Vuetify from "vuetify";
import 'vuetify/dist/vuetify.min.css';
import fullscreen from 'vue-fullscreen';

Vue.use(fullscreen);
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
        el: '#mga-app',
        components: { Mga },
        store,
        created: function() {
            this.$store.dispatch('loadStoredDatasets')
        }
    })
});
