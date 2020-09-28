/**
 * MetaProteomics Analysis app entrypoint. This app appears under the "Metaproteomics Analysis"-tab on the Unipept
 * web app.
 */

import vuetify from "unipept-web-components/src/plugins/vuetify";

import {
    createAssayStore,
    AssayState,
    lcaOntologyStore,
    FilterStore,
    ConfigurationStore,
    CountTable,
    Peptide,
    EcCountTableProcessor,
    GoCountTableProcessor,
    InterproCountTableProcessor,
    SearchConfiguration,
    CommunicationSource,
    ProteomicsAssay,
    EcOntologyProcessor,
    GoOntologyProcessor,
    InterproOntologyProcessor,
    ProgressListener,
    FunctionalOntologyStoreFactory
} from "unipept-web-components";

import Vue from "vue";
import Vuex, { ActionContext } from "vuex";
import fullscreen from "vue-fullscreen";
import VueRouter from "vue-router";

import App from "../../assets/javascripts/mpa/components/App.vue";

import "unipept-visualizations/dist/unipept-visualizations.es5.js";
import WebAssayProcessor from "../../assets/javascripts/mpa/logic/processor/WebAssayProcessor";
import { webStore } from "../../assets/javascripts/mpa/state/WebStore";

Vue.use(VueRouter);
Vue.use(fullscreen);
Vue.use(Vuex);

const functionalStoreFactory = new FunctionalOntologyStoreFactory();
const ecStore = functionalStoreFactory.createOntologyStore(
    (
        x: CountTable<Peptide>,
        configuration: SearchConfiguration,
        communicationSource: CommunicationSource
    ) => new EcCountTableProcessor(x, configuration, communicationSource),
    (communicationSource: CommunicationSource) => new EcOntologyProcessor(communicationSource)
);
const goStore = functionalStoreFactory.createOntologyStore(
    (
        x: CountTable<Peptide>,
        configuration: SearchConfiguration,
        communicationSource: CommunicationSource
    ) => new GoCountTableProcessor(x, configuration, communicationSource),
    (communicationSource: CommunicationSource) => new GoOntologyProcessor(communicationSource)
);
const iprStore = functionalStoreFactory.createOntologyStore(
    (
        x: CountTable<Peptide>,
        configuration: SearchConfiguration,
        communicationSource: CommunicationSource
    ) => new InterproCountTableProcessor(x, configuration, communicationSource),
    (communicationSource: CommunicationSource) => new InterproOntologyProcessor(communicationSource)
);

const assayStore = createAssayStore((
    store: ActionContext<AssayState, any>,
    assay: ProteomicsAssay,
    progressListener: ProgressListener
) => {
    return new WebAssayProcessor(assay, progressListener);
});


const store = new Vuex.Store({
    modules: {
        assay: assayStore,
        storage: webStore,
        filter: FilterStore,
        configuration: ConfigurationStore,
        ec: ecStore,
        go: goStore,
        interpro: iprStore,
        ncbi: lcaOntologyStore
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const app = new Vue({
        el: "#mpa-app",
        components: { App },
        store: store,
        // @ts-ignore
        vuetify: vuetify
    });
});
