<template>
    <v-dialog
        v-model="dialogOpen"
        max-width="80%"
    >
        <v-card>
            <v-card-title class="d-flex align-center">
                <h2>Create samples</h2>
                <v-spacer />
                <v-btn
                    icon
                    flat
                    @click="undoChanges"
                >
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-subtitle>
                Create one or more assays and modify their search configuration using the settings below.
            </v-card-subtitle>

            <v-card-text>
                <sample-table v-model="localSamples" />

                <div class="d-flex justify-end">
                    <v-btn
                        color="primary"
                        variant="text"
                        text="Cancel"
                        @click="undoChanges"
                    />
                    <v-btn
                        class="ms-2"
                        color="primary"
                        variant="tonal"
                        text="Save samples"
                        prepend-icon="mdi-content-save-outline"
                        @click="confirmChanges"
                    />
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import SampleTable from "@/components/new/sample/SampleTable.vue";
import {ref, watch} from "vue";
import {Analysis} from "@/components/pages/TestPage.vue";

const dialogOpen = defineModel<boolean>();
const samples = defineModel<Analysis[]>('samples')

const localSamples = ref<Analysis[]>([]);

const confirmChanges = () => {
    dialogOpen.value = false;
    samples.value = localSamples.value;
};

const undoChanges = () => {
    dialogOpen.value = false;
};

watch(dialogOpen, (value) => {
    if (value) {
        localSamples.value = JSON.parse(JSON.stringify(samples.value))
    }
});
</script>
