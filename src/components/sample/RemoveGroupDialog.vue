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
                Are you sure you want to remove the group <b>{{ group.name }}</b>? This action is irreversible. All samples and analyses will be lost.
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
                        @click="confirm"
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

const dialogOpen = defineModel<boolean>();

defineProps<{
    group: MultiAnalysisStore;
}>();

const emits = defineEmits<{
    (e: "confirm"): void;
}>();

const confirm = () => {
    dialogOpen.value = false;
    emits('confirm');
};
</script>

<style scoped>

</style>
