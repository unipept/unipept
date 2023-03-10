<template>
    <v-container>
        <h1 class="font-weight-light">
            Case study: Taxonomic analysis of a tryptic peptide
        </h1>
        <h3 class="font-weight-light">
            This case study describes how the Unipept command line tools can be used for the taxonomic analysis of a single tryptic peptide.
        </h3>

        <HeaderBodyCard class="mt-5" title="Introduction">
            <p>
                Over the period of evolution, we human beings have co-evolved an intricate symbiosis with microorganisms that inhabit our gastrointestinal tract. 
                These microorganisms are responsible for maintaining a healthy gut environment, they aid in digestion of our food and our immune system and they 
                guard us against invading pathogens. In addition, some diseases, such as <RLink to="https://en.wikipedia.org/wiki/Crohn%27s_disease">Crohn's disease</RLink>, 
                are somehow correlated to the composition of the gut microbiota. Although we are dependent on microorganisms for normal gut functioning, much 
                remains to be learned about microbial processes in the gut that are carried out by this huge community of largely unexplored microbial cells that 
                can amount to numbers as great as 10<sup>11</sup> per gram of faeces.
            </p>

            <p>
                Recently, we have been aided by the development of molecular tools that enable us to determine the composition of microorganisms inhabiting the 
                intestine without having to cultivate them. In addition to the increasing amounts of information about the identities of microorganisms in the gut 
                from our own studies and others, there have been a limited number of studies of the functional genes in the entire gut microbial metagenome, using 
                sequencing based metagenomics approaches.
            </p>

            <p>
                A next step is to determine what genes are actually expressed and the function of the gut microbiota in different states of health and disease. 
                <i>Shotgun proteomics</i> (<RLink to="#fig1" router>Figure 1</RLink>) is one approach that can be used to determine what proteins were expressed in 
                an environmental sample. As of today, this technique is still in its infancy, but given the rapid technological developments and based on the 
                results of the first analyses, we can nevertheless consider this to be a very promising technique.
            </p>

            <ImageCaptionCard id="fig1" class="mb-5" :image="require('@/assets/documentation/cli/casestudy-mpa-shotgun-mpa.jpg')">
                <b>Figure 1</b> Shotgun metaproteomics approach used to identify microbial proteins in human faecal samples. Taken from 
                {{ references.verberkmoes.short }}.
            </ImageCaptionCard>
        </HeaderBodyCard>

        <HeaderBodyCard class="mt-5" title="Getting started">
            <p>
                Before the Unipept command line interface (<Initialism>CLI</Initialism>) can be used, it first needs to be <RLink to="/clidocs" router>installed locally</RLink>. 
                Since the commands of the <Initialism>CLI</Initialism> are implemented in Ruby, the <RLink to="https://www.ruby-lang.org/en/downloads/">Ruby environment</RLink> must 
                be installed first (at least version 2.3). The Unipept <Initialism>CLI</Initialism> can then be installed using the <Code>gem</Code> command, which 
                is the RubyGems package manager for the Ruby programming language.
            </p>

            <Boxed>
                <Sentinel>$</Sentinel> gem install unipept
                <br>Successfully installed unipept-2.2.1
                <br>1 gem installed
                <br>Installing ri documentation for unipept-2.2.1...
                <br>Installing RDoc documentation for unipept-2.2.1...
            </Boxed>

            <p>
                By default, the <Code>gem</Code> command installs the Unipept <Initialism>CLI</Initialism> for all users on the computer system. To make a personal 
                installation or in case you don't have the necessary permissions for the appropriate directories to make a system-wide installation, you can use the 
                option <Code>--user-install</Code> of the <Code>gem</Code> command.
            </p>

            <p>
                The Unipept <Initialism>CLI</Initialism> is a bundle of different commands that all come with detailed 
                <RLink to="/clidocs" router>online documentation</RLink>. Naturally, the most important command is <Code>unipept</Code>.
            </p>

            <Boxed>
