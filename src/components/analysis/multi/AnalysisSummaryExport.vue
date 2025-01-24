<template>
    <div class="d-flex flex-column">
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
                    @click="prepareDownload(',')"
                >
                    Comma separated (international)
                </v-list-item>
                <v-list-item
                    density="compact"
                    @click="prepareDownload(';')"
                >
                    Semicolon separated (European)
                </v-list-item>
                <v-list-item
                    density="compact"
                    @click="prepareDownload('\t')"
                >
                    Tab separated
                </v-list-item>
            </v-list>
        </v-menu>
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
    </div>
</template>

<script setup lang="ts">
import {Ref, ref} from "vue";

const emits = defineEmits<{
    (e: 'prepareDownload', delimiter: string, callback: () => {}): Promise<void>,
    (e: 'download'): void
}>();

const dialogOpen: Ref<boolean> = ref(false);
const loading: Ref<boolean> = ref(false);

const prepareDownload = async (delimiter: string): Promise<void> => {
    loading.value = true;
    dialogOpen.value = true;
    await new Promise<void>(resolve => emits("prepareDownload", delimiter, resolve));
    loading.value = false;
}

const download = async (): Promise<void> => {
    await new Promise<void>(resolve => emits("download", resolve));
    dialogOpen.value = false;
}
</script>
