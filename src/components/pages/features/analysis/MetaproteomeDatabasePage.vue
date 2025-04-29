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
import useCustomFilterStore, {Filter} from "@/store/CustomFilterStore";
import {AnalysisStatus} from "@/store/AnalysisStatus";
import useProjectAnalysisStore from "@/store/ProjectAnalysisStore";

const project = useProjectAnalysisStore();
const customFilterStore = useCustomFilterStore();

const updateDatabase = async (name: string, newName: string, newFilter: Filter) => {
    customFilterStore.updateFilter(name, newName, newFilter);

    const reanalyse = [];
    for (const group of project.groups) {
        for (const analysis of group.analyses) {
            if (analysis.config.database === name) {
                analysis.updateConfig({
                    ...analysis.config,
                    database: newName,
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

const deleteDatabase = async (name: string) => {
    customFilterStore.removeFilter(name);

    const reanalyse = [];
    for (const group of project.groups) {
        for (const analysis of group.analyses) {
            if (analysis.config.database === name) {
                analysis.updateConfig({
                    ...analysis.config,
                    database: "UniProtKB",
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
