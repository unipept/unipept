<template>
    <download-dialog @download="download">
        <template #default="{ startPreparing }">
            <v-menu>
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        text="Export results"
                        color="primary"
                        variant="tonal"
                        prepend-icon="mdi-download"
                        append-icon="mdi-chevron-down"
                        :loading="loading"
                    />
                </template>
                <v-list density="compact">
                    <v-list-item
                        density="compact"
                        @click="startPreparing(prepareDownload(','))"
                    >
                        Comma separated (international)
                    </v-list-item>
                    <v-list-item
                        density="compact"
                        @click="startPreparing(prepareDownload(';'))"
                    >
                        Semicolon separated (European)
                    </v-list-item>
                    <v-list-item
                        density="compact"
                        @click="startPreparing(prepareDownload('\t'))"
                    >
                        Tab separated
                    </v-list-item>
                </v-list>
            </v-menu>
        </template>
    </download-dialog>
</template>

<script setup lang="ts">
import DownloadDialog from "@/components/dialogs/DownloadDialog.vue";
import {ref, Ref} from "vue";

const emits = defineEmits<{
    (e: 'prepareDownload', delimiter: string, callback: () => void): Promise<void>,
    (e: 'download', callback: () => void): Promise<void>
}>();

const loading: Ref<boolean> = ref(false);

const prepareDownload = async (delimiter: string): Promise<void> => {
    loading.value = true;
    await new Promise<void>(resolve => emits("prepareDownload", delimiter, () => resolve()));
    loading.value = false;
}

const download = async (callback: () => void): Promise<void> => {
    await emits("download", callback);
}
</script>