<pre>
<Sentinel>$</Sentinel> unipept --help
NAME
unipept - Command line interface to Unipept web services.

USAGE
unipept subcommand [options]

DESCRIPTION
The unipept subcommands are command line wrappers around the Unipept web
services.

Subcommands that start with pept expect a list of tryptic peptides as
input. Subcommands that start with tax expect a list of NCBI Taxonomy
Identifiers as input. Input is passed

- as separate command line arguments
- in a text file that is passed as an argument to the -i option
- to standard input

The command will give priority to the first way the input is passed, in
the order as listed above. Text files and standard input should have one
tryptic peptide or one NCBI Taxonomy Identifier per line.

COMMANDS
config        Set configuration options.
help          show help
pept2lca      Fetch taxonomic lowest common ancestor of UniProt entries that match tryptic peptides.
pept2prot     Fetch UniProt entries that match tryptic peptides.
pept2taxa     Fetch taxa of UniProt entries that match tryptic peptides.
taxa2lca      Compute taxonomic lowest common ancestor for given list of taxa.
taxonomy      Fetch taxonomic information from Unipept Taxonomy.

OPTIONS
-f --format=&lt;value>         define the output format (available: json, csv, xml) (default: csv)
-h --help                   show help for this command
--host=&lt;value>              specify the server running the Unipept webservice
-i --input=&lt;value>          read input from file
-o --output=&lt;value>         write output to file
-q --quiet                  disable service messages
-v --version                displays the version
</pre>
            </Boxed>

            <p>
                As the <Code>unipept</Code> command makes calls to the Unipept <Initialism>API</Initialism> that is provided by an instance of the Unipept 
                application server (web services that communicate with an instance of the Unipept database), the location of the Unipept application server must 
                be <RLink to="/clidocs" router>configured</RLink>. By default, the public Unipept server (api.unipept.ugent.be) is used, but this can be changed by passing the <Initialism>URL</Initialism> 
                of the server as an argument to the option <Code>--host</Code>. To avoid that a custom server needs to be specified with each use of the 
                <Code>unipept</Code> command, a custom server can be set as default using the <Code>unipept config</Code> subcommand. A server set with the 
                <Code>--host</Code> option always overrides the default server.
            </p>

            <Boxed>
                <Sentinel>$</Sentinel> unipept <b>--host 'api.unipept.ugent.be'</b> pept2lca ENFVYIAK
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>ENFVYIAK,35493,Streptophyta,phylum
                <br><Sentinel>$</Sentinel> unipept <b>config host 'api.unipept.ugent.be'</b>
                <br><Sentinel>$</Sentinel> unipept pept2lca ENFVYIAK
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>ENFVYIAK,35493,Streptophyta,phylum
            </Boxed>
        </HeaderBodyCard>

        <HeaderBodyCard class="mt-5" title="Taxonomic analysis">
            <p>
                As a demonstration of the Unipept <Initialism>CLI</Initialism> we show how it can be used to get insight into the biodiversity within one of the 
                faecal samples from a gut microbiome study ({{ references.verberkmoes.short }}). The sample was taken from a female that is part of a healthy 
                monozygotic twin pair born in 1951 that was invited to take part in a larger double-blinded study. Details of this individual with respect to diet, 
                antibiotic usage, and so on are described by {{ references.dicksved.short }} (individual 6a in this study, sample 7 in the study of {{ references.verberkmoes.short }}). 
                The most important that we learn from the available information in the questionnaire that this individual has filled up, is that she had 
                gastroenteritis at the time the sample was taken and that her twin sister (individual 6b in the study of {{ references.dicksved.short }}, 
                sample 7 in the study of {{ references.verberkmoes.short }}) had taken non-steroidal anti-inflammatory drugs during the past 12 months before the 
                time of sampling. The data can be downloaded from the <RLink to="https://www.nature.com/articles/ismej2008108#bib7">website of the study</RLink> 
                and is also available as a demo data set on the Unipept website.
            </p>

            <p>
                Say that we stored the list of tryptic peptides that were extracted from sample 7 in the study of {{ references.verberkmoes.short }} in the text 
                file <RLink to="/sample7.dat" target="_blank">sample7.dat</RLink>. The file contains a list of all tryptic peptides, each on a separate line. The 
                following session shows that this file contains a list of 3983 tryptic peptides (2065 unique peptides) that could be identified in the faecal sample 
                using <i>shotgun metaproteomics</i>.
            </p>

            <Boxed>
                <Sentinel>$</Sentinel> head sample7.dat
                <br>SGIVLPGQAQEKPQQAEVVAVGPGGVVDGK
                <br>SGIVLPGQAQEKPQQAEVVAVGPGGVVDGK
                <br>SGIVLPGQAQEKPQQAEVVAVGPGGVVDGKEVK
                <br>MEVAVGDKVIYSK
                <br>MDGTEYIIVK
                <br>GLTAAIEAADAMTK
                <br>AAEVALVGTEK
                <br>IGSGLVTVMVR
                <br>IGSGLVTVMVR
                <br>AAVESGSAAASR
                <br><Sentinel>$</Sentinel> wc -l sample7.dat
                <br>3983 sample7.dat
                <br><Sentinel>$</Sentinel> sort -u sample7.dat | wc -l
                <br>2065
            </Boxed>

            <p>
                The first thing that strikes the eye is that a mass spectrometer might pick up multiple copies of the same tryptic peptide from an environmental 
                sample. Depending on the fact whether or not we can draw quantitative conclusion on the number of different identifications of a particular peptide 
                (apart from identification, the quantification of proteins in an environmental sample is an important research theme 
                ({{ references.seifert.short }}; {{ references.kolmeder.short }})), we might decide to deduplicate the peptides before they are analysed further 
                using the Unipept <Initialism>CLI</Initialism>. This decision has an impact on the analysis results, but deduplication also results in improved 
                performance since it avoids duplicate work.
            </p>

            <p>
                What might be less obvious at first sight, is that the peptides on lines 3 and 4 in the text file <RLink to="/sample7.dat" target="_blank">sample7.dat</RLink> 
                actually aren't tryptic peptides, but the composition of two tryptic peptides. This is a consequence of the fact that cleavage of proteins using 
                trypsin is not always perfect, leading to some proteins that aren't cleaved properly. Such composed tryptic peptides are called <i>missed cleavages</i>. 
                The index structure underpinning Unipept only indexes tryptic peptides that result from an <i>in silico</i> trypsin digest of the proteins in 
                UniProt, so that missed cleavages cannot be matched directly by Unipept.
            </p>

            <p>
                To cope with this problem, we can start to check if the peptides resulting from a <i>shotgun metaproteomics</i> experiment need to be cleaved 
                further before making taxonomic identifications using Unipept. Performing an <i>in silico</i> trypsin digest can be done using the <Code>prot2pept</Code> 
                command from the Unipept <Initialism>CLI</Initialism>. This command is executed purely <i>client side</i>, and thus is provided as a standalone command 
                and not as a subcommand of the <Code>unipept</Code> command.
            </p>

            <Boxed>
                <Sentinel>$</Sentinel> sed -ne '4{p;q}' sample7.dat
                <br>MEVAVGDKVIYSK
                <br><Sentinel>$</Sentinel> sed -ne '4{p;q}' sample7.dat | <b>prot2pept</b>
                <br>MEVAVGDK
                <br>VIYSK
            </Boxed>

            <p>
                Once a peptide is broken into multiple tryptic peptides, the lowest common ancestor can be computed for each tryptic peptide using the 
                <Code>unipept pept2lca</Code> command. Next to accepting tryptic peptides as arguments, the command can also read one ore more tryptic peptides 
                from standard input if no arguments were passed. Each tryptic peptide should be on a separate line when using standard input.
            </p>

            <Boxed>
                <Sentinel>$</Sentinel> unipept <b>pept2lca</b> -e SGIVLPGQAQEKPQQAEVVAVGPGGVVDGK MDGTEYIIVK
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>SGIVLPGQAQEKPQQAEVVAVGPGGVVDGK,1263,Ruminococcus,genus
                <br>MDGTEYIIVK,1263,Ruminococcus,genus
                <br><Sentinel>$</Sentinel> sed -ne '3{p;q}' sample7.dat
                <br>SGIVLPGQAQEKPQQAEVVAVGPGGVVDGKEVK
                <br><Sentinel>$</Sentinel> sed -ne '3{p;q}' sample7.dat | unipept pept2lca -e
                <br><Sentinel>$</Sentinel> sed -ne '3{p;q}' sample7.dat | prot2pept
                <br>SGIVLPGQAQEKPQQAEVVAVGPGGVVDGK
                <br>EVK
                <br><Sentinel>$</Sentinel> sed -ne '3{p;q}' sample7.dat | prot2pept | unipept pept2lca -e
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>SGIVLPGQAQEKPQQAEVVAVGPGGVVDGK,1263,Ruminococcus,genus
            </Boxed>

            <p>
                Unipept only indexes tryptic peptides extracted from UniProt sequences that have a length between 5 and 50 amino acids (boundaries included). 
                This choice was driven by the detection limits of most common mass spectrometers. As a result, an additional time saver is to search for 
                tryptic peptides that have less than 5 of more than 50 amino acids, because Unipept will never find protein matches for these peptides. The 
                <Code>peptfilter</Code> command from the Unipept <Initialism>CLI</Initialism> can be used to filter out peptides that are too short or too long prior to the 
                taxonomic identification step. By default, it filters out all peptides for which it is known in advance that Unipept will find no matches.
            </p>

            <Boxed>
                <Sentinel>$</Sentinel> sed -ne '3{p;q}' sample7.dat | prot2pept | <b>peptfilter</b> | unipept pept2lca -e
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>SGIVLPGQAQEKPQQAEVVAVGPGGVVDGK,1263,Ruminococcus,genus
            </Boxed>

            <p>
                All commands of the Unipept <Initialism>CLI</Initialism> follow the input/output paradigm of the Unix command line, so that they be chained together 
                seamlessly. This way, for example, we can determine the <Initialism>LCA</Initialism>s for the first six peptides of sample 7 by combining the 
                previous processing steps: split missed cleavages, filter out peptides that are too short or too long, equate leucine (residue CodeL) and isoleucine 
                (residue <Code>I</Code>), and deduplicate the tryptic peptides.
            </p>

            <Boxed>
                <Sentinel>$</Sentinel> head -n6 sample7.dat | prot2pept | peptfilter | tr I L | sort -u
                <br>GLTAALEAADAMTK
                <br>MDGTEYLLVK
                <br>MEVAVGDK
                <br>SGLVLPGQAQEKPQQAEVVAVGPGGVVDGK
                <br>VLYSK
                <br><Sentinel>$</Sentinel> head -n6 sample7.dat | prot2pept | peptfilter | tr I L | sort -u | unipept pept2lca -e
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>GLTAALEAADAMTK,186802,Clostridiales,order
                <br>MDGTEYLLVK,1263,Ruminococcus,genus
                <br>MEVAVGDK,1263,Ruminococcus,genus
                <br>SGLVLPGQAQEKPQQAEVVAVGPGGVVDGK,1263,Ruminococcus,genus
                <br>VLYSK,1,root,no rank
            </Boxed>
        </HeaderBodyCard>

        <HeaderBodyCard class="mt-5" title="Comparison with the Unipept web interface">
            <p>
                The biodiversity in sample 7 from the study of {{ references.verberkmoes.short }} can be easily computed and visualised using the 
                <i>Metagenomics Analysis</i> feature of the <RLink to="/" router>Unipept website</RLink>. All it takes is to paste the list of peptides that 
                were identified from an environmental sample in a text area, select the appropriate search options, and to click the Search button to launch the 
                identification process.
            </p>

            <p>
                In the session that is shown in <RLink to="#fig2" router>Figure 2</RLink>, we have indicated that no distinction should be made between leucine 
                (<Code>L</Code>) and isoleucine (<Code>I</Code>), that the peptides must be deduplicate prior to the actual biodiversity analysis, and that the 
                results must be exported in csv format (<i>comma separated values</i>). Breaking up the missed cleavages happens by default. In addition, the option 
                <i>Advanced missed cleavage handling</i> can be activated to indicate that the results should be aggregated as a post-processing step 
                (not selected in this example).
            </p>

            <ImageCaptionCard id="fig2" class="mb-5" :image="require('@/assets/documentation/cli/casestudy-mpa-request.png')">
                <b>Figure 2</b> Processing of sample 7 from the study of {{ references.verberkmoes.short }} using the Metaproteomics Analysis feature of the 
                <RLink to="/" router>Unipept website</RLink>. In this example session we indicate that no distinction should be made between leucine (<code>L</code>) 
                and isoleucine (<Code>I</Code>), that the peptides must be deduplicated, and that the results must be exported in csv format (<i>comma separated values</i>). 
                Breaking up the missed cleavages happens by default. In addition, the option <i>Advanced missed cleavage handling</i> can be activated to indicate 
                that the results should be aggregated as a post-processing step (not selected in this example).
            </ImageCaptionCard>

            <p>
                The same result can be obtained using the following combination of commands from the Unipept <Initialism>CLI</Initialism>. The timing gives an 
                impression of the performance of Unipept to compute the <Initialism>LCA</Initialism>s for all 2005 unique tryptic peptides extracted from sample 7. 
                It indicates that part of the processing is parallelised, and that the majority of the processing time is consumed by exchanging data between the 
                client and the Unipept server and the server-side processing of the data.
            </p>

            <Boxed>
                $ prot2pept &lt; sample7.dat | peptfilter | tr I L | sort -u | wc -l
