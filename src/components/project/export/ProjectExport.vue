<template>
    <div>
        <v-unipept-card class="mb-6">
            <v-card-title class="text-h5 font-weight-bold mb-2">
                🧬 Export Project Overview
            </v-card-title>
            <v-card-text>
                <p>
                    You’re about to export your entire project. This includes all samples, groups, analysis results, and settings.
                    The export will be saved as a <strong>.zip</strong> file that can later be re-imported or shared with others.
                </p>
            </v-card-text>
        </v-unipept-card>

        <v-row class="mb-6" dense>
            <v-col cols="12" sm="3">
                <v-unipept-card class="d-flex flex-row py-2 px-4 align-center">
                    <v-icon icon="mdi-account-group-outline" size="36" class="me-4" color="primary"/>
                    <div>
                        <div class="text-subtitle-1 font-weight-medium">Groups</div>
                        <div class="text-h5 font-weight-bold">{{ amountOfGroups }}</div>
                    </div>
                </v-unipept-card>
            </v-col>

            <v-col cols="12" sm="3">
                <v-unipept-card class="d-flex flex-row py-2 px-4 align-center">
                    <v-icon icon="mdi-flask-outline" size="36" class="me-4" color="primary"/>
                    <div>
                        <div class="text-subtitle-1 font-weight-medium">Samples</div>
                        <div class="text-h5 font-weight-bold">{{ amountOfSamples }}</div>
                    </div>
                </v-unipept-card>
            </v-col>

            <v-col cols="12" sm="3">
                <v-unipept-card class="d-flex flex-row py-2 px-4 align-center">
                    <v-icon icon="mdi-dna" size="36" class="me-4" color="primary"/>
                    <div>
                        <div class="text-subtitle-1 font-weight-medium">Total Peptides</div>
                        <div class="text-h5 font-weight-bold">{{ formatNumber(amountOfPeptides) }}</div>
                    </div>
                </v-unipept-card>
            </v-col>

            <v-col cols="12" sm="3">
                <v-unipept-card class="d-flex flex-row py-2 px-4 align-center">
                    <v-icon icon="mdi-dna" size="36" class="me-4" color="primary"/>
                    <div>
                        <div class="text-subtitle-1 font-weight-medium">Unique Peptides</div>
                        <div class="text-h5 font-weight-bold">{{ formatNumber(amountOfUniquePeptides) }}</div>
                    </div>
                </v-unipept-card>
            </v-col>
        </v-row>

        <v-unipept-card>
            <v-card-title class="text-h6">
                Sample Statistics per Group
            </v-card-title>

            <v-data-table
                :headers="headers"
                :items="groups"
                item-value="name"
                density="compact"
                hide-default-footer
            />
        </v-unipept-card>

        <v-row justify="center" class="mt-6">
            <v-btn
                color="primary"
                @click="exportProject"
                prepend-icon="mdi-download"
                text="Prepare Project Export (.zip)"
                :loading="preparingExport"
            />

            <v-snackbar
                v-model="a"
                color="primary"
                timeout="-1"
            >
                Your export is ready to download!

                <template v-slot:actions>
                    <v-btn
                        text="download"
                        @click="snackbar = false"
                    />
                </template>
            </v-snackbar>
        </v-row>
    </div>
</template>

<script setup lang="ts">
import GroupAnalysisStore from "@/store/new/GroupAnalysisStore";
import {computed, ref} from "vue";
import {useNumberFormatter} from "@/composables/useNumberFormatter";
import useAsyncWebWorker from "@/composables/useAsyncWebWorker";
import {useWebWorkerFn} from "@vueuse/core";
import useProjectExport from "@/components/project/export/useProjectExport";

const { formatNumber } = useNumberFormatter();

const { project } = defineProps<{
    project: GroupAnalysisStore
}>();

const preparingExport = ref(false);
const exportedProject = ref<string | null>(null);
const a = ref(true)

const amountOfGroups = computed(() => project.groups.length);

const amountOfSamples = computed(() => {
    return project.groups.reduce((total, group) => {
        return total + group.analyses.length;
    }, 0);
});

const amountOfPeptides = computed(() => {
    return project.groups.reduce((total, group) => {
        return total + group.analyses.reduce((groupTotal, analysis) => {
            return groupTotal + analysis.peptides.length;
        }, 0);
    }, 0);
});

const amountOfUniquePeptides = computed(() => {
    const uniquePeptides = new Set();
    project.groups.forEach(group => {
        group.analyses.forEach(analysis => {
            analysis.peptides.forEach(peptide => {
                uniquePeptides.add(peptide);
            });
        });
    });

    return uniquePeptides.size;
});

const groups = computed(() => project.groups.map(group => {
    const uniquePeptidesInGroup = new Set();
    group.analyses.forEach(analysis => {
        analysis.peptides.forEach(peptide => {
            uniquePeptidesInGroup.add(peptide);
        });
    });

    return {
        name: group.name,
        sampleCount: group.analyses.length,
        peptides: group.analyses.reduce((total, analysis) => total + analysis.peptides.length, 0),
        uniquePeptides: uniquePeptidesInGroup.size
    };
}));

const headers = [
    { title: '', value: 'expand', width: '32px' },
    { title: 'Group', value: 'name' },
    { title: 'Samples', value: 'sampleCount' },
    { title: 'Peptides', value: 'peptides' },
    { title: 'Unique Peptides', value: 'uniquePeptides' }
]

const { process: processExport } = useProjectExport();

async function exportProject() {
    preparingExport.value = true;

    exportedProject.value = await processExport(project.exportStore());

    preparingExport.value = false;
}
</script>
