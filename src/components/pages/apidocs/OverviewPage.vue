<template>
    <v-container>
        <h1 class="font-weight-light">
            Unipept <Initialism>API</Initialism> documentation <small>v2.0</small>
        </h1>
        <h3 class="font-weight-light">
            Most of the peptide analysis workflows provided by Unipept are available as web services. 
            This page contains the documentation on how to use these services. 
        </h3>

        <p class="mt-5">
            The Unipept API is HTTP-based and always returns JSON objects as response. The current version of the <Initialism>API</Initialism> provides 
            11 endpoints.
        </p>

        <p class="mt-3">
            If you use this API, please cite Mesuere et al. (2016) Bioinformatics 
            <ResourceLink to="https://academic.oup.com/bioinformatics/article/32/11/1746/1742840?login=false">doi:10.1093/bioinformatics/btw039</ResourceLink>
        </p>
        
        <HeaderBodyCard id="functionality" title="API functions" class="mt-5">
            <v-simple-table>
                <template v-slot:default>
                    <thead>
                        <tr>
                            <th class="text-left">Resource</th>
                            <th class="text-left">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <router-link v-for="item in functions" class="clickable" :key="item.resource" :to="item.link" tag="tr">
                            <td style="white-space: nowrap;">
                                <b>{{ item.resource }}</b>
                            </td>
                            <td class="py-3">
                                {{ item.description }}
                            </td>
                        </router-link>
                    </tbody>
                </template>
            </v-simple-table>
        </HeaderBodyCard>
    </v-container>
</template>

<script setup lang="ts">
import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import Initialism from '@/components/highlights/Initialism.vue';
import ResourceLink from '@/components/highlights/ResourceLink.vue';

const functions = [
    { 
        resource: "POST /api/v1/pept2prot", 
        description: "Returns the set of UniProt entries containing a given tryptic peptide.",
        link: "/apidocs/pept2prot"
    },
    { 
        resource: "POST /api/v1/pept2taxa", 
        description: "Returns the set of taxa extracted from the UniProt entries containing a given tryptic peptide.",
        link: "/apidocs/pept2taxa" 
    },
    { 
        resource: "POST /api/v1/pept2lca", 
        description: "Returns the taxonomic lowest common ancestor for a given tryptic peptide.",
        link: "/apidocs/pept2lca"  
    },
    { 
        resource: "POST /api/v1/pept2ec", 
        description: "Returns the functional EC-numbers associated with a given tryptic peptide.",
        link: "/apidocs/pept2ec"  
    },
    { 
        resource: "POST /api/v1/pept2go", 
        description: "Returns the functional GO-terms associated with a given tryptic peptide.",
        link: "/apidocs/pept2go"  
    },
    { 
        resource: "POST /api/v1/pept2interpro", 
        description: "Returns the functional InterPro entries associated with a given tryptic peptide.",
        link: "/apidocs/pept2interpro"  
    },
    { 
        resource: "POST /api/v1/pept2funct", 
        description: "Returns the functional EC-numbers, GO-terms and InterPro entries associated with a given tryptic peptide.",
        link: "/apidocs/pept2funct"  
    },
    { 
        resource: "POST /api/v1/peptinfo", 
        description: "Returns functional information and the lowest common ancestor for a given tryptic peptide.",
        link: "/apidocs/peptinfo"  
    },
    { 
        resource: "POST /api/v1/protinfo", 
        description: "Returns functional information and the taxonomic identifier for a given uniprot ID.",
        link: "/apidocs/protinfo"  
    },
    { 
        resource: "POST /api/v1/taxa2lca", 
        description: "Returns the taxonomic lowest common ancestor for a given list of taxon identifiers.",
        link: "/apidocs/taxa2lca"  
    },
    { 
        resource: "POST /api/v1/taxa2tree", 
        description: "Returns the taxonomic tree for a given list of taxon identifiers.",
        link: "/apidocs/taxa2tree"  
    },
    { 
        resource: "POST /api/v1/taxonomy", 
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
