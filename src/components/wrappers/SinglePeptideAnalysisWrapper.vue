<template>
    <div>
        <single-peptide-summary
            class="my-5"
            :assay="analysisStore.assay"
            :toggle-fullcreen="toggle"
            go-link
            ec-link
            interpro-link
            @go-link-clicked="() => onGoClicked()"
            @ec-link-clicked="() => onEcClicked()"
            @interpro-link-clicked="() => onInterproClicked()"
        />
        <single-peptide-analysis
            id="Analysis"
            :assay="analysisStore.assay"
            :tab="currentTab"
            @tab-update="currentTab = $event"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SinglePeptideSummary, SinglePeptideAnalysis } from 'unipept-web-components';
import { useFullscreen } from '@vueuse/core';
import useSingleAnalysis from "@/store/SingleAnalysisStore";
export interface Props {
    peptide: string
    equateIl: boolean
}

const { peptide, equateIl } = defineProps<Props>();

const analysisStore = useSingleAnalysis();

const { toggle } = useFullscreen();

const currentTab = ref<string>("matched-proteins");

analysisStore.analyse(peptide, equateIl);

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