2005
$ time prot2pept &lt; sample7.dat | peptfilter | tr I L | sort -u | unipept pept2lca -e > sample7.csv

real    0m0.329s
user    0m0.465s
sys     0m0.038s
$ head sample7.csv
peptide,taxon_id,taxon_name,taxon_rank
AAALNLVPNSTGAAK,2,Bacteria,superkingdom
AAALNTLAHSTGAAK,1678,Bifidobacterium,genus
AAALNTLPHSTGAAK,1678,Bifidobacterium,genus
AAAMSMLPTSTGAAK,2,Bacteria,superkingdom
AAANESFGYNEDELVSSDLVGMR,186802,Clostridiales,order
AAANYLDLPLYR,2,Bacteria,superkingdom
AAAVNLVPNSTGAAK,2,Bacteria,superkingdom
AADAAAALGEGLQAFCLPGSVADHR,186802,Clostridiales,order
AADAAAALGEGLQAFCLPGSVADTR,186802,Clostridiales,order
            </Boxed>

            <p>
                For those that are not familiar with <i>IO redirection</i>, the <Code>unipept</Code> command also supports the <Code>-i/--input</Code> option to 
                read the peptides from the file that is passed as an argument and the <Code>-o/--output</Code> option to store the results in a file that is passed 
                as an argument.
            </p>

            <Boxed>
                $ unipept pept2lca <b>--input</b> sample7.dat <b>--output</b> sample7.csv
