<template>
    <v-container>
        <h1 class="font-weight-light">
            Unipept <initialism>CLI</initialism> Case Studies
        </h1>
        <h3 class="font-weight-light">
            This page explores several uses of the Unipept command line tools.
        </h3>

        <header-body-card
            class="mt-5"
            title="Taxonomic analysis of a tryptic peptide"
            large-title
        >
            <p>
                This case study describes how the Unipept command line tools can be used for the taxonomic analysis of a single tryptic peptide. All steps,
                from installation till the end result are covered.
            </p>

            <v-divider />

            <v-btn
                color="secondary"
                class="float-end my-2"
                variant="text"
                @click="navigate('/clidocs/casestudies/tpa')"
            >
                Get started
            </v-btn>
        </header-body-card>

        <header-body-card
            class="mt-5"
            title="Taxonomic analysis of a metaproteomics dataset"
            large-title
        >
            <p>
                This case study describes how the Unipept command line tools can be used for the taxonomic analysis of a metaproteomics dataset.
            </p>

            <v-divider />
            <v-btn
                color="secondary"
                variant="text"
                class="float-end my-2"
                @click="navigate('/clidocs/casestudies/mpa')"
            >
                Get started
            </v-btn>
        </header-body-card>
    </v-container>
</template>

<script setup lang="ts">
import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import initialism from '@/components/highlights/Initialism.vue';
import useNavigation from "@/composables/useNavigation";

const { navigate } = useNavigation();
</script>
