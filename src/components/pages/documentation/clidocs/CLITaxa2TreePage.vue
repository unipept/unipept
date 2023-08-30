<template>
    <v-container>
        <h1 class="font-weight-light">
            unipept taxa2tree
        </h1>
        <h3 class="font-weight-light">
            Returns the taxonomic tree of a given list of taxon identifiers.
        </h3>

        <v-divider class="my-2" />

        <p>
            The <inline-code>unipept taxa2lca</inline-code> command takes one or more <initialism>NCBI</initialism> taxon id's as input and returns the taxonomic tree of these
            taxa as output. All this information is fetched by doing  <r-link to="/apidocs/taxa2tree" router><initialism>API</initialism>-requests</r-link> to the
            Unipept server.
        </p>

        <header-body-card
            id="input"
            title="Input"
            large-title
        >
            <p>
                The <inline-code>unipept taxa2tree</inline-code> command expects <initialism>NCBI</initialism> taxon id's as input. The source of this input can be command line
                arguments, a file, or <i>standard input</i>. If input is supplied using multiple sources at the same time, the order of priority as described above is used.
            </p>

            <h3>Command line arguments</h3>
            <p>
                If input is supplied using command line arguments, the accession numbers must be separated by spaces.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept taxa2tree 817 329854 1099853
                <br>[{"id":1,"name":"Organism","rank":"root","data":{"count":3,"self_count":0},"children":[{"id":2,"name":"Bacteria","rank":"superkingdom","data":{"count":3,"self_count":0},"children":[{"id":976,"name":"Bacteroidetes","rank":"phylum","data":{"count":3,"self_count":0},"children":[{"id":200643,"name":"Bacteroidia","rank":"class_","data":{"count":3,"self_count":0},"children":[{"id":171549,"name":"Bacteroidales","rank":"order","data":{"count":3,"self_count":0},"children":[{"id":815,"name":"Bacteroidaceae","rank":"family","data":{"count":2,"self_count":0},"children":[{"id":816,"name":"Bacteroides","rank":"genus","data":{"count":2,"self_count":0},"children":[{"id":817,"name":"Bacteroides fragilis","rank":"species","data":{"count":1,"self_count":1},"children":[]},{"id":329854,"name":"Bacteroides intestinalis","rank":"species","data":{"count":1,"self_count":1},"children":[]}]}]},{"id":2005519,"name":"Barnesiellaceae","rank":"family","data":{"count":1,"self_count":0},"children":[{"id":1348911,"name":"Coprobacter","rank":"genus","data":{"count":1,"self_count":0},"children":[{"id":1099853,"name":"Coprobacter fastidiosus","rank":"species","data":{"count":1,"self_count":1},"children":[]}]}]}]}]}]}]}]}]
            </boxed>

            <h3>File input</h3>
            <p>
                Use the <r-link to="#options" router>--input parameter</r-link> to specify a file to use as input. If input is supplied using a file, a single
                peptide per line is expected.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> cat input.txt
                <br>817,5
                <br>329854,4
                <br>1099853,78
                <br><sentinel>$</sentinel> unipept taxa2tree --input input.txt
                <br>[{"id":1,"name":"Organism","rank":"root","data":{"count":3,"self_count":0},"children":[{"id":2,"name":"Bacteria","rank":"superkingdom","data":{"count":3,"self_count":0},"children":[{"id":976,"name":"Bacteroidetes","rank":"phylum","data":{"count":3,"self_count":0},"children":[{"id":200643,"name":"Bacteroidia","rank":"class_","data":{"count":3,"self_count":0},"children":[{"id":171549,"name":"Bacteroidales","rank":"order","data":{"count":3,"self_count":0},"children":[{"id":815,"name":"Bacteroidaceae","rank":"family","data":{"count":2,"self_count":0},"children":[{"id":816,"name":"Bacteroides","rank":"genus","data":{"count":2,"self_count":0},"children":[{"id":817,"name":"Bacteroides fragilis","rank":"species","data":{"count":1,"self_count":1},"children":[]},{"id":329854,"name":"Bacteroides intestinalis","rank":"species","data":{"count":1,"self_count":1},"children":[]}]}]},{"id":2005519,"name":"Barnesiellaceae","rank":"family","data":{"count":1,"self_count":0},"children":[{"id":1348911,"name":"Coprobacter","rank":"genus","data":{"count":1,"self_count":0},"children":[{"id":1099853,"name":"Coprobacter fastidiosus","rank":"species","data":{"count":1,"self_count":1},"children":[]}]}]}]}]}]}]}]}]
            </boxed>

            <h3>Standard input</h3>
            <p>
                If the command is run without arguments and no file is specified, <inline-code>unipept taxa2tree</inline-code> will read its input from <i>standard input</i>.
                When <i>standard input</i> is used, a single peptide per line is expected.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> cat input.txt
                <br>817,5
                <br>329854,4
                <br>1099853,78
                <br><sentinel>$</sentinel> cat input | unipept taxa2tree
                <br>[{"id":1,"name":"Organism","rank":"root","data":{"count":3,"self_count":0},"children":[{"id":2,"name":"Bacteria","rank":"superkingdom","data":{"count":3,"self_count":0},"children":[{"id":976,"name":"Bacteroidetes","rank":"phylum","data":{"count":3,"self_count":0},"children":[{"id":200643,"name":"Bacteroidia","rank":"class_","data":{"count":3,"self_count":0},"children":[{"id":171549,"name":"Bacteroidales","rank":"order","data":{"count":3,"self_count":0},"children":[{"id":815,"name":"Bacteroidaceae","rank":"family","data":{"count":2,"self_count":0},"children":[{"id":816,"name":"Bacteroides","rank":"genus","data":{"count":2,"self_count":0},"children":[{"id":817,"name":"Bacteroides fragilis","rank":"species","data":{"count":1,"self_count":1},"children":[]},{"id":329854,"name":"Bacteroides intestinalis","rank":"species","data":{"count":1,"self_count":1},"children":[]}]}]},{"id":2005519,"name":"Barnesiellaceae","rank":"family","data":{"count":1,"self_count":0},"children":[{"id":1348911,"name":"Coprobacter","rank":"genus","data":{"count":1,"self_count":0},"children":[{"id":1099853,"name":"Coprobacter fastidiosus","rank":"species","data":{"count":1,"self_count":1},"children":[]}]}]}]}]}]}]}]}]
            </boxed>
        </header-body-card>

        <header-body-card
            id="output"
            title="Output"
            class="mt-5"
            large-title
        >
            <p>
                The <inline-code>unipept taxa2tree</inline-code> command outputs the taxonomic tree for a given set of taxon IDs. By default, the <initialism>NCBI</initialism> taxon id,
                taxon name, taxonomic rank, count and self count of each node in the tree are returned in the json format. Consult the
                <r-link to="/apidocs/taxa2tree" router><initialism>API</initialism> documentation</r-link> for a detailed list of output fields. By default, output is
                generated in json format. By using the <r-link to="#options" router>--format parameter</r-link>, the format can be changed into html or an url. The output
                can be written to a file or to <i>standard output</i>.
            </p>

            <h3>File output</h3>
            <p>
                Use the <r-link to="#options" router>--output parameter</r-link> to specify an output file. If the file aready exists, the output will be
                appended to the end of the file.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept taxa2tree --output output.txt 817 329854 1099853
                <br><sentinel>$</sentinel> cat output.txt
                <br>[{"id":1,"name":"Organism","rank":"root","data":{"count":3,"self_count":0},"children":[{"id":2,"name":"Bacteria","rank":"superkingdom","data":{"count":3,"self_count":0},"children":[{"id":976,"name":"Bacteroidetes","rank":"phylum","data":{"count":3,"self_count":0},"children":[{"id":200643,"name":"Bacteroidia","rank":"class_","data":{"count":3,"self_count":0},"children":[{"id":171549,"name":"Bacteroidales","rank":"order","data":{"count":3,"self_count":0},"children":[{"id":815,"name":"Bacteroidaceae","rank":"family","data":{"count":2,"self_count":0},"children":[{"id":816,"name":"Bacteroides","rank":"genus","data":{"count":2,"self_count":0},"children":[{"id":817,"name":"Bacteroides fragilis","rank":"species","data":{"count":1,"self_count":1},"children":[]},{"id":329854,"name":"Bacteroides intestinalis","rank":"species","data":{"count":1,"self_count":1},"children":[]}]}]},{"id":2005519,"name":"Barnesiellaceae","rank":"family","data":{"count":1,"self_count":0},"children":[{"id":1348911,"name":"Coprobacter","rank":"genus","data":{"count":1,"self_count":0},"children":[{"id":1099853,"name":"Coprobacter fastidiosus","rank":"species","data":{"count":1,"self_count":1},"children":[]}]}]}]}]}]}]}]}]
            </boxed>

            <h3>Standard output</h3>
            <p>
                If no output file is specified, <inline-code>unipept taxa2tree</inline-code> will write its output to <i>standard output</i>.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept taxa2tree 817 329854 1099853
                <br>[{"id":1,"name":"Organism","rank":"root","data":{"count":3,"self_count":0},"children":[{"id":2,"name":"Bacteria","rank":"superkingdom","data":{"count":3,"self_count":0},"children":[{"id":976,"name":"Bacteroidetes","rank":"phylum","data":{"count":3,"self_count":0},"children":[{"id":200643,"name":"Bacteroidia","rank":"class_","data":{"count":3,"self_count":0},"children":[{"id":171549,"name":"Bacteroidales","rank":"order","data":{"count":3,"self_count":0},"children":[{"id":815,"name":"Bacteroidaceae","rank":"family","data":{"count":2,"self_count":0},"children":[{"id":816,"name":"Bacteroides","rank":"genus","data":{"count":2,"self_count":0},"children":[{"id":817,"name":"Bacteroides fragilis","rank":"species","data":{"count":1,"self_count":1},"children":[]},{"id":329854,"name":"Bacteroides intestinalis","rank":"species","data":{"count":1,"self_count":1},"children":[]}]}]},{"id":2005519,"name":"Barnesiellaceae","rank":"family","data":{"count":1,"self_count":0},"children":[{"id":1348911,"name":"Coprobacter","rank":"genus","data":{"count":1,"self_count":0},"children":[{"id":1099853,"name":"Coprobacter fastidiosus","rank":"species","data":{"count":1,"self_count":1},"children":[]}]}]}]}]}]}]}]}]
                <br><sentinel>$</sentinel> unipept taxa2lca 817 329854 1099853 > output.txt
                <br><sentinel>$</sentinel> cat output.txt
                <br>[{"id":1,"name":"Organism","rank":"root","data":{"count":3,"self_count":0},"children":[{"id":2,"name":"Bacteria","rank":"superkingdom","data":{"count":3,"self_count":0},"children":[{"id":976,"name":"Bacteroidetes","rank":"phylum","data":{"count":3,"self_count":0},"children":[{"id":200643,"name":"Bacteroidia","rank":"class_","data":{"count":3,"self_count":0},"children":[{"id":171549,"name":"Bacteroidales","rank":"order","data":{"count":3,"self_count":0},"children":[{"id":815,"name":"Bacteroidaceae","rank":"family","data":{"count":2,"self_count":0},"children":[{"id":816,"name":"Bacteroides","rank":"genus","data":{"count":2,"self_count":0},"children":[{"id":817,"name":"Bacteroides fragilis","rank":"species","data":{"count":1,"self_count":1},"children":[]},{"id":329854,"name":"Bacteroides intestinalis","rank":"species","data":{"count":1,"self_count":1},"children":[]}]}]},{"id":2005519,"name":"Barnesiellaceae","rank":"family","data":{"count":1,"self_count":0},"children":[{"id":1348911,"name":"Coprobacter","rank":"genus","data":{"count":1,"self_count":0},"children":[{"id":1099853,"name":"Coprobacter fastidiosus","rank":"species","data":{"count":1,"self_count":1},"children":[]}]}]}]}]}]}]}]}]
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
                <br>817,5
                <br>329854,4
                <br>1099853,78
                <br><sentinel>$</sentinel> unipept taxa2tree <b>--input</b> input.txt
                <br>[{"id":1,"name":"Organism","rank":"root","data":{"count":3,"self_count":0},"children":[{"id":2,"name":"Bacteria","rank":"superkingdom","data":{"count":3,"self_count":0},"children":[{"id":976,"name":"Bacteroidetes","rank":"phylum","data":{"count":3,"self_count":0},"children":[{"id":200643,"name":"Bacteroidia","rank":"class_","data":{"count":3,"self_count":0},"children":[{"id":171549,"name":"Bacteroidales","rank":"order","data":{"count":3,"self_count":0},"children":[{"id":815,"name":"Bacteroidaceae","rank":"family","data":{"count":2,"self_count":0},"children":[{"id":816,"name":"Bacteroides","rank":"genus","data":{"count":2,"self_count":0},"children":[{"id":817,"name":"Bacteroides fragilis","rank":"species","data":{"count":1,"self_count":1},"children":[]},{"id":329854,"name":"Bacteroides intestinalis","rank":"species","data":{"count":1,"self_count":1},"children":[]}]}]},{"id":2005519,"name":"Barnesiellaceae","rank":"family","data":{"count":1,"self_count":0},"children":[{"id":1348911,"name":"Coprobacter","rank":"genus","data":{"count":1,"self_count":0},"children":[{"id":1099853,"name":"Coprobacter fastidiosus","rank":"species","data":{"count":1,"self_count":1},"children":[]}]}]}]}]}]}]}]}]
            </boxed>

            <h2>--output / -o <span class="text-caption grey--text text--darken-2">Specify an output file</span></h2>

            <p>
                By default, the unipept commands write their output to <i>standard output</i>. Using the optional <inline-code>--output</inline-code> option allows you to
                specify a file to write the output to. If the file already exists, the output will be appended; if it doesn't, a new file will be created.
            </p>

            <h4>Example</h4>
            <boxed>
                <sentinel>$</sentinel> unipept taxa2tree <b>--output</b> output.txt 817 329854 1099853
                <br><sentinel>$</sentinel> cat output.txt
                <br>[{"id":1,"name":"Organism","rank":"root","data":{"count":3,"self_count":0},"children":[{"id":2,"name":"Bacteria","rank":"superkingdom","data":{"count":3,"self_count":0},"children":[{"id":976,"name":"Bacteroidetes","rank":"phylum","data":{"count":3,"self_count":0},"children":[{"id":200643,"name":"Bacteroidia","rank":"class_","data":{"count":3,"self_count":0},"children":[{"id":171549,"name":"Bacteroidales","rank":"order","data":{"count":3,"self_count":0},"children":[{"id":815,"name":"Bacteroidaceae","rank":"family","data":{"count":2,"self_count":0},"children":[{"id":816,"name":"Bacteroides","rank":"genus","data":{"count":2,"self_count":0},"children":[{"id":817,"name":"Bacteroides fragilis","rank":"species","data":{"count":1,"self_count":1},"children":[]},{"id":329854,"name":"Bacteroides intestinalis","rank":"species","data":{"count":1,"self_count":1},"children":[]}]}]},{"id":2005519,"name":"Barnesiellaceae","rank":"family","data":{"count":1,"self_count":0},"children":[{"id":1348911,"name":"Coprobacter","rank":"genus","data":{"count":1,"self_count":0},"children":[{"id":1099853,"name":"Coprobacter fastidiosus","rank":"species","data":{"count":1,"self_count":1},"children":[]}]}]}]}]}]}]}]}]
            </boxed>

            <h2>--format / -f <span class="text-caption grey--text text--darken-2">Specify the output format</span></h2>

            <p>
                By default, the Unipept <initialism>CLI</initialism> commands return their output in json format. The <inline-code>--format</inline-code> option allows you to select another format.
                Supported formats are json, html, and url.
            </p>

            <h4>Example</h4>
            <boxed style="padding-bottom: 16px; white-space: pre;">
                <sentinel>$</sentinel> unipept taxa2tree <b>--format</b> url 817 329854 1099853
                <br><a href="https://bl.ocks.org/2c8279c53874528aa3f1ddd018953e60" target="_blank">https://bl.ocks.org/2c8279c53874528aa3f1ddd018953e60</a>
                <br><sentinel>$</sentinel> unipept taxa2lca <b>--format</b> html 817 329854 1099853
