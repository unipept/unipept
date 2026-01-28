<template>
    <v-card variant="flat">
        <v-card-text>
            <v-text-field
                v-model="search"
                class="mb-3"
                color="primary"
                prepend-inner-icon="mdi-magnify"
                clearable
                clear-icon="mdi-close"
                label="Search for an organism"
                density="compact"
                variant="outlined"
                hide-details
                @update:model-value="searchUpdated"
            />

            <div class="position-relative">
                <treeview
                    v-model:item="selectedItem"
                    :node="filteredTree"
                    :expanded="3"
                />

                <v-unipept-card
                    class="position-absolute top-0 right-0 pa-0"
                >
                    <v-alert
                        color="primary"
                        variant="tonal"
                    >
                        <b>Click on a node in the tree to see the peptides associated with that organism.</b>
                    </v-alert>
                </v-unipept-card>
            </div>

            <v-dialog
                v-model="dialogOpen"
            >
                <v-unipept-card v-click-outside="closeDialog">
                    <v-card-title class="d-flex align-center">
                        <h1>{{ selectedItem?.name }} ({{ selectedItem?.extra.rank }})</h1>
                        <v-spacer />
                        <div class="justify-end">
                            <v-btn
                                icon="mdi-close"
                                variant="plain"
                                density="compact"
                                @click="closeDialog"
                            />
                        </div>
                    </v-card-title>

                    <v-card-text>
                        <v-row>
                            <v-col cols="6">
                                <span><b>{{ selfPeptides.length }}</b> {{ selfPeptides.length === 1 ? 'peptide is' : 'peptides are' }} specific to this taxon</span>
                                <v-data-table-virtual
                                    v-if="selfPeptides.length > 0"
                                    :headers="headers"
                                    :items="selfPeptides"
                                    class="mt-3"
                                    height="400"
                                    item-value="name"
                                    density="compact"
                                    hide-default-header
                                >
                                    <template #item.name="{ item }">
                                        <div
                                            class="cursor-pointer"
                                            @click="openPeptideAnalysis(item.name)"
                                        >
                                            <span>{{ item.name }}</span>
                                        </div>
                                    </template>

                                    <template #item.action="{ item }">
                                        <v-icon
                                            size="small"
                                            icon="mdi-open-in-new"
                                            @click="openPeptideAnalysis(item.name)"
                                        />
                                    </template>

                                    <template #bottom>
                                        <v-btn
                                            class="mt-3"
                                            color="primary"
                                            variant="text"
                                            text="Copy to clipboard"
                                            prepend-icon="mdi-content-copy"
                                            @click="copyToClipboard(selfPeptides.map(p => p.name))"
                                        />
                                    </template>
                                </v-data-table-virtual>
                            </v-col>
                            <v-col cols="6">
                                <span><b>{{ subPeptides.length }}</b> {{ subPeptides.length === 1 ? 'peptide is' : 'peptides are' }} specific to this taxon or its subtaxa</span>
                                <v-data-table-virtual
                                    v-if="subPeptides.length > 0"
                                    :headers="headers"
                                    :items="subPeptides"
                                    class="mt-3"
                                    height="400"
                                    item-value="name"
                                    density="compact"
                                    hide-default-header
                                >
                                    <template #item.name="{ item }">
                                        <div
                                            class="cursor-pointer"
                                            @click="openPeptideAnalysis(item.name)"
                                        >
                                            <span>{{ item.name }}</span>
                                        </div>
                                    </template>

                                    <template #item.action="{ item }">
                                        <v-icon
                                            size="small"
                                            icon="mdi-open-in-new"
                                            @click="openPeptideAnalysis(item.name)"
                                        />
                                    </template>

                                    <template #bottom>
                                        <v-btn
                                            class="mt-3"
                                            color="primary"
                                            variant="text"
                                            text="Copy to clipboard"
                                            prepend-icon="mdi-content-copy"
                                            @click="copyToClipboard(subPeptides.map(p => p.name))"
                                        />
                                    </template>
                                </v-data-table-virtual>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-unipept-card>
            </v-dialog>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import Treeview from '@/components/visualization/treeview/Treeview.vue';
import {computed, ref, watch} from "vue";
import useTreeFilter from "@/composables/useTreeFilter";
import NcbiTreeNode from "@/logic/ontology/taxonomic/NcbiTreeNode";
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import {FilteredTree} from "@/composables/useTreeFilter";
import {useRouter} from "vue-router";

const router = useRouter();

const { analysis } = defineProps<{
    analysis: SingleAnalysisStore
}>();

const constructTree = (node: NcbiTreeNode): FilteredTree => {
    return {
        id: node.id,
        name: node.name,
        nameExtra: `${node.selfCount}/${node.count}`,
        children: node.children.map(child => constructTree(child)),
        extra: node.extra
    }
}

const recursivePeptides = (analysis: SingleAnalysisStore, node?: NcbiTreeNode): string[] => {
    if (!node) {
        return [];
    }

    const ownPeptides = [...analysis.lcaToPeptides?.get(node.id) || []];

    for (const child of node.children) {
        for (const p of recursivePeptides(analysis, child)) {
            ownPeptides.push(p);
        }
    }

    return ownPeptides;
}

const recursiveSearch = (node: NcbiTreeNode, id: number): NcbiTreeNode | undefined => {
    if (node.id === id) {
        return node;
    }

    for (const child of node.children) {
        const result = recursiveSearch(child, id);
        if (result) {
            return result;
        }
    }

    return undefined;
}

const { filteredTree, filter, update } = useTreeFilter(constructTree(analysis.ncbiTree));

const search = ref('');
const selectedItem = ref();
const dialogOpen = ref(false);

const selfPeptides = computed(() =>
    [...new Set(analysis.lcaToPeptides?.get(selectedItem.value?.id) || [])].map(p => ({ name: p }))
);
const subPeptides = computed(() => {
    const nodeInOriginalTree = recursiveSearch(analysis.ncbiTree, selectedItem.value?.id);
    return [...new Set(recursivePeptides(analysis, nodeInOriginalTree) || [])].map(p => ({ name: p }));
});

const searchUpdated = (search: string) => {
    filter(search);
    selectedItem.value = undefined;
}

const closeDialog = () => {
    selectedItem.value = undefined;
}

watch(() => analysis.ncbiTree, () => update(constructTree(analysis.ncbiTree)));

watch(selectedItem, () => {
    dialogOpen.value = selectedItem.value !== undefined;
});

const headers = [
    { title: 'Peptide', value: 'name', width: '98%' },
    { title: '', value: 'action', width: '2%', sortable: false }
];

const openPeptideAnalysis = (peptide: string) => {
    const route = router.resolve({
        path: `/tpa/${peptide}`,
        query: { equate: analysis.config.equate }
    });
    window.open(route.href, '_blank');
}

const copyToClipboard = (peptides: string[]) => {
    navigator.clipboard.writeText(peptides.join('\n'));
}
</script>

<style scoped>

</style>
