<template>
    <v-container>
        <static-alert
            class="mt-5"
            title="Getting started with UMGAP"
        >
            <p>
                Go from a paired-end <initialism>FASTQ</initialism> sample to an interactive visualisation in 7 simple commands.
            </p>

            <boxed class="text-black">
                <sentinel>$</sentinel> git clone https://github.com/unipept/umgap.git && cd umgap # download source code
                <br><sentinel>$</sentinel> cargo install --path . # install UMGAP
                <br><sentinel>$</sentinel> git clone https://github.com/unipept/FragGeneScanPlusPlus.git FGSpp # download gene predictor
                <br><sentinel>$</sentinel> cd FGSpp && make && cd .. # install gene predictor
                <br><sentinel>$</sentinel> ./scripts/umgap-setup.sh -f FGSpp # interactive setup
                <br><sentinel>$</sentinel> ./scripts/umgap-analyse.sh -1 A1.fq -2 A2.fq -t tryptic-precision -o results.fa # run analysis
                <br><sentinel>$</sentinel> ./scripts/umgap-visualize.sh -i results.fa -u # get interactive results
            </boxed>
        </static-alert>

        <h1 class="font-weight-light">
            <initialism>UMGAP</initialism> documentation
        </h1>
        <h3 class="font-weight-light">
            Use the Unipept MetaGenomics Analysis Pipeline to assign taxonomic labels to your shotgun metagenomics reads. The results
            are available as taxonomic frequency tables and interactive visualizations.
        </h3>

        <p class="mt-5">
            The <initialism>UMGAP</initialism> is a collection of command line tools. Combine them into your own pipeline to identify
            (short) shotgun metagenomics reads guided by our <RLink to="/umgap/casestudies" router>case studies</RLink>, or use one of the
            preconfigured pipelines. After each read is assigned a taxon, collect the results in frequency tabels and interactive
            visualizations. With communication via <i>standard input</i> and <i>standard output</i>, and an easy to understand,
            consistent intermediate format, it's easy to plug your own extensions into the pipeline.
        </p>

        <ul>
            <li><b><initialism>UMGAP</initialism> High Precision</b>: Optimized for high precision identifications on your metagenomics reads.</li>
            <li><b><initialism>UMGAP</initialism> Max Precision</b>: Optimized for highest precision, with a small setback on sensitivity.</li>
            <li><b><initialism>UMGAP</initialism> Tryptic Precision</b>: Made for fast analyses on your laptop. Fewer results, but accurate.</li>
            <li><b><initialism>UMGAP</initialism> High Sensitivity</b>: Optimized for high sensitivity identifications on metagenomics reads.</li>
            <li><b><initialism>UMGAP</initialism> Max Sensitivity</b>: Optimized for highest sensitivity, with a small setback on precision.</li>
            <li><b><initialism>UMGAP</initialism> Tryptic Sensitivity</b>: Made for fast analyses on your laptop. Get a quick overview of your data.</li>
        </ul>

        <p class="mt-3">
            Throughout this documentation, the term peptides is used for both tryptic peptides and k-mers. The term taxon ID refers to an
            identifier of an NCBI taxonomy (which should be the same version in the whole pipeline).
        </p>

        <p>
            The UMGAP is free and open-source software under the MIT License and all code is available on <RLink to="https://github.com/unipept/umgap">Github</RLink>.
            In case you have encountered an issue using these tools, have feature requests or found a bug, don't hesitate to contact us
            by email (<RLink to="unipept@ugent.be" mail>unipept@ugent.be</RLink>), or create an <RLink to="https://github.com/unipept/umgap/issues">issue</RLink> on Github.
        </p>

        <header-body-card
            id="functionality"
            title="UMGAP functionality"
            class="mt-5"
            large-title
        >
            <v-table>
                <thead>
                    <tr>
                        <th class="text-start">
                            Resource
                        </th>
                        <th class="text-start">
                            Description
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="item in functions"
                        class="clickable"
                        :key="item.resource"
                        @click="navigate(item.link)"
                    >
                        <td>
                            <b>{{ item.resource }}</b>
                        </td>
                        <td class="py-3">
                            {{ item.description }}
                        </td>
                    </tr>
                </tbody>
            </v-table>
        </header-body-card>

        <header-body-card
            id="installation"
            title="Installation"
            class="mt-5"
            large-title
        >
            <p>
                To use <initialism>UMGAP</initialism>, Rust needs to be installed on your system. We recommend the lastest version,
                but all versions since Rust 1.35 are supported. To check if you have the correct Ruby version installed, open a terminal
                and run <inline-code>rustc --version</inline-code>.
            </p>

            <boxed>
                <sentinel>$</sentinel> rustc --version
                <br>rustc 1.42.0
            </boxed>

            <static-alert
                class="mt-5"
                title="Installing Rust"
            >
                <p>
                    If the <inline-code>rustc --version</inline-code> command returns <i>command not found</i>, Rust is not yet installed on your system. More
                    information on installing Rust can be found at <RLink to="https://www.rust-lang.org/tools/install">https://www.rust-lang.org/tools/install</RLink>.
                </p>
            </static-alert>

            <p>
                The next step is to download the UMGAP source code. The easiest way to do this, is by cloning our git repository using
                <inline-code>git clone https://github.com/unipept/umgap.git</inline-code>. Alternatively, you can also click the download button on
                <RLink to="https://github.com/unipept/umgap">Github</RLink>.
            </p>

            <p>
                Next, we're ready to compile and install <initialism>UMGAP</initialism>. First navigate to the directory where you cloned
                or downloaded the code, then run <inline-code>cargo install --path .</inline-code>. The output should look like this:
            </p>

            <boxed>
                <sentinel>$</sentinel> <b>cargo install --path .</b>
                <br>Installing umgap v0.3.5 (/Users/unipept/Downloads/umgap)
                <br> Updating crates.io index
                <br>Downloaded num-traits v0.2.11
                <br>Downloaded error-chain v0.12.2
                <br> ...
                <br>Compiling structopt v0.3.13
                <br>Compiling umgap v0.3.5 (/Users/bart/Downloads/umgap)
                <br>Finished release [optimized] target(s) in 1m 50s
                <br>Installed package `umgap v0.3.5 (/Users/unipept/Downloads/umgap)` (executable `umgap`)
                <br>warning: be sure to add `/Users/unipept/.cargo/bin` to your PATH to be able to run the installed binaries
            </boxed>

            <p>
                <initialism>UMGAP</initialism> should now be installed to the <inline-code>~/.cargo/bin</inline-code> directory. To access it
                everywhere, be sure to add it to your <inline-code>$PATH</inline-code>.
            </p>

            <p>
                After successful installation, the <initialism>UMGAP</initialism> command should be available. To check if it was
                installed correctly, run <inline-code>umgap --version</inline-code>. This should print the version number:
            </p>

            <boxed>
                <sentinel>$</sentinel> umgap --version
                <br>umgap 0.3.5
            </boxed>

            <p>
                More information about the installed command can be found on these pages, or by running the <inline-code>umgap --help</inline-code> command.
            </p>
        </header-body-card>

        <header-body-card
            id="updates"
            title="Updates"
            class="mt-5"
            large-title
        >
            <p>
                To update <initialism>UMGAP</initialism>, simply repeat the install instructions and be sure to redownload the source code. The
                changes between releases are listed in the <RLink to="/news/umgap" router>changelog</RLink>.
            </p>
        </header-body-card>

        <header-body-card
            id="configuration"
            title="Configuration"
            class="mt-5"
            large-title
        >
            <p>
                If you want to use FragGeneScanPlusPlus as gene predictor, this needs to be installed as well. Instructions can be
                found at <RLink to="https://github.com/unipept/FragGeneScanPlusPlus">https://github.com/unipept/FragGeneScanPlusPlus</RLink>.
            </p>

            <p>
                Run the configuration script at <inline-code>scripts/umgap-setup.sh</inline-code> to interactively configure <initialism>UMGAP</initialism>
                and download the data files required for some steps of the pipeline.
            </p>

            <p>
                Depending on which type of analysis you are planning, you will need the tryptic index file (less powerfull, but runs on
                any decent laptop) and the 9-mer index file (uses about 100GB disk space for storage and as much RAM during operation.
                The exact size depends on the version.)
            </p>

            <p>
                To check if the configuration was successful, you can run a sample analysis with some include test data. The following
                command should show you a <initialism>FASTA</initialism>-like file with a taxon ID per header.
            </p>

            <boxed>
                <sentinel>$</sentinel> ./scripts/umgap-analyse.sh -1 testdata/A1.fq -2 testdata/A2.fq -t tryptic-sensitivity -o - | tee output.fa
            </boxed>
        </header-body-card>
    </v-container>
