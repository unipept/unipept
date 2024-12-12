<template>
    <v-card
        variant="elevated"
        elevation="3"
    >
        <v-card-text class="d-flex">
            <div class="flex-grow-1 me-5">
                <v-text-field
                    v-model="sample.name"
                    variant="outlined"
                    density="compact"
                    label="Sample name"
                    :rules="[
                        v => !!v || 'Provide a valid name for your database',
                        _ => isUnique(sample) || 'Name must be unique'
                    ]"
                />
                <v-textarea
                    v-model="sample.rawPeptides"
                    class="mt-1"
                    label="Peptides"
                    variant="outlined"
                    density="compact"
                    counter
                    hide-details
                    no-resize
                />
            </div>
            <div class="align-self-center">
                <v-checkbox
                    v-model="sample.config.equate"
                    color="primary"
                    label="Equate I and L"
                    density="compact"
                    hide-details
                />
                <v-checkbox
                    v-model="sample.config.filter"
                    color="primary"
                    label="Filter duplicate peptides"
                    density="compact"
                    hide-details
                />
                <v-checkbox
                    v-model="sample.config.missed"
                    color="primary"
                    label="Enable missed cleavages"
                    density="compact"
                    hide-details
                    disabled
                />
                <database-select
                    v-model="sample.config.database"
                    class="mt-1"
                    label="Selected database"
                    hide-details
                />
            </div>
        </v-card-text>
        <v-card-actions>
            <v-spacer />
            <v-btn
                color="primary"
                variant="text"
                text="Cancel"
                @click="emits('cancel')"
            />
            <v-btn
                color="primary"
                variant="tonal"
                text="Add sample"
                :disabled="!sample.name || !sample.rawPeptides || !isUnique(sample)"
                @click="addSample"
            />
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import DatabaseSelect from "@/components/new/database/DatabaseSelect.vue";
import {ref} from "vue";
import {SampleTableItem} from "@/components/new/sample/SampleTable.vue";
import {v4 as uuidv4} from "uuid";
import {DEFAULT_PEPTIDE_INTENSITIES} from "@/store/new/PeptonizerAnalysisStore";

defineProps<{
    isUnique: (item: SampleTableItem) => boolean;
}>();

const emits = defineEmits<{
    (e: 'confirm', sample: SampleTableItem): void;
    (e: 'cancel'): void;
}>();

const sample = ref<SampleTableItem>({
    id: uuidv4(),
    name: "",
    rawPeptides: "",
    config: {
        equate: true,
        filter: true,
        missed: true,
        database: "UniProtKB"
    },
    intensities: new Map<string, number>()
});

const addSample = () => {
    for (const seq of sample.value.rawPeptides.split(/\r?\n/)) {
        sample.value.intensities.set(seq, DEFAULT_PEPTIDE_INTENSITIES);
    }
    emits('confirm', sample.value);
};
</script>

<style scoped>

</style>
