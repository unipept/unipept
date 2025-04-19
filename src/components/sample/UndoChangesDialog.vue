<template>
    <v-dialog v-model="dialogOpen" max-width="600">
        <v-unipept-card>
            <v-card-title class="text-h6 font-weight-bold">
                Confirm Undo
            </v-card-title>
            <v-card-text class="pb-0">
                <p>
                    Are you sure you want to undo all changes? This action is <b>irreversible</b>. All changes made will
                    be permanently lost.
                </p>
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn variant="text" @click="cancel">Cancel</v-btn>
                <v-btn color="error" @click="confirm">Yes, undo changes</v-btn>
            </v-card-actions>
        </v-unipept-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const dialogOpen = defineModel<boolean>();

const emit = defineEmits({
    confirm: () => true,
});

const cancel = () => {
    dialogOpen.value = false;
};

const confirm = () => {
    dialogOpen.value = false;
    emit('confirm');
};
</script>

<style scoped>
p {
    margin-bottom: 1em;
}
</style>
