<template>
    <v-unipept-card :disabled="disabled">
        <v-card-title>
            <h2 class="mt-2" style="white-space: normal;">Open a reprocessed PRIDE Project</h2>
        </v-card-title>

        <v-card-text>
            <p>Open a dataset we've already preprocessed from the PRIDE repository.</p>

            <v-text-field
                v-model="search"
                class="mt-3"
                density="compact"
                variant="outlined"
                hide-details
                clearable
                prepend-inner-icon="mdi-magnify"
                autocomplete="off"
                placeholder="Search dataset by PXD accession"
            />

            <div
                v-if="loading"
                class="d-flex justify-center my-5"
            >
                <v-progress-circular color="primary" indeterminate />
            </div>

            <v-list
                v-else
                class="mt-2"
                style="max-height: 300px; overflow-y: auto;"
                density="compact"
            >
                <v-list-item
                    v-for="accession in filtered"
                    :key="accession"
                    :title="accession"
                    rounded="lg"
                    @click="emits('select', accession)"
                >
                    <template #prepend>
                        <v-avatar color="primary">
                            <v-icon icon="mdi-database" />
                        </v-avatar>
                    </template>
                </v-list-item>

                <v-list-item v-if="filtered.length === 0">
                    <span class="text-medium-emphasis">No datasets found.</span>
                </v-list-item>
            </v-list>
        </v-card-text>
    </v-unipept-card>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";

const {accessions, loading = false, disabled = false} = defineProps<{
    accessions: string[],
    loading?: boolean,
    disabled?: boolean
}>();

const emits = defineEmits<{
    (e: "select", accession: string): void;
}>();

const search = ref("");

const filtered = computed(() => {
    const term = (search.value ?? "").trim().toLowerCase();
    if (term.length === 0) {
        return accessions;
    }
    return accessions.filter(accession => accession.toLowerCase().includes(term));
});
</script>

<style scoped>

</style>
