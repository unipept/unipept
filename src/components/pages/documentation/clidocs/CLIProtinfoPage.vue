<template>
    <v-container>
        <h1 class="font-weight-light">
            unipept protinfo
        </h1>
        <h3 class="font-weight-light">
            Returns functional and taxonomic information for UniProt accession numbers.
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>unipept protinfo</inline-code> command takes one or more UniProt accession numbers as input and returns the functional
            annotations and the taxon of the corresponding UniProt entries. Where <r-link
                to="/clidocs/peptinfo"
                router
            >
                peptinfo
            </r-link> starts from a tryptic peptide and aggregates over every protein that contains it, protinfo reports on the proteins themselves.
        </p>

        <header-body-card
            id="input"
            title="Input"
            large-title
        >
            <p>
                The <inline-code>unipept protinfo</inline-code> command accepts UniProt accession numbers as command line arguments, from a file passed
                with the <r-link
                    to="#options"
                    router
                >
                    --input
                </r-link> option, or from <i>standard input</i>. The first of these that is present is used. Files and standard input should contain a
                single accession number per line.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept protinfo P78330
                <br><sentinel>$</sentinel> unipept protinfo --input accessions.txt
                <br><sentinel>$</sentinel> cat accessions.txt | unipept protinfo
            </boxed>
        </header-body-card>

        <header-body-card
            id="output"
            title="Output"
            class="mt-5"
            large-title
        >
            <p>
                For each accession number, the command returns the protein name, the taxon it belongs to, and its <initialism>EC</initialism> numbers,
                <initialism>GO</initialism> terms and <initialism>InterPro</initialism> entries. Output is <initialism>CSV</initialism> by default and
                contains the following fields:
            </p>

            <boxed>
                protein,name,taxon_id,taxon_name,taxon_rank,ec_number,go_term,ipr_code
            </boxed>

            <p>
                Use the <r-link
                    to="#options"
                    router
                >
                    --select
                </r-link> option to limit the output to the fields you need.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept protinfo --select protein,name,taxon_name,ec_number P78330 Q9UBQ7
                <br>protein,name,taxon_name,ec_number
                <br>Q9UBQ7,Glyoxylate reductase/hydroxypyruvate reductase,Homo sapiens,1.1.1.79 1.1.1.81
                <br>P78330,Phosphoserine phosphatase,Homo sapiens,3.1.3.3
            </boxed>

            <static-alert
                class="mt-5"
                title="Result order"
            >
                <p>
                    Results are returned in the order the server produces them, which is not necessarily the order of the input. Include the
                    <inline-code>protein</inline-code> field if you need to match each row back to its accession number.
                </p>
            </static-alert>
        </header-body-card>

        <header-body-card
            id="options"
            title="Command-line options"
            class="mt-5"
            large-title
        >
            <h2>--input / -i <span class="text-caption grey--text text--darken-2">Read input from a file</span></h2>

            <p>
                By default, input is read from <i>standard input</i>. The <inline-code>--input</inline-code> option reads it from a file instead.
                The option may be given more than once, in which case the files are read one after the other as a single stream.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept protinfo <b>--input</b> accessions1.txt <b>--input</b> accessions2.txt
            </boxed>

            <h2>--output / -o <span class="text-caption grey--text text--darken-2">Write output to a file</span></h2>

            <p>
                By default, output is written to <i>standard output</i>. The <inline-code>--output</inline-code> option writes it to a file instead.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept protinfo <b>--output</b> results.csv P78330
            </boxed>

            <h2>--select / -s <span class="text-caption grey--text text--darken-2">Specify the output fields</span></h2>

            <p>
                By default, all information fields received from the Unipept server are returned. The <inline-code>--select</inline-code> option controls
                which fields are returned. Fields can be given as a comma separated list or by repeating the option, and <inline-code>*</inline-code> acts
                as a wildcard.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept protinfo <b>--select</b> protein,taxon* P78330
                <br>protein,taxon_id,taxon_name,taxon_rank
                <br>P78330,9606,Homo sapiens,species
            </boxed>

            <h2>--format / -f <span class="text-caption grey--text text--darken-2">Specify the output format</span></h2>

            <p>
                The output format can be set to <inline-code>csv</inline-code> (the default), <inline-code>json</inline-code> or
                <inline-code>xml</inline-code>.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept protinfo <b>--format</b> json --select protein,taxon_id,taxon_name P78330
                <br>[{"protein":"P78330","taxon_id":9606,"taxon_name":"Homo sapiens"}]
            </boxed>

            <h2>--host <span class="text-caption grey--text text--darken-2">Use a different server</span></h2>

            <p>
                By default, requests go to the Unipept server at <inline-code>https://api.unipept.ugent.be</inline-code>. The <inline-code>--host</inline-code>
                option sends them to another server running the Unipept web service, such as a local instance.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept protinfo <b>--host</b> http://localhost:3000 P78330
            </boxed>

            <h2>--quiet / -q <span class="text-caption grey--text text--darken-2">Suppress service messages</span></h2>

            <p>
                Suppresses the messages that are normally written to <i>standard error</i>, such as retry notices and failed request reports.
                Failed requests are still recorded in the log file.
            </p>

            <h2>--log <span class="text-caption grey--text text--darken-2">Write messages to a log file</span></h2>

            <p>
                Writes the messages that normally go to <i>standard error</i> to the given file instead. Without this option, failed requests are
                recorded in a dated file in the <inline-code>.unipept</inline-code> directory of your home directory.
            </p>

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
import StaticAlert from '@/components/alerts/StaticAlert.vue';
import initialism from '@/components/highlights/Initialism.vue';
</script>
