<template>
    <v-card>
        <v-tabs
            style="pointer-events: none;"
            slider-color="primary"
            background-color="primary"
            dark
        >
            <v-tab>Search for a single tryptic peptide</v-tab>
        </v-tabs>

        <v-card-text>
            <router-link
                :to="{
                    name: 'tpaResult',
                    params: { sequence: sequence.toUpperCase() },
                    query: { equate: equateIl }
                }"
                v-slot="{ navigate }"
            >
                <v-form ref="form" v-model="validForm" @submit="navigate">
                    <v-row>
                        <v-col>
                            <p class="mb-0">
                                Search for a single tryptic peptide (e.g. <ResourceLink to="/tpa/MDGTEYIIVK?equate=true" router>MDGTEYIIVK</ResourceLink>) by entering the sequence below. Note that your input should only consist of <b>5</b> to <b>50</b> amino acids. 
                                Lowercase letters are allowed, but will be converted to their uppercase counterpart.
                            </p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="pb-0" cols=12>
                            <v-text-field
                                class="pt-0 mt-0"
                                v-model.trim="sequence"
                                label="Sequence"
                                :rules="sequenceRules"
                                autofocus
                            ></v-text-field>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col class="py-0" cols=12 md=6>
                            <Tooltip message="Equate isoleucine (I) and leucine (L) when matching peptides to UniProt entries.">
                                <v-checkbox
                                    v-model="equateIl"
                                    label="Equate I and L?"
                                ></v-checkbox>
                            </Tooltip>
                        </v-col>

                        <v-col class="d-flex" cols=12 md=6>
                            <v-spacer />
                            <v-btn
                                color="primary"
                                :disabled="!validForm"
                                type="submit"
                            >
                                <v-icon class="pe-1">mdi-magnify</v-icon> Search
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </router-link>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import ResourceLink from '@/components/highlights/ResourceLink.vue';
import { Tooltip } from 'unipept-web-components';
import { ref } from 'vue';

const validForm = ref(false);
const sequence = ref("");
const equateIl = ref(true);

const form = ref(null);

const sequenceRules = [
    (value: string) => /^[A-Z]+$/.test(value.toUpperCase()) || "Peptide can only consist of letters",
    (value: string) => value.length >= 5 && value.length <= 50 || "Peptide should consist of 5 to 50 characters"
];
</script>
