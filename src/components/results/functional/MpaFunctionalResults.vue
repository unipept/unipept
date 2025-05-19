<template>
    <v-unipept-card class="pa-0">
        <v-tabs
            v-model="currentTab"
            bg-color="primary"
            slider-color="secondary"
        >
            <v-tab text="GO terms" />
            <v-tab text="EC numbers" />
            <v-tab text="InterPro entries" />

            <v-spacer />

            <v-menu>
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        class="align-self-center mr-4"
                        :text="sortPeptidePercentage ? 'Peptides %' : 'Peptides'"
                        variant="text"
                        prepend-icon="mdi-sort-descending"
                        append-icon="mdi-menu-down"
                    />
                </template>

                <v-list
                    class="grey-lighten-3"
                    density="compact"
                >
                    <v-list-item
                        density="compact"
                        class="menu-header"
                    >
                        Sort by number of peptides in related proteins
                        <v-btn
                            color="primary"
                            icon="mdi-help-circle"
                            variant="plain"
                            size="small"
                            @click="sortingPeptidesDialogOpen = true"
                        />
                    </v-list-item>
                    <v-list-item
                        title="Peptides %"
                        @click="sortPeptidePercentage = true"
                    />
                    <v-list-item
                        title="Peptides"
                        @click="sortPeptidePercentage = false"
                    />
                </v-list>
            </v-menu>

            <v-btn
                class="align-self-center mr-4"
                text="Set threshold"
                variant="text"
                prepend-icon="mdi-filter-outline"
                @click="filterModalOpen = true"
            />

            <sorting-peptides-dialog v-model="sortingPeptidesDialogOpen" />

            <filter-functional-results
                v-model="filterModalOpen"
                :filter-percentage="analysis.functionalFilter"
                @confirm="updateFilter"
            />
        </v-tabs>

        <v-card-text>
            <v-tabs-window v-model="currentTab">
                <v-tabs-window-item>
                    <functional-go-results
                        :data="goData"
                        :loading="analysis.filteringStatus === AnalysisStatus.Running"
                        :show-percentage="sortPeptidePercentage"
                        @download-item="downloadGoItem"
                        @download-table="downloadGoTable"
                    >
                        <template #trust>
                            <span>
                                This panel shows the Gene Ontology annotations that were matched to your peptides.
                                <b>{{ analysis.goTrust!.annotatedItems }}</b> proteins <b>({{ displayPercentage(analysis.goTrust!.annotatedItems / analysis.goTrust!.totalItems) }})</b>
                                have at least one GO term assigned to them. Click on a row in a table to see a taxonomy tree that highlights occurrences.
                            </span>
                        </template>
                    </functional-go-results>
                </v-tabs-window-item>

                <v-tabs-window-item>
                    <functional-ec-results
                        :data="ecData"
                        :loading="analysis.filteringStatus === AnalysisStatus.Running"
                        :show-percentage="sortPeptidePercentage"
                        @download-item="downloadEcItem"
                        @download-table="downloadEcTable"
                    >
                        <template #trust>
                            <span>
                                This panel shows the Gene Ontology annotations that were matched to your peptides.
                                <b>{{ analysis.ecTrust!.annotatedItems }}</b> proteins <b>({{ displayPercentage(analysis.ecTrust!.annotatedItems / analysis.ecTrust!.totalItems) }})</b>
                                have at least one EC number assigned to them. Click on a row in a table to see a taxonomy tree that
                                highlights occurrences.
                            </span>
                        </template>
                    </functional-ec-results>
                </v-tabs-window-item>

                <v-tabs-window-item>
                    <functional-ipr-results
                        :data="iprData"
                        :loading="analysis.filteringStatus === AnalysisStatus.Running"
                        :show-percentage="sortPeptidePercentage"
                        @download-item="downloadInterproItem"
                        @download-table="downloadInterproTable"
                    >
                        <template #trust>
                            <span>
                                This panel shows the InterPro annotations that were matched to your peptides.
                                <b>{{ analysis.iprTrust!.annotatedItems }}</b> proteins <b>({{ displayPercentage(analysis.iprTrust!.annotatedItems / analysis.iprTrust!.totalItems) }})</b>
                                have at least one InterPro entry assigned to them. Click on a row in a table to see a taxonomy tree that
                                highlights occurrences.
                            </span>
                        </template>
                    </functional-ipr-results>
                </v-tabs-window-item>
            </v-tabs-window>
        </v-card-text>
    </v-unipept-card>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import FunctionalGoResults from "@/components/results/functional/go/FunctionalGoResults.vue";
import SortingPeptidesDialog from "@/components/results/functional/SortingPeptidesDialog.vue";
import FunctionalEcResults from "@/components/results/functional/ec/FunctionalEcResults.vue";
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import FunctionalIprResults from "@/components/results/functional/ipr/FunctionalIprResults.vue";
import FilterFunctionalResults from "@/components/results/functional/FilterFunctionalResults.vue";
import usePercentage from "@/composables/usePercentage";
import GoTableData from "@/components/results/functional/go/GoTableData";
import EcTableData from "@/components/results/functional/ec/EcTableData";
import InterproTableData from "@/components/results/functional/ipr/InterproTableData";
import {AnalysisStatus} from "@/store/AnalysisStatus";
import {GoResultsTableItem} from "@/components/results/functional/go/GoResultsTable.vue";
import useCsvDownload from "@/composables/useCsvDownload";
import useOntologyStore from "@/store/OntologyStore";
import {EcResultsTableItem} from "@/components/results/functional/ec/EcResultsTable.vue";
import {IprResultsTableItem} from "@/components/results/functional/ipr/IprResultsTable.vue";

