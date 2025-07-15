<template>
    <v-container fluid>
        <database-overview
            :project="project"
            @database:update="updateDatabase"
            @database:delete="deleteDatabase"
        />
    </v-container>
</template>

<script setup lang="ts">
import DatabaseOverview from "@/components/database/DatabaseOverview.vue";
import useCustomFilterStore, {Filter, UNIPROT_ID} from "@/store/CustomFilterStore";
import {AnalysisStatus} from "@/store/AnalysisStatus";
import useProjectAnalysisStore from "@/store/ProjectAnalysisStore";

const project = useProjectAnalysisStore();
const customFilterStore = useCustomFilterStore();

const updateDatabase = async (id: string, newFilter: Filter) => {
    customFilterStore.updateFilterById(id, newFilter);

    const reanalyse = [];
    for (const group of project.groups) {
        for (const analysis of group.analyses) {
            if (analysis.config.database === id) {
                analysis.status = AnalysisStatus.Pending;
                reanalyse.push(analysis);
            }
        }
    }

    for (const analysis of reanalyse) {
        await analysis.analyse();
    }
}

const deleteDatabase = async (id: string) => {
    customFilterStore.removeFilterById(id);

    const reanalyse = [];
    for (const group of project.groups) {
        for (const analysis of group.analyses) {
            if (analysis.config.database === id) {
                analysis.updateConfig({
                    ...analysis.config,
                    database: UNIPROT_ID,
                });
                analysis.status = AnalysisStatus.Pending;
                reanalyse.push(analysis);
            }
        }
    }

    for (const analysis of reanalyse) {
        await analysis.analyse();
    }
}
</script>

<style scoped>

</style>
