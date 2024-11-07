<template>
    <v-menu>
        <template #activator="{ props }">
            <v-icon
                v-bind="props"
                icon="mdi-dots-horizontal"
                @click="console.log"
            />
        </template>
        <v-list>
            <v-list-item
                class="pa-0"
                density="compact"
            >
                <v-btn
                    text="Show sample info"
                    prepend-icon="mdi-information-outline"
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
    "sample:info": () => void;
    "sample:edit": () => void;
    "sample:remove": () => void;
}>();
</script>
