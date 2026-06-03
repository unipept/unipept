<template>
    <v-dialog
        v-model="dialogOpen"
        width="50%"
    >
        <v-unipept-card>
            <v-card-title class="d-flex align-center">
                <h2>{{ peptides.length }} cRAP-filtered peptides</h2>
                <v-spacer />
                <v-btn
                    icon="mdi-close"
                    variant="plain"
                    density="compact"
                    @click="dialogOpen = false"
                />
            </v-card-title>

            <v-card-text>
                <v-alert
                    color="warning"
                    variant="tonal"
                    icon="mdi-filter-outline"
                    class="mb-4"
                >
                    These <b>{{ peptides.length }}</b> peptides match proteins in the
                    <a href="https://www.thegpm.org/crap/" target="_blank">cRAP database</a>
                    (Common Repository of Adventitious Proteins) and were excluded from the
                    analysis. cRAP proteins are common laboratory contaminants such as keratins,
                    trypsin, and BSA. Their presence in your sample is typically not biologically
                    meaningful.
                </v-alert>

                <v-data-table-virtual
                    v-if="peptides.length > 0"
                    :headers="headers"
                    :items="peptideItems"
                    height="400"
                    item-value="name"
                    density="compact"
                    hide-default-header
                >
                    <template #bottom>
                        <v-btn
                            class="mt-3"
                            color="primary"
                            variant="tonal"
                            prepend-icon="mdi-content-copy"
                            @click="copyToClipboard"
                        >
                            Copy to clipboard
                        </v-btn>
                    </template>
                </v-data-table-virtual>
            </v-card-text>
        </v-unipept-card>
    </v-dialog>
</template>

<script setup lang="ts">
import {computed} from "vue";

const dialogOpen = defineModel<boolean>();

const { peptides } = defineProps<{
    peptides: string[]
}>();

const peptideItems = computed(() => peptides.map(name => ({ name })));

const copyToClipboard = () => {
    navigator.clipboard.writeText(peptides.join('\n'));
};
</script>

<script lang="ts">
const headers = [
    { title: 'Peptide', value: 'name', width: '100%' }
];
</script>
