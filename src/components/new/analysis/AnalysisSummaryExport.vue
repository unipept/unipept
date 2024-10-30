<template>
    <v-menu>
        <template #activator="{ props }">
            <v-btn
                v-bind="props"
                text="Export results"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-download"
                append-icon="mdi-chevron-down"
            />
        </template>
        <v-list density="compact">
            <v-list-item
                density="compact"
                @click="downloadCommaSeparated"
            >
                Comma separated (international)
            </v-list-item>
            <v-list-item
                density="compact"
                @click="downloadSemicolonSeparated"
            >
                Semicolon separated (European)
            </v-list-item>
            <v-list-item
                density="compact"
                @click="downloadTabSeparated"
            >
                Tab separated
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script setup lang="ts">
const emits = defineEmits<{
    download: (delimiter: string) => void
}>();

const downloadSemicolonSeparated = () => emits("download", ";");
const downloadCommaSeparated = () => emits("download", ",");
const downloadTabSeparated = () => emits("download", "\t")
</script>
