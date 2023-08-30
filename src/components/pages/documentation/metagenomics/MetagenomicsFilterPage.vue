<template>
    <v-container>
        <h1 class="font-weight-light">
            umgap filter
        </h1>
        <h3 class="font-weight-light">
            Filters a <initialism>FASTA</initialism> stream of peptides
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>umgap filter</inline-code> command takes a <initialism>FASTA</initialism> stream of peptides as input and outputs a filtered stream.
        </p>

        <header-body-card
            id="usage"
            title="Usage"
            large-title
        >
            <p>
                The input is given in <initialism>FASTA</initialism> format on <i>standard input</i>. Per <initialism>FASTA</initialism> header,
                there may be multiple peptides separated by newlines. Each of these peptides are checked against the filter criteria and
                written to <i>standard output</i> they pass them. The criteria are specified as options:
            </p>

            <ul class="mb-3">
                <li><b>-m</b> 5 sets the minimum length of the peptides to 5.</li>
                <li><b>-M</b> 50 sets the maximum length of the peptides to 50.</li>
                <li><b>-c</b> LIK requires the peptides to contain amino acids Leucine (L), Isoleucine (I) and Lysine (K).</li>
                <li><b>-l</b> LIK removes the peptides containing the amino acids Leucine, Isoleucine or Lysine.</li>
            </ul>

            <boxed style="max-height: fit-content;">
                <sentinel>$</sentinel> <b>cat input.fa</b>
                <br>>header1
                <br>AYKKAGVSGHVWQSDGITNCLLRGLTRVKEAVANRDSGNGYINKVYYWTVDKRATTRDALDAGVDGIMTNYPDVITDVLN
                <br>AYK
                <br>K
                <br>AGVSGHVWQSDGITNCLLR
                <br>GLTR
                <br>VK
                <br>EAVANR
                <br>DSGNGYINK
                <br><sentinel>$</sentinel> <b>umgap filter &lt; input.fa</b>
                <br>>header1
                <br>AGVSGHVWQSDGITNCLLR
                <br>EAVANR
                <br>DSGNGYINK
                <br><sentinel>$</sentinel> <b>umgap filter -m 0 -c R -l K &lt; input.fa</b>
                <br>>header1
                <br>AGVSGHVWQSDGITNCLLR
                <br>GLTR
                <br>EAVANR
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
    { name: "-c / --contains c", description: "Amino acid symbols that a sequence must contain [none by default]" },
    { name: "-l / --lacks l", description: "Amino acid symbols that a sequence may not contain [none by default]" },
    { name: "-M / --maxlen M", description: "Maximum length allowed [default: 50]" },
    { name: "-m / --minlen m", description: "Minimum length required [default: 5]" }
];
</script>
