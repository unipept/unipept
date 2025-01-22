<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap taxa2tree
        </h1>
        <h3 class="font-weight-light">
            Visualizes a stream of taxon IDs using the Unipept <initialism>API</initialism>
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>umgap taxa2tree</inline-code> command, similar to the <inline-code>unipept taxa2tree</inline-code> command, takes one or more taxon
            IDs as input and returns a visualized taxonomic tree of these taxa using the <RLink
                to="/apidocs/taxa2tree"
                router
            >
                Unipept API server
            </RLink>.
        </p>

        <header-body-card
            id="usage"
            title="usage"
            large-title
        >
            <p>
                The input is given in a <initialism>FASTA</initialism> format on <i>standard input</i>. Each <initialism>FASTA</initialism> record contains one taxon ID. A HTML file
                is written to <i>standard output</i> containing a visualization of the taxonomic tree containing all these taxa.
                With <inline-code>-u</inline-code>, a <initialism>URL</initialism> to the visualization hosted online is printed instead.
            </p>

            <boxed style="max-height: fit-content;">
                <sentinel>$</sentinel> <b>cat input.txt</b>
                <br>>header1
                <br>817
                <br>329854
                <br>1099853
                <br><sentinel>$</sentinel> <b>umgap taxa2tree &lt; input.txt > output.html</b>
                <br><sentinel>$</sentinel> <b>umgap taxa2tree --url &lt; input.txt</b>
                <br><RLink to="https://bl.ocks.org/a686a37e1dcd43dd4ec7d467487bd6a1">
                    https://bl.ocks.org/a686a37e1dcd43dd4ec7d467487bd6a1
                </RLink>
            </boxed>

            <parameter-table
                class="mt-5 mb-3"
                :parameters="usageParameters"
            />
        </header-body-card>
    </v-container>
</template>

<script setup lang="ts">
import InlineCode from '@/components/highlights/InlineCode.vue';
import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import Initialism from '@/components/highlights/Initialism.vue';
import Boxed from '@/components/highlights/Boxed.vue';
import Sentinel from '@/components/highlights/Sentinel.vue';
import ParameterTable from '@/components/tables/ParameterTable.vue';
import RLink from '@/components/highlights/ResourceLink.vue';

const usageParameters = [
    { name: "-h / --help", description: "Prints help information" },
    { name: "-V / --version", description: "Prints version information" },
    { name: "-u / --url", description: "Host the result online and return the URL" }
];
</script>
