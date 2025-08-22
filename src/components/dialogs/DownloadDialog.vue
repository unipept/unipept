<!--
    This dialog component is designed to handle file downloads in a browser-friendly way.
    It displays a loading state while a file is being prepared and then shows a download
    button only when the file is ready. This approach prevents browser download blocking
    that can occur when there's a long delay between the user's click and the actual
    download start. Instead, this component waits for the file to be ready before actually
    allowing the user to initiate the download.
-->
<template>
    <slot :start-preparing="startPreparing" />
    <v-dialog
        v-model="dialogOpen"
        width="400px"
    >
        <v-card>
            <v-card-title class="d-flex align-center">
                <h2 v-if="loading">Preparing download</h2>
                <h2 v-else>Download ready</h2>
                <v-spacer />
                <div class="justify-end">
                    <v-btn
                        icon="mdi-close"
                        variant="plain"
                        density="compact"
                        @click="dialogOpen = false"
                    />
                </div>
            </v-card-title>
            <v-card-text>
                <div v-if="loading" class="d-flex justify-center">
                    <v-progress-circular color="primary" indeterminate />
                </div>
                <div v-else class="d-flex justify-center flex-column">
                    We finished preparing your export. Click the button below to save the file to your computer.
                    <v-btn
                        @click="download"
                        color="primary"
                        variant="tonal"
                        text="Download"
                        prepend-icon="mdi-download"
                        class="mt-2"
                    />
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import {Ref, ref} from "vue";

const dialogOpen: Ref<boolean> = ref(false);
const loading: Ref<boolean> = ref(false);

/**
 * Events emitted by the download dialog
 * @event download - Emitted when the user clicks the download button
 * @param {Function} callback - Callback function to be called when the download is complete
 */
const emits = defineEmits<{
    (e: 'download', callback: () => void): Promise<void>
}>();

const download = async (): Promise<void> => {
    await new Promise<void>(resolve => emits("download", () => resolve()));
    dialogOpen.value = false;
}

const startPreparing = async (callback: Promise<void>) => {
    dialogOpen.value = true;
    loading.value = true;
    await callback;
    loading.value = false;
}
</script>

<style scoped>

</style>