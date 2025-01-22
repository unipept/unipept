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
            <!--            <database-select-->
            <!--                v-model="sample.config.database"-->
            <!--                class="mt-1"-->
            <!--                label="Selected database"-->
            <!--                hide-details-->
            <!--            />-->
        </div>
    </div>
</template>

<script setup lang="ts">
import DatabaseSelect from "@/components/new/database/DatabaseSelect.vue";
import {SampleTableItem} from "@/components/new/sample/SampleTable.vue";

const props = defineProps<{
    isUnique: (item: SampleTableItem) => boolean;
    sample: SampleTableItem;
}>();
</script>

<style scoped>

</style>
