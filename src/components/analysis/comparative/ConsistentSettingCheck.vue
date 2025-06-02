<template>
    <div class="mt-1 d-flex align-center">
        <v-icon
            class="ms-1 me-1"
            :icon="uniqueCheckValues.size < 2 ? 'mdi-checkbox-multiple-marked-circle' : 'mdi-alert-circle'"
            :color="uniqueCheckValues.size < 2 ? 'success' : 'warning'"
        />
        <span v-if="uniqueCheckValues.size < 2">
            <span class="font-weight-bold">&quot;{{ checkName }}&quot;</span> setting is consistent (<span class="font-weight-bold">{{ uniqueCheckValues.values().next().value }}</span>)
        </span>
        <span v-else>
            <span class="font-weight-bold">&quot;{{ checkName }}&quot;</span> setting is inconsistent over selected samples
        </span>
    </div>
</template>

<script setup lang="ts">
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import {computed, ComputedRef} from "vue";

const { selectedAnalyses, checkTest, checkName } = defineProps<{
    selectedAnalyses: SingleAnalysisStore[],
    checkTest: (s: SingleAnalysisStore) => any,
    checkName: string,
}>();

const uniqueCheckValues: ComputedRef<Set<string>> = computed(() => {
    if (!selectedAnalyses || selectedAnalyses.length == 0) {
        return new Set();
    }

    return new Set(selectedAnalyses.map(s => checkTest(s).toString()));
});
</script>

<style scoped>

</style>