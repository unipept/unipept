<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap seedextend
        </h1>
        <h3 class="font-weight-light">
            Selects promising regions in sequences of taxon IDs
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>umgap seedextend</inline-code> command takes one or more sequences of taxon IDs and selects regions of consecutive
            predictions. It can be used to filter out accidental matches of incorrect taxa.
        </p>

        <header-body-card
            id="usage"
            title="Usage"
            large-title
        >
            <p>
                The input is given in a <initialism>FASTA</initialism> format on <i>standard input</i>. It should consist of taxon IDs separated by newlines, and
                the order of these taxa should reflect their location on a peptide, such as output by the
                <inline-code>umgap prot2kmer2lca -o</inline-code> command. As such, 3 consecutive equal IDs representing 9-mers, for instance,
                indicate a 11-mer match. This so-called seed could still be extended with other taxa, forming an extended seed. The
                command writes all taxa in any of these extended seeds to <inline-code>standard output</inline-code>.
            </p>

            <boxed style="max-height: fit-content;">
                <sentinel>$</sentinel> <b>cat dna.fa</b>
                <br>>header1
                <br>CGCAGAGACGGGTAGAACCTCAGTAATCCGAAAAGCCGGGATCGACCGCCCCTTGCTTGCAGCCGGGCACTACAGGACCC
                <br><sentinel>$</sentinel> <b>umgap translate -n -a &lt; dna.fa | umgap prot2kmer2lca 9mer.index > input.fa</b>
                <br>>header1|1
                <br>9606 9606 2759 9606 9606 9606 9606 9606 9606 9606 8287
                <br>>header1|2
                <br>2026807 888268 186802 1598 1883
                <br>>header1|3
                <br>1883
                <br>>header1|1R
                <br>27342 2759 155619 1133106 38033 2
                <br>>header1|2R
                <br>>header1|3R
                <br>2951
                <br><sentinel>$</sentinel> <b>umgap seedextend &lt; input.fa</b>
                <br>>header1|1
                <br>9606 9606 2759 9606 9606 9606 9606 9606 9606 9606 8287
                <br>>header1|2
                <br>>header1|3
                <br>>header1|1R
                <br>>header1|2R
                <br>>header1|3R
            </boxed>

            <p>
                Taxon IDs are separated by newlines in the actual output, but are separated by spaces in this example.
            </p>

            <p>
                The number of consecutive equal IDs to start a seed is 2 by default, and can be changed using the <inline-code>-s</inline-code> option.
                The maximum length of gaps between seeds to join in an extension can be set with <inline-code>-g</inline-code>, no gaps are allowed by
                default.
            </p>

            <p>
                The command can be altered to print only the extended seed with the highest score among all extended seeds. Pass a
                taxonomy using the <inline-code>-r taxon.tsv</inline-code> option to activate this. In this scored mode, extended seeds with gaps are
                given a penalty of 5, which can be made more or less severe (higher or lower) with the <inline-code>-p</inline-code> option.
            </p>

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
    { name: "-g / --max-gap-size g", description: "The maximum length of a gap between seeds in an extension [default: 0]" },
    { name: "-s / --min-seed-size s", description: "The minimum length of equal taxa to count as seed [default: 2]" },
    { name: "-p / --penalty p", description: "The score penalty for gaps in extended seeds [default: 5]" },
    { name: "-r / --ranked r", description: "Use taxon ranks in given NCBI taxonomy tsv-file to pick extended seed with highest score" }
];
</script>
