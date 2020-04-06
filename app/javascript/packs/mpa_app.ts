/**
 * MetaProteomics Analysis app entrypoint. This app appears under the "Metaproteomics Analysis"-tab on the Unipept
 * web app.
 */

import Vue from 'vue'
import Vuex from 'vuex'
import App from "../../assets/javascripts/mpa/components/App.vue";
import {ConfigurationStore} from "unipept-web-components/src/state/ConfigurationStore";
import {StorageStore} from "./../../assets/javascripts/mpa/state/StorageStore";
import {FilterStore} from "unipept-web-components/src/state/FilterStore";
import "unipept-visualizations/dist/unipept-visualizations.es5.js";
import fullscreen from 'vue-fullscreen';
import vuetify from 'unipept-web-components/src/plugins/vuetify';
import VueRouter from 'vue-router';

Vue.use(VueRouter);
Vue.use(fullscreen);
Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        assay: StorageStore,
        configuration: ConfigurationStore,
        filter: FilterStore
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
