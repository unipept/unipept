<template>
    <v-container
        v-if="analysisStore.status === AnalysisStatus.Finished"
    >
        <single-peptide-summary
            class="mb-4"
            :assay="analysisStore"
            go-link
            ec-link
            interpro-link
            @go-link-clicked="() => onGoClicked()"
            @ec-link-clicked="() => onEcClicked()"
            @interpro-link-clicked="() => onInterproClicked()"
        />
        <single-peptide-analysis-results-card
            id="Analysis"
            :assay="analysisStore"
            :tab="currentTab"
            @tab-update="currentTab = $event"
        />
    </v-container>
    <v-container v-else-if="analysisStore.status === AnalysisStatus.Failed">
        <v-alert
            variant="tonal"
            type="error"
        >
            <div>
                An error occurred while analysing this peptide. Please try again.
                You can contact us if the issue persists.
            </div>
            <div class="font-weight-bold">
                Error details:
            </div>
            <pre>{{ analysisStore.analysisError }}</pre>
            <v-btn variant="flat" class="float-right" @click="analysisStore.analyse()">
                Reanalyse peptide
            </v-btn>
        </v-alert>
    </v-container>
    <v-container v-else class="d-flex justify-center align-center">
        <v-progress-circular color="primary" indeterminate size="50" />
    </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import usePeptideAnalysisStore from "@/store/PeptideAnalysisStore";
import {AnalysisStatus} from "@/store/AnalysisStatus";
import SinglePeptideAnalysisResultsCard from "@/components/analysis/single/SinglePeptideAnalysisResultsCard.vue";
import SinglePeptideSummary from "@/components/results/SinglePeptideSummary.vue";

export interface Props {
    peptide: string
    equateIl: boolean
}

const { peptide, equateIl } = defineProps<Props>();

const analysisStore = usePeptideAnalysisStore(
    crypto.randomUUID(),
    peptide,
    {
        equate: equateIl,
        filter: false,
        useCrap: false,
        database: ""
    }
);

const currentTab = ref<string>("matched-proteins");

analysisStore.analyse();

const onGoClicked = () => {
    currentTab.value = "go-terms";
}

const onEcClicked = () => {
    currentTab.value = "ec-numbers";
}

const onInterproClicked = () => {
    currentTab.value = "interpro";
}
</script>
