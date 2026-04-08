<template>
    <pathway-selection-table
        :filters="filters"
        :headers="headers"
        sort-key="totalCount"
        :loading="loading"
        :category-options="categoryOptions"
        :compound-options="compoundOptions"
        :subtitle="`Select a KEGG metabolic pathway to compare EC number coverage across all selected analyses. Colors indicate which analyses have matching EC numbers for each pathway area.`"
        @select="emit('select', $event)"
    />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { SingleAnalysisStore } from '@/store/SingleAnalysisStore';
import { PathwayPilotStatus, PathwayItem } from '@/store/PathwayPilotStore';
import { categoryColor } from '@/composables/pathway/usePathwayColors';
import { usePathwayFilters } from '@/composables/pathway/usePathwayFilters';
import { pathwayGroups } from '@/logic/PathwayGroups';
import usePathwayPilotMappingStore from '@/store/PathwayPilotMappingStore';
import PathwaySelectionTable from '@/components/pathway/PathwaySelectionTable.vue';

export interface MergedPathwayItem extends PathwayItem {
    totalCount: number;
    matchingAnalyses: SingleAnalysisStore[];
}

const props = defineProps<{
    analyses: SingleAnalysisStore[];
    loading?: boolean;
}>();

const emit = defineEmits<{
    select: [item: MergedPathwayItem];
}>();

const mappingStore = usePathwayPilotMappingStore();

const headers = [
    { title: 'ID', key: 'id', sortable: true, width: '110px' },
    { title: 'Category', key: 'category', sortable: true },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Total count', key: 'totalCount', sortable: true, align: 'end' as const }
];

const mergedPathwayItems = computed<MergedPathwayItem[]>(() => {
    if (!mappingStore.pathwayMapping) return [];

    const pathwayMap = new Map<string, MergedPathwayItem>();

    for (const analysis of props.analyses) {
        if (analysis.pathwayPilotStore.status !== PathwayPilotStatus.Ready) continue;

        for (const item of analysis.pathwayPilotStore.pathwayItems) {
            if (!pathwayMap.has(item.id)) {
                pathwayMap.set(item.id, { ...item, totalCount: 0, matchingAnalyses: [] });
            }
            const merged = pathwayMap.get(item.id)!;
            merged.totalCount += item.count;
            if (item.count > 0 && !merged.matchingAnalyses.includes(analysis)) {
                merged.matchingAnalyses.push(analysis);
            }
        }
    }

    return Array.from(pathwayMap.values()).sort((a, b) => b.totalCount - a.totalCount);
});

const filters = usePathwayFilters({
    items: () => mergedPathwayItems.value,
    pathwaysForEc: (ec) => {
        const result = new Set<string>();
        for (const analysis of props.analyses) {
            for (const p of analysis.pathwayPilotStore.pathwaysForEc(ec)) result.add(p);
        }
        return result;
    },
    pathwaysForCompound: (c) => {
        const result = new Set<string>();
        for (const analysis of props.analyses) {
            for (const p of analysis.pathwayPilotStore.pathwaysForCompound(c)) result.add(p);
        }
        return result;
    },
    allEcs: () => {
        const ecSet = new Set<string>();
        for (const analysis of props.analyses) {
            for (const ec of analysis.pathwayPilotStore.ecs) ecSet.add(ec);
        }
        return ecSet;
    },
});

const categoryOptions = computed(() =>
    [...new Set(mergedPathwayItems.value.map(item => item.subCategory || item.category))]
        .sort((a, b) => {
            const iA = pathwayGroups.indexOf(a), iB = pathwayGroups.indexOf(b);
            if (iA >= 0 && iB >= 0) return iA - iB;
            return iA >= 0 ? -1 : iB >= 0 ? 1 : a.localeCompare(b);
        })
        .map(name => ({ value: name, title: name, color: categoryColor(name) }))
);

const compoundOptions = computed(() => {
    const compoundSet = new Set<string>();
    for (const analysis of props.analyses) {
        for (const c of analysis.pathwayPilotStore.compounds) {
            compoundSet.add(c);
        }
    }
    return Array.from(compoundSet)
        .map(id => ({
            value: id,
            title: `${id}: ${mappingStore.compoundMapping?.get(id)?.names?.[0] ?? 'Unknown'}`
        }))
        .sort((a, b) => a.value.localeCompare(b.value));
});
</script>
