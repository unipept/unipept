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

                <v-card
                    class="position-absolute top-0 right-0"
                >
                    <v-alert
                        color="primary"
                        variant="tonal"
                    >
                        <b>Click on a node in the tree to see the peptides associated with that organism.</b>
                    </v-alert>
                </v-card>
            </div>

            <v-dialog
                v-model="dialogOpen"
            >
                <v-card v-click-outside="closeDialog">
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
                </v-card>
            </v-dialog>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import Treeview from '@/components/new/treeview/Treeview.vue';
import {computed, ref, watch} from "vue";
import useTreeFilter from "@/composables/new/useTreeFilter";

const { analysis } = defineProps<{
    analysis: SingleAnalysisStore
}>();

const { filteredTree, filter, update } = useTreeFilter(constructTree(analysis.ncbiTree));

const search = ref('');
const selectedItem = ref();
const dialogOpen = ref(false);

const selfPeptides = computed(() =>
    [...new Set(analysis.lcaToPeptides.get(selectedItem.value?.id) || [])].map(p => ({ name: p }))
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
</script>

<script lang="ts">
import {NcbiTreeNode} from "unipept-web-components";
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";

const headers = [
    { text: 'Peptide', value: 'name', width: '98%' },
    { text: '', value: 'action', width: '2%' }
];

const openPeptideAnalysis = (peptide: string) => {
    // TODO: change this. Hardcoded link to website for testing purposes
    const a = document.createElement('a');
    a.href = `https://unipept.ugent.be/tpa/${peptide}?equate=${true}`;
    a.target = '_blank';
    a.click();
}

const copyToClipboard = (peptides: string[]) => {
    navigator.clipboard.writeText(peptides.join('\n'));
}

const constructTree = (node: NcbiTreeNode): NcbiTreeNode => {
    node.nameExtra = `${node.selfCount}/${node.count}`;
    node.children = node.children.map(child => constructTree(child));
    return node;
}

const recursivePeptides = (analysis: SingleAnalysisStore, node: NcbiTreeNode): string[] => {
    if (!node) {
        return [];
    }

    const ownPeptides = [...analysis.lcaToPeptides.get(node.id) || []];

    for (const child of node.children) {
        ownPeptides.push(...recursivePeptides(analysis, child));
    }

    return ownPeptides;
}

const recursiveSearch = (node: NcbiTreeNode, id: number): NcbiTreeNode => {
    if (node.id === id) {
        return node;
    }

    for (const child of node.children) {
        const result = recursiveSearch(child, id);
        if (result) {
            return result;
        }
    }
}
</script>

<style scoped>

</style>
