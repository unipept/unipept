<template>
    <v-dialog v-model="dialogOpen" max-width="600">
        <v-unipept-card>
            <v-card-title class="text-h6 font-weight-bold">
                Confirm Deletion
            </v-card-title>
            <v-card-text class="pb-0">
                <p>
                    Are you sure you want to delete the custom database <strong>{{ database }}</strong>?
                    This action is <b>irreversible</b>.
                </p>
                <v-alert type="warning" class="mt-4">
                    Deleting this database will trigger a <em>reanalysis</em> of all samples that currently use this database.
                    The reanalysis will be performed using the default <strong>UniProtKB</strong> database.
                </v-alert>
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn variant="text" @click="cancel">Cancel</v-btn>
                <v-btn color="red-darken-2" @click="confirm">Delete</v-btn>
            </v-card-actions>
        </v-unipept-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const dialogOpen = defineModel<boolean>();

const props = defineProps<{
    database: string,
}>();

const emit = defineEmits({
    confirm: () => true,
});

const cancel = () => {
    dialogOpen.value = false;
};

const confirm = () => {
    emit('confirm');
    dialogOpen.value = false;
};
</script>

<style scoped>
p {
    margin-bottom: 1em;
}
</style>
