<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap snaptaxon
        </h1>
        <h3 class="font-weight-light">
            Snaps taxon IDs to a rank or specified taxa
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>umgap snaptaxon</inline-code> command takes one or more taxon IDs. For each taxon, it searches amongst its ancestors
            if any are of the specified rank (e.g., <inline-code>-r species</inline-code>), or are one of the listed taxa (e.g.,
            <inline-code>-t 1598 -t 1883</inline-code>). If so, the taxon is replaced by the most specific of these matching taxa. Otherwise, it is
            mapped to the root of the taxonomy.
        </p>

        <header-body-card
            id="usage"
            title="usage"
            large-title
        >
            <p>
                The input is given on <i>standard input</i> and may be any sequence of <initialism>FASTA</initialism> headers and/or lines containing a single
                taxon ID. The <initialism>FASTA</initialism> headers (if any) are just copied over to <i>standard output</i>.
            </p>

            <p>
                The taxonomy to be used is passed as an argument to this command. This is a preprocessed version of the <initialism>NCBI</initialism> taxonomy.
            </p>

            <boxed style="max-height: fit-content;">
                <sentinel>$</sentinel> <b>cat input.fa</b>
                <br>>header1
                <br>888268
                <br>186802
                <br>1598
                <br>1883
                <br><sentinel>$</sentinel> <b>umgap snaptaxon 2020-04-taxons.tsv -r order &lt; ~/input.fa</b>
                <br>>header1
                <br>38820
                <br>186802
                <br>186826
                <br>85011
                <br><sentinel>$</sentinel> <b>umgap snaptaxon 2020-04-taxons.tsv -t 1239 2 &lt; ~/input.fa</b>
                <br>>header1
                <br>1
                <br>1239
                <br>1239
                <br>2
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

const usageParameters = [
    { name: "-h / --help", description: "Prints help information" },
    { name: "-V / --version", description: "Prints version information" },
    { name: "-i / --invalid", description: "Include the invalidated taxa from the taxonomy" },
    { name: "-r / --rank r", description: "The rank to snap towards [possible values: superkingdom, kingdom, subkingdom, superphylum, phylum, subphylum, superclass, class, subclass, infraclass, superorder, order, suborder, infraorder, parvorder, superfamily, family, subfamily, tribe, subtribe, genus, subgenus, species group, species subgroup, species, subspecies, varietas, forma]" },
    { name: "-t / --taxons t...", description: "A taxon to snap towards (allow multiple times)" }
];
</script>
