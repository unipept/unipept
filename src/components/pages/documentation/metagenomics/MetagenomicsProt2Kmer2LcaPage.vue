<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap prot2kmer2lca
        </h1>
        <h3 class="font-weight-light">
            Maps all k-mers from a <initialism>FASTA</initialism> stream of peptides to taxon IDs.
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>umgap prot2kmer2lca</inline-code> command takes one or more peptides as input and outputs the lowest common ancestors
            of all their k-mers. It is a combination of the <inline-code>umgap prot2kmer</inline-code> and <inline-code>umgap pept2lca</inline-code> commands to
            allow more efficient parallel computing.
        </p>

        <header-body-card
            id="usage"
            title="Usage"
            large-title
        >
            <p>
                The input is given in a <initialism>FASTA</initialism> format on <i>standard input</i>, with a single peptide per <initialism>FASTA</initialism> header, which may be
                hardwrapped with newlines. All overlapping k-mers in these peptides (k configurable via the <inline-code>-k</inline-code> option,
                and 9 by default) are searched for in the index (as build by the <inline-code>umgap buildindex</inline-code> command) passed as
                argument. The results are printed on <i>standard output</i> in <initialism>FASTA</initialism> format.
            </p>

            <boxed style="max-height: fit-content;">
                <sentinel>$</sentinel> <b>cat input.fa</b>
                <br>>header1
                <br>DAIGDVAKAYKKAG*S
                <br><sentinel>$</sentinel> <b>umgap prot2kmer2lca -k9 uniprot-2020-04-9mer.index &lt; input.fa</b>
                <br>>header1
                <br>571525
                <br>571525
                <br>6920
                <br>6920
                <br>1
                <br>6920
            </boxed>

            <p>
                Add the <inline-code>-o</inline-code> option to print out 0 for k-mers not found in the index.
            </p>

            <boxed>
                <sentinel>$</sentinel> <b>umgap prot2kmer2lca -o uniprot-2020-04-9mer.index &lt; input.fa</b>
                <br>>header1
                <br>571525
                <br>571525
                <br>6920
                <br>6920
                <br>1
                <br>6920
                <br>0
                <br>0
            </boxed>

            <p>
                This command also allows an alternative mode of operation. When memory mapped, it can take some time for the index to
                be searched. With the <inline-code>-m</inline-code> flag, the complete index will be loaded in memory before operation. This, too,
                takes some time, but for a single large analysis, this impact is irrelevant compared to the time of analysis. When
                processing many short files, the index would need to be loaded again and again. Instead of using this command as part
                of a pipeline, <inline-code>... | umgap prot2kmer2lca index | ...</inline-code>, it can run in a separate (and persistent) process,
                reusing the same loaded index. Run <inline-code>umgap prot2kmer2lca -m -s umgap-socket index</inline-code> as a service, and when the
                index is loaded, change your original pipeline(s) to communicate with the socket using
                <RLink to="http://man.openbsd.org/nc">
                    OpenBSD's netcat
                </RLink>: <inline-code>... | nc -NU /path/to/umgap-socket | ...</inline-code>.
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
    { name: "-m / --in-memory", description: "Load index in memory instead of memory mapping the file contents. This makes querying significantly faster, but requires some initialization time." },
    { name: "-o / --one-on-one", description: "Map unknown sequences to 0 instead of ignoring them" },
    { name: "-c / --chunksize c", description: "Number of reads grouped into one chunk. Bigger chunks decrease the overhead caused by multithreading. Because the output order is not necessarily the same as the input order, having a chunk size which is a multiple of 12 (all 6 translations multiplied by the two paired-end reads) will keep FASTA records that originate from the same reads together [default: 240]" },
    { name: "-l / --length l", description: "The length of the k-mers in the index [default: 9]" },
    { name: "-s / --socket s", description: "Instead of reading from stdin and writing to stdout, create a Unix socket to communicate with using OpenBSD's netcat (nc -NU socket). This is especially useful in combination with the --in-memory flag: you only have to load the index in memory once, after which you can query it without having the loading time overhead each time" },
];
</script>
