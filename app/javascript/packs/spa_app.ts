/**
 * Single Peptide Analysis app entrypoint. This app appears under the "Tryptic Peptide Analysis" tab in the Unipept
 * web application.
 */

import Vue from 'vue'
import Vuex from 'vuex'
import App from "../../assets/javascripts/spa/components/App.vue";
import "unipept-visualizations/dist/unipept-visualizations.es5.js";
import fullscreen from 'vue-fullscreen';
import vuetify from 'unipept-web-components/src/plugins/vuetify';
import VueRouter from 'vue-router';

Vue.use(VueRouter);
Vue.use(fullscreen);

document.addEventListener('DOMContentLoaded', () => {
    const app = new Vue({
        el: '#spa-app',
        components: { App },
        // @ts-ignore
        vuetify: vuetify
    })
});
