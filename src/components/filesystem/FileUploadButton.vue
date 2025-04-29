<template>
    <div class="file-upload-container">
        <v-btn
            :text="text"
            :prepend-icon="prependIcon"
            :variant="variant"
            :color="color"
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
            :accept="accept"
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
    color?: string
    variant?: "flat" | "text" | "elevated" | "tonal" | "outlined" | "plain" | undefined
    prependIcon?: string
    text?: string
    accept?: string
}>(), {
    multiple: false,
    loading: false,
    color: "primary",
    variant: "outlined",
    prependIcon: "mdi-upload",
    text: "Upload file",
    accept: "*"
});

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
