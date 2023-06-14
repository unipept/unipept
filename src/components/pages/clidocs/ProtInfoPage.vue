<template>
    <v-container>
        <h1 class="font-weight-light">
            unipept protinfo
        </h1>
        <h3 class="font-weight-light">Returns all information associated with a given UniProt id.</h3>
        
        <v-divider class="my-2" />

        <p>
            The <Code>unipept protinfo</Code> command takes one or more UniProt ids as input and returns both taxonomic and functional information for each 
            of them as output. This information is collected from the UniProt entries itself. All this information is fetched by doing 
            <RLink to="/apidocs/protinfo" router><Initialism>API</Initialism>-requests</RLink> to the Unipept server.
        </p>

        <HeaderBodyCard id="input" title="Input">
            <p>
                The <Code>unipept protinfo</Code> command expects UniProt ids as input. The source of this input can be command line arguments, a file, or 
                <i>standard input</i>. If input is supplied using multiple sources at the same time, the order of priority as described above is used.  
            </p>

            <h3>Command line arguments</h3>
            <p>
                If input is supplied using command line arguments, the accession numbers must be separated by spaces. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept protinfo P00909 P07756
                <br>protein,taxon_id,taxon_name,taxon_rank,ec_number,go_term,ipr_code
                <br>P00909,83333,Escherichia coli K-12,strain,4.1.1.48 5.3.1.24,GO:0004425 GO:0004640 GO:0000162,IPR013785 IPR045186 IPR013798 IPR001468 IPR001240 IPR011060
                <br>P07756,10116,Rattus norvegicus,species,6.3.4.16,GO:0005737 GO:0005743 GO:0042645 GO:0005739 GO:0005730 GO:0032991 GO:0005524 GO:0005509 GO:0004087 GO:0004088 GO:0004175 GO:0016595 GO:0046872 GO:0072341 GO:0005543 GO:0044877 GO:0036094 GO:0006207 GO:0070409 GO:0071242 GO:0071320 GO:0044344 GO:0071377 GO:0071400 GO:0006541 GO:0070365 GO:0050667 GO:0001889 GO:0007494 GO:0055081 GO:0046209 GO:0014075 GO:0043200 GO:0051591 GO:0071548 GO:0032094 GO:0033762 GO:0051384 GO:0060416 GO:0032496 GO:0034201 GO:0042594 GO:0048545 GO:0009636 GO:0009410 GO:0010043 GO:0051238 GO:0019433 GO:0000050 GO:0042311,IPR011761 IPR013815 IPR006275 IPR005480 IPR036897 IPR006274 IPR002474 IPR036480 IPR005479 IPR005483 IPR029062 IPR035686 IPR017926 IPR011607 IPR036914 IPR016185
            </Boxed>

            <h3>File input</h3>
            <p>
                Use the <RLink to="#options" router>--input parameter</RLink> to specify a file to use as input. If input is supplied using a file, a single 
                UniProt id per line is expected.  
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> cat input.txt
                <br>P00909
                <br>P07756
                <br><Sentinel>$</Sentinel> unipept protinfo --input input.txt
                <br>protein,taxon_id,taxon_name,taxon_rank,ec_number,go_term,ipr_code
                <br>P00909,83333,Escherichia coli K-12,strain,4.1.1.48 5.3.1.24,GO:0004425 GO:0004640 GO:0000162,IPR013785 IPR045186 IPR013798 IPR001468 IPR001240 IPR011060
                <br>P07756,10116,Rattus norvegicus,species,6.3.4.16,GO:0005737 GO:0005743 GO:0042645 GO:0005739 GO:0005730 GO:0032991 GO:0005524 GO:0005509 GO:0004087 GO:0004088 GO:0004175 GO:0016595 GO:0046872 GO:0072341 GO:0005543 GO:0044877 GO:0036094 GO:0006207 GO:0070409 GO:0071242 GO:0071320 GO:0044344 GO:0071377 GO:0071400 GO:0006541 GO:0070365 GO:0050667 GO:0001889 GO:0007494 GO:0055081 GO:0046209 GO:0014075 GO:0043200 GO:0051591 GO:0071548 GO:0032094 GO:0033762 GO:0051384 GO:0060416 GO:0032496 GO:0034201 GO:0042594 GO:0048545 GO:0009636 GO:0009410 GO:0010043 GO:0051238 GO:0019433 GO:0000050 GO:0042311,IPR011761 IPR013815 IPR006275 IPR005480 IPR036897 IPR006274 IPR002474 IPR036480 IPR005479 IPR005483 IPR029062 IPR035686 IPR017926 IPR011607 IPR036914 IPR016185
            </Boxed>

            <h3>Standard input</h3>
            <p>
                If the command is run without arguments and no file is specified, <Code>unipept protinfo</Code> will read its input from <i>standard input</i>. 
                When <i>standard input</i> is used, a single UniProt id per line is expected. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> cat input.txt
                <br>P00909
                <br>P07756
                <br><Sentinel>$</Sentinel> cat input | unipept protinfo
                <br>protein,taxon_id,taxon_name,taxon_rank,ec_number,go_term,ipr_code
                <br>P00909,83333,Escherichia coli K-12,strain,4.1.1.48 5.3.1.24,GO:0004425 GO:0004640 GO:0000162,IPR013785 IPR045186 IPR013798 IPR001468 IPR001240 IPR011060
                <br>P07756,10116,Rattus norvegicus,species,6.3.4.16,GO:0005737 GO:0005743 GO:0042645 GO:0005739 GO:0005730 GO:0032991 GO:0005524 GO:0005509 GO:0004087 GO:0004088 GO:0004175 GO:0016595 GO:0046872 GO:0072341 GO:0005543 GO:0044877 GO:0036094 GO:0006207 GO:0070409 GO:0071242 GO:0071320 GO:0044344 GO:0071377 GO:0071400 GO:0006541 GO:0070365 GO:0050667 GO:0001889 GO:0007494 GO:0055081 GO:0046209 GO:0014075 GO:0043200 GO:0051591 GO:0071548 GO:0032094 GO:0033762 GO:0051384 GO:0060416 GO:0032496 GO:0034201 GO:0042594 GO:0048545 GO:0009636 GO:0009410 GO:0010043 GO:0051238 GO:0019433 GO:0000050 GO:0042311,IPR011761 IPR013815 IPR006275 IPR005480 IPR036897 IPR006274 IPR002474 IPR036480 IPR005479 IPR005483 IPR029062 IPR035686 IPR017926 IPR011607 IPR036914 IPR016185
            </Boxed>
        </HeaderBodyCard>

        <HeaderBodyCard id="output" title="Output" class="mt-5">
            <p>
                The <Code>unipept protinfo</Code> command outputs both taxonomic and functional information for each of the input UniProt ids that were 
                found in the Unipept database. Consult the <RLink to="/apidocs/protinfo" router><Initialism>API</Initialism> documentation</RLink> for a detailed list of 
                output fields. A selection of output fields can be specified with the <RLink to="#options" router>--select parameter</RLink>. By default, output 
                is generated in csv format. By using the <RLink to="#options" router>--format parameter</RLink>, the format can be changed into json or xml. The 
                output can be written to a file or to <i>standard output</i>.
            </p>

            <h3>File output</h3>
            <p>
                Use the <RLink to="#options" router>--output parameter</RLink> to specify an output file. If the file aready exists, the output will be 
                appended to the end of the file. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept protinfo --output output.txt P00909 P07756
                <br><Sentinel>$</Sentinel> cat output.txt
                <br>protein,taxon_id,taxon_name,taxon_rank,ec_number,go_term,ipr_code
                <br>P00909,83333,Escherichia coli K-12,strain,4.1.1.48 5.3.1.24,GO:0004425 GO:0004640 GO:0000162,IPR013785 IPR045186 IPR013798 IPR001468 IPR001240 IPR011060
                <br>P07756,10116,Rattus norvegicus,species,6.3.4.16,GO:0005737 GO:0005743 GO:0042645 GO:0005739 GO:0005730 GO:0032991 GO:0005524 GO:0005509 GO:0004087 GO:0004088 GO:0004175 GO:0016595 GO:0046872 GO:0072341 GO:0005543 GO:0044877 GO:0036094 GO:0006207 GO:0070409 GO:0071242 GO:0071320 GO:0044344 GO:0071377 GO:0071400 GO:0006541 GO:0070365 GO:0050667 GO:0001889 GO:0007494 GO:0055081 GO:0046209 GO:0014075 GO:0043200 GO:0051591 GO:0071548 GO:0032094 GO:0033762 GO:0051384 GO:0060416 GO:0032496 GO:0034201 GO:0042594 GO:0048545 GO:0009636 GO:0009410 GO:0010043 GO:0051238 GO:0019433 GO:0000050 GO:0042311,IPR011761 IPR013815 IPR006275 IPR005480 IPR036897 IPR006274 IPR002474 IPR036480 IPR005479 IPR005483 IPR029062 IPR035686 IPR017926 IPR011607 IPR036914 IPR016185
            </Boxed>

            <h3>Standard output</h3>
            <p>
                If no output file is specified, <Code>unipept protinfo</Code> will write its output to <i>standard output</i>.
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept protinfo P00909 P07756
                <br>protein,taxon_id,taxon_name,taxon_rank,ec_number,go_term,ipr_code
                <br>P00909,83333,Escherichia coli K-12,strain,4.1.1.48 5.3.1.24,GO:0004425 GO:0004640 GO:0000162,IPR013785 IPR045186 IPR013798 IPR001468 IPR001240 IPR011060
                <br>P07756,10116,Rattus norvegicus,species,6.3.4.16,GO:0005737 GO:0005743 GO:0042645 GO:0005739 GO:0005730 GO:0032991 GO:0005524 GO:0005509 GO:0004087 GO:0004088 GO:0004175 GO:0016595 GO:0046872 GO:0072341 GO:0005543 GO:0044877 GO:0036094 GO:0006207 GO:0070409 GO:0071242 GO:0071320 GO:0044344 GO:0071377 GO:0071400 GO:0006541 GO:0070365 GO:0050667 GO:0001889 GO:0007494 GO:0055081 GO:0046209 GO:0014075 GO:0043200 GO:0051591 GO:0071548 GO:0032094 GO:0033762 GO:0051384 GO:0060416 GO:0032496 GO:0034201 GO:0042594 GO:0048545 GO:0009636 GO:0009410 GO:0010043 GO:0051238 GO:0019433 GO:0000050 GO:0042311,IPR011761 IPR013815 IPR006275 IPR005480 IPR036897 IPR006274 IPR002474 IPR036480 IPR005479 IPR005483 IPR029062 IPR035686 IPR017926 IPR011607 IPR036914 IPR016185
                <br><Sentinel>$</Sentinel> unipept protinfo P00909 P07756 > output.txt
                <br><Sentinel>$</Sentinel> cat output.txt
                <br>protein,taxon_id,taxon_name,taxon_rank,ec_number,go_term,ipr_code
                <br>P00909,83333,Escherichia coli K-12,strain,4.1.1.48 5.3.1.24,GO:0004425 GO:0004640 GO:0000162,IPR013785 IPR045186 IPR013798 IPR001468 IPR001240 IPR011060
                <br>P07756,10116,Rattus norvegicus,species,6.3.4.16,GO:0005737 GO:0005743 GO:0042645 GO:0005739 GO:0005730 GO:0032991 GO:0005524 GO:0005509 GO:0004087 GO:0004088 GO:0004175 GO:0016595 GO:0046872 GO:0072341 GO:0005543 GO:0044877 GO:0036094 GO:0006207 GO:0070409 GO:0071242 GO:0071320 GO:0044344 GO:0071377 GO:0071400 GO:0006541 GO:0070365 GO:0050667 GO:0001889 GO:0007494 GO:0055081 GO:0046209 GO:0014075 GO:0043200 GO:0051591 GO:0071548 GO:0032094 GO:0033762 GO:0051384 GO:0060416 GO:0032496 GO:0034201 GO:0042594 GO:0048545 GO:0009636 GO:0009410 GO:0010043 GO:0051238 GO:0019433 GO:0000050 GO:0042311,IPR011761 IPR013815 IPR006275 IPR005480 IPR036897 IPR006274 IPR002474 IPR036480 IPR005479 IPR005483 IPR029062 IPR035686 IPR017926 IPR011607 IPR036914 IPR016185
            </Boxed>
        </HeaderBodyCard>

        <HeaderBodyCard id="options" title="Command-line options" class="mt-5">
            <h2>--input / -i <span class="text-caption grey--text text--darken-2">Specify an input file</span></h2>

            <p>
                All Unipept <Initialism>CLI</Initialism> commands can process input from 3 sources: command line arguments, a file, or <i>standard input</i>. The optional <Code>--input</Code> 
                option allows you to specify an input file. The file should contain a single UniProt id per line. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> cat input.txt
                <br>P00909
                <br>P07756
                <br><Sentinel>$</Sentinel> unipept protinfo <b>--input</b> input.txt
                <br>protein,taxon_id,taxon_name,taxon_rank,ec_number,go_term,ipr_code
                <br>P00909,83333,Escherichia coli K-12,strain,4.1.1.48 5.3.1.24,GO:0004425 GO:0004640 GO:0000162,IPR013785 IPR045186 IPR013798 IPR001468 IPR001240 IPR011060
                <br>P07756,10116,Rattus norvegicus,species,6.3.4.16,GO:0005737 GO:0005743 GO:0042645 GO:0005739 GO:0005730 GO:0032991 GO:0005524 GO:0005509 GO:0004087 GO:0004088 GO:0004175 GO:0016595 GO:0046872 GO:0072341 GO:0005543 GO:0044877 GO:0036094 GO:0006207 GO:0070409 GO:0071242 GO:0071320 GO:0044344 GO:0071377 GO:0071400 GO:0006541 GO:0070365 GO:0050667 GO:0001889 GO:0007494 GO:0055081 GO:0046209 GO:0014075 GO:0043200 GO:0051591 GO:0071548 GO:0032094 GO:0033762 GO:0051384 GO:0060416 GO:0032496 GO:0034201 GO:0042594 GO:0048545 GO:0009636 GO:0009410 GO:0010043 GO:0051238 GO:0019433 GO:0000050 GO:0042311,IPR011761 IPR013815 IPR006275 IPR005480 IPR036897 IPR006274 IPR002474 IPR036480 IPR005479 IPR005483 IPR029062 IPR035686 IPR017926 IPR011607 IPR036914 IPR016185
            </Boxed>

            <h2>--output / -o <span class="text-caption grey--text text--darken-2">Specify an output file</span></h2>

            <p>
                By default, the unipept commands write their output to <i>standard output</i>. Using the optional <Code>--output</Code> option allows you to 
                specify a file to write the output to. If the file already exists, the output will be appended; if it doesn't, a new file will be created. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept protinfo <b>--output</b> output.txt P00909
                <br><Sentinel>$</Sentinel> cat output.txt
                <br>protein,taxon_id,taxon_name,taxon_rank,ec_number,go_term,ipr_code
                <br>P00909,83333,Escherichia coli K-12,strain,4.1.1.48 5.3.1.24,GO:0004425 GO:0004640 GO:0000162,IPR013785 IPR045186 IPR013798 IPR001468 IPR001240 IPR011060
            </Boxed>

            <h2>--select / -s <span class="text-caption grey--text text--darken-2">Specify the output fields</span></h2>

            <p>
                By default, the Unipept <Initialism>CLI</Initialism> commands output all information fields received from the Unipept server. The <Code>--select</Code> option allows you 
                to control which fields are returned. A list of fields can be specified by a comma-separated list, or by using multiple <Code>--select</Code> 
                options. A <b>*</b> can be used as a wildcard for field names. For example, <Code>--select protein,taxon*</Code> will return the protein field and all 
                fields starting with taxon. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept protinfo <b>--select</b> protein,ec_number P00909
                <br>protein,ec_number
                <br>P00909,4.1.1.48 5.3.1.24
            </Boxed>

            <h2>--format / -f <span class="text-caption grey--text text--darken-2">Specify the output format</span></h2>

            <p>
                By default, the Unipept <Initialism>CLI</Initialism> commands return their output in csv format. The <Code>--format</Code> option allows you to select another format. 
                Supported formats are csv, json, and xml. 
            </p>

            <h4>Example</h4>
            <Boxed>
                <Sentinel>$</Sentinel> unipept protinfo <b>--format</b> json P00909 P07756
                <br>[{"protein":"P00909","ec":[{"ec_number":"4.1.1.48"},{"ec_number":"5.3.1.24"}],"go":[{"go_term":"GO:0004425"},{"go_term":"GO:0004640"},{"go_term":"GO:0000162"}],"ipr":[{"code":"IPR013785"},{"code":"IPR045186"},{"code":"IPR013798"},{"code":"IPR001468"},{"code":"IPR001240"},{"code":"IPR011060"}],"taxon_id":83333,"taxon_name":"Escherichia coli K-12","taxon_rank":"strain"},{"protein":"P07756","ec":[{"ec_number":"6.3.4.16"}],"go":[{"go_term":"GO:0005737"},{"go_term":"GO:0005743"},{"go_term":"GO:0042645"},{"go_term":"GO:0005739"},{"go_term":"GO:0005730"},{"go_term":"GO:0032991"},{"go_term":"GO:0005524"},{"go_term":"GO:0005509"},{"go_term":"GO:0004087"},{"go_term":"GO:0004088"},{"go_term":"GO:0004175"},{"go_term":"GO:0016595"},{"go_term":"GO:0046872"},{"go_term":"GO:0072341"},{"go_term":"GO:0005543"},{"go_term":"GO:0044877"},{"go_term":"GO:0036094"},{"go_term":"GO:0006207"},{"go_term":"GO:0070409"},{"go_term":"GO:0071242"},{"go_term":"GO:0071320"},{"go_term":"GO:0044344"},{"go_term":"GO:0071377"},{"go_term":"GO:0071400"},{"go_term":"GO:0006541"},{"go_term":"GO:0070365"},{"go_term":"GO:0050667"},{"go_term":"GO:0001889"},{"go_term":"GO:0007494"},{"go_term":"GO:0055081"},{"go_term":"GO:0046209"},{"go_term":"GO:0014075"},{"go_term":"GO:0043200"},{"go_term":"GO:0051591"},{"go_term":"GO:0071548"},{"go_term":"GO:0032094"},{"go_term":"GO:0033762"},{"go_term":"GO:0051384"},{"go_term":"GO:0060416"},{"go_term":"GO:0032496"},{"go_term":"GO:0034201"},{"go_term":"GO:0042594"},{"go_term":"GO:0048545"},{"go_term":"GO:0009636"},{"go_term":"GO:0009410"},{"go_term":"GO:0010043"},{"go_term":"GO:0051238"},{"go_term":"GO:0019433"},{"go_term":"GO:0000050"},{"go_term":"GO:0042311"}],"ipr":[{"code":"IPR011761"},{"code":"IPR013815"},{"code":"IPR006275"},{"code":"IPR005480"},{"code":"IPR036897"},{"code":"IPR006274"},{"code":"IPR002474"},{"code":"IPR036480"},{"code":"IPR005479"},{"code":"IPR005483"},{"code":"IPR029062"},{"code":"IPR035686"},{"code":"IPR017926"},{"code":"IPR011607"},{"code":"IPR036914"},{"code":"IPR016185"}],"taxon_id":10116,"taxon_name":"Rattus norvegicus","taxon_rank":"species"}]
                <br><Sentinel>$</Sentinel> unipept protinfo <b>--format</b> xml P00909 P07756
                <br>{{ htmlFragment }}
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
import Initialism from '@/components/highlights/Initialism.vue';

