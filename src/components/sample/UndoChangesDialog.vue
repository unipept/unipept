<template>
    <v-dialog
        v-model="dialogOpen"
        max-width="450px"
    >
        <v-unipept-card>
            <v-card-text class="pa-4">
                <v-alert type="error" variant="tonal" density="compact">
                    Are you sure you want to undo all changes? This action is
                    <strong>irreversible</strong>. All changes made will be permanently lost.
                </v-alert>
            </v-card-text>

            <v-card-actions class="d-flex justify-end">
                <v-btn
                    variant="text"
                    @click="dialogOpen = false"
                >
                    Cancel
                </v-btn>

                <v-btn
                    color="error"
                    variant="flat"
                    @click="confirm"
                >
                    Yes, undo changes
                </v-btn>
            </v-card-actions>
        </v-unipept-card>
    </v-dialog>
</template>

<script setup lang="ts">
const dialogOpen = defineModel<boolean>();

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