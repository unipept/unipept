<template>
    <v-unipept-card>
        <v-card-title>
            <h2>Advanced analysis</h2>
        </v-card-title>
        <v-card-text>
            <p>
                Open an existing project (<em>.unipept</em>) or start from scratch with an empty project and start analyzing
                your own data.
            </p>

            <div class="d-flex justify-end">
                <v-btn
                    class="mt-3 me-3 float-right"
                    variant="plain"
                    color="primary"
                    text="Open project"
                    prepend-icon="mdi-folder-open-outline"
                    @click="advancedAnalyze"
                />

                <v-btn
                    class="mt-3 float-right"
                    variant="tonal"
                    color="primary"
                    text="Create new project"
                    prepend-icon="mdi-folder-plus-outline"
                    @click="advancedAnalyze"
                />
            </div>
        </v-card-text>
    </v-unipept-card>
</template>

<script setup lang="ts">
const emits = defineEmits<{
    (e: 'click'): void
}>();

const advancedAnalyze = () => {
    emits('click');
};
</script>

<style scoped>

</style>
