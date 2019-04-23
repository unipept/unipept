<template>
    <v-app>
        <mpa-home v-if="!this.$store.getters.isAnalysis"></mpa-home>
        <mpa-analysis v-else></mpa-analysis>
    </v-app>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import MpaHome from "./mpa-home.vue";
    import MpaAnalysis from "./mpa-analysis.vue";

    @Component({
        components: {MpaAnalysis, MpaHome}
    })
    export default class Mpa extends Vue {
    };
</script>

<style scoped>

</style>