const { analysis } = defineProps<{
    analysis: SingleAnalysisStore
}>();

const { displayPercentage } = usePercentage();
const { download } = useCsvDownload();
const { getNcbiDefinition } = useOntologyStore();

const currentTab = ref(0);
const sortPeptidePercentage = ref(false);
const sortingPeptidesDialogOpen = ref(false);
const filterModalOpen = ref<boolean>(false);

const goData = computed(() => ({
    goTable: analysis.goTable!,
    goTrust: analysis.goTrust!,
    ncbiTree: analysis.ncbiTree,
    goToPeptides: analysis.goToPeptides!,
    lcaToPeptides: analysis.lcaToPeptides
}));

const ecData = computed(() => ({
    ecTable: analysis.ecTable!,
    ecTrust: analysis.ecTrust!,
    ncbiTree: analysis.ncbiTree,
    ecToPeptides: analysis.ecToPeptides!,
    lcaToPeptides: analysis.lcaToPeptides
}));

const iprData = computed(() => ({
    iprTable: analysis.iprTable!,
    iprTrust: analysis.iprTrust!,
    ncbiTree: analysis.ncbiTree,
    iprToPeptides: analysis.iprToPeptides!,
    lcaToPeptides: analysis.lcaToPeptides
}));

const updateFilter = (value: number) => {
    analysis.updateFunctionalFilter(value);
}

const downloadGoItem = (item: GoResultsTableItem) => {
    const header = ["peptide", "spectral count", "matching proteins", `matching proteins with ${item.code}`, `percentage proteins with ${item.code}`, "lca"];
    const exportData = [header].concat(Array.from(analysis.goToPeptides!.get(item.code)!).map(peptide => {
        const peptideData = analysis.peptideToData!.get(peptide)!;
        const totalProteinCount = peptideData.faCounts.all;
        const itemProteinCount = peptideData.go[item.code] ?? 0;
        return [
            peptide,
            analysis.peptidesTable!.counts.get(peptide),
            totalProteinCount,
            itemProteinCount,
            displayPercentage(itemProteinCount / totalProteinCount, Infinity),
            getNcbiDefinition(peptideData.lca)?.name ?? "Unknown"
        ];
    }));

    download(exportData, `unipept_${analysis.name.replaceAll(" ", "_")}_${item.code.replace(":", "_")}.csv`);
}

const downloadGoTable = (items: GoResultsTableItem[]) => {
    const header = ["peptides", "go term", "name"];
    const data = [header].concat(items.map(item => {
        return [
            item.count.toString(),
            item.code,
            item.name
        ];
    }));
    download(data, `unipept_${analysis.name.replaceAll(" ", "_")}_go_table.csv`);
}

const downloadEcItem = (item: EcResultsTableItem) => {
    const header = ["peptide", "spectral count", "matching proteins", `matching proteins with ${item.code}`, `percentage proteins with ${item.code}`, "lca"];
    const data = [header].concat(Array.from(analysis.ecToPeptides!.get(item.code)!).map(peptide => {
        const peptideData = analysis.peptideToData!.get(peptide);
        const totalProteinCount = peptideData!.faCounts.all;
        const itemProteinCount = peptideData!.ec[item.code] ?? 0;
        return [
            peptide,
            analysis.peptidesTable!.counts.get(peptide),
            totalProteinCount,
            itemProteinCount,
            displayPercentage(itemProteinCount / totalProteinCount, Infinity),
            getNcbiDefinition(peptideData!.lca)?.name ?? "Unknown"
        ];
    }));

    download(data, `unipept_${analysis.name.replaceAll(" ", "_")}_${item.code.replace(":", "_")}.csv`);
}

const downloadEcTable = (items: EcResultsTableItem[]) => {
    const header = ["peptides", "ec number", "name"]
    const data = [header].concat(items.map(item => {
        return [
            item.count.toString(),
            item.code,
            item.name
        ];
    }));

    download(data, `unipept_${analysis.name.replaceAll(" ", "_")}_ec_table.csv`);
}

const downloadInterproItem = (item: IprResultsTableItem) => {
    const header = ["peptide", "spectral count", "matching proteins", `matching proteins with ${item.code}`, `percentage proteins with ${item.code}`, "lca"];
    const data = [header].concat(Array.from(analysis.iprToPeptides!.get(item.code)!).map(peptide => {
        const peptideData = analysis.peptideToData!.get(peptide);
        const totalProteinCount = peptideData!.faCounts.all;
        const itemProteinCount = peptideData!.ipr[item.code] ?? 0;
        return [
            peptide,
            analysis.peptidesTable!.counts.get(peptide),
            totalProteinCount,
            itemProteinCount,
            displayPercentage(itemProteinCount / totalProteinCount, Infinity),
            getNcbiDefinition(peptideData!.lca)?.name ?? "Unknown"
        ];
    }));

    download(data, `unipept_${analysis.name.replaceAll(" ", "_")}_${item.code.replace(":", "_")}.csv`);
}

const downloadInterproTable = (items: IprResultsTableItem[]) => {
    const header = ["peptides", "interpro entry", "name"]
    const data = [header].concat(items.map(item => {
        return [
            item.count.toString(),
            item.code,
            item.name
        ];
    }));

    download(data, `unipept_${analysis.name.replaceAll(" ", "_")}_interpro_table.csv`);
}
</script>

<style scoped>

</style>
