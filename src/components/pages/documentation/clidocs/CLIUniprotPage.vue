<template>
    <v-container>
        <h1 class="font-weight-light">
            uniprot
        </h1>
        <h3 class="font-weight-light">
            Fetches UniProt entries based on their accession numbers.
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>uniprot</inline-code> command takes one or more UniProt accession numbers and returns the corresponding UniProt entry for each of the accession
            numbers as output. This information is fetched by using the UniProt webservice.
        </p>

        <header-body-card
            id="input"
            title="Input"
            large-title
        >
            <p>
                The <inline-code>uniprot</inline-code> command expects UniProt accession numbers as input. The source of this input can be command line arguments or standard
                input. If input is supplied using multiple sources at the same time, the order of priority as described above is used.
            </p>

            <h3>Command line arguments</h3>
            <p>
                If input is supplied using command line arguments, the accession numbers must be separated by spaces.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> uniprot C6JD41 Q06JG4
                <br>MTLVPLGDRVVLKQVEAEETTKSGIVLPGQAQEKPQQAEVVAVGPGGVVDGKEVKMEVAVGDKVIYSKYSGTEVKMDGTEYIIVKQNDILAIVK
                <br>MFTNSIKNLIIYLMPLMVTLMLLSVSFVDAGKKPSGPNPGGNN
            </boxed>

            <h3>Standard input</h3>
            <p>
                If the command is run without arguments, <inline-code>uniprot</inline-code> will read its input from <i>standard input</i>. When <i>standard input</i> is used,
                a single UniProt accession number per line is expected.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> cat input.txt
                <br>C6JD41
                <br>Q06JG4
                <br><sentinel>$</sentinel> cat input | uniprot
                <br>MTLVPLGDRVVLKQVEAEETTKSGIVLPGQAQEKPQQAEVVAVGPGGVVDGKEVKMEVAVGDKVIYSKYSGTEVKMDGTEYIIVKQNDILAIVK
                <br>MFTNSIKNLIIYLMPLMVTLMLLSVSFVDAGKKPSGPNPGGNN
            </boxed>
        </header-body-card>

        <header-body-card
            id="output"
            title="Output"
            class="mt-5"
            large-title
        >
            <p>
                The <inline-code>uniprot</inline-code> command outputs the UniProt entry for each of the input accession numbers. By default, only the protein sequences are
                returned. By using the <r-link
                    to="#options"
                    router
                >
                    --format parameter
                </r-link>, this can be changed to fasta, txt, xml, rdf or gff. All output is
                written to <i>standard output</i>.
            </p>
        </header-body-card>

        <header-body-card
            id="options"
            title="Command-line options"
            class="mt-5"
            large-title
        >
            <h2>--format / -f <span class="text-caption grey--text text--darken-2">Specify the output format</span></h2>

            <p>
                By default, the <inline-code>uniprot</inline-code> command only returns the protein sequence of the UniProt entry. The <inline-code>--format</inline-code> option allows you
                to select another format. Supported formats are sequence, fasta, txt, xml, rdf, and gff.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> uniprot <b>--format</b> fasta C6JD41 Q06JG4
                <br>>tr|C6JD41|C6JD41_9FIRM 10 kDa chaperonin OS=Ruminococcus sp. 5_1_39BFAA GN=groS PE=3 SV=1
                <br>MTLVPLGDRVVLKQVEAEETTKSGIVLPGQAQEKPQQAEVVAVGPGGVVDGKEVKMEVAV
                <br>GDKVIYSKYSGTEVKMDGTEYIIVKQNDILAIVK
                <br>>sp|Q06JG4|16D10_MELHA CLAVATA3/ESR (CLE)-related protein 16D10 OS=Meloidogyne hapla GN=16D10 PE=2 SV=1
                <br>MFTNSIKNLIIYLMPLMVTLMLLSVSFVDAGKKPSGPNPGGNN
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
