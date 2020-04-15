/**
 * Single Peptide Analysis results endpoint. Given a peptide and equateIl-setting through the URL, this app will
 * process the given peptide and display all results associated with it.
 */

import Vue from 'vue'
import SingleResults from "../../assets/javascripts/spa/components/SingleResults.vue";
import "unipept-visualizations/dist/unipept-visualizations.es5.js";
import fullscreen from 'vue-fullscreen';
import vuetify from 'unipept-web-components/src/plugins/vuetify';

Vue.use(fullscreen);

document.addEventListener('DOMContentLoaded', () => {
    const app = new Vue({
        el: '#spa-app',
        components: { SingleResults },
        // @ts-ignore
        vuetify: vuetify
    })
});
