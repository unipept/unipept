import Vue from 'vue/dist/vue.esm'
import Vuex from 'vuex'
import Mpa from '../../assets/javascripts/mpa/ui/mpa.vue'

Vue.use(Vuex);

const store = new Vuex.Store({

});

document.addEventListener('DOMContentLoaded', () => {
    const app = new Vue({
        el: '#mpa-app',
        data: {},
        components: { Mpa }
    })
});
