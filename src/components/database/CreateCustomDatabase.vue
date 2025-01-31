<template>
    <v-dialog
        v-model="dialogOpen"
        max-width="80%"
    >
        <v-card>
            <v-card-title class="d-flex align-center">
                <h2>Create custom database</h2>
                <v-spacer />
                <v-btn
                    icon
                    flat
                    @click="dialogOpen = false"
                >
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-divider />

            <v-card-text class="mt-2">
                <v-stepper-vertical
                    color="primary"
                    flat
                >
                    <template #default="{ step, next, prev }">
                        <v-stepper-vertical-item
                            :complete="step > 1"
                            :editable="step > 1"
                            title="Database name"
                            subtitle="Provide basic construction details"
                            value="1"
                        >
                            <v-form v-model="isValidDatabaseName">
                                <v-container fluid>
                                    <v-row>
                                        <v-col cols="12">
                                            <div>
                                                <v-text-field
                                                    v-model="databaseName"
                                                    density="comfortable"
                                                    variant="outlined"
                                                    label="Database name"
                                                    :rules="[
                                                        v => !!v || 'Provide a valid name for your database',
                                                    ]"
                                                />
                                            </div>
                                            <div class="mt-n6">
                                                <span class="text-caption text-grey-darken-2">Give your database a name to easily recognize it.</span>
                                            </div>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-form>

                            <template #next>
                                <v-btn
                                    color="primary"
                                    text="Continue"
                                    :disabled="!isValidDatabaseName"
                                    @click="next"
                                />
                            </template>

                            <template #prev />
                        </v-stepper-vertical-item>

                        <v-stepper-vertical-item
                            :complete="step > 2"
                            :editable="isValidDatabaseName"
                            title="Construction method"
                            subtitle="Please select how you want to construct the database"
                            value="2"
                        >
                            <v-container fluid>
                                <v-row>
                                    <v-col cols="6">
                                        <span>
                                            Manually select which UniProt sources (e.g. TrEMBL and SwissProt) should be
                                            used for the database construction and which proteins should be included
                                            based on a given set of taxa.
                                        </span>
                                    </v-col>

                                    <v-col cols="6">
                                        <span>
                                            Provide a list of UniProt reference proteomes that should be used as the
                                            basis for a custom protein reference database. All available UniProt sources
                                            (both TrEMBL and SwissProt) will be consulted in this case.
                                        </span>
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col
                                        cols="6"
                                        class="d-flex flex-column"
                                    >
                                        <v-btn
                                            color="primary"
                                            text="Manually filter database"
                                            variant="tonal"
                                            @click="filter = Filter.Manually; next()"
                                        />
                                    </v-col>
                                    <v-col
                                        cols="6"
                                        class="d-flex flex-column"
                                    >
                                        <v-btn
                                            color="primary"
                                            text="Construct from reference proteomes"
                                            variant="tonal"
                                            @click="filter = Filter.ReferenceProteomes; next()"
                                        />
                                    </v-col>
                                </v-row>
                            </v-container>

                            <template #actions />
                        </v-stepper-vertical-item>

                        <v-stepper-vertical-item
                            v-if="filter === Filter.None"
                            :complete="step > 3"
                            title="Select a construction method first"
                            value="3"
                        />

                        <v-stepper-vertical-item
                            v-else-if="filter === Filter.Manually"
                            :complete="step > 3"
                            editable
                            title="Filter organisms"
                            subtitle="Select which organisms will be present in the output database"
                            value="3"
                        >
                            <taxa-browser v-model="selectedTaxa" />

                            <template #prev>
                                <v-btn 
                                    color="primary" 
                                    variant="tonal" 
                                    text="Build database" 
                                    @click="buildTaxonDatabase" 
                                />
                            </template>

                            <template #next>
                                <v-btn
                                    color="primary"
                                    variant="text"
                                    text="Go back"
                                    @click="prev"
                                />
                            </template>
                        </v-stepper-vertical-item>

                        <v-stepper-vertical-item
                            v-else
                            :complete="step > 3"
                            editable
                            title="Select reference proteomes"
                            subtitle="Decide on a set of reference proteomes that should be present in the database"
                            value="3"
                        >
                            <proteome-browser v-model="selectedProteomes" />

                            <template #prev>
                                <v-btn
                                    color="primary"
                                    variant="tonal"
                                    text="Build database"
                                    @click="buildProteomeDatabase"
                                />
                            </template>

                            <template #next>
                                <v-btn
                                    color="primary"
                                    variant="text"
                                    text="Go back"
                                    @click="prev"
                                />
                            </template>
                        </v-stepper-vertical-item>
                    </template>
                </v-stepper-vertical>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import {ref} from "vue";
import TaxaBrowser from "@/components/taxon/TaxaBrowser.vue";
import {NcbiTaxon} from "unipept-web-components";
import ProteomeBrowser from "@/components/proteomes/ProteomeBrowser.vue";

const dialogOpen = defineModel<boolean>();

const databaseName = ref<string>();
const isValidDatabaseName = ref(false);
const filter = ref<Filter>(Filter.None);

const selectedTaxa = ref<NcbiTaxon[]>([]);
const selectedProteomes = ref<any[]>([]);

const buildTaxonDatabase = () => {
    dialogOpen.value = false;
};

const buildProteomeDatabase = () => {
    dialogOpen.value = false;
};
</script>

<script lang="ts">
enum Filter {
    None,
    Manually,
    ReferenceProteomes
}
</script>

<style scoped>
:deep(.v-stepper-vertical-actions.v-stepper-actions) {
    padding-top: 0;
}
</style>