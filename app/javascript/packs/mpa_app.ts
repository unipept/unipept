import Vue from 'vue'
import Vuex from 'vuex'
import VueClipboard from 'vue-clipboard2'
import App from '../../assets/javascripts/mpa/components/App.vue'
import {GlobalStore} from "./../../assets/javascripts/web-components/state/GlobalStore";
import {AnalysisStore} from "./../../assets/javascripts/web-components/state/AnalysisStore";
import "unipept-visualizations/dist/unipept-visualizations.es5.js";
import fullscreen from 'vue-fullscreen';
import vuetify from './../../assets/javascripts/web-components/plugins/vuetify';


Vue.use(fullscreen);
Vue.use(VueClipboard);
Vue.use(Vuex);

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
        store: store,
        // @ts-ignore
        vuetify: vuetify,
        created: function() {
            this.$store.dispatch('loadStoredDatasets')
        }
    })
});
