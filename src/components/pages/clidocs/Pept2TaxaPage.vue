<template>
    <v-container>
        <h1 class="font-weight-light">
            unipept pept2taxa
        </h1>
        <h3 class="font-weight-light">Returns the set of taxa extracted from the UniProt entries containing a given tryptic peptide.</h3>
        
        <v-divider class="my-2" />

        <p>
            The <Code>unipept pept2taxa</Code> command takes one or more tryptic peptides as input and returns the set of (<Initialism>NCBI</Initialism>) taxa 
            extracted from the UniProt entries containing the peptides as output. This information is fetched by doing 
            <RLink to="/apidocs/pept2taxa" router><Initialism>API</Initialism>-requests</RLink> to the Unipept server.
        </p>

        <HeaderBodyCard id="input" title="Input">
            <p>
                The <Code>unipept pept2taxa</Code> command expects tryptic peptides as input. The source of this input can be command line arguments, a file, or 
                <i>standard input</i>. If input is supplied using multiple sources at the same time, the order of priority as described above is used.  
            </p>

            <h3>Command line arguments</h3>
            <p>
                If input is supplied using command line arguments, the accession numbers must be separated by spaces. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept pept2taxa MFNEIAPK ISVAQGASK
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>MFNEIAPK,1262758,Blautia sp. CAG:52,species
                <br>MFNEIAPK,1262948,Roseburia sp. CAG:471,species
                <br>ISVAQGASK,9606,Homo sapiens,species
            </Boxed>

            <h3>File input</h3>
            <p>
                Use the <RLink to="#options" router>--input parameter</RLink> to specify a file to use as input. If input is supplied using a file, a single 
                peptide per line is expected.  
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> cat input.txt
                <br>MFNEIAPK
                <br>ISVAQGASK
                <br><Sentinel>$</Sentinel> unipept pept2taxa --input input.txt
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>MFNEIAPK,1262758,Blautia sp. CAG:52,species
                <br>MFNEIAPK,1262948,Roseburia sp. CAG:471,species
                <br>ISVAQGASK,9606,Homo sapiens,species
            </Boxed>

            <h3>Standard input</h3>
            <p>
                If the command is run without arguments and no file is specified, <Code>unipept pept2taxa</Code> will read its input from <i>standard input</i>. 
                When <i>standard input</i> is used, a single peptide per line is expected. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> cat input.txt
                <br>MFNEIAPK
                <br>ISVAQGASK
                <br><Sentinel>$</Sentinel> cat input | unipept pept2taxa
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>MFNEIAPK,1262758,Blautia sp. CAG:52,species
                <br>MFNEIAPK,1262948,Roseburia sp. CAG:471,species
                <br>ISVAQGASK,9606,Homo sapiens,species
            </Boxed>
        </HeaderBodyCard>

        <HeaderBodyCard id="output" title="Output" class="mt-5">
            <p>
                The <Code>unipept pept2taxa</Code> command outputs all <Initialism>NCBI</Initialism> taxonomy entries that are associated with UniProt entries that contain 
                the given (tryptic) input peptides. By default, for each of the taxa, the <Initialism>NCBI</Initialism> taxon id, the name of the organism and the taxonomic 
                rank are returned. By using the <RLink to="#options" router>--all parameter</RLink>, this can be supplemented with the full taxonomic lineage of the taxon. 
                Consult the <RLink to="/apidocs/pept2taxa" router><Initialism>API</Initialism> documentation</RLink> for a detailed list of output fields. A selection of output 
                fields can be specified with the <RLink to="#options" router>--select parameter</RLink>. By default, output is generated in csv format. By using the 
                <RLink to="#options" router>--format parameter</RLink>, the format can be changed into json or xml. The output can be written to a file or to <i>standard output</i>.
            </p>

            <h3>File output</h3>
            <p>
                Use the <RLink to="#options" router>--output parameter</RLink> to specify an output file. If the file aready exists, the output will be 
                appended to the end of the file. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept pept2taxa --output output.txt MFNEIAPK ISVAQGASK
                <br><Sentinel>$</Sentinel> cat output.txt
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>MFNEIAPK,1262758,Blautia sp. CAG:52,species
                <br>MFNEIAPK,1262948,Roseburia sp. CAG:471,species
                <br>ISVAQGASK,9606,Homo sapiens,species
            </Boxed>

            <h3>Standard output</h3>
            <p>
                If no output file is specified, <Code>unipept pept2taxa</Code> will write its output to <i>standard output</i>.
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept pept2taxa MFNEIAPK ISVAQGASK
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>MFNEIAPK,1262758,Blautia sp. CAG:52,species
                <br>MFNEIAPK,1262948,Roseburia sp. CAG:471,species
                <br>ISVAQGASK,9606,Homo sapiens,species
                <br><Sentinel>$</Sentinel> unipept pept2taxa MFNEIAPK ISVAQGASK > output.txt
                <br><Sentinel>$</Sentinel> cat output.txt
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>MFNEIAPK,1262758,Blautia sp. CAG:52,species
                <br>MFNEIAPK,1262948,Roseburia sp. CAG:471,species
                <br>ISVAQGASK,9606,Homo sapiens,species
            </Boxed>
        </HeaderBodyCard>

        <HeaderBodyCard id="fasta" title="Fasta support" class="mt-5">
            <p>
                The <Code>unipept pept2taxa</Code> command supports input (from any source) in a fasta-like format (for example generated by the 
                <RLink to="/clidocs/prot2pept" router>prot2pept command</RLink>). This format consists of a fasta header (a line starting with a >), followed by 
                one or more lines containing one peptide each. When this format is detected, the output will automatically include an extra information field 
                containing the corresponding fasta header. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> cat input.txt
                <br>> header 1
                <br>ISVAQGASK
                <br>MFNEIAPK
                <br>> header 2
                <br>ISVAQGASK
                <br><Sentinel>$</Sentinel> unipept pept2taxa --input input.txt
                <br>fasta_header,peptide,taxon_id,taxon_name,taxon_rank
                <br>> header 1,ISVAQGASK,9606,Homo sapiens,species
                <br>> header 1,MFNEIAPK,1262758,Blautia sp. CAG:52,species
                <br>> header 1,MFNEIAPK,1262948,Roseburia sp. CAG:471,species
                <br>> header 2,ISVAQGASK,9606,Homo sapiens,species
            </Boxed>
        </HeaderBodyCard>

        <HeaderBodyCard id="options" title="Command-line options" class="mt-5">
            <h2>--equate / -e <span class="text-caption grey--text text--darken-2">Equate isoleucine and leucine</span></h2>

            <p>
                If the <Code>--equate</Code> flag is set, isoleucine (I) and leucine (L) are equated when matching tryptic peptides to UniProt entries. This is 
                similar to checking the <i>Equate I and L?</i> checkbox when performing a search in the Unipept web interface. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept pept2taxa FEALLGDGSQYGLHLQYK
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>FEALLGDGSQYGLHLQYK,408170,human gut metagenome,species
                <br>FEALLGDGSQYGLHLQYK,411471,Subdoligranulum variabile DSM 15176,no rank
                <br><Sentinel>$</Sentinel> unipept pept2taxa <b>--equate</b> FEALLGDGSQYGLHLQYK
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>FEALLGDGSQYGLHLQYK,408170,human gut metagenome,species
                <br>FEALLGDGSQYGLHLQYK,411471,Subdoligranulum variabile DSM 15176,no rank
                <br>FEALLGDGSQYGLHLQYK,411483,Faecalibacterium prausnitzii A2-165,no rank
                <br>FEALLGDGSQYGLHLQYK,411485,Faecalibacterium prausnitzii M21/2,no rank
                <br>FEALLGDGSQYGLHLQYK,657322,Faecalibacterium prausnitzii SL3/3,no rank
                <br>FEALLGDGSQYGLHLQYK,718252,Faecalibacterium prausnitzii L2-6,no rank
                <br>FEALLGDGSQYGLHLQYK,748224,Faecalibacterium cf. prausnitzii KLE1255,no rank
                <br>FEALLGDGSQYGLHLQYK,1262898,Faecalibacterium sp. CAG:82,species
            </Boxed>

            <h2>--input / -i <span class="text-caption grey--text text--darken-2">Specify an input file</span></h2>

            <p>
                All Unipept <Initialism>CLI</Initialism> commands can process input from 3 sources: command line arguments, a file, or <i>standard input</i>. The optional <Code>--input</Code> 
                option allows you to specify an input file. The file should contain a single peptide per line. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> cat input.txt
                <br>MFNEIAPK
                <br>OMGWTFBBQ
                <br>ISVAQGASK
                <br><Sentinel>$</Sentinel> unipept pept2taxa <b>--input</b> input.txt
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>MFNEIAPK,1262758,Blautia sp. CAG:52,species
                <br>MFNEIAPK,1262948,Roseburia sp. CAG:471,species
                <br>ISVAQGASK,9606,Homo sapiens,species
            </Boxed>

            <h2>--output / -o <span class="text-caption grey--text text--darken-2">Specify an output file</span></h2>

            <p>
                By default, the unipept commands write their output to <i>standard output</i>. Using the optional <Code>--output</Code> option allows you to 
                specify a file to write the output to. If the file already exists, the output will be appended; if it doesn't, a new file will be created. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept pept2taxa <b>--output</b> output.txt MFNEIAPK ISVAQGASK
                <br><Sentinel>$</Sentinel> cat output.txt
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>MFNEIAPK,1262758,Blautia sp. CAG:52,species
                <br>MFNEIAPK,1262948,Roseburia sp. CAG:471,species
                <br>ISVAQGASK,9606,Homo sapiens,species
            </Boxed>

            <h2>--select / -s <span class="text-caption grey--text text--darken-2">Specify the output fields</span></h2>

            <p>
                By default, the Unipept <Initialism>CLI</Initialism> commands output all information fields received from the Unipept server. The <Code>--select</Code> option allows you 
                to control which fields are returned. A list of fields can be specified by a comma-separated list, or by using multiple <Code>--select</Code> 
                options. A <b>*</b> can be used as a wildcard for field names. For example, <Code>--select peptide,taxon*</Code> will return the peptide field and all 
                fields starting with taxon. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept pept2taxa <b>--select</b> peptide,taxon_id MFNEIAPK
                <br>peptide,taxon_id
                <br>MFNEIAPK,1262758
                <br>MFNEIAPK,1262948
                <br><Sentinel>$</Sentinel> unipept pept2taxa <b>--select</b> peptide <b>--select</b> *name MFNEIAPK
                <br>peptide,taxon_name
                <br>MFNEIAPK,Blautia sp. CAG:52
                <br>MFNEIAPK,Roseburia sp. CAG:471
            </Boxed>

            <h2>--format / -f <span class="text-caption grey--text text--darken-2">Specify the output format</span></h2>

            <p>
                By default, the Unipept <Initialism>CLI</Initialism> commands return their output in csv format. The <Code>--format</Code> option allows you to select another format. 
                Supported formats are csv, json, and xml. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept pept2taxa <b>--format</b> json ISVAQGASK MFNEIAPK
                <br>[{"peptide":"ISVAQGASK","taxon_id":9606,"taxon_name":"Homo sapiens","taxon_rank":"species"},{"peptide":"MFNEIAPK","taxon_id":1262758,"taxon_name":"Blautia sp. CAG:52","taxon_rank":"species"},{"peptide":"MFNEIAPK","taxon_id":1262948,"taxon_name":"Roseburia sp. CAG:471","taxon_rank":"species"}]
                <br><Sentinel>$</Sentinel> unipept pept2taxa <b>--format</b> xml ISVAQGASK MFNEIAPK
                <br>{{ htmlFragment }}
            </Boxed>

            <h2>--all / -a <span class="text-caption grey--text text--darken-2">Request additional information</span></h2>

            <p>
                By default, the Unipept <Initialism>CLI</Initialism> commands only request basic information from the Unipept server. By using the <Code>--all</Code> flag, you can request 
                additional information fields such as the lineage of the returned taxa. You can use the <Code>--select</Code> option to select which fields are 
                included in the output. 
            </p>

            <StaticAlert title="Performance penalty">
                <p>
                    Setting <Code>--all</Code> has a performance penalty inferred from additional database queries. Do not use this parameter 
                    unless the extra information fields are needed.
                </p>
            </StaticAlert>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept pept2taxa <b>--all</b> --select peptide,taxon_id,order* ISVAQGASK MFNEIAPK
                <br>peptide,taxon_id,order_id,order_name
                <br>ISVAQGASK,9606,9443,Primates
                <br>MFNEIAPK,1262758,186802,Clostridiales
                <br>MFNEIAPK,1262948,186802,Clostridiales
            </Boxed>

            <h2>--help / -h <span class="text-caption grey--text text--darken-2">Display help</span></h2>

            <p>
                This flag displays the help. 
            </p>
        </HeaderBodyCard>
    </v-container>
</template>

<script setup lang="ts">
import Code from '@/components/highlights/InlineCode.vue';
import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import Boxed from '@/components/highlights/Boxed.vue';
import Sentinel from '@/components/highlights/Sentinel.vue';
import RLink from '@/components/highlights/ResourceLink.vue';
import StaticAlert from '@/components/alerts/StaticAlert.vue';
import Initialism from '@/components/highlights/Initialism.vue';

const htmlFragment = "<results><result><peptide>ISVAQGASK</peptide><taxon_id>9606</taxon_id><taxon_name>Homo sapiens</taxon_name><taxon_rank>species</taxon_rank></result><result><peptide>MFNEIAPK</peptide><taxon_id>1262758</taxon_id><taxon_name>Blautia sp. CAG:52</taxon_name><taxon_rank>species</taxon_rank></result><result><peptide>MFNEIAPK</peptide><taxon_id>1262948</taxon_id><taxon_name>Roseburia sp. CAG:471</taxon_name><taxon_rank>species</taxon_rank></result></results>"
</script>
