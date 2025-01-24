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
                Are you sure you want to undo all changes? All changes made will be lost. This action is irreversible.
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
                        Yes, undo changes
                    </v-btn>
                </div>
            </v-alert>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
const dialogOpen = defineModel<boolean>();

const emits = defineEmits<{
    "confirm": () => void;
}>();

const confirm = () => {
    dialogOpen.value = false;
    emits('confirm');
};
</script>

<style scoped>

</style>