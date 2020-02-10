import Vue from 'vue'
import Vuex from 'vuex'
import App from '../../assets/javascripts/mpa/components/App.vue'
import {AssayStore} from "../../assets/javascripts/mpa/state/AssayStore";
import {FilterStore} from "unipept-web-components/src/state/FilterStore";
import {ConfigurationStore} from "unipept-web-components/src/state/ConfigurationStore";
import "unipept-visualizations/dist/unipept-visualizations.es5.js";
import fullscreen from 'vue-fullscreen';
import vuetify from 'unipept-web-components/src/plugins/vuetify';
import VueRouter from 'vue-router';


Vue.use(VueRouter);
Vue.use(fullscreen);
Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        assay: AssayStore,
        filter: FilterStore,
        configuration: ConfigurationStore
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const app = new Vue({
        el: '#mpa-app',
        components: { App },
        store: store,
        // @ts-ignore
        vuetify: vuetify
    })
});
