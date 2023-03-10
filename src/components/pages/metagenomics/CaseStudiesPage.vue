<template>
    <v-container>
        <h1 class="font-weight-light">
            <Initialism>UMGAP</Initialism> Case Studies
        </h1>
        <h3 class="font-weight-light">
            This page explores several uses of the Unipept MetaGenomics Analysis Pipeline.
        </h3>

        <HeaderBodyCard class="mt-5" title="Introduction">
            <p>
                The Unipept Metagenomics Analysis Pipeline (<Initialism>UMGAP</Initialism>) is a tool for mapping (short) metagenomics 
                reads to taxa, rivalling state of the art alternatives such as Kraken (2014) with the additional benefit of species level 
                identification. <Initialism>UMGAP</Initialism> achieves this by transforming the mapping task into a metaproteomics 
                problem by using various alternative gene predictors on the metagenomics reads and processing the resulting data with 
                the existing Unipept Metaproteomics Analysis Pipeline. Each step in <Initialism>UMGAP</Initialism> is highly configurable.
            </p>

            <p>
                These case studies assume you have already followed the installation instructions on the 
                <RLink to="/umgap" router>overview</RLink> page.
            </p>
        </HeaderBodyCard>

        <HeaderBodyCard class="mt-5" title="Preconfigured analysis of a metagenomics dataset">
            <p class="mb-0">
                The easiest way to use <Initialism>UMGAP</Initialism> for a taxonomic analysis of a metagenomic dataset is with one of 
                the 6 preconfigured pipelines. This case study walks you through the complete analysis of 2 short <Initialism>FASTQ</Initialism> files.
            </p>

            <template #extension>
                <v-divider />
                <v-card-actions>
                    <v-spacer />
                    <router-link
                        to="/umgap/casestudies/basic"
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

        <HeaderBodyCard class="mt-5" title="Complete configuration walkthrough">
            <p class="mb-0">
                This case study shows how to use <Initialism>UMGAP</Initialism> for the taxonomic analysis of a metagenomics dataset. 
                It shows every step of the pipeline in detail, refering to the documentation for alternative options.
            </p>

            <template #extension>
                <v-divider />
                <v-card-actions>
                    <v-spacer />
                    <router-link
                        to="/umgap/casestudies/advanced"
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

        <HeaderBodyCard class="mt-5" title="Comparative analysis walkthrough">
            <p class="mb-0">
                This case study shows how to use <Initialism>UMGAP</Initialism> for the comparative taxonomic analysis of multiple 
                metagenomics datasets. Using a preconfigured pipeline and the visualize script, we show how to create a comparative 
                graphic.
            </p>

            <template #extension>
                <v-divider />
                <v-card-actions>
                    <v-spacer />
                    <router-link
                        to="/umgap/casestudies/comparative"
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
import RLink from '@/components/highlights/ResourceLink.vue';
</script>
