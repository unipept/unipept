<template>
    <v-dialog
        v-model="dialogOpen"
        scrollable
        :width="600"
    >
        <v-card>
            <v-card-title class="d-flex">
                {{ missedPeptides.length }} missed peptides
                <v-spacer />
                <div class="justify-end">
                    <v-btn
                        icon="mdi-close"
                        variant="plain"
                        size="small"
                        density="compact"
                        @click="dialogOpen = false"
                    />
                </div>
            </v-card-title>
            <v-card-text>
                <p>
                    Sorry, we didn't manage to find <b>{{ missedPeptides.length }}</b> of your
                    peptides. You can BLAST them by clicking the links or copy them by using the button below.
                </p>

                <missing-peptides-table
                    :items="missedPeptides"
                />

                <div class="d-flex justify-center mt-3">
                    <v-btn
                        color="primary"
                        prepend-icon="mdi-content-copy"
                        @click="copyMissedPeptides"
                    >
                        Copy all to clipboard
                    </v-btn>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { Peptide } from 'unipept-web-components';
import MissingPeptidesTable from '../tables/MissingPeptidesTable.vue';
import { ref, watch } from "vue";

export interface Props {
    modelValue: boolean,
    missedPeptides: Peptide[]
}

const props = defineProps<Props>();

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const dialogOpen = ref(props.modelValue);

const copyMissedPeptides = () => {
    navigator.clipboard.writeText(props.missedPeptides.join('\n'));
}

watch(dialogOpen, (newValue) => {
    emit('update:modelValue', newValue);
});

watch(() => props.modelValue, (newValue) => {
    dialogOpen.value = newValue;
});
</script>
