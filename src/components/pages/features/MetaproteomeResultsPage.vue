<template>
    <v-container class="py-0" fluid>
        <v-alert
            v-if="isDemoMode"
            type="info"
        >
            You are currently in <b>demo</b> mode. Changes made to the project will not be saved. To save your changes, please create a new project.
        </v-alert>
    </v-container>

    <project
        :project="project"
        @sample:add="addSample"
        @sample:update="updateSample"
        @sample:remove="removeSample"
        @group:add="createGroup"
        @group:update="updateGroup"
        @group:remove="removeGroup"
        @database:update="updateDatabase"
        @database:delete="deleteDatabase"
    />
</template>

<script setup lang="ts">
import {SampleTableItem} from "@/components/sample/SampleTable.vue";
import Project from "@/components/project/Project.vue";
import useCustomFilterStore, {Filter} from "@/store/CustomFilterStore";
import useUnipeptAnalysisStore from "@/store/UnipeptAnalysisStore";

const { project, isDemoMode } = useUnipeptAnalysisStore();
const customFilterStore = useCustomFilterStore();

const addSample = (groupId: string, sample: SampleTableItem) => {
    const analysisId = project.getGroup(groupId).addAnalysis(
        sample.name,
        sample.rawPeptides,
        sample.config,
        sample.intensities
    );
    const analysis = project.getGroup(groupId).getAnalysis(analysisId);
    if (!analysis) {
      throw Error(`Could not create a new analysis with the provided properties. Analysis with id ${analysisId} is invalid.`);
    } else {
      analysis.analyse();
    }
}

const removeSample = (groupId: string, analysisId: string) => {
    project.getGroup(groupId)?.removeAnalysis(analysisId);
}

const updateSample = (groupId: string, analysisId: string, updatedSample: SampleTableItem) => {
    const analysis = project.getGroup(groupId)?.getAnalysis(analysisId);
    analysis?.updateName(updatedSample.name);
    analysis?.updateConfig(updatedSample.config);
    analysis?.analyse();
}

const createGroup = project.addGroup;

const removeGroup = project.removeGroup;

const updateGroup = (groupId: string, updatedName: string) => {
    project.getGroup(groupId)?.updateName(updatedName);
}

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

<script lang="ts">
import {AnalysisConfig} from "@/store/AnalysisConfig";
import {AnalysisStatus} from "@/store/AnalysisStatus";

export interface AnalysisGroup {
    name: string;
    analysis: Analysis[];
    open: boolean;
}

export interface Analysis {
    id: number;
    sample: Sample;
    config: AnalysisConfig;
    result: AnalysisResult;
}

export interface Sample {
    name: string;
    rawPeptides: string;
}

export interface AnalysisResult {
    status: AnalysisStatus;
    config: AnalysisConfig;
}
</script>

<style scoped>

</style>
