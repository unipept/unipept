<template>
    <div class="file-upload-container">
        <v-btn
            text="Upload file"
            prepend-icon="mdi-upload"
            color="primary"
            :loading="loading"
            @click="triggerFileInput"
        />

        <!-- Hidden File Input -->
        <v-file-input
            ref="fileInput"
            v-model="selectedFiles"
            style="display: none;"
            label="Hidden File Input"
            :multiple="multiple"
            @change="onFileSelect"
        />
    </div>
</template>

<script setup lang="ts">
import {ref, useTemplateRef} from "vue";

const fileInput = useTemplateRef("fileInput");

withDefaults(defineProps<{
    multiple?: boolean
    loading?: boolean
}>(), { multiple: false, loading: false });

const emit = defineEmits(["upload"]);

const selectedFiles = ref<File | File[] | null>(null); // Tracks the selected file

const triggerFileInput = () => fileInput.value?.click();

const onFileSelect = () => {
    if (selectedFiles.value) {
        emit("upload", selectedFiles.value);
        selectedFiles.value = null;
    }
};
</script>

<style scoped>
.file-upload-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}
</style>
