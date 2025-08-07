<template>
    <v-container fluid>
        <project-export-view :project="project" />
    </v-container>
</template>

<script setup lang="ts">
import ProjectExportView from "@/components/project/ProjectExportView.vue";
import useProjectAnalysisStore from "@/store/ProjectAnalysisStore";

const project = useProjectAnalysisStore();
</script>
