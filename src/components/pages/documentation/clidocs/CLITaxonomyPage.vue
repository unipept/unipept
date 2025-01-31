<template>
    <v-container>
        <h1 class="font-weight-light">
            unipept taxonomy
        </h1>
        <h3 class="font-weight-light">
            Returns the taxonomic information for a given <initialism>NCBI</initialism> taxon identifier.
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>unipept taxonomy</inline-code> command takes one or more <initialism>NCBI</initialism> taxon id's as input and returns taxonomic information about
            these taxa as output. All this information is fetched by doing <r-link
                to="/apidocs/taxonomy"
                router
            >
                <initialism>API</initialism>-requests
            </r-link> to
            the Unipept server.
        </p>

        <header-body-card
            id="input"
            title="Input"
            large-title
        >
            <p>
                The <inline-code>unipept taxonomy</inline-code> command expects <initialism>NCBI</initialism> taxon id's as input. The source of this input can be command line
                arguments, a file, or <i>standard input</i>. If input is supplied using multiple sources at the same time, the order of priority as described above is used.
            </p>

            <h3>Command line arguments</h3>
            <p>
                If input is supplied using command line arguments, the accession numbers must be separated by spaces.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept taxonomy 817 329854
                <br>taxon_id,taxon_name,taxon_rank
                <br>817,Bacteroides fragilis,species
                <br>329854,Bacteroides intestinalis,species
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
                <br><sentinel>$</sentinel> unipept taxonomy --input input.txt
                <br>taxon_id,taxon_name,taxon_rank
                <br>817,Bacteroides fragilis,species
                <br>329854,Bacteroides intestinalis,species
            </boxed>

            <h3>Standard input</h3>
            <p>
                If the command is run without arguments and no file is specified, <inline-code>unipept taxonomy</inline-code> will read its input from <i>standard input</i>.
                When <i>standard input</i> is used, a single peptide per line is expected.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> cat input.txt
                <br>817
                <br>329854
                <br><sentinel>$</sentinel> cat input | unipept taxonomy
                <br>taxon_id,taxon_name,taxon_rank
                <br>817,Bacteroides fragilis,species
                <br>329854,Bacteroides intestinalis,species
            </boxed>
        </header-body-card>

        <header-body-card
            id="output"
            title="Output"
            class="mt-5"
            large-title
        >
            <p>
                The <inline-code>unipept taxonomy</inline-code> command outputs taxonomic information for a given list of taxon id's. By default, the taxon name and taxonomic
                rank of each taxon id are returned. By using the <r-link
                    to="#options"
                    router
                >
                    --all parameter
                </r-link>, this can be supplemented with the full
                taxonomic lineage of each taxon. Consult the <r-link
                    to="/apidocs/taxa2tree"
                    router
                >
                    <initialism>API</initialism> documentation
                </r-link> for a detailed
                list of output fields. A selection of output fields can be specified with the <r-link
                    to="#options"
                    router
                >
                    --select parameter
                </r-link>. By default,
                output is generated in csv format. By using the <r-link
                    to="#options"
                    router
                >
                    --format parameter
                </r-link>, the format can be changed into json or xml.
                The output can be written to a file or to <i>standard output</i>.
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
                <sentinel>$</sentinel> unipept taxonomy --output output.txt 817 329854
                <br><sentinel>$</sentinel> cat output.txt
                <br>taxon_id,taxon_name,taxon_rank
                <br>817,Bacteroides fragilis,species
                <br>329854,Bacteroides intestinalis,species
            </boxed>

            <h3>Standard output</h3>
            <p>
                If no output file is specified, <inline-code>unipept taxonomy</inline-code> will write its output to <i>standard output</i>.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept taxonomy 817 329854
                <br>taxon_id,taxon_name,taxon_rank
                <br>817,Bacteroides fragilis,species
                <br>329854,Bacteroides intestinalis,species
                <br><sentinel>$</sentinel> unipept taxonomy 817 329854 > output.txt
                <br><sentinel>$</sentinel> cat output.txt
                <br>taxon_id,taxon_name,taxon_rank
                <br>817,Bacteroides fragilis,species
                <br>329854,Bacteroides intestinalis,species
            </boxed>
        </header-body-card>

        <header-body-card
            id="fasta"
            title="Fasta support"
            class="mt-5"
            large-title
        >
            <p>
                The <inline-code>unipept taxonomy</inline-code> command supports input (from any source) in a fasta-like format (for example generated by the
                <r-link
                    to="/clidocs/prot2pept"
                    router
                >
                    prot2pept command
                </r-link>). This format consists of a fasta header (a line starting with a >), followed by
                one or more lines containing one peptide each. When this format is detected, the output will automatically include an extra information field
                containing the corresponding fasta header.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> cat input.txt
                <br>> header 1
                <br>817
                <br>329854
                <br>> header 2
                <br>817
                <br><sentinel>$</sentinel> unipept pept2lca --input input.txt
                <br>fasta_header,taxon_id,taxon_name,taxon_rank
                <br>> header 1,817,Bacteroides fragilis,species
                <br>> header 1,329854,Bacteroides intestinalis,species
                <br>> header 2,817,Bacteroides fragilis,species
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
                <br><sentinel>$</sentinel> unipept taxonomy <b>--input</b> input.txt
                <br>taxon_id,taxon_name,taxon_rank
                <br>817,Bacteroides fragilis,species
                <br>329854,Bacteroides intestinalis,species
            </boxed>

            <h2>--output / -o <span class="text-caption grey--text text--darken-2">Specify an output file</span></h2>

            <p>
                By default, the unipept commands write their output to <i>standard output</i>. Using the optional <inline-code>--output</inline-code> option allows you to
                specify a file to write the output to. If the file already exists, the output will be appended; if it doesn't, a new file will be created.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept taxonomy <b>--output</b> output.txt 817 329854
                <br><sentinel>$</sentinel> cat output.txt
                <br>taxon_id,taxon_name,taxon_rank
                <br>817,Bacteroides fragilis,species
                <br>329854,Bacteroides intestinalis,species
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
                <sentinel>$</sentinel> unipept taxonomy <b>--select</b> taxon_id,taxon_name 817 329854
                <br>taxon_id,taxon_name
                <br>817,Bacteroides fragilis
                <br>329854,Bacteroides intestinalis
                <br><sentinel>$</sentinel> unipept taxonomy <b>--select</b> taxon_id <b>--select</b> *rank 817 329854
                <br>taxon_id,taxon_rank
                <br>817,species
                <br>329854,species
            </boxed>

            <h2>--format / -f <span class="text-caption grey--text text--darken-2">Specify the output format</span></h2>

            <p>
                By default, the Unipept <initialism>CLI</initialism> commands return their output in json format. The <inline-code>--format</inline-code> option allows you to select another format.
                Supported formats are csv, json and xml.
            </p>

            <h4>Example</h4>
            <boxed style="padding-bottom: 16px; white-space: pre;">
                <sentinel>$</sentinel> unipept taxonomy <b>--format</b> json 817 329854
                <br>[{"taxon_id":817,"taxon_name":"Bacteroides fragilis","taxon_rank":"species"},{"taxon_id":329854,"taxon_name":"Bacteroides intestinalis","taxon_rank":"species"}]
                <br><sentinel>$</sentinel> unipept taxonomy <b>--format</b> xml 817 329854
                <br>{{ htmlText }}
            </boxed>

            <h2>--all / -a <span class="text-caption grey--text text--darken-2">Request additional information</span></h2>

            <p>
                By default, the Unipept <initialism>CLI</initialism> commands only request basic information from the Unipept server. By using the <inline-code>--all</inline-code> flag, you can request
                additional information fields such as the lineage of the returned taxa. You can use the <inline-code>--select</inline-code> option to select which fields are
                included in the output.
            </p>

            <static-alert title="Performance penalty">
                <p>
                    Setting <inline-code>--all</inline-code> has a performance penalty inferred from additional database queries. Do not use this parameter
                    unless the extra information fields are needed.
                </p>
            </static-alert>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept taxonomy <b>--all</b> --select taxon_id,order* 817 329854
                <br>taxon_id,order_id,order_name
                <br>817,171549,Bacteroidales
                <br>329854,171549,Bacteroidales
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
import Initialism from '@/components/highlights/Initialism.vue';

const htmlText = "<results><result><taxon_id>817</taxon_id><taxon_name>Bacteroides fragilis</taxon_name><taxon_rank>species</taxon_rank></result><result><taxon_id>329854</taxon_id><taxon_name>Bacteroides intestinalis</taxon_name><taxon_rank>species</taxon_rank></result></results>"
</script>

<style scoped>
a {
    text-decoration: none;
}
</style>
