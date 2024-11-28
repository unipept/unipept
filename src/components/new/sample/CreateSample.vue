<template>
    <v-dialog
        v-model="dialogOpen"
        max-width="80%"
        height="80%"
    >
        <v-card>
            <v-card-title class="d-flex align-center">
                <h2>Manage samples</h2>
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

            <v-card-text class="d-flex flex-column">
                <sample-table v-model="samples" />

                <v-spacer />

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
import SampleTable, {SampleTableItem} from "@/components/new/sample/SampleTable.vue";
import {ref} from "vue";

const dialogOpen = defineModel<boolean>();

const emit = defineEmits<{
    confirm: (samples: SampleTableItem[]) => void
}>();

const samples = ref<SampleTableItem[]>([]);

const confirmChanges = () => {
    emit('confirm', samples.value);
    undoChanges();
};

const undoChanges = () => {
    samples.value = [];
    dialogOpen.value = false;
};
</script>
