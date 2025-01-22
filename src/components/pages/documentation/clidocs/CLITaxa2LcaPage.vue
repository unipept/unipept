<template>
    <v-container>
        <h1 class="font-weight-light">
            unipept taxa2lca
        </h1>
        <h3 class="font-weight-light">
            Returns the taxonomic lowest common ancestor of a given list of taxon identifiers.
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>unipept taxa2lca</inline-code> command takes one or more <initialism>NCBI</initialism> taxon id's as input and returns the taxonomic lowest common
            ancestor (<initialism>LCA</initialism>) of these taxa as output. All this information is fetched by doing
            <r-link
                to="/apidocs/taxa2lca"
                router
            >
                <initialism>API</initialism>-requests
            </r-link> to the Unipept server.
        </p>

        <header-body-card
            id="input"
            title="Input"
            large-title
        >
            <p>
                The <inline-code>unipept taxa2lca</inline-code> command expects <initialism>NCBI</initialism> taxon id's as input. The source of this input can be command line
                arguments, a file, or <i>standard input</i>. If input is supplied using multiple sources at the same time, the order of priority as described above is used.
            </p>

            <h3>Command line arguments</h3>
            <p>
                If input is supplied using command line arguments, the accession numbers must be separated by spaces.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept taxa2lca 817 329854 1099853
                <br>taxon_id,taxon_name,taxon_rank
                <br>171549,Bacteroidales,order
            </boxed>

            <h3>File input</h3>
            <p>
                Use the <r-link
                    to="#options"
                    router
                >
                    --input parameter
                </r-link> to specify a file to use as input. If input is supplied using a file, a single
                peptide per line is expected.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> cat input.txt
                <br>817
                <br>329854
                <br>1099853
                <br><sentinel>$</sentinel> unipept taxa2lca --input input.txt
                <br>taxon_id,taxon_name,taxon_rank
                <br>171549,Bacteroidales,order
            </boxed>

            <h3>Standard input</h3>
            <p>
                If the command is run without arguments and no file is specified, <inline-code>unipept taxa2lca</inline-code> will read its input from <i>standard input</i>.
                When <i>standard input</i> is used, a single peptide per line is expected.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> cat input.txt
                <br>817
                <br>329854
                <br>1099853
                <br><sentinel>$</sentinel> cat input | unipept taxa2lca
                <br>taxon_id,taxon_name,taxon_rank
                <br>171549,Bacteroidales,order
            </boxed>
        </header-body-card>

        <header-body-card
            id="output"
            title="Output"
            class="mt-5"
            large-title
        >
            <p>
                The <inline-code>unipept taxa2lca</inline-code> command outputs the taxonomic lowest common ancestor (<initialism>LCA</initialism>) for a given set of taxon id's.
                By default, the <initialism>NCBI</initialism> taxon id, taxon name and taxonomic rank of the <initialism>LCA</initialism> are returned. By using
                the <r-link
                    to="#options"
                    router
                >
                    --all parameter
                </r-link>, this can be supplemented with the full taxonomic lineage of the <initialism>LCA</initialism>.
                Consult the <r-link
                    to="/apidocs/taxa2lca"
                    router
                >
                    <initialism>API</initialism> documentation
                </r-link> for a detailed list of output fields. A selection
                of output fields can be specified with the <r-link
                    to="#options"
                    router
                >
                    --select parameter
                </r-link>. By default, output is generated in csv format.
                By using the <r-link
                    to="#options"
                    router
                >
                    --format parameter
                </r-link>, the format can be changed into json or xml. The output can be written to a file
                or to <i>standard output</i>.
            </p>

            <h3>File output</h3>
            <p>
                Use the <r-link
                    to="#options"
                    router
                >
                    --output parameter
                </r-link> to specify an output file. If the file aready exists, the output will be
                appended to the end of the file.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept taxa2lca --output output.txt 817 329854 1099853
                <br><sentinel>$</sentinel> cat output.txt
                <br>taxon_id,taxon_name,taxon_rank
                <br>171549,Bacteroidales,order
            </boxed>

            <h3>Standard output</h3>
            <p>
                If no output file is specified, <inline-code>unipept taxa2lca</inline-code> will write its output to <i>standard output</i>.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept taxa2lca 817 329854 1099853
                <br>taxon_id,taxon_name,taxon_rank
                <br>171549,Bacteroidales,order
                <br><sentinel>$</sentinel> unipept taxa2lca 817 329854 1099853 > output.txt
                <br><sentinel>$</sentinel> cat output.txt
                <br>taxon_id,taxon_name,taxon_rank
                <br>171549,Bacteroidales,order
            </boxed>
        </header-body-card>

        <header-body-card
            id="options"
            title="Command-line options"
            class="mt-5"
            large-title
        >
            <h2>--input / -i <span class="text-caption grey--text text--darken-2">Specify an input file</span></h2>

            <p>
                All Unipept <initialism>CLI</initialism> commands can process input from 3 sources: command line arguments, a file, or <i>standard input</i>. The optional <inline-code>--input</inline-code>
                option allows you to specify an input file. The file should contain a single peptide per line.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> cat input.txt
                <br>817
                <br>329854
                <br>1099853
                <br><sentinel>$</sentinel> unipept taxa2lca <b>--input</b> input.txt
                <br>taxon_id,taxon_name,taxon_rank
                <br>171549,Bacteroidales,order
            </boxed>

            <h2>--output / -o <span class="text-caption grey--text text--darken-2">Specify an output file</span></h2>

            <p>
                By default, the unipept commands write their output to <i>standard output</i>. Using the optional <inline-code>--output</inline-code> option allows you to
                specify a file to write the output to. If the file already exists, the output will be appended; if it doesn't, a new file will be created.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept taxa2lca <b>--output</b> output.txt 817 329854 1099853
                <br><sentinel>$</sentinel> cat output.txt
                <br>taxon_id,taxon_name,taxon_rank
                <br>171549,Bacteroidales,order
            </boxed>

            <h2>--select / -s <span class="text-caption grey--text text--darken-2">Specify the output fields</span></h2>

            <p>
                By default, the Unipept <initialism>CLI</initialism> commands output all information fields received from the Unipept server. The <inline-code>--select</inline-code> option allows you
                to control which fields are returned. A list of fields can be specified by a comma-separated list, or by using multiple <inline-code>--select</inline-code>
                options. A <b>*</b> can be used as a wildcard for field names. For example, <inline-code>--select peptide,taxon*</inline-code> will return the peptide field and all
                fields starting with taxon.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept taxa2lca <b>--select</b> taxon_id,taxon_name 817 329854 1099853
                <br>taxon_id,taxon_name
                <br>171549,Bacteroidales
                <br><sentinel>$</sentinel> unipept taxa2lca <b>--select</b> taxon_id <b>--select</b> *rank 817 329854 1099853
                <br>taxon_id,taxon_rank
                <br>171549,order
            </boxed>

            <h2>--format / -f <span class="text-caption grey--text text--darken-2">Specify the output format</span></h2>

            <p>
                By default, the Unipept <initialism>CLI</initialism> commands return their output in csv format. The <inline-code>--format</inline-code> option allows you to select another format.
                Supported formats are csv, json, and xml.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept taxa2lca <b>--format</b> json 817 329854 1099853
                <br>[{"taxon_id":171549,"taxon_name":"Bacteroidales","taxon_rank":"order"}]
                <br><sentinel>$</sentinel> unipept taxa2lca <b>--format</b> xml 817 329854 1099853
                <br>{{ htmlFragment }}
            </boxed>

            <h2>--all / -a <span class="text-caption grey--text text--darken-2">Request additional information</span></h2>

            <p>
                By default, the Unipept <initialism>CLI</initialism> commands only request basic information from the Unipept server. By using the <inline-code>--all</inline-code> flag, you can request
                additional information fields such as the lineage of the returned taxa. You can use the <inline-code>--select</inline-code> option to select which fields are
                included in the output.
            </p>

            <StaticAlert title="Performance penalty">
                <p>
                    Setting <inline-code>--all</inline-code> has a performance penalty inferred from additional database queries. Do not use this parameter
                    unless the extra information fields are needed.
                </p>
            </StaticAlert>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept taxa2lca <b>--all</b> --select taxon_id,phylum* 817 329854 1099853
                <br>taxon_id,phylum_id,phylum_name
                <br>171549,976,Bacteroidetes
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
import StaticAlert from '@/components/alerts/StaticAlert.vue';
import initialism from '@/components/highlights/Initialism.vue';

const htmlFragment = "<results><result><taxon_id>171549</taxon_id><taxon_name>Bacteroidales</taxon_name><taxon_rank>order</taxon_rank></result></results>"
</script>
