<template>
    <v-card>
        <v-tabs
            v-model="currentTab"
            slider-color="secondary"
            bg-color="primary"
            dark
        >
            <v-tab value="matched-proteins">
                Matched proteins
            </v-tab>
            <v-tab value="lineage-tree">
                Lineage tree
            </v-tab>
            <v-tab value="lineage-table">
                Lineage table
            </v-tab>
            <v-tab value="go-terms">
                GO terms
            </v-tab>
            <v-tab value="ec-numbers">
                EC numbers
            </v-tab>
            <v-tab value="interpro">
                Interpro
            </v-tab>
        </v-tabs>

        <v-window v-model="currentTab">
            <v-window-item value="matched-proteins">
                <matched-proteins-table :assay="assay" />
            </v-window-item>
            <v-window-item value="lineage-tree">
                <v-card-text>
                    This interactive tree bundles the complete taxonomic lineages of all UniProt entries whose protein sequence contains the tryptic peptide.
                </v-card-text>
                <treeview :ncbi-root="assay.ncbiTree!" />
            </v-window-item>
            <v-window-item value="lineage-table">
                <lineage-table :assay="assay" />
            </v-window-item>
            <v-window-item value="go-terms">
                <v-card-text>
                    <functional-go-results
                        :data="goData"
                        :loading="assay.status! === AnalysisStatus.Running"
                        :show-percentage="false"
                        :show-download-item="false"
                        @download-table="downloadGoTable"
                    >
                        <template #trust>
                            <span>
                                This panel shows the Gene Ontology annotations that were matched to your peptides.
                                <b>{{ assay.goTrust!.annotatedItems }}</b> proteins <b>({{ displayPercentage(assay.goTrust!.annotatedItems / assay.goTrust!.totalItems) }})</b>
                                have at least one GO term assigned to them. Click on a row in a table to see a taxonomy tree that highlights occurrences.
                            </span>
                        </template>
                    </functional-go-results>
                </v-card-text>
            </v-window-item>
            <v-window-item value="ec-numbers">
                <v-card-text>
                    <functional-ec-results
                        :data="ecData"
                        :loading="assay.status! === AnalysisStatus.Running"
                        :show-percentage="false"
                        :show-download-item="false"
                        @download-table="downloadEcTable"
                    >
                        <template #trust>
                            <span>
                                This panel shows the Enzyme Commission numbers that were matched to your peptides.
                                <b>{{ assay.ecTrust!.annotatedItems }}</b> proteins <b>({{ displayPercentage(assay.ecTrust!.annotatedItems / assay.ecTrust!.totalItems) }})</b>
                                have at least one EC number assigned to them. Click on a row in a table to see a taxonomy tree that highlights occurrences.
                            </span>
                        </template>
                    </functional-ec-results>
                </v-card-text>
            </v-window-item>
            <v-window-item value="interpro">
                <v-card-text>
                    <functional-ipr-results
                        :data="interproData"
                        :loading="assay.status! === AnalysisStatus.Running"
                        :show-percentage="false"
                        :show-download-item="false"
                        @download-table="downloadIprTable"
                    >
                        <template #trust>
                            <span>
                                This panel shows the Interpro entries that were matched to your peptides.
                                <b>{{ assay.iprTrust!.annotatedItems }}</b> proteins <b>({{ displayPercentage(assay.iprTrust!.annotatedItems / assay.iprTrust!.totalItems) }})</b>
                                have at least one Interpro entry assigned to them. Click on a row in a table to see a taxonomy tree that highlights occurrences.
                            </span>
                        </template>
                    </functional-ipr-results>
                </v-card-text>
            </v-window-item>
        </v-window>
    </v-card>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import MatchedProteinsTable from "@/components/tables/MatchedProteinsTable.vue";
import {PeptideAnalysisStore} from "@/store/new/PeptideAnalysisStore";
import LineageTable from "@/components/tables/LineageTable.vue";
import Treeview from "@/components/results/taxonomic/Treeview.vue";
import FunctionalGoResults from "@/components/results/functional/go/FunctionalGoResults.vue";
import usePercentage from "@/composables/new/usePercentage";
import {AnalysisStatus} from "@/store/new/AnalysisStatus";
import FunctionalEcResults from "@/components/results/functional/ec/FunctionalEcResults.vue";
import FunctionalIprResults from "@/components/results/functional/ipr/FunctionalIprResults.vue";
import {GoResultsTableItem} from "@/components/results/functional/go/GoResultsTable.vue";
import useCsvDownload from "@/composables/new/useCsvDownload";
import {EcResultsTableItem} from "@/components/results/functional/ec/EcResultsTable.vue";
import {IprResultsTableItem} from "@/components/results/functional/ipr/IprResultsTable.vue";

const { displayPercentage } = usePercentage();
const { download } = useCsvDownload();

export interface Props {
    assay: PeptideAnalysisStore
    tab?: string
}

const props = withDefaults(defineProps<Props>(), {
    tab: "matched-proteins"
});

const emits = defineEmits(["tabUpdate"]);

const goData = ref<GoTableData>({
    goTable: props.assay.goTable!,
    goTrust: props.assay.goTrust!,
    goToPeptides: props.assay.goToPeptides,
});

const ecData = ref<EcTableData>({
    ecTable: props.assay.ecTable!,
    ecTrust: props.assay.ecTrust!,
    ecToPeptides: props.assay.ecToPeptides
});

const interproData = ref<InterproTableData>({
    iprTable: props.assay.iprTable!,
    iprTrust: props.assay.iprTrust!,
    iprToPeptides: props.assay.iprToPeptides
});

const currentTab = ref<string>(props.tab);

const downloadGoTable = (items: GoResultsTableItem[]) => {
    const header = ["proteins", "go term", "name"];
    const data = [header].concat(items.map(item => {
        return [
            item.count,
            item.code,
            item.name
        ];
    }));

    download(data, `unipept_${props.assay.peptide}_go_table.csv`);
}

const downloadEcTable = (items: EcResultsTableItem[]) => {
    const header = ["proteins", "ec number", "name"];
    const data = [header].concat(items.map(item => {
        return [
            item.count,
            item.code,
            item.name
        ];
    }));

    download(data, `unipept_${props.assay.peptide}_ec_table.csv`);
}

const downloadIprTable = (items: IprResultsTableItem[]) => {
    const header = ["proteins", "ipr entry", "name"];
    const data = [header].concat(items.map(item => {
        return [
            item.count,
            item.code,
            item.name
        ];
    }));

    download(data, `unipept_${props.assay.peptide}_ipr_table.csv`);
}

watch(() => props.tab, (newTab) => {
    currentTab.value = newTab;
});

watch(currentTab, (newTab) => {
    emits("tabUpdate", newTab);
});
</script>