const htmlFragment = "<results><result><protein>P00909</protein><ec><item><ec_number>4.1.1.48</ec_number></item><item><ec_number>5.3.1.24</ec_number></item></ec><go><item><go_term>GO:0004425</go_term></item><item><go_term>GO:0004640</go_term></item><item><go_term>GO:0000162</go_term></item></go><ipr><item><code>IPR013785</code></item><item><code>IPR045186</code></item><item><code>IPR013798</code></item><item><code>IPR001468</code></item><item><code>IPR001240</code></item><item><code>IPR011060</code></item></ipr><taxon_id>83333</taxon_id><taxon_name>Escherichia coli K-12</taxon_name><taxon_rank>strain</taxon_rank></result><result><protein>P07756</protein><ec><item><ec_number>6.3.4.16</ec_number></item></ec><go><item><go_term>GO:0005737</go_term></item><item><go_term>GO:0005743</go_term></item><item><go_term>GO:0042645</go_term></item><item><go_term>GO:0005739</go_term></item><item><go_term>GO:0005730</go_term></item><item><go_term>GO:0032991</go_term></item><item><go_term>GO:0005524</go_term></item><item><go_term>GO:0005509</go_term></item><item><go_term>GO:0004087</go_term></item><item><go_term>GO:0004088</go_term></item><item><go_term>GO:0004175</go_term></item><item><go_term>GO:0016595</go_term></item><item><go_term>GO:0046872</go_term></item><item><go_term>GO:0072341</go_term></item><item><go_term>GO:0005543</go_term></item><item><go_term>GO:0044877</go_term></item><item><go_term>GO:0036094</go_term></item><item><go_term>GO:0006207</go_term></item><item><go_term>GO:0070409</go_term></item><item><go_term>GO:0071242</go_term></item><item><go_term>GO:0071320</go_term></item><item><go_term>GO:0044344</go_term></item><item><go_term>GO:0071377</go_term></item><item><go_term>GO:0071400</go_term></item><item><go_term>GO:0006541</go_term></item><item><go_term>GO:0070365</go_term></item><item><go_term>GO:0050667</go_term></item><item><go_term>GO:0001889</go_term></item><item><go_term>GO:0007494</go_term></item><item><go_term>GO:0055081</go_term></item><item><go_term>GO:0046209</go_term></item><item><go_term>GO:0014075</go_term></item><item><go_term>GO:0043200</go_term></item><item><go_term>GO:0051591</go_term></item><item><go_term>GO:0071548</go_term></item><item><go_term>GO:0032094</go_term></item><item><go_term>GO:0033762</go_term></item><item><go_term>GO:0051384</go_term></item><item><go_term>GO:0060416</go_term></item><item><go_term>GO:0032496</go_term></item><item><go_term>GO:0034201</go_term></item><item><go_term>GO:0042594</go_term></item><item><go_term>GO:0048545</go_term></item><item><go_term>GO:0009636</go_term></item><item><go_term>GO:0009410</go_term></item><item><go_term>GO:0010043</go_term></item><item><go_term>GO:0051238</go_term></item><item><go_term>GO:0019433</go_term></item><item><go_term>GO:0000050</go_term></item><item><go_term>GO:0042311</go_term></item></go><ipr><item><code>IPR011761</code></item><item><code>IPR013815</code></item><item><code>IPR006275</code></item><item><code>IPR005480</code></item><item><code>IPR036897</code></item><item><code>IPR006274</code></item><item><code>IPR002474</code></item><item><code>IPR036480</code></item><item><code>IPR005479</code></item><item><code>IPR005483</code></item><item><code>IPR029062</code></item><item><code>IPR035686</code></item><item><code>IPR017926</code></item><item><code>IPR011607</code></item><item><code>IPR036914</code></item><item><code>IPR016185</code></item></ipr><taxon_id>10116</taxon_id><taxon_name>Rattus norvegicus</taxon_name><taxon_rank>species</taxon_rank></result></results>"
</script>
