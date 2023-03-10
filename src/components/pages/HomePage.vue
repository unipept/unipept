<template>
    <v-container>
        <v-row>
            <v-col cols=12 md=6>
                <div class="text-h3 font-weight-light mb-2">Welcome</div>
                Unipept is an open source web application developed at <a href="https://www.ugent.be/en" target="_blank">Ghent University</a> that is designed for metaproteomics
                data analysis with a focus on <span class="font-weight-bold">interactive datavisualizations</span>. Unipept is powered by an index containing all
                UniProt entries, a tweaked version of the NCBI taxonomy and a custom lowest common ancestor algorithm. This combination enables a blazingly fast
                <span class="font-weight-bold">biodiversity analysis</span> of large and complex <span class="font-weight-bold">metaproteome samples</span>.
                This functionality is also available via an API and a set of command line tools. Next to these core functions, Unipept also has a tool for
                selecting unique peptides for <span class="font-weight-bold">targeted proteomics</span> and for <span class="font-weight-bold">comparing
                genomes</span> based on peptide similarity.
            </v-col>

            <v-col class="mt-0" cols=12 md=6>
                <ReleaseOverviewCard v-if="!loading" :services="services" />
                <div v-else class="d-flex justify-center">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </div>
            </v-col>
        </v-row>
        <v-row>
            <!-- Tryptic Peptide Analysis -->
            <v-col class="col-lg-4 col-md-6">
                <router-link to="/tpa">
                    <v-hover>
                        <template v-slot:default="{ hover }">
                            <HomePageCard :hover="hover" title="Tryptic Peptide Analysis" :asset="require('@/assets/homepage/home-feature-single.png')">
                                With tryptic peptide analysis, you can submit a single <span class='font-weight-bold'>tryptic peptide</span> that can be 5
                                to 50 residues long. The application will respond with a list of <span class='font-weight-bold'>all Uniprot entries</span>
                                wherein the peptide was found along with a complete taxonomic lineage derived from the NCBI taxonomy. These lineages are
                                presented as a comprehensible table and using an interactive tree view.
                            </HomePageCard>
                        </template>
                    </v-hover>
                </router-link>
            </v-col>

            <!-- Metaproteomics Analysis -->
            <v-col class="col-lg-4 col-md-6">
                <router-link to="/mpa">
                    <v-hover>
                        <template v-slot:default="{ hover }">
                            <HomePageCard :hover="hover" title="Metaproteomics Analysis" :asset="require('@/assets/homepage/home-feature-multi.svg')">
                                Metaproteomics analysis helps you analyze <span class='font-weight-bold'>lists of tryptic peptides</span>, e.g.
                                extracted from an environmental sample using shotgun tandem mass spectrometric methods. Of these peptides, the
                                lowest common ancestors (LCA) will be calculated. These LCAs will be bundled and displayed in an interactive treemap
                                giving you insight into the <span class='font-weight-bold'>biodiversity of your sample</span>.
                            </HomePageCard>
                        </template>
                    </v-hover>
                </router-link>
            </v-col>

            <!-- Unipept Desktop -->
            <v-col class="col-lg-4 col-md-6">
                <router-link to="/desktop">
                    <v-hover>
                        <template v-slot:default="{ hover }">
                            <HomePageCard :hover="hover" title="Unipept Desktop" :asset="require('@/assets/homepage/home-feature-desktop.png')">
                                The Unipept Desktop application allows to analyse larger samples, to store analysis results offline, to extensively
                                compare assays with each other and to better manage samples. This application is powered by the Electron framework and
                                runs on almost all systems. This allows you to improve the understanding of all interactions that are taking place in a
                                complex environment.
                            </HomePageCard>
                        </template>
                    </v-hover>
                </router-link>
            </v-col>

            <!-- API Documentation -->
            <v-col class="col-lg-4 col-md-6">
                <router-link to="/apidocs">
                    <v-hover>
                        <template v-slot:default="{ hover }">
                            <HomePageCard :hover="hover" title="API Documentation" :asset="require('@/assets/homepage/home-feature-api.svg')" contain>
                                Unipept offers most of its peptide analysis features as a <span class='font-weight-bold'>web service</span>. This enables
                                the integration of Unipept functionality into other applications and the creation of batch processing scripts. These
                                <span class='font-weight-bold'>documentation pages</span> describe the available features of the API, how to access them and
                                plenty examples.
                            </HomePageCard>
                        </template>
                    </v-hover>
                </router-link>
            </v-col>

            <!-- CLI Documentation -->
            <v-col class="col-lg-4 col-md-6">
                <router-link to="/clidocs">
                    <v-hover>
                        <template v-slot:default="{ hover }">
                            <HomePageCard :hover="hover" title="CLI Documentation" :asset="require('@/assets/homepage/home-feature-cli.svg')" contain>
                                The Unipept <span class='font-weight-bold'>command line interface</span> (CLI) is a wrapper around the Unipept API that
                                offers an easy way to <span class='font-weight-bold'>integrate Unipept</span> functionality into your data processing
                                <span class='font-weight-bold'>pipelines and scripts</span>. These pages cover installation and usage instructions, an
                                overview of all available options and several use cases.
                            </HomePageCard>
                        </template>
                    </v-hover>
                </router-link>
            </v-col>

            <!-- Metagenomics Analysis -->
            <v-col class="col-lg-4 col-md-6">
                <router-link to="/umgap">
                    <v-hover>
                        <template v-slot:default="{ hover }">
                            <HomePageCard :hover="hover" title="UMGAP" :asset="require('@/assets/homepage/home-feature-umgap.svg')" contain>
                                Use the Unipept MetaGenomics Analysis Pipeline to assign taxonomic labels to your <span class='font-weight-bold'>shotgun
                                metagenomics reads</span>. The results are available as taxonomic frequency tables and interactive visualizations. UMGAP
                                is a collection of CLI tools that can be combined to identify shotgun metagenomics reads.
                            </HomePageCard>
                        </template>
                    </v-hover>
                </router-link>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { GithubCommunicator } from "@/logic/communicators/github/GithubCommunicator";
import { onBeforeMount, ref } from "vue";
import HomePageCard from "../cards/HomePageCard.vue";
import ReleaseOverviewCard, { Service } from "../cards/ReleaseOverviewCard.vue";

const githubCommunicator = new GithubCommunicator();

const loading = ref<boolean>(true);
const services = ref<Service[]>([]);

onBeforeMount(async () => {
    const API = await githubCommunicator.latestRelease("https://api.github.com/repos/unipept/unipept/releases");
    const CLI = await githubCommunicator.latestRelease("https://api.github.com/repos/unipept/unipept-cli/releases");
    const Web = await githubCommunicator.latestRelease("https://api.github.com/repos/unipept/unipept-web/releases");
    const Desktop = await githubCommunicator.latestRelease("https://api.github.com/repos/unipept/unipept-desktop/releases");

    services.value = [
        { name: "API", icon: "mdi-api", version: API.tag_name.replace(/^v/, ""), date: API.published_at, to: "/news/api" },
        { name: "CLI", icon: "mdi-console", version: CLI.tag_name.replace(/^v/, ""), date: CLI.published_at, to: "/news/cli" },
        { name: "Web app", icon: "mdi-web", version: Web.tag_name.replace(/^v/, ""), date: Web.published_at, to: "/news/web" },
        { name: "Desktop app", icon: "mdi-desktop-tower-monitor", version: Desktop.tag_name.replace(/^v/, ""), date: Desktop.published_at, to: "/news/desktop" }
    ];

    loading.value = false;
});
</script>

<style scoped>
    a {
        text-decoration: none;
    }
</style>
