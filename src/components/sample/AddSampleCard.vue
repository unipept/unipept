<template>
    <div class="d-flex">
        <div class="flex-grow-1 me-5">
            <v-text-field
                v-model="sample.name"
                variant="outlined"
                density="compact"
                label="Sample name"
                :rules="[
                    v => !!v || 'Provide a valid name for your database',
                    _ => props.isUnique(sample) || 'Name must be unique'
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
    </div>
</template>

<script setup lang="ts">
import {SampleTableItem} from "@/components/sample/SampleTable.vue";

const props = defineProps<{
    isUnique: (item: SampleTableItem) => boolean;
    sample: SampleTableItem;
}>();
</script>

<style scoped>

</style>
