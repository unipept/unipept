<template>
    <div>
        <single-peptide-summary
            class="my-5"
            :assay="analysisStore.assay"
            :toggle-fullcreen="toggle"
            go-link
            ec-link
            interpro-link
            @go-link-clicked="() => onGoClicked($router)"
            @ec-link-clicked="() => onEcClicked($router)"
            @interpro-link-clicked="() => onInterproClicked($router)"
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
import { defineProps, ref } from 'vue';
import { SinglePeptideSummary, SinglePeptideAnalysis } from 'unipept-web-components';
import { useSingleAnalysis } from '@/stores';
import { useFullscreen } from '@vueuse/core';
import { Router } from "vue-router";

export interface Props {
    peptide: string
    equateIl: boolean
}

const { peptide, equateIl } = defineProps<Props>();

const analysisStore = useSingleAnalysis();

const { toggle } = useFullscreen();

const currentTab = ref<string>("matched-proteins");

analysisStore.analyse(peptide, equateIl);

const onGoClicked = (router: Router) => {
    currentTab.value = "go-terms";
    // https://github.com/vuejs/vue-router/issues/2881#issuecomment-520554378
    router.push({ path: '#Analysis' }).catch(() => {});
}

const onEcClicked = (router: Router) => {
    currentTab.value = "ec-numbers";
    // https://github.com/vuejs/vue-router/issues/2881#issuecomment-520554378
    router.push({ path: '#Analysis' }).catch(() => {});
}

const onInterproClicked = (router: Router) => {
    currentTab.value = "interpro";
    // https://github.com/vuejs/vue-router/issues/2881#issuecomment-520554378
    router.push({ path: '#Analysis' }).catch(() => {});
}
</script>
