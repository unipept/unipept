import Vue from 'vue/dist/vue.esm'
import Mpa from '../vue/mpa/mpa.vue'

document.addEventListener('DOMContentLoaded', () => {
    const app = new Vue({
        el: '#mpa-app',
        data: {},
        components: { Mpa }
    })
});
