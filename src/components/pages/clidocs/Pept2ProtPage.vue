<template>
    <v-container>
        <h1 class="font-weight-light">
            unipept pept2prot
        </h1>
        <h3 class="font-weight-light">Returns the set of UniProt entries containing a given tryptic peptide.</h3>
        
        <v-divider class="my-2" />

        <p>
            The <Code>unipept pept2prot</Code> command takes one or more tryptic peptides as input and returns the set of UniProt entries containing the peptides 
            as output. This information is fetched by doing <RLink to="/apidocs/pept2prot" router><Initialism>API</Initialism>-requests</RLink> to the Unipept server. 
        </p>

        <HeaderBodyCard id="input" title="Input">
            <p>
                The <Code>unipept pept2prot</Code> command expects tryptic peptides as input. The source of this input can be command line arguments, a file, or 
                <i>standard input</i>. If input is supplied using multiple sources at the same time, the order of priority as described above is used.  
            </p>

            <h3>Command line arguments</h3>
            <p>
                If input is supplied using command line arguments, the accession numbers must be separated by spaces. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept pept2prot MDGTEYIIVK ISVAQGASK
                <br>peptide,uniprot_id,protein_name,taxon_id
                <br>MDGTEYIIVK,C6JD41,10 kDa chaperonin,457412
                <br>ISVAQGASK,Q9Y6R7,IgGFc-binding protein,9606
                <br>ISVAQGASK,A0A087WXI2,IgGFc-binding protein,9606
            </Boxed>

            <h3>File input</h3>
            <p>
                Use the <RLink to="#options" router>--input parameter</RLink> to specify a file to use as input. If input is supplied using a file, a single 
                peptide per line is expected.  
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> cat input.txt
                <br>MDGTEYIIVK
                <br>ISVAQGASK
                <br><Sentinel>$</Sentinel> unipept pept2prot --input input.txt
                <br>peptide,uniprot_id,protein_name,taxon_id
                <br>MDGTEYIIVK,C6JD41,10 kDa chaperonin,457412
                <br>ISVAQGASK,Q9Y6R7,IgGFc-binding protein,9606
                <br>ISVAQGASK,A0A087WXI2,IgGFc-binding protein,9606
            </Boxed>

            <h3>Standard input</h3>
            <p>
                If the command is run without arguments and no file is specified, <Code>unipept pept2prot</Code> will read its input from <i>standard input</i>. 
                When <i>standard input</i> is used, a single peptide per line is expected. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> cat input.txt
                <br>MDGTEYIIVK
                <br>ISVAQGASK
                <br><Sentinel>$</Sentinel> cat input | unipept pept2prot
                <br>peptide,uniprot_id,protein_name,taxon_id
                <br>MDGTEYIIVK,C6JD41,10 kDa chaperonin,457412
                <br>ISVAQGASK,Q9Y6R7,IgGFc-binding protein,9606
                <br>ISVAQGASK,A0A087WXI2,IgGFc-binding protein,9606
            </Boxed>
        </HeaderBodyCard>

        <HeaderBodyCard id="output" title="Output" class="mt-5">
            <p>
                The <Code>unipept pept2prot</Code> command outputs all UniProt entries that contain the given (tryptic) input peptides. By default, for each of the 
                matching UniProt entries, the accession number, the name of the protein and the <Initialism>NCBI</Initialism> taxon id are returned. By using the 
                <RLink to="#options" router>--all parameter</RLink>, this can be supplemented with the name of the associated taxon and several cross referenes such 
                as the the associated <Initialism>EC</Initialism>-numbers and <Initialism>GO</Initialism>-terms. Consult the 
                <RLink to="/apidocs/pept2prot" router><Initialism>API</Initialism> documentation</RLink> for a detailed list of output fields. A selection of output fields can 
                be specified with the <RLink to="#options" router>--select parameter</RLink>. By default, output is generated in csv format. By using the 
                <RLink to="#options" router>--format parameter</RLink>, the format can be changed into json or xml. The output can be written to a file or to 
                <i>standard output</i>. 
            </p>

            <h3>File output</h3>
            <p>
                Use the <RLink to="#options" router>--output parameter</RLink> to specify an output file. If the file aready exists, the output will be 
                appended to the end of the file. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept pept2prot --output output.txt MDGTEYIIVK ISVAQGASK
                <br><Sentinel>$</Sentinel> cat output.txt
                <br>peptide,uniprot_id,protein_name,taxon_id
                <br>MDGTEYIIVK,C6JD41,10 kDa chaperonin,457412
                <br>ISVAQGASK,Q9Y6R7,IgGFc-binding protein,9606
                <br>ISVAQGASK,A0A087WXI2,IgGFc-binding protein,9606
            </Boxed>

            <h3>Standard output</h3>
            <p>
                If no output file is specified, <Code>unipept pept2prot</Code> will write its output to <i>standard output</i>.
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept pept2prot MDGTEYIIVK ISVAQGASK
                <br>peptide,uniprot_id,protein_name,taxon_id
                <br>MDGTEYIIVK,C6JD41,10 kDa chaperonin,457412
                <br>ISVAQGASK,Q9Y6R7,IgGFc-binding protein,9606
                <br>ISVAQGASK,A0A087WXI2,IgGFc-binding protein,9606
                <br><Sentinel>$</Sentinel> unipept pept2prot MDGTEYIIVK ISVAQGASK > output.txt
                <br><Sentinel>$</Sentinel> cat output.txt
                <br>peptide,uniprot_id,protein_name,taxon_id
                <br>MDGTEYIIVK,C6JD41,10 kDa chaperonin,457412
                <br>ISVAQGASK,Q9Y6R7,IgGFc-binding protein,9606
                <br>ISVAQGASK,A0A087WXI2,IgGFc-binding protein,9606
            </Boxed>
        </HeaderBodyCard>

        <HeaderBodyCard id="fasta" title="Fasta support" class="mt-5">
            <p>
                The <Code>unipept pept2prot</Code> command supports input (from any source) in a fasta-like format (for example generated by the 
                <RLink to="/clidocs/prot2pept" router>prot2pept command</RLink>). This format consists of a fasta header (a line starting with a >), followed by 
                one or more lines containing one peptide each. When this format is detected, the output will automatically include an extra information field 
                containing the corresponding fasta header. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> cat input.txt
                <br>> header 1
                <br>ISVAQGASK
                <br>MDGTEYIIVK
                <br>> header 2
                <br>ISVAQGASK
                <br><Sentinel>$</Sentinel> unipept pept2prot --input input.txt
                <br>fasta_header,peptide,uniprot_id,protein_name,taxon_id
                <br>> header 1,MDGTEYIIVK,C6JD41,10 kDa chaperonin,457412
                <br>> header 1,ISVAQGASK,Q9Y6R7,IgGFc-binding protein,9606
                <br>> header 1,ISVAQGASK,A0A087WXI2,IgGFc-binding protein,9606
                <br>> header 2,MDGTEYIIVK,C6JD41,10 kDa chaperonin,457412
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
                <Sentinel>$</Sentinel> unipept pept2prot FEALLGDGSQYGLHLQYK
                <br>peptide,uniprot_id,protein_name,taxon_id
                <br>FEALLGDGSQYGLHLQYK,D1PLT2,Glucose-1-phosphate thymidylyltransferase,411471
                <br>FEALLGDGSQYGLHLQYK,K1TWG3,"Glucose-1-phosphate thymidylyltransferase, long form",408170
                <br><Sentinel>$</Sentinel> unipept pept2prot <b>--equate</b> FEALLGDGSQYGLHLQYK
                <br>peptide,uniprot_id,protein_name,taxon_id
                <br>FEALLGDGSQYGLHLQYK,D4K7A9,Glucose-1-phosphate thymidylyltransferase,657322
                <br>FEALLGDGSQYGLHLQYK,D4K112,Glucose-1-phosphate thymidylyltransferase,718252
                <br>FEALLGDGSQYGLHLQYK,D1PLT2,Glucose-1-phosphate thymidylyltransferase,411471
                <br>FEALLGDGSQYGLHLQYK,A8SH27,Glucose-1-phosphate thymidylyltransferase,411485
                <br>FEALLGDGSQYGLHLQYK,K1TWG3,"Glucose-1-phosphate thymidylyltransferase, long form",408170
                <br>FEALLGDGSQYGLHLQYK,E2ZLF5,Glucose-1-phosphate thymidylyltransferase,748224
                <br>FEALLGDGSQYGLHLQYK,R6Q2J6,Glucose-1-phosphate thymidylyltransferase,1262898
                <br>FEALLGDGSQYGLHLQYK,C7HAW8,Glucose-1-phosphate thymidylyltransferase,411483
            </Boxed>

            <h2>--input / -i <span class="text-caption grey--text text--darken-2">Specify an input file</span></h2>

            <p>
                All Unipept <Initialism>CLI</Initialism> commands can process input from 3 sources: command line arguments, a file, or <i>standard input</i>. The optional <Code>--input</Code> 
                option allows you to specify an input file. The file should contain a single peptide per line. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> cat input.txt
                <br>ISVAQGASK
                <br>OMGWTFBBQ
                <br>MDGTEYIIVK
                <br><Sentinel>$</Sentinel> unipept pept2prot <b>--input</b> input.txt
                <br>peptide,uniprot_id,protein_name,taxon_id
                <br>ISVAQGASK,Q9Y6R7,IgGFc-binding protein,9606
                <br>ISVAQGASK,A0A087WXI2,IgGFc-binding protein,9606
                <br>MDGTEYIIVK,C6JD41,10 kDa chaperonin,457412
            </Boxed>

            <h2>--output / -o <span class="text-caption grey--text text--darken-2">Specify an output file</span></h2>

            <p>
                By default, the unipept commands write their output to <i>standard output</i>. Using the optional <Code>--output</Code> option allows you to 
                specify a file to write the output to. If the file already exists, the output will be appended; if it doesn't, a new file will be created. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept pept2prot <b>--output</b> output.txt ISVAQGASK MDGTEYIIVK
                <br><Sentinel>$</Sentinel> cat output.txt
                <br>peptide,uniprot_id,protein_name,taxon_id
                <br>ISVAQGASK,Q9Y6R7,IgGFc-binding protein,9606
                <br>ISVAQGASK,A0A087WXI2,IgGFc-binding protein,9606
                <br>MDGTEYIIVK,C6JD41,10 kDa chaperonin,457412
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
                <Sentinel>$</Sentinel> unipept pept2prot <b>--select</b> peptide,uniprot_id MDGTEYIIVK
                <br>peptide,uniprot_id
                <br>MDGTEYIIVK,C6JD41
                <br><Sentinel>$</Sentinel> unipept pept2prot <b>--select</b> peptide <b>--select</b> *id MDGTEYIIVK
                <br>peptide,uniprot_id,taxon_id
                <br>MDGTEYIIVK,C6JD41,457412
            </Boxed>

            <h2>--format / -f <span class="text-caption grey--text text--darken-2">Specify the output format</span></h2>

            <p>
                By default, the Unipept <Initialism>CLI</Initialism> commands return their output in csv format. The <Code>--format</Code> option allows you to select another format. 
                Supported formats are csv, json, and xml. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept pept2prot <b>--format</b> json ISVAQGASK MDGTEYIIVK
                <br>[{"peptide":"ISVAQGASK","uniprot_id":"Q9Y6R7","protein_name":"IgGFc-binding protein","taxon_id":9606},{"peptide":"ISVAQGASK","uniprot_id":"A0A087WXI2","protein_name":"IgGFc-binding protein","taxon_id":9606},{"peptide":"MDGTEYIIVK","uniprot_id":"C6JD41","protein_name":"10 kDa chaperonin","taxon_id":457412}]
                <br><Sentinel>$</Sentinel> unipept pept2prot <b>--format</b> xml ISVAQGASK MDGTEYIIVK
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
                <Sentinel>$</Sentinel> unipept pept2prot <b>--all</b> --select peptide,uniprot_id,*name,go_references ISVAQGASK
                <br>peptide,uniprot_id,protein_name,taxon_name,go_references
                <br>ISVAQGASK,Q9Y6R7,IgGFc-binding protein,Homo sapiens,GO:0070062
                <br>ISVAQGASK,A0A087WXI2,IgGFc-binding protein,Homo sapiens,
            </Boxed>

            <h2>--help / -h <span class="text-caption grey--text text--darken-2">Display help</span></h2>

            <p>
                This flag displays the help. 
            </p>
        </HeaderBodyCard>

        <HeaderBodyCard title="Meganize" class="mt-5">
            <p>
                The <Code>unipept pept2prot</Code> command can be used in combination with Megan, for example to perform a functional analysis of the sample. 
                This requires using the <Code>--meganize</Code> option that was added in version 1.2.0. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept pept2prot <b>--meganize</b> MDGTEYIIVK ISVAQGASK
                <br>MDGTEYIIVK	ref|WP_008705701.1|	100	10	0	0	0	10	0	10	1e-100	100
                <br>ISVAQGASK	ref|NP_003881.2 XP_011547112.1 XP_011547113.1|	100	10	0	0	0	10	0	10	1e-100	100
            </Boxed>

            <p>
                The generated output can be saved to a file and imported into Megan using the following settings: 
                <ul>
                    <li>Import from blast</li>
                    <li>Select the file with the <Code>unipept pept2prot --meganize</Code> output</li>
                    <li>Set format to blastTab and mode to blastp</li>
                    <li>Remove the fasta mapping that was automatically added</li>
                    <li>Enable the tabs you want (taxonomy/interpro2go/...), but always select the "use accession" option for this</li>
                    <li>Go back to the first tab and make sure it says blasttab and blastp, because sometimes it changes back when you switch tabs</li>
                    <li>Click apply</li>
                </ul>
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

const htmlFragment = "<results><result><peptide>ISVAQGASK</peptide><uniprot_id>Q9Y6R7</uniprot_id><protein_name>IgGFc-binding protein</protein_name><taxon_id>9606</taxon_id></result><result><peptide>ISVAQGASK</peptide><uniprot_id>A0A087WXI2</uniprot_id><protein_name>IgGFc-binding protein</protein_name><taxon_id>9606</taxon_id></result><result><peptide>MDGTEYIIVK</peptide><uniprot_id>C6JD41</uniprot_id><protein_name>10 kDa chaperonin</protein_name><taxon_id>457412</taxon_id></result></results>"
</script>
