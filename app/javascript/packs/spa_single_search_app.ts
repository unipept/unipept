/**
 * Single Peptide Analysis app search entrypoint. This entrypoint provides the user with a searchbar to look up a
 * specific tryptic peptide.
 */

import Vue from "vue";
import SingleSearch from "../../assets/javascripts/spa/components/SingleSearch.vue";
import "unipept-visualizations/dist/unipept-visualizations.es5.js";
import fullscreen from "vue-fullscreen";
import vuetify from "unipept-web-components/src/plugins/vuetify";

Vue.use(fullscreen);

document.addEventListener("DOMContentLoaded", () => {
    const app = new Vue({
        el: "#spa-app",
        components: { SingleSearch },
        // @ts-ignore
        vuetify: vuetify
    })
});
