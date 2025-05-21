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
    />
</template>

<script setup lang="ts">
import {SampleTableItem} from "@/components/sample/SampleTable.vue";
import Project from "@/components/project/Project.vue";
import useUnipeptAnalysisStore from "@/store/UnipeptAnalysisStore";

const { project, isDemoMode } = useUnipeptAnalysisStore();

const addSample = (groupId: string, sample: SampleTableItem) => {
    console.log("Adding sample...");
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
    console.log("Updating sample...");
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
</script>

<script lang="ts">
import {AnalysisConfig} from "@/store/AnalysisConfig";
import {AnalysisStatus} from "@/store/AnalysisStatus";

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