$ head sample7.csv
peptide,taxon_id,taxon_name,taxon_rank
AAALNLVPNSTGAAK,2,Bacteria,superkingdom
AAALNTLAHSTGAAK,1678,Bifidobacterium,genus
AAALNTLPHSTGAAK,1678,Bifidobacterium,genus
AAAMSMLPTSTGAAK,2,Bacteria,superkingdom
AAANESFGYNEDELVSSDLVGMR,186802,Clostridiales,order
AAANYLDLPLYR,2,Bacteria,superkingdom
AAAVNLVPNSTGAAK,2,Bacteria,superkingdom
AADAAAALGEGLQAFCLPGSVADHR,186802,Clostridiales,order
AADAAAALGEGLQAFCLPGSVADTR,186802,Clostridiales,order
            </Boxed>

            <p>
                If needed, the <Code>unipept pept2lca</Code> command can be used in combination with the <Code>-a</Code> option to fetch the complete lineages for 
                all <Initialism>LCA</Initialism>s according to the Unipept Taxonomy. <RLink to="#fig3" router>Figure 3</RLink> shows the hierarchical classification 
                of the taxa that could be identified in sample 7, with the node representing the order <i>Clostridiales</i> having the focus. A similar tree view 
                can be found in the <i>Treeview</i> tab on the page showing the results of a Metaproteomics analysis in the Unipept web interface.
            </p>

            <ImageCaptionCard id="fig3" class="mb-5" :image="require('@/assets/documentation/cli/casestudy-mpa-treeview.png')">
                <b>Figure 3</b> Snapshot of an interactive tree view that shows the results of the biodiversity analysis of sample 7, a metaproteomics data set 
                from the study of {{ references.verberkmoes.short }}. The node that represents the order <i>Clostridiales</i> has the focus. Percentages on the 
                nodes indicate the relative amount of tryptic peptides that are specific for the corresponding taxa or one of its subtaxa, and also correspond to 
                the linear color gradient that was used to color the nodes: red (100%) - light yellow (0%).
            </ImageCaptionCard>
        </HeaderBodyCard>

        <h2 class="font-weight-light mt-5">References</h2>
        <ul>
            <li v-for="reference in references" :key="reference.short">
                {{ reference.full }}
            </li>
        </ul>
    </v-container>
