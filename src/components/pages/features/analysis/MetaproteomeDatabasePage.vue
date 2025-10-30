<template>
    <v-container fluid>
        <database-overview
            :project="project"
            @database:update-name="updateDatabaseName"
            @database:update-filter="updateDatabaseFilter"
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

const updateDatabaseName = (id: string, newFilter: Filter) => {
    customFilterStore.updateFilterById(id, newFilter);
}

const updateDatabaseFilter = async (id: string, newFilter: Filter) => {
    updateDatabaseName(id, newFilter);

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
