<template>
    <v-alert
        class="pb-2 my-4"
        variant="outlined"
        border="start"
        color="secondary"
        elevation="1"
        :title="title"
    >
        <slot />
    </v-alert>
</template>

<script setup lang="ts">
export interface Props {
    title: string
}

defineProps<Props>();
</script>

<style scoped>
.v-alert {
    font-size: inherit;
    padding-left: 32px;
    padding-bottom: 0;
}
</style>
