<template>
    <v-dialog
        v-model="dialogOpen"
        max-width="50%"
    >
        <v-card>
            <v-alert
                type="error"
                icon="mdi-alert"
                variant="tonal"
            >
                <b>Are you sure you want to remove the group? Removing this group will also remove all samples associated with it:</b>
                <ul class="mt-1">
                    <li v-for="sample in group.analyses" :key="sample.id">
                        {{ sample.name }}
                    </li>
                </ul>
                <div class="d-flex justify-end">
                    <v-btn
                        class="me-3"
                        variant="text"
                        @click="dialogOpen = false"
                    >
                        Cancel
                    </v-btn>

                    <v-btn
                        color="error"
                        @click="emits('confirm')"
                    >
                        Remove
                    </v-btn>
                </div>
            </v-alert>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import {MultiAnalysisStore} from "@/store/new/MultiAnalysisStore";

const dialogOpen = defineModel({ default: false });

const props = defineProps<{
    group: MultiAnalysisStore;
}>();

const emits = defineEmits<{
    "confirm": () => void;
}>();
</script>

<style scoped>

</style>
