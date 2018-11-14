import {MPA} from "../../assets/javascripts/mpa";

window.MPA = MPA;

import Vue from 'vue/dist/vue.esm'
import App from '../vue/mpa/mpa.vue'

document.addEventListener('DOMContentLoaded', () => {
    const app = new Vue({
        el: '#mpa-app',
        data: {},
        components: { App }
    })
});
