import Vue from 'vue'
import Vuex from 'vuex'
import VueClipboard from 'vue-clipboard2'
import App from '../../assets/javascripts/mpa/components/App.vue';
import {GlobalStore} from "unipept-web-components/src/state/GlobalStore";
import {AnalysisStore} from "unipept-web-components/src/state/AnalysisStore";
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
        global: GlobalStore,
        analysis: AnalysisStore
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const app = new Vue({
        el: '#mpa-app',
        components: { App },
        store,
        created: function() {
            this.$store.dispatch('loadStoredDatasets')
        }
    })
});
