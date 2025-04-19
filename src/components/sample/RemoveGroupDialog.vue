<template>
    <v-dialog v-model="dialogOpen" max-width="600" persistent>
        <v-unipept-card>
            <v-card-title class="text-h6 font-weight-bold">
                Delete Group
            </v-card-title>
            <v-card-text class="pb-0">
                <p>
                    Are you sure you want to remove the group <b>{{ group.name }}</b>? This action is
                    <strong>irreversible</strong>. All associated samples and analyses will be permanently lost.
                </p>
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn variant="text" @click="cancel">Cancel</v-btn>
                <v-btn color="error" @click="confirm">Remove</v-btn>
            </v-card-actions>
        </v-unipept-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import {GroupAnalysisStore} from "@/store/GroupAnalysisStore";

const dialogOpen = defineModel<boolean>();

defineProps<{
    group: GroupAnalysisStore;
}>();

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

