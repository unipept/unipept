<template>
    <v-card
        elevation="2"
        variant="flat"
    >
        <v-card-title>
            <h2>Quick analysis</h2>
        </v-card-title>
        <v-card-text>
            <p>
                Analyze your peptides quickly. Just paste your peptides in the box below and click analyze.
            </p>
            <v-textarea
                v-model="rawPeptides"
                label="Peptides"
                class="mt-3"
                variant="outlined"
                density="compact"
                counter
                hide-details
                no-resize
            />
            <v-checkbox
                v-model="config.equate"
                class="mt-3"
                color="primary"
                label="Equate I and L"
                density="compact"
                hide-details
                readonly
            />
            <v-checkbox
                v-model="config.filter"
                color="primary"
                label="Filter duplicate peptides"
                density="compact"
                hide-details
                readonly
            />
            <v-checkbox
                v-model="config.missed"
                color="primary"
                label="Enable missed cleavages"
                density="compact"
                hide-details
                disabled

            />
            <database-select
                v-model="config.database"
                class="mt-1"
                label="Selected database"
            />
            <v-btn
                color="primary"
                text="Analyze"
                @click="analyze"
            />
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import DatabaseSelect from "@/components/new/database/DatabaseSelect.vue";
import {ref} from "vue";
import {AnalysisConfig} from "@/components/pages/TestPage.vue";

const emits = defineEmits<{
    analyze: (rawPeptides: string, config: AnalysisConfig) => void
}>();

const rawPeptides = ref("");
const config = ref<AnalysisConfig>({
    equate: true,
    filter: true,
    missed: true,
    database: "UniProtKB"
});

const analyze = () => {
    emits("analyze", rawPeptides.value, config.value);
};
</script>

<style scoped>

</style>
