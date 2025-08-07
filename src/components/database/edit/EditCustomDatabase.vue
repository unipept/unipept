<template>
    <edit-taxon-database-dialog
        v-if="filter && filter.filter === FilterType.Taxon"
        v-model="dialogOpen"
        :database="database"
        :amount-of-linked-samples="amountOfLinkedSamples"
        @edit:name="emits('edit:name', $event)"
        @edit:filter="emits('edit:filter', $event)"
    />

    <edit-protein-database-dialog
        v-else-if="filter && filter.filter === FilterType.Protein"
        v-model="dialogOpen"
        :database="database"
        :amount-of-linked-samples="amountOfLinkedSamples"
        @edit:name="emits('edit:name', $event)"
        @edit:filter="emits('edit:filter', $event)"
    />

    <edit-proteome-database-dialog
        v-else-if="filter && filter.filter === FilterType.Proteome"
        v-model="dialogOpen"
        :database="database"
        :amount-of-linked-samples="amountOfLinkedSamples"
        @edit:name="emits('edit:name', $event)"
        @edit:filter="emits('edit:filter', $event)"
    />
</template>

<script setup lang="ts">
import useCustomFilterStore, {Filter, FilterType} from "@/store/CustomFilterStore";
import EditTaxonDatabaseDialog from "@/components/database/edit/EditTaxonDatabase.vue";
import {computed} from "vue";
import EditProteinDatabaseDialog from "@/components/database/edit/EditProteinDatabase.vue";
import EditProteomeDatabaseDialog from "@/components/database/edit/EditProteomeDatabase.vue";

const customFilterStore = useCustomFilterStore();

const dialogOpen = defineModel<boolean>();

const props = defineProps<{
    database: string,
    amountOfLinkedSamples: number,
}>();

const emits = defineEmits<{
    (e: 'edit:name', filter: Filter): void
    (e: 'edit:filter', filter: Filter): void
}>();

const filter = computed(() => customFilterStore.getFilterById(props.database));
</script>
