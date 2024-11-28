<template>
    <span><b>Environment:</b> {{ sample.environment }}</span>
    <span>
        <b>Reference:</b> {{ sample.reference }}
        <v-icon
            color="primary"
            size="small"
            @click="openReference"
        >
            mdi-link-variant
        </v-icon>
    </span>
    <v-menu>
        <template #activator="{ props }">
            <v-btn
                v-bind="props"
                class="mt-3"
                text="Select dataset"
                color="primary"
                variant="outlined"
                append-icon="mdi-chevron-down"
            />
        </template>
        <v-list>
            <v-list-item
                v-for="dataset in sample.datasets"
                density="compact"
                @click="emits('select', dataset)"
            >
                {{ dataset.name }}
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script setup lang="ts">
import {SampleData, SampleDataset} from "@/composables/new/communication/unipept/useSampleData";

const { sample } = defineProps<{
    sample: SampleData
}>();

const emits = defineEmits<{
    "select": (sample: SampleDataset) => void;
}>();

const openReference = () => window.open(sample.url, '_blank');
</script>

<style scoped>

</style>
