<template>
    <v-container>
        <h1 class="font-weight-light">
            Case study: Taxonomic analysis of a tryptic peptide
        </h1>
        <h3 class="font-weight-light">
            This case study describes how the Unipept command line tools can be used for the taxonomic analysis of a single tryptic peptide.
        </h3>

        <header-body-card
            class="mt-5"
            title="Introduction"
            large-title
        >
            <p>
                Because most proteins are simply too large to be analysed using a mass spectrometer, they are usually cleaved into smaller peptides before the
                actual <initialism>MS</initialism> analysis takes place. In practice, most proteomics studies achieve such a cleavage by adding trypsin to a protein sample. Trypsin is a
                serine protease found in the digestive system of humans and many other vertebrates, where it helps to digest food proteins. The enzyme has a very
                specific function — it only cleaves <r-link to="https://en.wikipedia.org/wiki/Peptide">peptide</r-link> chains at the
                <r-link to="https://en.wikipedia.org/wiki/Carboxylic_acid">carboxyl</r-link> side of the <r-link to="https://en.wikipedia.org/wiki/Amino_acid">amino acids</r-link>
                <r-link to="https://en.wikipedia.org/wiki/Lysine">lysine</r-link> (represented by the letter <inline-code>K</inline-code>) or
                <r-link to="https://en.wikipedia.org/wiki/Arginine">arginine</r-link> (represented by the letter <inline-code>R</inline-code>). As a result, it is commonly used in biological
                research during <r-link to="https://en.wikipedia.org/wiki/Proteomics">proteomics</r-link> experiments to digest proteins into peptides for mass
                spectrometry analysis, e.g., <r-link to="https://en.wikipedia.org/wiki/In-gel_digestion">in-gel digestion</r-link>.
            </p>

            <p>
                <i>High-performance liquid chromatography</i> (<initialism>HPLC</initialism>) is a <r-link to="https://en.wikipedia.org/wiki/Chromatography">chromatographic</r-link>
                technique used to separate the components in a mixture, to identify each component, and to quantify each component. When combined with shotgun tandem mass
                spectrometric methods, the active proteins within a biological sample may be determined. A trypsin digest is used to cleave the proteins in a sample downstream
                to every <inline-code>K</inline-code> (lysine) or <inline-code>R</inline-code> (arginine), except when followed by <inline-code>P</inline-code> (proline). The individual components that result after the
                cleavage step are called tryptic peptides. The amino acid sequence of these tryptic peptides may then be determined by means of mass spectrometry. However, most
                devices have a detection limit that only allows to determine the amino acid sequence of peptides having a length between 5 and 50 amino acids
                (<r-link to="#fig1" router>Figure 1</r-link>).
            </p>

            <image-caption-card
                id="fig1"
                class="mb-5"
                :image="CaseStudyTPATrypticDigestImage"
            >
                <b>Figure 1</b> Tryptic digestion is a necessary step in protein absorption as proteins are generally too large to be absorbed through the lining
                of the small intestine. Trypsin predominantly cleaves proteins at the carboxyl side (or "C-terminal side") of the amino acids lysine (<inline-code>K</inline-code>)
                and arginine (<inline-code>R</inline-code>) except when either is bound to a C-terminal proline (<inline-code>P</inline-code>).
            </image-caption-card>

            <p>
                By searching for all proteins that contain a particular tryptic peptide that was sequenced from an environmental sample, we can get insight into
                the biodiversity and functionality of the biological sample. The <r-link to="/" router>Unipept web application</r-link> supports biodiversity analysis
                of large and complex metaproteome samples using tryptic peptide information obtained from shotgun <initialism>MS/MS</initialism> experiments. Its
                underlying index structure is designed to quickly retrieve all occurrences of a tryptic peptide in UniProt entries.
            </p>

            <image-caption-card
                id="fig2"
                :image="CaseStudyTPAWorkflowImage"
            >
                <b>Figure 2</b> General outline of the Unipept workflow for taxonomic identification of tryptic peptides. For a given tryptic peptide, all UniProt
                entries having an exact match of the peptide in the protein sequence are found. Unipept then computes the lowest common ancestor (<initialism>LCA</initialism>)
                of the taxonomic annotations extracted from the matched UniProt entries, based on a cleaned up version of the <initialism>NCBI</initialism> Taxonomy. All
                intermediate results are shown for the sample tryptic peptide <inline-code>ENFVY[IL]AK</inline-code> (isoleucine and leucine equated), leading to an
                <initialism>LCA</initialism> in the phylum Streptophyta. Arrows at the bottom show which processing steps are available as functions in the
                <r-link to="/apidocs" router>Unipept <initialism>API</initialism></r-link> and the <r-link to="/clidocs" router>Unipept <initialism>CLI</initialism></r-link>.
            </image-caption-card>
        </header-body-card>

        <header-body-card
            class="mt-5"
            title="Getting started"
            large-title
        >
            <p>
                Before the Unipept command line interface (<initialism>CLI</initialism>) can be used, it first needs to be <r-link to="/clidocs" router>installed locally</r-link>.
                Since the commands of the <initialism>CLI</initialism> are implemented in Ruby, the <r-link to="https://www.ruby-lang.org/en/downloads/">Ruby environment</r-link> must
                be installed first (at least version 2.3). The Unipept <initialism>CLI</initialism> can then be installed using the <inline-code>gem</inline-code> command, which
                is the RubyGems package manager for the Ruby programming language.
            </p>

            <boxed>
                <sentinel>$</sentinel> gem install unipept
                <br>Successfully installed unipept-2.2.1
                <br>1 gem installed
                <br>Installing ri documentation for unipept-2.2.1...
                <br>Installing RDoc documentation for unipept-2.2.1...
            </boxed>

            <p>
                By default, the <inline-code>gem</inline-code> command installs the Unipept <initialism>CLI</initialism> for all users on the computer system. To make a personal
                installation or in case you don't have the necessary permissions for the appropriate directories to make a system-wide installation, you can use the
                option <inline-code>--user-install</inline-code> of the <inline-code>gem</inline-code> command.
            </p>

            <p>
                The Unipept <initialism>CLI</initialism> is a bundle of different commands that all come with detailed
                <r-link to="/clidocs" router>online documentation</r-link>. Naturally, the most important command is <inline-code>unipept</inline-code>.
            </p>

            <boxed>
