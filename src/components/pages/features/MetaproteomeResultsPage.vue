<template>
    <project
        :project="groupStore"
        @sample:add="addSample"
        @sample:update="updateSample"
        @sample:remove="removeSample"
        @group:add="createGroup"
        @group:update="updateGroup"
        @group:remove="removeGroup"
    />
</template>

<script setup lang="ts">
import useGroupAnalysisStore from "@/store/new/GroupAnalysisStore";
import {SampleTableItem} from "@/components/sample/SampleTable.vue";
import Project from "@/components/project/Project.vue";

const groupStore = useGroupAnalysisStore();

const addSample = (groupId: string, sample: SampleTableItem) => {
    const analysisId = groupStore.getGroup(groupId).addAnalysis(
        sample.name,
        sample.rawPeptides,
        sample.config,
        sample.intensities
    );
    groupStore.getGroup(groupId).getAnalysis(analysisId).analyse();
}

const removeSample = (groupId: string, analysisId: string) => {
    groupStore.getGroup(groupId)?.removeAnalysis(analysisId);
}

const updateSample = (groupId: string, analysisId: string, updatedSample: SampleTableItem) => {
    const analysis = groupStore.getGroup(groupId)?.getAnalysis(analysisId);
    analysis?.updateName(updatedSample.name);
    analysis?.updateConfig(updatedSample.config);
    analysis?.analyse();
}

const createGroup = groupStore.addGroup;

const removeGroup = groupStore.removeGroup;

const updateGroup = (groupId: string, updatedName: string) => {
    groupStore.getGroup(groupId)?.updateName(updatedName);
}
</script>

<script lang="ts">
import {AnalysisConfig} from "@/store/new/AnalysisConfig";
import {AnalysisStatus} from "@/store/new/AnalysisStatus";

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
