<template>
    <v-container>
        <h1 class="font-weight-light">
            <initialism>UMGAP</initialism> Case Studies
        </h1>
        <h3 class="font-weight-light">
            This page explores several uses of the Unipept MetaGenomics Analysis Pipeline.
        </h3>

        <header-body-card
            class="mt-5"
            title="Introduction"
            large-title
        >
            <p>
                The Unipept Metagenomics Analysis Pipeline (<initialism>UMGAP</initialism>) is a tool for mapping (short) metagenomics
                reads to taxa, rivalling state of the art alternatives such as Kraken (2014) with the additional benefit of species level
                identification. <initialism>UMGAP</initialism> achieves this by transforming the mapping task into a metaproteomics
                problem by using various alternative gene predictors on the metagenomics reads and processing the resulting data with
                the existing Unipept Metaproteomics Analysis Pipeline. Each step in <initialism>UMGAP</initialism> is highly configurable.
            </p>

            <p>
                These case studies assume you have already followed the installation instructions on the
                <RLink
                    to="/umgap"
                    router
                >
                    overview
                </RLink> page.
            </p>
        </header-body-card>

        <header-body-card
            class="mt-5"
            title="Preconfigured analysis of a metagenomics dataset"
            large-title
        >
            <p class="mb-0">
                The easiest way to use <initialism>UMGAP</initialism> for a taxonomic analysis of a metagenomic dataset is with one of
                the 6 preconfigured pipelines. This case study walks you through the complete analysis of 2 short <initialism>FASTQ</initialism> files.
            </p>

            <v-divider class="my-2" />
            <v-btn
                color="secondary"
                class="float-end mb-2"
                variant="text"
                @click="navigate('/umgap/casestudies/basic')"
            >
                Get started
            </v-btn>
        </header-body-card>

        <header-body-card
            class="mt-5"
            title="Complete configuration walkthrough"
            large-title
        >
            <p class="mb-0">
                This case study shows how to use <initialism>UMGAP</initialism> for the taxonomic analysis of a metagenomics dataset.
                It shows every step of the pipeline in detail, refering to the documentation for alternative options.
            </p>

            <v-divider class="my-2" />
            <v-btn
                color="secondary"
                variant="text"
                class="float-end mb-2"
                @click="navigate('/umgap/casestudies/advanced')"
            >
                Get started
            </v-btn>
        </header-body-card>

        <header-body-card
            class="mt-5"
            title="Comparative analysis walkthrough"
            large-title
        >
            <p class="mb-0">
                This case study shows how to use <initialism>UMGAP</initialism> for the comparative taxonomic analysis of multiple
                metagenomics datasets. Using a preconfigured pipeline and the visualize script, we show how to create a comparative
                graphic.
            </p>

            <v-divider class="my-2" />
            <v-btn
                color="secondary"
                class="float-end mb-2"
                variant="text"
                @click="navigate('/umgap/casestudies/comparative')"
            >
                Get started
            </v-btn>
        </header-body-card>
    </v-container>
</template>

<script setup lang="ts">
import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import RLink from '@/components/highlights/ResourceLink.vue';
import useNavigation from "@/composables/useNavigation";
import Initialism from "@/components/highlights/Initialism.vue";

const { navigate } = useNavigation();
</script>
