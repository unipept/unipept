<template>
    <v-row class="py-3">
        <v-col cols="6">
            <v-textarea
                v-model="peptides"
                label="Peptides"
                variant="outlined"
                density="compact"
                counter
                hide-details
                no-resize
            />
        </v-col>

        <v-col
            v-if="isPeptides"
            cols="6"
        >
            <v-file-input
                label="File input"
                variant="outlined"
                density="compact"
                hide-details
            />
        </v-col>

        <v-col
            v-else-if="isSample"
            cols="6"
        >
            TODO
        </v-col>

        <v-col
            v-else-if="isPride"
            cols="6"
        >
            <h4>Load data from the PRIDE archive</h4>
            <p>
                You can easily load data from the PRIDE data repository. Simply enter an
                assay id (e.g. 8500) in the field below and click the 'Load PRIDE Dataset'
                button. The corresponding dataset will then be fetched using the PRIDE API
                and loaded into the search form on the left.
            </p>
            <v-text-field
                label="Assay identifier"
                variant="outlined"
                density="compact"
                counter
                hide-details
                no-resize
            >
                <template #append>
                    <v-btn
                        text="Fetch PRIDE dataset"
                        color="primary"
                        variant="flat"
                        prepend-icon="mdi-cloud-download"
                        @click="addProteome"
                    />
                </template>
            </v-text-field>
        </v-col>

        <v-col
            v-else
            cols="6"
        />
    </v-row>
</template>

<script setup lang="ts">
import {computed} from "vue";

const { type } = defineProps<{
    type?: SampleType
}>();

const peptides = defineModel<string>();

const isPeptides = computed(() => type === SampleType.Peptides);
const isSample = computed(() => type === SampleType.Sample);
const isPride = computed(() => type === SampleType.Pride);
</script>

<script lang="ts">
export enum SampleType {
    Peptides = 'peptides',
    Sample = 'sample',
    Pride = 'pride',
}
</script>