<pre>
&lt;!DOCTYPE html>
&lt;html>
    &lt;head>
        &lt;script src="https://code.jquery.com/jquery-3.5.0.slim.min.js" integrity="sha256-MlusDLJIP1GRgLrOflUQtshyP0TwT/RHXsI1wWGnQhs=" crossorigin="anonymous">&lt;/script>
        &lt;script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.17/d3.min.js" integrity="sha256-dsOXGNHAo/syFnazt+KTBsCQeRmlcW1XKL0bCK4Baec=" crossorigin="anonymous">&lt;/script>
        &lt;script src="https://cdn.jsdelivr.net/npm/unipept-visualizations@1.7.3/dist/unipept-visualizations.min.js" integrity="sha256-X40vVFfGbi55N33QuZEMmw3nxi7Swljq5OJ1UHWdBhQ=" crossorigin="anonymous">&lt;/script>
    &lt;/head>
    &lt;body>
        &lt;div id="sunburst">&lt;/div>
        &lt;script>
            const data = {"id":1,"name":"Organism","rank":"root","data":{"count":3,"self_count":0},"children":[{"id":2,"name":"Bacteria","rank":"superkingdom","data":{"count":3,"self_count":0},"children":[{"id":976,"name":"Bacteroidetes","rank":"phylum","data":{"count":3,"self_count":0},"children":[{"id":200643,"name":"Bacteroidia","rank":"class_","data":{"count":3,"self_count":0},"children":[{"id":171549,"name":"Bacteroidales","rank":"order","data":{"count":3,"self_count":0},"children":[{"id":815,"name":"Bacteroidaceae","rank":"family","data":{"count":2,"self_count":0},"children":[{"id":816,"name":"Bacteroides","rank":"genus","data":{"count":2,"self_count":0},"children":[{"id":817,"name":"Bacteroides fragilis","rank":"species","data":{"count":1,"self_count":1},"children":[]},{"id":329854,"name":"Bacteroides intestinalis","rank":"species","data":{"count":1,"self_count":1},"children":[]}]}]},{"id":2005519,"name":"Barnesiellaceae","rank":"family","data":{"count":1,"self_count":0},"children":[{"id":1348911,"name":"Coprobacter","rank":"genus","data":{"count":1,"self_count":0},"children":[{"id":1099853,"name":"Coprobacter fastidiosus","rank":"species","data":{"count":1,"self_count":1},"children":[]}]}]}]}]}]}]}]};

            function tooltipContent(d) {
                return '&lt;b>' + d.name + '&lt;/b> (' + d.rank + ')&lt;br/>' +
                    (!d.data.self_count ? '0' : d.data.self_count) +
                    (d.data.self_count && d.data.self_count === 1 ? ' sequence' : ' sequences') + ' specific to this level&lt;br/>' +
                    (!d.data.count ? '0' : d.data.count) +
                    (d.data.count && d.data.count === 1 ? ' sequence' : ' sequences') + ' specific to this level or lower';
            };

            const options = {
                getTooltip: tooltipContent
            };

            $("#sunburst").sunburst(data, options);
        &lt;/script>
    &lt;/body>
&lt;/html>
</pre>
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
import initialism from '@/components/highlights/initialism.vue';
</script>

<style scoped>
a {
    text-decoration: none;
}
</style>
