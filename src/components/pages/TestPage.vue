<template>
    <v-container>
        <v-card>
            <v-card-title class="pa-4 bg-primary text-white">
                Metaproteomics analysis
            </v-card-title>

            <v-layout>
                <v-navigation-drawer
                    permanent
                >
                    <v-list
                        v-model:opened="openedGroups"
                        v-model:selected="selected"
                        class="py-0"
                        color="primary"
                        selectable
                        select-strategy="single-leaf"
                        open-strategy="multiple"
                        active-strategy="single-leaf"
                        mandatory
                    >
                        <v-list-group v-for="group in groups" :key="group.name" :value="group.name">
                            <template #activator="{ props }">
                                <v-list-item
                                    :title="group.name"
                                    base-color="grey-darken-3"
                                    color="none"
                                    density="compact"
                                    variant="tonal"
                                >
                                    <template #title="{ title }">
                                        <div v-bind="props">{{ title }}</div>
                                    </template>

                                    <template #prepend="{ isOpen }">
                                        <v-icon v-if="isOpen" v-bind="props">mdi-chevron-down</v-icon>
                                        <v-icon v-else v-bind="props">mdi-chevron-right</v-icon>
                                    </template>

                                    <template #append>
                                        <v-tooltip location="bottom">
                                            <template #activator="{ props: tProps }">
                                                <v-btn v-bind="tProps" variant="plain" density="compact" icon="mdi-file-document-edit-outline" @click="group.open = true" />
                                            </template>
                                            <span>Create or edit samples</span>
                                        </v-tooltip>
                                    </template>
                                </v-list-item>
                            </template>

                            <v-list-item
                                v-for="analysis in group.analysis"
                                :key="analysis.id"
                                :value="analysis"
                                :title="analysis.sample.name"
                                color="primary"
                                density="compact"
                                prepend-icon="mdi-file-document-outline"
                                append-icon="mdi-information-outline"
                            />

                            <create-sample
                                v-model="group.open"
                                v-model:samples="group.analysis"
                            />
                        </v-list-group>
                    </v-list>
                </v-navigation-drawer>
                <v-main min-height="400">
                    <analysis-summary v-model="selectedAnalysis" />
                </v-main>
            </v-layout>
        </v-card>
    </v-container>
</template>

<script lang="ts">
export interface AnalysisGroup {
    name: string;
    analysis: Analysis[];
    open: boolean;
}

export interface Analysis {
    id: number;
    sample: Sample;
    config: AnalysisConfig;
}

export interface Sample {
    name: string;
    peptides: any[];
    peptideCount: number;
}

export interface AnalysisConfig {
    equate: boolean;
    filter: boolean;
    missed: boolean;
    database: string;
}
</script>

<script setup lang="ts">
import {ref, watch} from "vue";
import AnalysisSummary from "@/components/new/analysis/AnalysisSummary.vue";
import CreateSample from "@/components/new/sample/CreateSample.vue";

const groups = ref<AnalysisGroup[]>([
    {
        name: "Clover",
        analysis: [
            {
                id: 1,
                sample: {
                    name: "Clover 1",
                    peptides: [],
                    peptideCount: 0
                },
                config: {
                    equate: true,
                    filter: true,
                    missed: true,
                    database: "UniProtKB"
                },
                result: {
                    test: [
                        {
                            peptide: "AALTER",
                            occurrence: 1,
                            lca: "Proteobacteria",
                            rank: "species"
                        },
                        {
                            peptide: "AALTER",
                            occurrence: 1,
                            lca: "Proteobacteria",
                            rank: "species"
                        },
                        {
                            peptide: "AALTER",
                            occurrence: 1,
                            lca: "Proteobacteria",
                            rank: "species"
                        }
                    ]
                }
            }
        ],
        open: false
    },
    {
        name: "Soybean",
        analysis: [],
        open: false
    }
]);

const openedGroups = ref(["Clover", "Soybean"]);

const selected = ref<Analysis[]>();
const selectedAnalysis = ref<Analysis>();

watch(selected, (value) => {
    console.log(value);
    console.log(selectedAnalysis.value);
    selectedAnalysis.value = value?.[0];
});

watch(selectedAnalysis, (value) => {
    console.log(value);
});
</script>

<style scoped>
:deep(.v-list-group__items .v-list-item) {
    padding-inline-start: 40px !important;
}

:deep(.v-list-item__spacer) {
    width: 5px !important;
}
</style>