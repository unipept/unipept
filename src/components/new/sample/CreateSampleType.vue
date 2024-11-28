<template>
    <v-row
        v-if="isPeptides"
        class="py-3"
    >
        <v-col>
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
    </v-row>

    <v-row
        v-else-if="isSampleData"
        class="py-3"
    >
        <v-col
            v-for="sample in samples"
            class="d-flex flex-column"
            cols="4"
        >
            <sample-data
                :sample="sample"
                @select="sampleDataSelect"
            />
        </v-col>
    </v-row>

    <v-row
        v-else
        class="py-3"
    >
        <v-col cols="12">
            <v-textarea
                v-model="peptides"
                label="Peptides"
                variant="outlined"
                density="compact"
                counter
                hide-details
                no-resize
                readonly
            />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import {computed, onMounted} from "vue";
import SampleData from "@/components/new/sample/SampleData.vue";
import useSampleData, {SampleDataset} from "@/composables/new/communication/unipept/useSampleData";

const { samples, process } = useSampleData();

const peptides = defineModel<string>("peptides");
const name = defineModel<string>("name");
const type = defineModel<SampleType | undefined>("type");

const isPeptides = computed(() => type.value === SampleType.Peptides);
const isSampleData = computed(() => type.value === SampleType.Sample);

const sampleDataSelect = (sample: SampleDataset) => {
    peptides.value = sample.data.join('\n');
    name.value = sample.name;
    type.value = undefined;
};

onMounted(process);
</script>

<script lang="ts">
export enum SampleType {
    Peptides = 'peptides',
    Sample = 'sample'
}
</script>
