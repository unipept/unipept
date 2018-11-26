<template>
    <card-nav>
        <tab label="GO terms" :active="true">
        </tab>
        <tab label="EC numbers">
        </tab>
    </card-nav>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import CardNav from "../../components/card/card-nav.vue";
    import Tab from "../../components/card/tab.vue";
    @Component({
        components: {Tab, CardNav}
    })
    export default class FunctionalSummaryCard extends Vue {

    }
</script>

<style scoped>

</style>
