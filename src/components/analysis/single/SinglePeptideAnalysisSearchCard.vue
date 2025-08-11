<template>
    <v-unipept-card class="pa-0">
        <v-tabs
            style="pointer-events: none;"
            slider-color="primary"
            bg-color="primary"
            dark
        >
            <v-tab>
                Search for a single peptide
            </v-tab>
        </v-tabs>

        <v-card-text class="pb-0">
            <v-form
                ref="form"
                v-model="validForm"
                @submit.prevent="analysePeptide"
            >
                <v-row>
                    <v-col>
                        <p class="mb-0">
                            Search for a single peptide (e.g. <ResourceLink
                                to="/spa/MDGTEYIIVK?equate=true"
                                router
                            >
                                MDGTEYIIVK
                            </ResourceLink>) by entering the sequence below.
                            Note that your input should only consist of <b>5</b> to <b>50</b> amino acids.
                            Lowercase letters are allowed, but will be converted to their uppercase equivalent.
                        </p>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col
                        class="pb-0"
                        cols="12"
                    >
                        <v-text-field
                            v-model.trim="sequence"
                            class="pt-0 mt-0"
                            label="Sequence"
                            :rules="sequenceRules"
                            density="compact"
                            autofocus
                            variant="underlined"
                        />
                    </v-col>
                </v-row>

                <v-row>
                    <v-col
                        class="py-0"
                        cols="6"
                    >
                        <v-tooltip text="Equate isoleucine (I) and leucine (L) when matching peptides to UniProt entries.">
                            <template #activator="{ props }">
                                <v-checkbox
                                    v-model="equateIl"
                                    label="Equate I and L"
                                    v-bind="props"
                                    color="primary"
                                />
                            </template>
                        </v-tooltip>
                    </v-col>

                    <v-col
                        class="d-flex"
                        cols="6"
                    >
                        <v-spacer />
                        <v-btn
                            color="primary"
                            :disabled="!validForm"
                            prepend-icon="mdi-magnify"
                            type="submit"
                        >
                            Search
                        </v-btn>
                    </v-col>
                </v-row>
            </v-form>
        </v-card-text>
    </v-unipept-card>
</template>

<script setup lang="ts">
import ResourceLink from '@/components/highlights/ResourceLink.vue';
import { Ref, ref } from "vue";
import { VForm } from "vuetify/components";
import { useRouter } from "vue-router";

const validForm = ref(false);
const sequence = ref("");
const equateIl = ref(true);

const form: Ref<VForm | null> = ref(null);

const sequenceRules = [
    (value: string) => /^[A-Z]+$/.test(value.toUpperCase()) || "Peptide can only consist of letters",
    (value: string) => value.length >= 5 && value.length <= 50 || "Peptide should consist of 5 to 50 characters"
];

const router = useRouter();

const analysePeptide = async function() {
    if (form.value && await form.value.validate()) {
        router.push({
            name: 'spaResult',
            params: {
                sequence: sequence.value.toUpperCase()
            },
            query: {
                equate: equateIl.value.toString()
            }
        });
    }
}
</script>
