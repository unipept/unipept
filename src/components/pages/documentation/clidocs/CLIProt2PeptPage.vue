<template>
    <v-container>
        <h1 class="font-weight-light">
            prot2pept
        </h1>
        <h3 class="font-weight-light">
            Splits proteins into peptides based on (trypsin) digest.
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>prot2pept</inline-code> command takes one or more protein sequences as input, performs an in silico tryptic digest on them and returns the
            digested peptides as output. By default, a trypsin digest is simulated, but other proteases can be specified by using the
            <r-link to="#options" router>--patern parameter</r-link>. This command runs entirely locally and doesn't connect to any server.
        </p>

        <header-body-card
            id="input"
            title="Input"
            large-title
        >
            <p>
                The <inline-code>prot2pept</inline-code> command expects protein sequences as input via <i>standard input</i>. A single protein sequences per line is expected.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> cat input.txt
                <br>AALTERAALE
                <br>MDGTEKYIIVK
                <br><sentinel>$</sentinel> cat input | prot2pept
                <br>AALTER
                <br>AALE
                <br>MDGTEK
                <br>YIIVK
            </boxed>
        </header-body-card>

        <header-body-card
            id="output"
            title="Output"
            class="mt-5"
            large-title
        >
            <p>
                The <inline-code>prot2pept</inline-code> command supports input in fasta format. This format consists of a fasta header (a line starting with a >), followed by
                one or more lines containing the protein sequence. When this format is detected, the command behaves slightly different. The main difference is that
                newlines between fasta headers are ignored: all lines between fasta headers are treated as a single protein. Next to this, the fasta headers are
                also written to output.
            </p>
        </header-body-card>

        <header-body-card
            id="fasta"
            title="Fasta support"
            class="mt-5"
            large-title
        >
            <p>
                The <inline-code>prot2pept</inline-code> command outputs the split peptides to <i>standard output</i>. All peptides are separated by newlines.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> cat input.txt
                <br>AALTE
                <br>AALRTER
                <br><sentinel>$</sentinel> cat input.txt | prot2pept
                <br>AALTE
                <br>AALR
                <br>TER
                <br><sentinel>$</sentinel> cat input.txt
                <br>> fasta header
                <br>AALTE
                <br>AALRTER
                <br>> other header
                <br>PEPTIDE
                <br><sentinel>$</sentinel> cat input.txt | prot2pept
                <br>> fasta header
                <br>AALTEAALR
                <br>TER
                <br>> other header
                <br>PEPTIDE
            </boxed>
        </header-body-card>

        <header-body-card
            id="options"
            title="Command-line options"
            class="mt-5"
            large-title
        >
            <h2>--pattern / -p <span class="text-caption grey--text text--darken-2">Specify cleavage pattern</span></h2>

            <p>
                By default, proteins are split by simulating a trypsin digest. This corresponds by splitting the input string by using the regular expression
                <inline-code>([KR])([^P])</inline-code>. The <inline-code>--pattern</inline-code> option allows you to specify an alternative (ruby-style) regular expression to split the
                sequences.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> echo "LGAARPLGAGLAKVIGAGIGIGK" | prot2pept
                <br>LGAARPLGAGLAK
                <br>VIGAGIGIGK
                <br><sentinel>$</sentinel> echo "LGAARPLGAGLAKVIGAGIGIGK" | prot2pept <b>--pattern</b> '([KR])([^V])'
                <br>LGAAR
                <br>PLGAGLAKVIGAGIGIGK
            </boxed>

            <h2>--help / -h <span class="text-caption grey--text text--darken-2">Display help</span></h2>

            <p>
                This flag displays the help.
            </p>
        </header-body-card>
    </v-container>
</template>

<script setup lang="ts">
import InlineCode from '@/components/highlights/InlineCode.vue';
import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import Boxed from '@/components/highlights/Boxed.vue';
import Sentinel from '@/components/highlights/Sentinel.vue';
import RLink from '@/components/highlights/ResourceLink.vue';
</script>