</template>

<script setup lang="ts">
import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import RLink from '@/components/highlights/ResourceLink.vue';
import Boxed from '@/components/highlights/Boxed.vue';
import Sentinel from '@/components/highlights/Sentinel.vue';
import Code from '@/components/highlights/InlineCode.vue';
import Initialism from '@/components/highlights/Initialism.vue';
import ImageCaptionCard from '@/components/cards/ImageCaptionCard.vue';

const references = {
    dicksved: { 
        full: "Dicksved, J., Halfvarson, J., Rosenquist, M., Järnerot, G., Tysk, C., Apajalahti, J., ... & Jansson, J. K. (2008). Molecular analysis of the gut microbiota of identical twins with Crohn's disease. The ISME journal, 2(7), 716-727.",
        short: "Dicksved et al. (2008)"
    },
    kolmeder: {
        full: "Kolmeder, C. A., & de Vos, W. M. (2014). Metaproteomics of our microbiome — developing insight in function and activity in man and model systems. Journal of proteomics, 97, 3-16.",
        short: "Kolmeder & de Vos (2014)"
    },
    seifert: {
        full: "Seifert, J., Herbst, F. A., Halkjær Nielsen, P., Planes, F. J., Jehmlich, N., Ferrer, M., & Bergen, M. (2013). Bioinformatic progress and applications in metaproteogenomics for bridging the gap between genomic sequences and metabolic functions in microbial communities. Proteomics, 13(18-19), 2786-2804.",
        short: "Seifert et al. (2013)"
    },
    verberkmoes: {
        full: "Verberkmoes, N. C., Russell, A. L., Shah, M., Godzik, A., Rosenquist, M., Halfvarson, J., ... & Jansson, J. K. (2009). Shotgun metaproteomics of the human distal gut microbiota. The ISME journal, 3(2), 179-189.",
        short: "Verberkmoes et al. (2009)"
    }
}
</script>

<style scoped>
li {
    line-height: 1.5 !important;
    padding-bottom: 8px;
}
</style>
