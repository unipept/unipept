<template>
    <div class="row">
        <div class="col-md-6">
            <select-datasets-card></select-datasets-card>
        </div>
        <div class="col-md-6">
            <input type="text" v-model="data"/>
            <validated-textfield name="blub" label="blub" v-model="data"></validated-textfield>
            <simple-button label="change data" @click="changeData()"></simple-button>
            <load-datasets-card></load-datasets-card>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import LoadDatasetsCard from "./load-datasets-card";
    import SelectDatasetsCard from "./select-datasets-card";
    import ValidatedTextfield from "../../components/input/validated-textfield";
    import SimpleButton from "../../components/button/simple-button";

    @Component({
        components: {SimpleButton, ValidatedTextfield, LoadDatasetsCard, SelectDatasetsCard}
    })
    export default class Mpa extends Vue {
        data: string = "";

        changeData() {
            this.data = Math.random().toString();
        }
    };
</script>

<style scoped>

</style>
