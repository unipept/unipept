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
import {ref, Ref} from "vue";
import useProjectImport from "@/composables/useProjectImport";

const projectImport = useProjectImport();

const importFile: Ref<File | null> = ref(null);

const emits = defineEmits<{
    (e: "imported", project: File): void;
}>();

const importProject = () => {
    emits("imported", importFile.value!);
}
</script>

<style scoped>

</style>