<pre>
<sentinel>$</sentinel> unipept --help
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
            </boxed>

            <p>
                As the <inline-code>unipept</inline-code> command makes calls to the Unipept <initialism>API</initialism> that is provided by an instance of the Unipept
                application server (web services that communicate with an instance of the Unipept database), the location of the Unipept application server must
                be <r-link to="/clidocs" router>configured</r-link>. By default, the public Unipept server (api.unipept.ugent.be) is used, but this can be changed by passing the <initialism>URL</initialism>
                of the server as an argument to the option <inline-code>--host</inline-code>. To avoid that a custom server needs to be specified with each use of the
                <inline-code>unipept</inline-code> command, a custom server can be set as default using the <inline-code>unipept config</inline-code> subcommand. A server set with the
                <inline-code>--host</inline-code> option always overrides the default server.
            </p>

            <boxed>
                <sentinel>$</sentinel> unipept <b>--host 'api.unipept.ugent.be'</b> pept2lca ENFVYIAK
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>ENFVYIAK,35493,Streptophyta,phylum
                <br><sentinel>$</sentinel> unipept <b>config host 'api.unipept.ugent.be'</b>
                <br><sentinel>$</sentinel> unipept pept2lca ENFVYIAK
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>ENFVYIAK,35493,Streptophyta,phylum
            </boxed>
        </header-body-card>

        <header-body-card
            class="mt-5"
            title="The Unipept commands"
            large-title
        >
            <p>
                Using the <inline-code>unipept</inline-code> command with a single tryptic peptide passed as an argument or read from <i>standard input</i>, corresponds to using
                the <r-link to="/tpa" router>Tryptic Peptide Analysis</r-link> feature from the Unipept web interface (<r-link to="#fig3" router>Figure 3</r-link>).
                Activating the option Equate I and L in the web interface corresponds to using the <inline-code>-e</inline-code> option with the <inline-code>unipept</inline-code> command.
            </p>

            <image-caption-card
                id="fig3"
                class="mb-5"
                :image="CaseStudyTPARequestImage"
            >
                <b>Figure 3</b> Taxonomic identification of the tryptic peptide <inline-code>ENFVYIAK</inline-code> using the <r-link to="/tpa" router>Tryptic Peptide Analysis</r-link>
                feature from the Unipept web interface.
            </image-caption-card>

            <p>
                The <inline-code>unipept pept2prot</inline-code> command is an implementation of the <inline-code>pept2prot</inline-code> step in <r-link to="#fig2" router>Figure 2</r-link>.
                This command can therefore be used to fetch all UniProt proteins that contain (exact matching) the given tryptic peptide. These peptides are listed
                in the <i>Protein matches</i> tab on the page that shows the results of a Tryptic Peptide Analysis on the Unipept web interface. When the option
                <inline-code>-a/--all</inline-code> is used, additional taxonomic and functional information is shown for each of the matched protein records. These metadata
                are extracted directly from the annotations on the UniProt entries.
            </p>

            <p>
                The <inline-code>unipept pept2taxa</inline-code> command is the composition of the <inline-code>pept2prot</inline-code> and <inline-code>prot2taxa</inline-code> steps in <r-link to="#fig2" router>Figure 2</r-link>,
                apart from the fact that this command also implements a deduplication of the matched taxa. The command can thus be used to fetch all taxonomic
                annotations from all UniProt proteins that contain the given tryptic peptide. This information is represented in the Unipept web interface in
                tabular format (<i>Lineage table tab</i>) and in tree format (<i>Lineage tree tab</i>). All information included in the table can be retrieved using the
                <inline-code>-a</inline-code> option in combination with this command. The tree structure is only a compact representation of the complete lineages included in the table.
            </p>

            <p>
                The <inline-code>unipept pept2lca</inline-code> command is the composition of the <inline-code>pept2prot</inline-code>, <inline-code>prot2taxa</inline-code> and <inline-code>taxa2lca</inline-code> steps
                in <r-link to="#fig2" router>Figure 2</r-link>. In other words, this command can be used to determine the taxonomic identification of a tryptic peptide.
                This is done by computing the lowest common ancestor (<initialism>LCA</initialism>) from all taxonomic annotations of the UniProt proteins that
                match the given tryptic peptide (<r-link to="#fig2" router>Figure 2</r-link>). This information can be found in the summary on top of the page that
                shows the results of a Tryptic Peptide Analysis in the Unipept web interface (<r-link to="#fig4" router>Figure 4</r-link>). The complete lineage can
                be retrieved using the <inline-code>-a</inline-code> option in combination with this command. Note that the computation of the <initialism>LCA</initialism>
                (<inline-code>taxa2lca</inline-code> step in <r-link to="#fig4" router>Figure 4</r-link>) can be done using the <inline-code>unipept taxa2lca</inline-code> command of the
                Unipept <initialism>CLI</initialism>.
            </p>

            <image-caption-card
                id="fig4"
                :image="CaseStudyTPAResponseImage"
            >
                <b>Figure 4</b> Information about the lowest common ancestor of the tryptic peptide <inline-code>ENFVYIAK</inline-code>, as displayed on top of the page that shows the
                results of a <r-link to="/tpa" router>Tryptic Peptide Analysis</r-link> in the Unipept web interface.
            </image-caption-card>
        </header-body-card>

        <header-body-card
            class="mt-5"
            title="Taxonomic analysis"
            large-title
        >
            <p>
                Say that we have determined the mass spectrum of a tryptic peptide, that was identified as the peptide <inline-code>ENFVYIAK</inline-code> using database
                searches (<i>Mascot</i> ({{ references.mascot.short }}), <i>Sequest</i> ({{ references.sequest.short }}), <i>X!Tandem</i> ({{ references.xtandem.short }})) or
                de novo identification (<i>PEAKS</i> ({{ references.peaks.short }})). As an example, we show how this tryptic peptide can be taxonomically assigned
                to the phylum Streptophyta. As a starter, we can use the <inline-code>unipept pept2prot</inline-code> command to fetch all UniProt proteins indexed by Unipept
                that contain the peptide.
            </p>

            <p>
                The following interactive session shows that UniProt contains 19 proteins that contain the tryptic peptide <inline-code>ENFVYIAK</inline-code>. Note that the
                first command passes the tryptic peptide as an argument to the <inline-code>unipept pept2prot</inline-code> command. In case no tryptic peptide is passed as an
                argument, the command reads a tryptic peptide from <i>standard input</i> as illustrated by the second command. Throughout this case study we will
                preferentially pass tryptic peptides as an argument to the <inline-code>unipept pept2prot</inline-code> command, but the command works the same way irrespective
                of how the tryptic peptide is fed to the command.
            </p>

            <boxed>
                <sentinel>$</sentinel> unipept pept2prot ENFVYIAK
                <br>peptide,uniprot_id,protein_name,taxon_id
                <br>ENFVYIAK,C6TH93,Casparian strip membrane protein 4,3847
                <br>ENFVYIAK,P42654,14-3-3-like protein B,3906
                <br>ENFVYIAK,Q96453,14-3-3-like protein D,3847
                <br>ENFVYIAK,G7LIR4,Uncharacterized protein,3880
                <br>ENFVYIAK,V4W919,Uncharacterized protein,85681
                <br>ENFVYIAK,T2DN83,14-3-3-like protein D,3885
                <br>ENFVYIAK,I1LUM3,Uncharacterized protein,3847
                <br>ENFVYIAK,A0A0B2R6Y9,14-3-3-like protein D,3848
                <br>ENFVYIAK,A0A0B2RUJ9,14-3-3-like protein D,3848
                <br>ENFVYIAK,A0A067GDS1,Uncharacterized protein,2711
                <br>ENFVYIAK,V4U9U4,Uncharacterized protein,85681
                <br>ENFVYIAK,A0A072VBW0,Uncharacterized protein,3880
                <br>ENFVYIAK,I1M3M0,Uncharacterized protein,3847
                <br>ENFVYIAK,F6H2P0,Putative uncharacterized protein,29760
                <br>ENFVYIAK,C6TM63,Putative uncharacterized protein,3847
                <br>ENFVYIAK,M0TAI1,Uncharacterized protein,214687
                <br>ENFVYIAK,E1U3Z1,14-3-3,3827
                <br>ENFVYIAK,M0TY03,Uncharacterized protein,214687
                <br>ENFVYIAK,A0A067GE20,Uncharacterized protein,2711
                <br><sentinel>$</sentinel> echo ENFVYIAK | unipept pept2prot
                <br>peptide,uniprot_id,protein_name,taxon_id
                <br>ENFVYIAK,C6TH93,Casparian strip membrane protein 4,3847
                <br>ENFVYIAK,P42654,14-3-3-like protein B,3906
                <br>ENFVYIAK,Q96453,14-3-3-like protein D,3847
                <br>ENFVYIAK,G7LIR4,Uncharacterized protein,3880
                <br>ENFVYIAK,V4W919,Uncharacterized protein,85681
                <br>ENFVYIAK,T2DN83,14-3-3-like protein D,3885
                <br>ENFVYIAK,I1LUM3,Uncharacterized protein,3847
                <br>ENFVYIAK,A0A0B2R6Y9,14-3-3-like protein D,3848
                <br>ENFVYIAK,A0A0B2RUJ9,14-3-3-like protein D,3848
                <br>ENFVYIAK,A0A067GDS1,Uncharacterized protein,2711
                <br>ENFVYIAK,V4U9U4,Uncharacterized protein,85681
                <br>ENFVYIAK,A0A072VBW0,Uncharacterized protein,3880
                <br>ENFVYIAK,I1M3M0,Uncharacterized protein,3847
                <br>ENFVYIAK,F6H2P0,Putative uncharacterized protein,29760
                <br>ENFVYIAK,C6TM63,Putative uncharacterized protein,3847
                <br>ENFVYIAK,M0TAI1,Uncharacterized protein,214687
                <br>ENFVYIAK,E1U3Z1,14-3-3,3827
                <br>ENFVYIAK,M0TY03,Uncharacterized protein,214687
                <br>ENFVYIAK,A0A067GE20,Uncharacterized protein,2711
            </boxed>

            <p>
                By default, the output is generated in csv-format (comma-separated values). Apart from the query peptide (<inline-code>peptide</inline-code>), the output contains
                two GUIDs (<i>globally unique identifiers</i>): i) the UniProt Accession Number (<inline-code>uniprot_id</inline-code>) that refers to the protein record in
                the UniProt database that contains the tryptic peptide and ii) the <initialism>NCBI</initialism> Taxonomy Identifier (<inline-code>taxon_id</inline-code>) assigned
                to the UniProt protein record that refers to a record in the <initialism>NCBI</initialism> Taxonomy Database
                ({{ references.ncbi1.short }}; {{ references.ncbi2.short }}). The latter describes a taxon in the hierarchical classification of cellular organisms,
                being the taxon from which the protein was extracted. The output also contains the name of each protein (<inline-code>protein_name</inline-code>).
            </p>

            <p>
                In peptide sequencing experiments involving a single step tandem mass acquisition, leucine (<inline-code>L</inline-code>) and isoleucine (<inline-code>I</inline-code>) are
                indistinguishable because both are characterized by a 113 Da mass difference from the other peptide fragments in the <initialism>MS-MS</initialism>
                spectrum. In general there are 2<sup>n</sup> <inline-code>I=L</inline-code> variants for each tryptic peptide that contains <i>n</i> residues that are either
                leucine or isoleucine. Therefore, all subcommands of the <inline-code>unipept</inline-code> command that are based on matching given peptides against UniProt
                proteins support the <inline-code>-e/--equate</inline-code> option (<i>equate</i>). Exact matching makes no distinction between <inline-code>I</inline-code> and <inline-code>L</inline-code>
                when this option is activated.
            </p>

            <boxed>
                <sentinel>$</sentinel> unipept pept2prot <b>-e</b> ENFVYIAK
                <br>peptide,uniprot_id,protein_name,taxon_id
                <br>ENFVYIAK,C6TH93,Casparian strip membrane protein 4,3847
                <br>ENFVYIAK,P42654,14-3-3-like protein B,3906
                <br>ENFVYIAK,Q96453,14-3-3-like protein D,3847
                <br>ENFVYIAK,G7LIR4,Uncharacterized protein,3880
                <br>ENFVYIAK,V4W919,Uncharacterized protein,85681
                <br>ENFVYIAK,T2DN83,14-3-3-like protein D,3885
                <br>ENFVYIAK,I1LUM3,Uncharacterized protein,3847
                <br>ENFVYIAK,A0A0B2R6Y9,14-3-3-like protein D,3848
                <br>ENFVYIAK,A0A0B2RUJ9,14-3-3-like protein D,3848
                <br>ENFVYIAK,A0A067GDS1,Uncharacterized protein,2711
                <br>ENFVYIAK,V4U9U4,Uncharacterized protein,85681
                <br>ENFVYIAK,A0A072VBW0,Uncharacterized protein,3880
                <br>ENFVYIAK,M5WGY1,Uncharacterized protein,3760
                <br>ENFVYIAK,I1M3M0,Uncharacterized protein,3847
                <br>ENFVYIAK,F6H2P0,Putative uncharacterized protein,29760
                <br>ENFVYIAK,C6TM63,Putative uncharacterized protein,3847
                <br>ENFVYIAK,M0TAI1,Uncharacterized protein,214687
                <br>ENFVYIAK,E1U3Z1,14-3-3,3827
                <br>ENFVYIAK,M0TY03,Uncharacterized protein,214687
                <br>ENFVYIAK,A0A067GE20,Uncharacterized protein,2711
            </boxed>

            <p>
                Note that the Unipept database has two separate index structures to match tryptic peptides against UniProt protein records: one that is used to
                exactly match tryptic peptides against UniProt protein records and one that is used to exactly match all <inline-code>I=L</inline-code> variants of a given
                tryptic peptide. As a result, matching all <inline-code>I=L</inline-code> variants of the tryptic peptide <inline-code>ENFVYIAK</inline-code> can be done in a single step,
                without any performance loss.
            </p>

            <p>
                Apart from a fast index that maps tryptic peptides onto the UniProt entries of proteins that contain the peptide, the Unipept database contains
                minimal information about the proteins that was extracted from the UniProt entries. This includes information about the taxon from which the protein
                was sequenced (<inline-code>taxon_id</inline-code> and <inline-code>taxon_name</inline-code>) and a description of the cellular functions the protein is involved in
                (<inline-code>ec_references</inline-code> and <inline-code>go_references</inline-code>). Taxonomic information is described using a <initialism>GUID</initialism> that refers to
                a record in the <initialism>NCBI</initialism> Taxonomy Database ({{ references.ncbi1.short }}; {{ references.ncbi2.short }}). Functional information is
                described using <initialism>NCBI</initialism>s that refer to records from the Enzyme Commission classification (<i><initialism>EC</initialism></i>; {{ references.ec.short }})
                and the Gene Ontology (<i><initialism>GO</initialism></i>; {{ references.go.short }}). The generated output contains this additional information if the <inline-code>-a/--all</inline-code> option
                of the <inline-code>unipept</inline-code> command is used. The following example is representative in the sense that the taxonomic information about proteins
                is generally more complete and accurate than the information about known functions of the proteins.
            </p>

            <boxed>
                <sentinel>$</sentinel> unipept pept2prot -e <b>-a</b> ENFVYIAK
                <br>peptide,uniprot_id,protein_name,taxon_id,taxon_name,ec_references,go_references,refseq_ids,refseq_protein_ids,insdc_ids,insdc_protein_ids
                <br>ENFVYIAK,C6TH93,Casparian strip membrane protein 4,3847,Glycine max,,GO:0016021 GO:0005886 GO:0071555,NM_001255156.1,NP_001242085.1,BT097011,ACU21195.1
                <br>ENFVYIAK,P42654,14-3-3-like protein B,3906,Vicia faba,,,,,Z48505,CAA88416.1
                <br>ENFVYIAK,Q96453,14-3-3-like protein D,3847,Glycine max,,,NM_001250136.1,NP_001237065.1,U70536,AAB09583.1
                <br>ENFVYIAK,G7LIR4,Uncharacterized protein,3880,Medicago truncatula,,,XM_003629715.1,XP_003629763.1,CM001224 BT141273,AET04239.2 AFK41067.1
                <br>ENFVYIAK,V4W919,Uncharacterized protein,85681,Citrus clementina,,,XM_006449435.1 XM_006449436.1,XP_006449498.1 XP_006449499.1,KI536312 KI536312,ESR62738.1 ESR62739.1
                <br>ENFVYIAK,T2DN83,14-3-3-like protein D,3885,Phaseolus vulgaris,,,,,KF033292,AGV54282.1
                <br>ENFVYIAK,I1LUM3,Uncharacterized protein,3847,Glycine max,,,XM_006591823.1,XP_006591886.1,,
                <br>ENFVYIAK,A0A0B2R6Y9,14-3-3-like protein D,3848,Glycine soja,,,,,KN653025,KHN27939.1
                <br>ENFVYIAK,A0A0B2RUJ9,14-3-3-like protein D,3848,Glycine soja,,,,,KN647401,KHN36695.1
                <br>ENFVYIAK,A0A067GDS1,Uncharacterized protein,2711,Citrus sinensis,,,,,KK784879,KDO77853.1
                <br>ENFVYIAK,V4U9U4,Uncharacterized protein,85681,Citrus clementina,,,XM_006449434.1,XP_006449497.1,KI536312,ESR62737.1
                <br>ENFVYIAK,A0A072VBW0,Uncharacterized protein,3880,Medicago truncatula,,GO:0005829 GO:0005634 GO:0005886 GO:0005509 GO:0019344 GO:0006096 GO:0007030 GO:0042744 GO:0006972 GO:0019288 GO:0048528 GO:0032880 GO:0046686 GO:0009750 GO:0009651 GO:0009266 GO:0006833,,,CM001218,KEH39277.1
                <br>ENFVYIAK,M5WGY1,Uncharacterized protein,3760,Prunus persica,,,XM_007211811.1,XP_007211873.1,KB639078,EMJ13072.1
                <br>ENFVYIAK,I1M3M0,Uncharacterized protein,3847,Glycine max,,,XM_006593419.1,XP_006593482.1,,
                <br>ENFVYIAK,F6H2P0,Putative uncharacterized protein,29760,Vitis vinifera,,,,,FN595229,CCB46258.1
                <br>ENFVYIAK,C6TM63,Putative uncharacterized protein,3847,Glycine max,,,NM_001255222.2,NP_001242151.1,BT098814,ACU24005.1
                <br>ENFVYIAK,M0TAI1,Uncharacterized protein,214687,Musa acuminata subsp. malaccensis,,,,,,
                <br>ENFVYIAK,E1U3Z1,14-3-3,3827,Cicer arietinum,,,XM_004487103.1,XP_004487160.1,FJ225662,ACQ45020.1
                <br>ENFVYIAK,M0TY03,Uncharacterized protein,214687,Musa acuminata subsp. malaccensis,,,,,,
                <br>ENFVYIAK,A0A067GE20,Uncharacterized protein,2711,Citrus sinensis,,,,,KK784879,KDO77854.1
            </boxed>

            <p>
                Because Unipept uses a separate peptide index in which <inline-code>I</inline-code> and <inline-code>L</inline-code> are equated, Unipept cannot directly resolve what specific
                <inline-code>I=L</inline-code> variant (or variants) of a tryptic peptide are contained in a protein sequence. However, the Unipept command line tools contain
                the <inline-code>uniprot</inline-code> command that calls the UniProt web services. This can be used, for example, to retrieve all protein sequences for a given
                list of <i>UniProt Accession Numbers</i>. The following example also illustrates the <inline-code>-s/--select</inline-code> option of the <inline-code>unipept</inline-code>
                command, that can be used to include only a selected list of information fields in the generated output. Note that we add a series of additional
                processing steps to the result of the <inline-code>uniprot</inline-code> command, that only put the contained <inline-code>I=L</inline-code> variants in capitals (the remaining
                residues are converted into lower case) and truncate the protein sequences after a fixed number of residues.
            </p>

            <boxed>
                <sentinel>$</sentinel> unipept pept2prot -e ENFVYIAK -s uniprot_id | tail -n+2 | <b>uniprot</b> | tr 'A-Z' 'a-z' | sed 's/enfvy[il]ak/\U&\E/' | sed -E 's/(.{60}).*/\1.../'
                <br>maaskdrENFVYIAKlaeqaeryeemvesmknvanldveltveerkkgvaildfilrlga...
                <br>mastkdrENFVYIAKlaeqaeryeemvdsmknvanldveltieernllsvgyknvigarr...
                <br>mtaskdrENFVYIAKlaeqaeryeemvesmknvanldveltveernllsvgyknvigarr...
                <br>mastkerENFVYIAKlaeqaeryeemveamknvakldveltveernllsvgyknvvgahr...
                <br>mdkdrENFVYIAKlaeqaerydemvdamkkvanldveltveernllsvgyknvigarras...
                <br>mtaskdrENFVYIAKlaeqaeryeemvesmknvanldveltvekqkpfwngtclrqafav...
                <br>maaskdrENFVYIAKlaeqaeryeemvesmknvanldveltveernllsvgyknvigarr...
                <br>maaskdrENFVYIAKlaeqaeryeemvesmknvanldveltveernllsvgyknvigarr...
                <br>mtaskdrENFVYIAKlaeqaeryeemvesmknvanldveltveernllsvgyknvigarr...
                <br>mdkdrENFVYIAKlaeqaerydemvdamkkvanldveltveernllsvgyknvigarras...
                <br>mdkdrENFVYIAKlaeqaerydemvdamkkvanldveltveernllsvgyknvigarras...
                <br>masskdrENFVYIAKlaeqaeryeemvdsmknvanldveltveernllsvgyknvigarr...
                <br>mgfaterENFVYLAKlseqaerydemvdamkkvanldveltveernllsvgyknvvgsrr...
                <br>mtaskdrENFVYIAKlaeqaeryeemvesmknvanldveltveernllsvgyknvigarr...
                <br>marENFVYIAKlaeqaerydemvdamkkvakldvdltveernllsvgyknvigarraswr...
                <br>maaskdrENFVYIAKlaeqaerfeemvesmknvanldveltveernllsvgyknvigarr...
                <br>masqkerENFVYIAKlaeqaerydemvdamkkvakldveltveernllsvgyknvvgarr...
                <br>masskdrENFVYIAKlaeqaeryeemvdsmksvanldveltveernllsvgyknvigarr...
                <br>masqkerENFVYIAKlaeqaerydemvdamkkvakldveltveernllsvgyknvvgarr...
                <br>mdkdrENFVYIAKlaeqaerydanldveltveernllsvgyknvigarraswrilssieq...
            </boxed>

            <p>
                The <inline-code>uniprot</inline-code> command can not only be used to fetch protein sequences from the UniProt database, but also all metadata that is
                available about the protein in UniProt. This can be done by passing a specific format to the <inline-code>-f/--format</inline-code> option of the <inline-code>uniprot</inline-code>
                command: csv (default value), fasta, xml, text, rdf or gff. As an example, the following session fetches the first three proteins from UniProt that
                contain an <inline-code>I=L</inline-code> variant of the tryptic peptide <inline-code>ENFVYIAK</inline-code>. These proteins are returned in <initialism>FASTA</initialism> format.
            </p>

            <boxed>
                <sentinel>$</sentinel> unipept pept2prot -e ENFVYIAK -s uniprot_id | tail -n+2 | head -3 | uniprot <b>-f fasta</b>
                <br>>sp|C6TH93|CASP4_SOYBN Casparian strip membrane protein 4 OS=Glycine max PE=2 SV=1
                <br>MAASKDRENFVYIAKLAEQAERYEEMVESMKNVANLDVELTVEERKKGVAILDFILRLGA
                <br>ITSALGAAATMATSDETLPFFTQFFQFEASYDSFSTFQFFVIAMAFVGGYLVLSLPFSIV
                <br>TIIRPHAAGPRLFLIILDTVFLTLATSSAAAATAIVYLAHNGNQDSNWLAICNQFGDFCQ
                <br>EISGAVVASFVAVVLFVLLIVMCAVALRNH
                <br>>sp|P42654|1433B_VICFA 14-3-3-like protein B OS=Vicia faba PE=2 SV=1
                <br>MASTKDRENFVYIAKLAEQAERYEEMVDSMKNVANLDVELTIEERNLLSVGYKNVIGARR
                <br>ASWRILSSIEQKEESKGNDVNAKRIKEYRHKVETELSNICIDVMRVIDEHLIPSAAAGES
                <br>TVFYYKMKGDYYRYLAEFKTGNEKKEAGDQSMKAYESATTAAEAELPPTHPIRLGLALNF
                <br>SVFYYEILNSPERACHLAKQAFDEAISELDTLNEESYKDSTLIMQLLRDNLTLWTSDIPE
                <br>DGEDSQKANGTAKFGGGDDAE
                <br>>sp|Q96453|1433D_SOYBN 14-3-3-like protein D OS=Glycine max GN=GF14D PE=2 SV=1
                <br>MTASKDRENFVYIAKLAEQAERYEEMVESMKNVANLDVELTVEERNLLSVGYKNVIGARR
                <br>ASWRILSSIEQKEETKGNELNAKRIKEYRQKVELELSNICNDVMRVIDEHLIPSAAAGES
                <br>TVFYYKMKGDYYRYLAEFKSGNEKKEAADQSMKAYESATAAAEADLPPTHPIRLGLALNF
                <br>SVFYYEILNSPERACHLAKQAFDEAISELDTLNEESYKDSTLIMQLLRDNLTLWTSDIPE
                <br>DGEDAQKVNGTAKLGGGEDAE
            </boxed>

            <p>
                Based on the taxonomic annotations contained in the UniProt entries that match a given tryptic peptide, the tryptic peptide can be assigned
                taxonomically. To do so, Unipept makes use of an algorithm that computes the <i>lowest common ancestor</i> (<initialism>LCA</initialism>) of all
                taxa in which the peptide was found. The implementation of this algorithm in Unipept is robust against taxonomic misarrangements, misidentifications,
                and inaccuracies. Unipept computes the <initialism>LCA</initialism> based on the Unipept Taxonomy, a cleaned up version of the <initialism>NCBI</initialism>
                Taxonomy that heuristically invalidates some "unnatural" taxa from the original database based on a set of regular expressions. Not taking into account
                this identification noise would otherwise result in drastic loss of information.
            </p>

            <p>
                Apart from the <initialism>LCA</initialism> algorithm implemented by Unipept, it is also possible to come up with alternative aggregation scenarios
                that are implemented client side based on the <initialism>NCBI</initialism> Taxonomy Identifiers that are associated with the matched UniProt
                protein records. Scenarios that are based on the Unipept Taxonomy can be implemented by using the <inline-code>unipept pept2taxa</inline-code> command that
                outputs all taxa associated with the UniProt proteins that contain a given tryptic peptide.
            </p>

            <boxed>
                <sentinel>$</sentinel> unipept <b>pept2taxa</b> -e ENFVYIAK
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>ENFVYIAK,2711,Citrus sinensis,species
                <br>ENFVYIAK,3760,Prunus persica,species
                <br>ENFVYIAK,3827,Cicer arietinum,species
                <br>ENFVYIAK,3847,Glycine max,species
                <br>ENFVYIAK,3848,Glycine soja,species
                <br>ENFVYIAK,3880,Medicago truncatula,species
                <br>ENFVYIAK,3885,Phaseolus vulgaris,species
                <br>ENFVYIAK,3906,Vicia faba,species
                <br>ENFVYIAK,29760,Vitis vinifera,species
                <br>ENFVYIAK,85681,Citrus clementina,species
                <br>ENFVYIAK,214687,Musa acuminata subsp. malaccensis,subspecies
            </boxed>

            <p>
                Using the <inline-code>-a</inline-code> option in combination with the <inline-code>unipept pept2taxa</inline-code> command includes the complete lineages (resulting after
                the cleanup done by Unipept) of the taxa in the generated output.
            </p>

            <boxed>
                <sentinel>$</sentinel> unipept pept2taxa -e <b>-a</b> ENFVYIAK
                <br>peptide,taxon_id,taxon_name,taxon_rank,superkingdom_id,superkingdom_name,kingdom_id,kingdom_name,subkingdom_id,subkingdom_name,superphylum_id,superphylum_name,phylum_id,phylum_name,subphylum_id,subphylum_name,superclass_id,superclass_name,class_id,class_name,subclass_id,subclass_name,infraclass_id,infraclass_name,superorder_id,superorder_name,order_id,order_name,suborder_id,suborder_name,infraorder_id,infraorder_name,parvorder_id,parvorder_name,superfamily_id,superfamily_name,family_id,family_name,subfamily_id,subfamily_name,tribe_id,tribe_name,subtribe_id,subtribe_name,genus_id,genus_name,subgenus_id,subgenus_name,species_group_id,species_group_name,species_subgroup_id,species_subgroup_name,species_id,species_name,subspecies_id,subspecies_name,varietas_id,varietas_name,forma_id,forma_name
                <br>ENFVYIAK,2711,Citrus sinensis,species,2759,Eukaryota,33090,Viridiplantae,,,,,35493,Streptophyta,,,,,,,71275,rosids,,,,,41937,Sapindales,,,,,,,,,23513,Rutaceae,,,,,,,2706,Citrus,,,,,,,2711,Citrus sinensis,,,,,,
                <br>ENFVYIAK,3760,Prunus persica,species,2759,Eukaryota,33090,Viridiplantae,,,,,35493,Streptophyta,,,,,,,71275,rosids,,,,,3744,Rosales,,,,,,,,,3745,Rosaceae,171637,Maloideae,,,,,3754,Prunus,,,,,,,3760,Prunus persica,,,,,,
                <br>ENFVYIAK,3827,Cicer arietinum,species,2759,Eukaryota,33090,Viridiplantae,,,,,35493,Streptophyta,,,,,,,71275,rosids,,,,,72025,Fabales,,,,,,,,,3803,Fabaceae,3814,Papilionoideae,163722,Cicereae,,,3826,Cicer,,,,,,,3827,Cicer arietinum,,,,,,
                <br>ENFVYIAK,3847,Glycine max,species,2759,Eukaryota,33090,Viridiplantae,,,,,35493,Streptophyta,,,,,,,71275,rosids,,,,,72025,Fabales,,,,,,,,,3803,Fabaceae,3814,Papilionoideae,163735,Phaseoleae,,,3846,Glycine,1462606,Soja,,,,,3847,Glycine max,,,,,,
                <br>ENFVYIAK,3848,Glycine soja,species,2759,Eukaryota,33090,Viridiplantae,,,,,35493,Streptophyta,,,,,,,71275,rosids,,,,,72025,Fabales,,,,,,,,,3803,Fabaceae,3814,Papilionoideae,163735,Phaseoleae,,,3846,Glycine,1462606,Soja,,,,,3848,Glycine soja,,,,,,
                <br>ENFVYIAK,3880,Medicago truncatula,species,2759,Eukaryota,33090,Viridiplantae,,,,,35493,Streptophyta,,,,,,,71275,rosids,,,,,72025,Fabales,,,,,,,,,3803,Fabaceae,3814,Papilionoideae,163742,Trifolieae,,,3877,Medicago,,,,,,,3880,Medicago truncatula,,,,,,
                <br>ENFVYIAK,3885,Phaseolus vulgaris,species,2759,Eukaryota,33090,Viridiplantae,,,,,35493,Streptophyta,,,,,,,71275,rosids,,,,,72025,Fabales,,,,,,,,,3803,Fabaceae,3814,Papilionoideae,163735,Phaseoleae,,,3883,Phaseolus,,,,,,,3885,Phaseolus vulgaris,,,,,,
                <br>ENFVYIAK,3906,Vicia faba,species,2759,Eukaryota,33090,Viridiplantae,,,,,35493,Streptophyta,,,,,,,71275,rosids,,,,,72025,Fabales,,,,,,,,,3803,Fabaceae,3814,Papilionoideae,163743,Fabeae,,,3904,Vicia,,,,,,,3906,Vicia faba,,,,,,
                <br>ENFVYIAK,29760,Vitis vinifera,species,2759,Eukaryota,33090,Viridiplantae,,,,,35493,Streptophyta,,,,,,,71275,rosids,,,,,403667,Vitales,,,,,,,,,3602,Vitaceae,,,,,,,3603,Vitis,,,,,,,29760,Vitis vinifera,,,,,,
                <br>ENFVYIAK,85681,Citrus clementina,species,2759,Eukaryota,33090,Viridiplantae,,,,,35493,Streptophyta,,,,,,,71275,rosids,,,,,41937,Sapindales,,,,,,,,,23513,Rutaceae,,,,,,,2706,Citrus,,,,,,,85681,Citrus clementina,,,,,,
                <br>ENFVYIAK,214687,Musa acuminata subsp. malaccensis,subspecies,2759,Eukaryota,33090,Viridiplantae,,,,,35493,Streptophyta,,,,,4447,Liliopsida,4734,commelinids,,,,,4618,Zingiberales,,,,,,,,,4637,Musaceae,,,,,,,4640,Musa,,,,,,,4641,Musa acuminata,214687,Musa acuminata subsp. malaccensis,,,,
            </boxed>

            <p>
                This output corresponds to the tree structure that appears at the left of <r-link to="#fig2" router>Figure 2</r-link> or the tree drawn in the
                <i>Lineage tree</i> tab on the page that shows the results of a Tryptic Peptide Analysis in the Unipept web interface. Note that the tryptic peptide
                <inline-code>ENFVYLAK</inline-code> was only found in a peach protein (Prunus persica), whereas its <inline-code>I=L</inline-code> variant was found in proteins of a species
                of wild banana (<i>Musa acuminata subsp. malaccensis</i>) and in different members of the flowering plants including chick pea (<i>Cicer arietinum</i>),
                broad been (<i>Vicia faba</i>), soybean (<i>Glycine max</i>), common bean (<i>Phaseolus vulgaris</i>), barrel medic (<i>Medicago truncatula</i>),
                orange (<i>Citrus sinensis</i>), clementine (<i>Citrus clementina</i>) and common grape vine (<i>Vitis vinifera</i>).
            </p>

            <p>
                The Unipept implementation of the <initialism>LCA</initialism> algorithm can be applied on a given tryptic peptide using the <inline-code>unipept pept2lca</inline-code>
                command. Using the <inline-code>-e</inline-code> option will again have an influence on the <initialism>LCA</initialism> computation for the tryptic peptide <inline-code>ENFVYIAK</inline-code>.
                After all, the <initialism>LCA</initialism> will be computed for all taxa associated with proteins in which the tryptic peptide (or one of its <inline-code>I=L</inline-code>
                variants) was found.
            </p>

            <boxed>
                <sentinel>$</sentinel> unipept <b>pept2lca</b> ENFVYIAK
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>ENFVYIAK,35493,Streptophyta,phylum
                <br><sentinel>$</sentinel> unipept <b>pept2lca</b> ENFVYLAK
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>ENFVYLAK,3760,Prunus persica,species
                <br><sentinel>$</sentinel> unipept <b>pept2lca</b> -e ENFVYLAK
                <br>peptide,taxon_id,taxon_name,taxon_rank
                <br>ENFVYLAK,35493,Streptophyta,phylum
            </boxed>

            <p>
                The correctness of the computed <initialism>LCA</initialism>s can be checked based on the taxonomic hierarchy shown in <r-link to="#fig2" router>Figure 2</r-link>.
            </p>
        </header-body-card>

        <h2 class="font-weight-light mt-5">
            References
        </h2>
        <ul>
            <li
                v-for="reference in references"
                :key="reference.short"
            >
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
import InlineCode from '@/components/highlights/InlineCode.vue';
import initialism from '@/components/highlights/initialism.vue';
import ImageCaptionCard from '@/components/cards/ImageCaptionCard.vue';
import CaseStudyTPATrypticDigestImage from '@/assets/documentation/cli/casestudy-tpa-trypsin-digest.png';
import CaseStudyTPAWorkflowImage from '@/assets/documentation/cli/casestudy-tpa-workflow.png';
import CaseStudyTPARequestImage from '@/assets/documentation/cli/casestudy-tpa-request.png';
import CaseStudyTPAResponseImage from '@/assets/documentation/cli/casestudy-tpa-response.png';

