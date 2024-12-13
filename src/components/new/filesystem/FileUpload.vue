<template>
    <div class="drag-and-drop-upload">
        <div
            class="file-upload-zone"
            :class="{ dragging: isDragging }"
            @dragover.prevent="onDragOver"
            @dragleave="onDragLeave"
            @drop.prevent="onDrop"
            @click="triggerFileInput"
        >
            <v-icon size="48" color="primary">mdi-cloud-upload</v-icon>
            <p v-if="!selectedFile">Drag and drop your file here, or <strong>click to browse</strong></p>
            <p v-else>{{ selectedFile.name }}</p>
            <small>Supported formats: CSV, TSV</small>
        </div>

        <!-- Hidden File Input -->
        <v-file-input
            ref="fileInput"
            v-model="selectedFile"
            @change="onFileSelect"
            style="display: none;"
            label="Hidden File Input"
            accept=".csv, .tsv, .txt, text/csv, text/tab-separated-values, text/plain"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";

defineProps<{
    modelValue: File | null, // v-model value
}>();

const emit = defineEmits(["update:modelValue"]); // Emits v-model updates

const isDragging = ref(false); // Tracks if the drag-over event is active
const selectedFile = ref<File | null>(null); // Tracks the selected file

const onDragOver = () => {
    isDragging.value = true;
};

const onDragLeave = () => {
    isDragging.value = false;
};

const onDrop = (event: DragEvent) => {
    isDragging.value = false;
    if (event.dataTransfer?.files.length) {
        selectedFile.value = event.dataTransfer.files[0];
    }
};

const triggerFileInput = () => {
    const fileInput = document.querySelector<HTMLInputElement>('.drag-and-drop-upload input[type="file"]');
    if (fileInput) {
        fileInput.click();
    }
};

const processFile = () => {
    if (selectedFile.value) {
        console.log(`Processing file: ${selectedFile.value.name}`);
    }
};

const onFileSelect = (file: File | null) => {
    if (file) {
        emitFile(file);
    }
};


// Emit function to update the parent component's v-model
const emitFile = (file: File) => {
    emit("update:modelValue", file);
};

</script>

<style scoped>
.file-upload-zone {
    /*noinspection CssUnresolvedCustomProperty*/
    border: 2px dashed rgb(var(--v-theme-primary));
    border-radius: 8px;
    padding: 50px;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.file-upload-zone.dragging {
    background-color: #E1F5FE;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}

.file-upload-zone:hover {
    background-color: #E1F5FE;
}
</style>