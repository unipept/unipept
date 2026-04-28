<template>
    <pathway-selection-table
        :filters="filters"
        :headers="headers"
        sort-key="count"
        :loading="loading"
        :error="store.status === 'Failed'"
        :category-options="categoryOptions"
        :compound-options="compoundOptions"
        :row-props="(data: any) => ({ class: data.item.id === store.selectedPathway?.id ? 'active-row' : '' })"
        @select="onSelectPathway"
        @retry="emit('retry')"
    />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PathwayPilotStore, PathwayItem } from '@/store/PathwayPilotStore';
import { categoryColor } from '@/composables/pathway/usePathwayColors';
import { usePathwayFilters } from '@/composables/pathway/usePathwayFilters';
import { pathwayGroups } from '@/logic/PathwayGroups';
import usePathwayPilotMappingStore from '@/store/PathwayPilotMappingStore';
import PathwaySelectionTable from '@/components/pathway/PathwaySelectionTable.vue';

const props = defineProps<{
    store: PathwayPilotStore;
    loading?: boolean;
}>();

const mappingStore = usePathwayPilotMappingStore();

const filters = usePathwayFilters({
    items: () => props.store.pathwayItems,
    pathwaysForEc: (ec) => props.store.pathwaysForEc(ec),
    pathwaysForCompound: (c) => props.store.pathwaysForCompound(c),
    allEcs: () => props.store.ecs,
});

const headers = [
    { title: 'ID', key: 'id', sortable: true, width: '110px' },
    { title: 'Category', key: 'category', sortable: true },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Count', key: 'count', sortable: true, align: 'end' as const }
];

const categoryOptions = computed(() =>
    [...new Set(props.store.pathwayItems.map(item => item.subCategory || item.category))]
        .sort((a, b) => {
            const iA = pathwayGroups.indexOf(a), iB = pathwayGroups.indexOf(b);
            if (iA >= 0 && iB >= 0) return iA - iB;
            return iA >= 0 ? -1 : iB >= 0 ? 1 : a.localeCompare(b);
        })
        .map(name => ({ value: name, title: name, color: categoryColor(name) }))
);

const compoundOptions = computed(() =>
    Array.from(props.store.compounds)
        .map(id => ({
            value: id,
            title: `${id}: ${mappingStore.compoundMapping?.get(id)?.names?.[0] ?? 'Unknown'}`
        }))
        .sort((a, b) => a.value.localeCompare(b.value))
);

const emit = defineEmits<{ retry: [] }>();

const onSelectPathway = (item: PathwayItem) => {
    props.store.setSelectedPathway(item);
};
</script>

<style scoped>
:deep(.active-row td) {
    background-color: rgba(76, 140, 191, 0.12);
}
</style>
