<template>
    <v-unipept-card :disabled="disabled">
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
            <div class="d-flex align-center">
                <v-checkbox
                    v-model="config.missed"
                    color="primary"
                    label="Enable missed cleavages"
                    density="compact"
                    hide-details
                    disabled
                />
                <v-tooltip width="30%">
                    <template #activator="{ props: tooltip }">
                        <v-icon
                            v-bind="tooltip"
                            class="ms-1"
                            icon="mdi-information"
                            size="small"
                        />
                    </template>
                    <span>
                        Missed cleavage handling is now always enabled. Because of a change in Unipept's underlying search
                        engine, enabling missed cleavage handling no longer results in a performance penalty. As a result,
                        this configuration option will be removed in a future release.
                    </span>
                </v-tooltip>
            </div>
            <v-btn
                color="primary"
                variant="tonal"
                text="Analyze"
                class="w-100 w-lg-auto float-lg-right mt-2"
                @click="analyze"
            />
        </v-card-text>
    </v-unipept-card>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {AnalysisConfig} from "@/store/AnalysisConfig";

const { disabled = false } = defineProps<{
    disabled?: boolean
}>();

const emits = defineEmits<{
    (e: "analyze", rawPeptides: string, config: AnalysisConfig): void;
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
