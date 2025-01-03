<template>
    <v-table density="compact" height="200px" fixed-header>
        <thead>
            <tr>
                <th class="text-right bg-grey-lighten-4 first-header"></th>
                <th class="text-left bg-grey-lighten-4">
                    Peptide
                </th>
                <th v-if="props.sample.intensities" class="text-left bg-grey-lighten-4">
                    Intensity
                </th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-if="props.sample.intensities"
                v-for="([seq, intensity], i) of props.sample.intensities.entries()"
                :key="`${seq}_${intensity}`"
            >
                <td class="bg-grey-lighten-4 text-right">{{ i + 1 }}</td>
                <td>{{ seq }}</td>
                <td>{{ intensity }}</td>
            </tr>
            <tr
                v-else
                v-for="(seq, i) of props.sample.rawPeptides.split(/\r?\n/)"
                :key="seq"
            >
                <td class="bg-grey-lighten-4 text-right">{{ i + 1 }}</td>
                <td>{{ seq }}</td>
            </tr>
        </tbody>
    </v-table>
</template>

<script setup lang="ts">

import {SampleTableItem} from "@/components/new/sample/SampleTable.vue";

const props = defineProps<{ sample: SampleTableItem }>();
</script>

<style scoped>
table {
    border-collapse: separate;
}

th:not(:last-child), td:not(:last-child) {
    border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.first-header {
    width: 100px;
}
</style>