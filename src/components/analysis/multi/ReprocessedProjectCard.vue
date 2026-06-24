<template>
    <v-unipept-card :disabled="disabled">
        <v-card-title>
            <h2 class="mt-2" style="white-space: normal;">Open a reprocessed PRIDE Project</h2>
        </v-card-title>

        <v-card-text>
            <p>
                Reprocessed datasets are public metaproteomics datasets from PRIDE whose raw mass
                spectrometry data were reanalysed with a standardized Sage and MS²Rescore workflow.
                Because of this consistent workflow, the results shown in Unipept may differ from
                those reported in the original publications.
            </p>

            <v-expand-transition>
                <div v-if="showDetails" class="text-medium-emphasis">
                    <p class="mt-2">
                        Reprocessed datasets are public metaproteomics datasets, available on PRIDE,
                        for which the original raw mass spectrometry data were analysed again using a
                        standardized workflow. Instead of directly reusing the peptide identifications
                        reported in the original publication, the spectra were searched again using
                        Sage and MS²Rescore
                        (<a href="https://doi.org/10.1101/2025.02.17.638783" target="_blank" rel="noopener">doi:10.1101/2025.02.17.638783v2</a>).
                    </p>
                    <p class="mt-2">
                        At this stage, only human gut datasets have been reprocessed. These datasets
                        were searched against the UHGP v2.0.2 protein catalogue clustered at 90% amino
                        acid identity, concatenated with the human reference proteome and the cRAP
                        contaminant database. Searches allowed up to two missed cleavages, with a
                        precursor mass tolerance of 20 ppm and a fragment mass tolerance of 20 ppm.
                        Carbamidomethylation of cysteine was set as a fixed modification, while
                        methionine oxidation and protein N-terminal acetylation were included as
                        variable modifications.
                    </p>
                    <p class="mt-2">
                        Because these datasets were reprocessed with a consistent workflow, database,
                        and search strategy, the results shown in Unipept may differ from those
                        reported in the original publications.
                    </p>
                </div>
            </v-expand-transition>

            <v-btn
                class="px-0"
                variant="text"
                color="primary"
                density="compact"
                :append-icon="showDetails ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                :text="showDetails ? 'Show less' : 'Learn more'"
                @click="showDetails = !showDetails"
            />

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
                    <template #append>
                        <v-icon icon="mdi-chevron-right" />
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
const showDetails = ref(false);

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
