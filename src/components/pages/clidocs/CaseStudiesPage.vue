<template>
    <v-container>
        <h1 class="font-weight-light">
            Unipept <Initialism>CLI</Initialism> Case Studies
        </h1>
        <h3 class="font-weight-light">
            This page explores several uses of the Unipept command line tools.
        </h3>

        <HeaderBodyCard class="mt-5" title="Taxonomic analysis of a tryptic peptide">
            <p class="mb-0">
                This case study describes how the Unipept command line tools can be used for the taxonomic analysis of a single tryptic peptide. All steps, 
                from installation till the end result are covered.
            </p>

            <template #extension>
                <v-divider />
                <v-card-actions>
                    <v-spacer />
                    <router-link
                        to="/clidocs/casestudies/tpa"
                        v-slot="{ href, navigate }"
                    >
                        <v-btn
                            color="secondary"
                            text
                            @click="navigate"
                            :href="href"
                        >
                            Get started
                        </v-btn>
                    </router-link>
                </v-card-actions>
            </template>
        </HeaderBodyCard>

        <HeaderBodyCard class="mt-5" title="Taxonomic analysis of a metaproteomics dataset">
            <p class="mb-0">
                This case study describes how the Unipept command line tools can be used for the taxonomic analysis of a metaproteomics dataset.
            </p>

            <template #extension>
                <v-divider />
                <v-card-actions>
                    <v-spacer />
                    <router-link
                        to="/clidocs/casestudies/mpa"
                        v-slot="{ href, navigate }"
                    >
                        <v-btn
                            color="secondary"
                            text
                            @click="navigate"
                            :href="href"
                        >
                            Get started
                        </v-btn>
                    </router-link>
                </v-card-actions>
            </template>
        </HeaderBodyCard>
    </v-container>
</template>

<script setup lang="ts">
import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import Initialism from '@/components/highlights/Initialism.vue';
</script>
