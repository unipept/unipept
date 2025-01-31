<template>
    <v-row>
        <v-col>
            <v-alert
                color="primary"
                variant="tonal"
                type="info"
            >
                <div class="d-flex flex-column justify-center">
                    <b>{{ text }}</b>
                    <v-progress-linear
                        class="mt-3"
                        color="primary"
                        indeterminate
                        rounded
                    />
                </div>
            </v-alert>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
defineProps<{
    text: string
}>();
</script>

<style scoped>

</style>
