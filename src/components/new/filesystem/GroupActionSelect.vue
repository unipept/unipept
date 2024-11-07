<template>
    <v-menu>
        <template #activator="{ props }">
            <v-icon
                v-bind="props"
                icon="mdi-dots-vertical"
                @click="console.log"
            />
        </template>
        <v-list>
            <v-list-item
                class="pa-0"
                density="compact"
            >
                <v-btn
                    text="Add new samples"
                    prepend-icon="mdi-file-document-plus-outline"
                    variant="plain"
                    @click="emits('sample:add')"
                />
            </v-list-item>

            <v-divider class="my-1" />

            <v-list-item
                class="pa-0"
                density="compact"
            >
                <v-btn
                    text="Rename group"
                    prepend-icon="mdi-pencil-outline"
                    variant="plain"
                    @click="emits('group:edit')"
                />
            </v-list-item>
            <v-list-item
                class="pa-0"
                density="compact"
            >
                <v-btn
                    text="Remove group"
                    prepend-icon="mdi-delete-outline"
                    color="error"
                    variant="plain"
                    @click="emits('group:remove')"
                />
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script setup lang="ts">
const emits = defineEmits<{
    "sample:add": () => void;
    "group:edit": () => void;
    "group:remove": () => void;
}>();
</script>
