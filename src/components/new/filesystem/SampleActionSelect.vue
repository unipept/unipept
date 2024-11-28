<template>
    <v-menu>
        <template #activator="{ props }">
            <v-icon
                v-bind="props"
                icon="mdi-dots-horizontal"
            />
        </template>
        <v-list>
            <v-list-item
                class="pa-0"
                density="compact"
            >
                <v-btn
                    text="Rename sample"
                    prepend-icon="mdi-pencil-outline"
                    variant="plain"
                    @click="emits('sample:edit')"
                />
            </v-list-item>
            <v-list-item
                class="pa-0"
                density="compact"
            >
                <v-btn
                    text="Remove sample"
                    prepend-icon="mdi-delete-outline"
                    color="error"
                    variant="plain"
                    @click="emits('sample:remove')"
                />
            </v-list-item>
        </v-list>
    </v-menu>
</template>

<script setup lang="ts">
const emits = defineEmits<{
    "sample:edit": () => void;
    "sample:remove": () => void;
}>();
</script>
