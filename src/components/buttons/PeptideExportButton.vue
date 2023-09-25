<template>
    <v-menu>
        <template #activator="{ props: menu }">
            <v-tooltip text="Download a CSV-file with the results of this analysis.">
                <template #activator="{ props: tooltip }">
                    <v-btn
                        min-width="187"
                        :disabled="assayStatus.analysisInProgress || exportLoading"
                        v-bind="mergeProps(menu, tooltip)"
                        color="default"
                        :loading="exportLoading"
                        prepend-icon="mdi-download"
                        append-icon="mdi-menu-down"
                    >
                        {{ buttonText }}
                    </v-btn>
                </template>
            </v-tooltip>
        </template>
        <v-list>
            <v-list-item
                title="Comma-separated (international)"
                @click="downloadCsv('csv (,)')"
            />
            <v-list-item
                title="Semi-colon-separated (Europe)"
                @click="downloadCsv('csv (;)', ';', ',')"
            />
            <v-list-item
                title="Tab-separated"
                @click="downloadCsv('tsv', '\t', ';')"
            />
        </v-list>
    </v-menu>
</template>

<script setup lang="ts">
import { MultiProteomicsAnalysisStatus, PeptideUtils, useCsvDownload } from "unipept-web-components";
import AnalyticsCommunicator from '@/logic/communicators/analytics/AnalyticsCommunicator';
import { mergeProps, ref } from "vue";

export interface Props {
    assayStatus: MultiProteomicsAnalysisStatus;
    buttonText: string
}

const props = defineProps<Props>();

const exportLoading = ref<boolean>(false);

const { downloadString } = useCsvDownload();

const downloadCsv = (name: string, separator = ',', functionalSeparator = ';') => {
    if(!props.assayStatus.analysisInProgress) {
        exportLoading.value = true;

        const csvString = PeptideUtils.exportAsCsv(
            props.assayStatus.data.peptideCountTable,
            props.assayStatus.pept2Data,
            props.assayStatus.goOntology,
            props.assayStatus.ecOntology,
            props.assayStatus.interproOntology,
            props.assayStatus.ncbiOntology,
            separator,
            functionalSeparator
        );
        downloadString(csvString, `${props.assayStatus.assay.name}_mpa.csv`);

        new AnalyticsCommunicator().logDownloadMpa(name);

        exportLoading.value = false;
    }
};
</script>
