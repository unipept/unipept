<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap taxa2agg
        </h1>
        <h3 class="font-weight-light">
            Aggregates taxon IDs in a <initialism>FASTA</initialism> stream
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>umgap taxa2agg</inline-code> command takes one or more lists of taxon IDs as input and aggregates them into a single consensus taxon.
        </p>

        <header-body-card
            id="usage"
            title="usage"
            large-title
        >
            <p>
                The input is given in a <initialism>FASTA</initialism> format on <i>standard input</i>. Each <initialism>FASTA</initialism> record contains a list of taxon IDs, separated
                by newlines. The output is written to <i>standard output</i>, also in a <initialism>FASTA</initialism> format, each record containing a single
                taxon ID, which is the consensus taxon resulting from aggregation of the given list.
            </p>

            <p>
                The taxonomy to be used is passed as an argument to this command. This is a preprocessed version of the <initialism>NCBI</initialism> taxonomy.
            </p>

            <boxed style="max-height: fit-content;">
                <sentinel>$</sentinel> <b>cat input.fa</b>
                <br>>header1
                <br>571525
                <br>571525
                <br>6920
                <br>6920
                <br>1
                <br>6920
                <br><sentinel>$</sentinel> <b>umgap taxa2agg taxons.tsv &lt; input.fa</b>
                <br>>header1
                <br>571525
            </boxed>

            <p>
                By default, the aggregation used is the maximum root-to-leaf path (<initialism>MRTL</initialism>). A variant of the
                lowest common ancestor (<initialism>LCA</initialism>*) aggregation is also available via the <inline-code>-a</inline-code> and
                <inline-code>-m</inline-code> options, as is a hybrid approach.
            </p>

            <ul>
                <li>
                    <b>-m rmq -a mrtl</b> is the default aggregation strategy. It selects the taxon from the given list which has the
                    highest frequency of ancestors in the list (including its own frequency). A range-minimum-query (<initialism>RMQ</initialism>)
                    algorithm is used.
                </li>
                <li>
                    <b>-m tree -a lca\*</b> returns the taxon (possibly not from the list) of lowest rank without contradicting taxa in
                    the list. Non-contradicting taxa of a taxon are either itself, its ancestors and its descendants. A tree-based
                    algorithm is used.
                </li>
                <li>
                    <b>-m tree -a hybrid</b> mixes the above two strategies, which results in a taxon which might have not have the
                    highest frequency of ancestors in the list, but would have less contradicting taxa. Use the <inline-code>-f</inline-code> option
                    to select a hybrid close to the <inline-code>MRTL(-f 0.0)</inline-code> or to the <inline-code>LCA (-f 1.0)</inline-code>.
                </li>
            </ul>

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
    { name: "-r / --ranked", description: "Let all taxa snap to taxa with a named rank (such as species) during calculations" },
    { name: "-s / --scored", description: "Each taxon is followed by a score between 0 and 1" },
    { name: "-f / --factor f", description: "The factor for the hybrid aggregation, from 0.0 (MRTL) to 1.0 (LCA*) [default: 0.25]" },
    { name: "-l / --lower-bound l", description: "The smallest input frequency for a taxon to be included in the aggregation [default: 0]" },
    { name: "-m / --method m", description: "The method to use for aggregation [default: tree] [possible values: tree, rmq]" },
    { name: "-a / --aggregate a", description: "The strategy to use for aggregation [default: hybrid] [possible values: lca*, hybrid, mrtl]" }
];
</script>