const references = {
    go: {
        full: "Ashburner, M., Ball, C. A., Blake, J. A., Botstein, D., Butler, H., Cherry, J. M., ... & Sherlock, G. (2000). Gene Ontology: tool for the unification of biology. Nature genetics, 25(1), 25-29.",
        short: "Ashburner et al., 2000"
    },
    ncbi2: {
        full: "Benson, D. A., Cavanaugh, M., Clark, K., Karsch-Mizrachi, I., Lipman, D. J., Ostell, J., & Sayers, E. W. (2013). GenBank. Nucleic acids research, 41(D1), D36-D42.",
        short: "Benson et al., 2013"
    },
    mascot: {
        full: "Cottrell, J. S., & London, U. (1999). Probability-based protein identification by searching sequence databases using mass spectrometry data. Electrophoresis, 20(18), 3551-3567.",
        short: "Cottrell & London, 1999"
    },
    xtandem: {
        full: "Craig, R., & Beavis, R. C. (2003). A method for reducing the time required to match protein sequences with tandem mass spectra. Rapid communications in mass spectrometry, 17(20), 2310-2316.",
        short: "Craig et al., 2003"
    },
    sequest: {
        full: "Eng, J. K., McCormack, A. L., & Yates, J. R. (1994). An approach to correlate tandem mass spectral data of peptides with amino acid sequences in a protein database. Journal of the American Society for Mass Spectrometry, 5(11), 976-989.",
        short: "Eng et al., 1994"
    },
    peaks: {
        full: "Ma, B., Zhang, K., Hendrie, C., Liang, C., Li, M., Doherty-Kirby, A., & Lajoie, G. (2003). PEAKS: powerful software for peptide de novo sequencing by tandem mass spectrometry. Rapid communications in mass spectrometry, 17(20), 2337-2342.",
        short: "Ma et al., 2003"
    },
    ncbi1: {
        full: "Sayers, E. W., Barrett, T., Benson, D. A., Bolton, E., Bryant, S. H., Canese, K., ... & Ye, J. (2011). Database resources of the national center for biotechnology information. Nucleic acids research, 39(suppl 1), D38-D51.",
        short: "Sayers et al., 2011"
    },
    ec: {
        full: "Webb, E. C. (1992). Enzyme nomenclature 1992. Recommendations of the Nomenclature Committee of the International Union of Biochemistry and Molecular Biology on the Nomenclature and Classification of Enzymes (No. Ed. 6). Academic Press.",
        short: "Webb, 1992"
    }
}
</script>

<style scoped>
li {
    line-height: 1.5 !important;
    padding-bottom: 8px;
}
</style>
