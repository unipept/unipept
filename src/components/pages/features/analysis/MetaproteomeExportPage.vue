<template>
    <v-container fluid>
        <project-export :project="project" />
    </v-container>
</template>

<script setup lang="ts">
import ProjectExport from "@/components/project/ProjectExport.vue";
import useProjectAnalysisStore from "@/store/ProjectAnalysisStore";

const project = useProjectAnalysisStore();
</script>
