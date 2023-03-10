<template>
    <div>
        <single-peptide-summary 
            class="my-5" 
            :assay="analysisStore.assay" 
            :toggleFullscreen="toggle" 
            goLink
            ecLink
            interproLink
            @goLinkClicked="() => onGoClicked($router)"
            @ecLinkClicked="() => onEcClicked($router)"
            @interproLinkClicked="() => onInterproClicked($router)"
        />
        <single-peptide-analysis id="Analysis" :assay="analysisStore.assay" :tab="currentTab" @tabUpdate="currentTab = $event" />
    </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
import { SinglePeptideSummary, SinglePeptideAnalysis } from 'unipept-web-components';
import { useSingleAnalysis } from '@/stores';
import { useFullscreen } from '@vueuse/core';
import VueRouter from 'vue-router';

export interface Props {
    peptide: string
    equateIl: boolean
}

const { peptide, equateIl } = defineProps<Props>();

const analysisStore = useSingleAnalysis();

const { toggle } = useFullscreen();

const currentTab = ref<number>(0);

analysisStore.analyse(peptide, equateIl);

const onGoClicked = (router: VueRouter) => {
    currentTab.value = 3;
    // https://github.com/vuejs/vue-router/issues/2881#issuecomment-520554378
    router.push({ path: '#Analysis' }).catch(() => {});
}

const onEcClicked = (router: VueRouter) => {
    currentTab.value = 4;
    // https://github.com/vuejs/vue-router/issues/2881#issuecomment-520554378
    router.push({ path: '#Analysis' }).catch(() => {});
}

const onInterproClicked = (router: VueRouter) => {
    currentTab.value = 5;
    // https://github.com/vuejs/vue-router/issues/2881#issuecomment-520554378
    router.push({ path: '#Analysis' }).catch(() => {});
}
</script>
