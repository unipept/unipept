<template>
    <v-unipept-card>
        <v-card-title>
            <h2>Import project</h2>
        </v-card-title>
        <v-card-text>
            <file-upload
                v-model="importFile"
                class="mb-4"
            />
            <v-btn
                class="float-right"
                variant="tonal"
                text="Import"
                :disabled="!importFile"
                @click="importProject"
            />
        </v-card-text>
    </v-unipept-card>
</template>

<script setup lang="ts">
import FileUpload from "@/components/filesystem/FileUpload.vue";
import {GroupAnalysisStoreImport} from "@/store/new/GroupAnalysisStore";
import {ref, Ref} from "vue";
import useProjectImport from "@/components/project/import/useProjectImport";

const projectImport = useProjectImport();

const importFile: Ref<File | null> = ref(null);

const emits = defineEmits<{
    (e: "imported", project: GroupAnalysisStoreImport): void;
}>();

const importProject = async () => {
    const project = await projectImport.process(importFile.value);
    emits("imported", project);
}
</script>

<style scoped>

</style>
