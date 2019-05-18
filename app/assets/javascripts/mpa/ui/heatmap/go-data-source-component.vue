<template>
    <div>
        <v-select :items="Object.values(GoNameSpace)"></v-select>
        
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import {GoNameSpace} from "./../../../fa/GoNameSpace";

    @Component
    export default class GoDataSourceComponent extends Vue {

    }
</script>

<style scoped>
</style>