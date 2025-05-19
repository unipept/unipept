<template>
    <div>
        <v-unipept-card class="mb-6">
            <v-card-title class="text-h5 font-weight-bold mb-2">
                <v-icon icon="mdi-file-download-outline" size="30" class="me-2" color="primary"/>
                Export Project Overview
            </v-card-title>
            <v-card-text>
                <p>
                    You’re about to export your entire project. This includes all samples, groups, analysis results, and settings.
                    The export will be saved as a <strong>.unipept</strong> file that can later be re-imported or shared with others.
                </p>
            </v-card-text>
        </v-unipept-card>

        <v-alert
            v-if="finishedAnalyses < amountOfSamples || peptonizerJobs > 0"
            type="warning"
            variant="tonal"
            class="mb-6"
            icon="mdi-alert-circle-outline"
        >
            <div class="d-flex justify-space-between align-center">
                <span>
                    <b>Warning:</b> Not all samples have been analyzed yet <b>({{ finishedAnalyses }} out of {{ amountOfSamples }} are finished)</b> OR
                    some peptonizer jobs are still running <b>({{ peptonizerJobs }} {{ peptonizerJobs === 1 ? 'job' : 'jobs' }} running)</b>.
                    Exporting your data now may result in incomplete results.
                    Unfinished analyses will be analysed upon importing the project. The latest version of UniProtKB will be used for
                    the analysis, rather than the version used in this project.
                </span>

            </div>
        </v-alert>

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
                variant="tonal"
                @click="exportProject"
                prepend-icon="mdi-download"
                text="Download Project Export"
                :loading="preparingExport"
            />
        </v-row>
    </div>
</template>

<script setup lang="ts">
import {ProjectAnalysisStore} from "@/store/ProjectAnalysisStore";
import {computed, ref} from "vue";
import {useNumberFormatter} from "@/composables/useNumberFormatter";
import {AnalysisStatus} from "@/store/AnalysisStatus";
import {PeptonizerStatus} from "@/store/PeptonizerAnalysisStore";
import useProjectExport from "@/composables/useProjectExport";

const { formatNumber } = useNumberFormatter();

const { project } = defineProps<{
    project: ProjectAnalysisStore
}>();

const preparingExport = ref(false);

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

const finishedAnalyses = computed(() => {
    return project.groups.reduce((total, group) => {
        return total + group.analyses.filter(analysis => analysis.status === AnalysisStatus.Finished).length;
    }, 0);
});

const peptonizerJobs = computed(() => {
    return project.groups.reduce((total, group) => {
        return total + group.analyses.filter(analysis =>
            analysis.peptonizerStore.status === PeptonizerStatus.Running
        ).length;
    }, 0);
});

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

    const url = URL.createObjectURL((await processExport(project)).content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project.unipept';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    preparingExport.value = false;
}
</script>
