<template>
    <v-container>
        <v-alert
            type="warning"
            class="mb-5"
            style="font-size: 105%"
        >
            Recently, NCBI has introduced changes to their taxonomy classifications (
            <a href="https://ncbiinsights.ncbi.nlm.nih.gov/2024/06/04/changes-ncbi-taxonomy-classifications/"><b>see announcement</b></a>).
            In response to this update, we have aligned Unipept’s taxonomic data accordingly.
            <br>
            <br>
            🔁 <b>As a result, the V1 and V2 endpoints of the Unipept API now produce identical taxonomic results.</b>
            <br>
            <br>
            There is no longer any difference between the two versions in terms of taxonomic resolution.
        </v-alert>

        <h1 class="font-weight-light">
            Unipept <initialism>API</initialism> documentation <small>v2.0</small>
        </h1>
        <h3 class="font-weight-light">
            Most of the peptide analysis workflows provided by Unipept are available as web services.
            This page contains the documentation on how to use these services.
        </h3>

        <p class="mt-5">
            The Unipept API is HTTP-based and always returns JSON objects as response. The current version of the <initialism>API</initialism> provides
            12 endpoints.
        </p>

        <p class="mt-3">
            If you use this API, please cite Mesuere et al. (2016) Bioinformatics
            <resource-link to="https://academic.oup.com/bioinformatics/article/32/11/1746/1742840?login=false">
                doi:10.1093/bioinformatics/btw039
            </resource-link>
        </p>

        <header-body-card
            id="functionality"
            title="API functions"
            class="mt-5"
            large-title
        >
            <v-table>
                <thead>
                    <tr>
                        <th class="text-left">
                            Resource
                        </th>
                        <th class="text-left">
                            Description
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="item in functions"
                        :key="item.resource"
                        class="clickable"
                        @click="navigate(item.link)"
                    >
                        <td style="white-space: nowrap;">
                            <b>{{ item.resource }}</b>
                        </td>
                        <td class="py-3">
                            {{ item.description }}
                        </td>
                    </tr>
                </tbody>
            </v-table>
        </header-body-card>
    </v-container>
</template>

<script setup lang="ts">
import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import Initialism from '@/components/highlights/Initialism.vue';
import ResourceLink from '@/components/highlights/ResourceLink.vue';
import useNavigation from "@/composables/useNavigation";

const { navigate } = useNavigation();

const functions = [
    {
        resource: "POST /api/v2/pept2prot",
        description: "Returns the set of UniProt entries containing a given peptide.",
        link: "/apidocs/pept2prot"
    },
    {
        resource: "POST /api/v2/pept2taxa",
        description: "Returns the set of taxa extracted from the UniProt entries containing a given peptide.",
        link: "/apidocs/pept2taxa"
    },
    {
        resource: "POST /api/v2/pept2lca",
        description: "Returns the taxonomic lowest common ancestor for a given peptide.",
        link: "/apidocs/pept2lca"
    },
    {
        resource: "POST /api/v2/pept2ec",
        description: "Returns the functional EC-numbers associated with a given peptide.",
        link: "/apidocs/pept2ec"
    },
    {
        resource: "POST /api/v2/pept2go",
        description: "Returns the functional GO-terms associated with a given peptide.",
        link: "/apidocs/pept2go"
    },
    {
        resource: "POST /api/v2/pept2interpro",
        description: "Returns the functional InterPro entries associated with a given peptide.",
        link: "/apidocs/pept2interpro"
    },
    {
        resource: "POST /api/v2/pept2funct",
        description: "Returns the functional EC-numbers, GO-terms and InterPro entries associated with a given peptide.",
        link: "/apidocs/pept2funct"
    },
    {
        resource: "POST /api/v2/peptinfo",
        description: "Returns functional information and the lowest common ancestor for a given peptide.",
        link: "/apidocs/peptinfo"
    },
    {
        resource: "POST /api/v2/protinfo",
        description: "Returns functional information and the lowest common ancestor for a given UniProtKB protein.",
        link: "/apidocs/protinfo"
    },
    {
        resource: "POST /api/v2/taxa2lca",
        description: "Returns the taxonomic lowest common ancestor for a given list of taxon identifiers.",
        link: "/apidocs/taxa2lca"
    },
    {
        resource: "POST /api/v2/taxa2tree",
        description: "Returns the taxonomic tree for a given list of taxon identifiers.",
        link: "/apidocs/taxa2tree"
    },
    {
        resource: "POST /api/v2/taxonomy",
        description: "Returns the taxonomic information for a given taxon identifier.",
        link: "/apidocs/taxonomy"
    }
];
</script>

<style scoped>
.clickable {
    cursor: pointer;
}
</style>
