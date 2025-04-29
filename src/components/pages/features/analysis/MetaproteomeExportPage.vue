<template>
    <v-container fluid>
        <project-export :project="groupStore" />
    </v-container>
</template>

<script setup lang="ts">
import ProjectExport from "@/components/project/ProjectExport.vue";
import useGroupAnalysisStore from "@/store/new/GroupAnalysisStore";

const groupStore = useGroupAnalysisStore();
</script>