</template>

<script setup lang="ts">
import Initialism from '@/components/highlights/Initialism.vue';
import StaticAlert from '@/components/alerts/StaticAlert.vue';
import Boxed from '@/components/highlights/Boxed.vue';
import Sentinel from '@/components/highlights/Sentinel.vue';
import RLink from '@/components/highlights/ResourceLink.vue';
import HeaderBodyCard from '@/components/cards/HeaderBodyCard.vue';
import InlineCode from '@/components/highlights/InlineCode.vue';
import useNavigation from "@/composables/useNavigation";

const { navigate } = useNavigation();

const functions = [
    {
        resource: "fastq2fasta",
        description: "Interleaves a number of FASTQ files into a single FASTA output",
        link: "/umgap/fastq2fasta"
    },
    {
        resource: "translate",
        description: "Translates DNA into Amino Acid Sequences",
        link: "/umgap/translate"
    },
    {
        resource: "prot2tryp",
        description: "Splits each protein sequence in a FASTA format into a list of (tryptic) peptides",
        link: "/umgap/prot2tryp"
    },
    {
        resource: "prot2kmer",
        description: "Splits each protein sequence in a FASTA format into a list of kmers",
        link: "/umgap/prot2kmer"
    },
    {
        resource: "filter",
        description: "Filter peptides in a FASTA format based on specific criteria",
        link: "/umgap/filter"
    },
    {
        resource: "pept2lca",
        description: "Looks up each line of input in a given FST index and outputs the result. Lines starting with a '>' are copied. Lines for which no mapping is found are ignored",
        link: "/umgap/pept2lca"
    },
    {
        resource: "prot2tryp2lca",
        description: "Reads all the records in a specified FASTA file and queries the tryptic peptides in an FST for the LCAs",
        link: "/umgap/prot2tryp2lca"
    },
    {
        resource: "prot2kmer2lca",
        description: "Reads all the records in a specified FASTA file and queries the k-mers in an FST for the LCAs",
        link: "/umgap/prot2kmer2lca"
    },
    {
        resource: "bestof",
        description: "Pick the frame with the most none-root hits",
        link: "/umgap/bestof"
    },
    {
        resource: "seedextend",
        description: "Seed and extend",
        link: "/umgap/seedextend"
    },
    {
        resource: "uniq",
        description: "Concatenates the data strings of all consecutive FASTA entries with the same header",
        link: "/umgap/uniq"
    },
    {
        resource: "taxa2agg",
        description: "Aggregates taxa to a single taxon",
        link: "/umgap/taxa2agg"
    },
    {
        resource: "snaptaxon",
        description: "Snap taxa to a specified rank or one of the specified taxa",
        link: "/umgap/snaptaxon"
    },
    {
        resource: "taxa2freq",
        description: "Count and report on a list of taxon IDs",
        link: "/umgap/taxa2freq"
    },
    {
        resource: "taxa2tree",
        description: "Visualizes the given list of taxons using the Unipept API",
        link: "/umgap/taxa2tree"
    },
    {
        resource: "taxonomy",
        description: "Show taxonomy info",
        link: "/umgap/taxonomy"
    },
    {
        resource: "splitkmers",
        description: "Splits each protein sequence in a CSV format into a list of kmers",
        link: "/umgap/splitkmers"
    },
    {
        resource: "joinkmers",
        description: "Groups a CSV by equal first fields (k-mers) and aggregates the second fields (taxon IDs)",
        link: "/umgap/joinkmers"
    },
    {
        resource: "buildindex",
        description: "Write an FST index of stdin on stdout",
        link: "/umgap/buildindex"
    },
    {
        resource: "printindex",
        description: "Print the values in an FST index to stdout",
        link: "/umgap/printindex"
    },
];
</script>
