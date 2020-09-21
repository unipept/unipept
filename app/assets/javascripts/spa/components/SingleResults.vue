<template>
    <v-app style="background: transparent;">
        <v-row>
            <v-col :cols="12">
                <single-peptide-summary :peptide="sequence" :equateIl="equateIl"></single-peptide-summary>
                <single-peptide-analysis-card :peptide="sequence" :equateIl="equateIl"></single-peptide-analysis-card>
            </v-col>
        </v-row>
    </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { NetworkConfiguration, SinglePeptideAnalysisCard, SinglePeptideSummary, Peptide } from "unipept-web-components";

@Component({
    components: {
        SinglePeptideSummary,
        SinglePeptideAnalysisCard
    }
})
export default class SingleResults extends Vue {
    private sequence: Peptide = "";
    private equateIl: boolean = true;

    private created() {
        NetworkConfiguration.BASE_URL = "";

        const currentRoute: string = window.location.href;

        this.sequence = currentRoute.match(/sequences\/([^/]*)/)[1];
        this.equateIl = currentRoute.includes("equateIl");
    }
}
</script>

<style scoped>

</style>
