<template>
    <v-menu contained>
        <template #activator="{ props }">
            <v-btn
                v-bind="props"
                text="Add new sample"
                color="primary"
                variant="text"
                prepend-icon="mdi-plus"
            />
        </template>
        <v-list>
            <v-list-item
                class="selector-item"
                density="compact"
                @click="emits('samplePeptides')"
            >
                From peptide list
            </v-list-item>
            <v-list-item
                density="compact"
                @click="emits('sampleFiles')"
            >
                Import from file(s)
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script setup lang="ts">
const emits = defineEmits<{
    (e: 'samplePeptides'): void;
    (e: 'sampleFiles'): void;
}>();
</script>

<style scoped>

</style>
