<template>
    <v-container>
        <h1 class="font-weight-light">
            Case Study: Running a preconfigured metagenomics pipeline
        </h1>
        <h3 class="font-weight-light">
            This case study shows how to set up and run the preconfigured scripts of the <initialism>UMGAP</initialism> for the
            taxonomic analysis of a metagenomics dataset.
        </h3>

        <header-body-card
            class="mt-5"
            title="Introduction"
            large-title
        >
            <p>
                The Unipept Metagenomics Analysis Pipeline (<initialism>UMGAP</initialism>) is accompanied by 3 scripts:
                <inline-code>umgap-setup.sh</inline-code>, <inline-code>umgap-analyse.sh</inline-code> and <inline-code>umgap-visualize.sh</inline-code>. The setup script deals
                with downloading prebuilt databases and checking and linking external tools. The analyse script runs several analyses
                in sequence. The visualize script creates webpages from the results of the analyse script.
            </p>

            <p>
                The following pipelines are preconfigured:
            </p>

            <ul>
                <li><b><initialism>UMGAP</initialism> High Precision</b>: Optimized for high precision identifications on your metagenomics reads.</li>
                <li><b><initialism>UMGAP</initialism> Max Precision</b>: Optimized for highest precision, with a small setback on sensitivity.</li>
                <li><b><initialism>UMGAP</initialism> Tryptic Precision</b>: Made for fast analyses on your laptop. Fewer results, but accurate.</li>
                <li><b><initialism>UMGAP</initialism> High Sensitivity</b>: Optimized for high sensitivity identifications on metagenomics reads.</li>
                <li><b><initialism>UMGAP</initialism> Max Sensitivity</b>: Optimized for highest sensitivity, with a small setback on precision.</li>
                <li><b><initialism>UMGAP</initialism> Tryptic Sensitivity</b>: Made for fast analyses on your laptop. Get a quick overview of your data.</li>
            </ul>
        </header-body-card>

        <header-body-card
            class="mt-5"
            title="Setup"
            large-title
        >
            <p>
                The preconfigured pipelines require some databases and external tools. The setup script will help you to get these in
                the right place. In general, you only need to run this script once, but you can also use it to verify the file locations
                and download newer versions of the data. If you're planning to use the tryptic precision, tryptic sensitivity,
                high precision or max precision pipelines, you'll need to install <RLink to="https://github.com/unipept/FragGeneScanPlusPlus/">
                    FragGeneScan++
                </RLink>
                first. In this casestudy, we will use a tryptic pipeline, so we don't have to download the 9-mer index (~12GiB, rather
                than ~150GiB).
            </p>

            <p>
                Following code snippet shows the interaction with the setup script. It starts out by asking the relevant questions, without
                delay. At the end, it downloads the relevant files in sequence, without further interaction.
            </p>

            <boxed>
                <pre>
<sentinel>$</sentinel> umgap-setup.sh -f /opt/FragGeneScanPlusPlus
Use '/home/user/.config/unipept' as configuration directory? [y]/n y
Created directory /home/user/.config/unipept.
Found, tested and remembered the FragGeneScan++ location.
Use '/home/user/.local/share/unipept' as data directory? [y]/n y
Created directory /home/user/.local/share/unipept.
Checking the latest version on the server.
Latest version is 2020-12-02.

For any type of analysis, you need a taxonomony. For mapping tryptic or
9-mer peptides to it, you need the respective index file of the same
version.

Would you like to download the taxonomy from 2020-12-02 (115MiB)? [y]/n y
Would you like to download the tryptic index from 2020-12-02 (12GiB)? [y]/n y
Would you like to download the 9-mer index from 2020-12-02 (152GiB)? [y]/n n
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  114M  100  114M    0     0  6477k      0  0:00:18  0:00:18 --:--:-- 6332k
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   12G  100   12G    0     0  5076k      0  0:34:12  0:34:12 --:--:-- 5790k
</pre>
            </boxed>

            <p>
                To change where the setup script will store the configuration and downloaded files, add some of the options detailed
                below. If you're familiar with the setup script, or you're running the script within another script, you can add the
                <inline-code>-y</inline-code> flag to run without interaction.
            </p>

            <parameter-table
                class="my-3"
                :parameters="setupParameters"
            />
        </header-body-card>

        <header-body-card
            class="mt-5"
            title="Analysis"
            large-title
        >
            <p>
                When setup is complete, the analyse script will automatically use the downloaded databases and linked tools. The input
                data consists of a 100 paired-end reads sampled from a dataset generated by {{ references.lindgreen.short }} for their
                metabenchmark. With these paired-end reads in the <RLink
                    to="/A1.fq"
                    target="_blank"
                >
                    A1.fq
                </RLink> and
                <RLink
                    to="/A2.fq"
                    target="_blank"
                >
                    A2.fq
                </RLink> files, the commands are as follows.
            </p>

            <boxed>
                <sentinel>$</sentinel> head -4 A1.fq
                <br>@1198114###CP002480-_Acidobacteria_733918/1
                <br>ATCGCGCACGCGGCCGATGCCCCAGAAGAGATTGACAGCGGTGGGGCGGGCGGCGGCGAGGTGGTCGCAGATCTCGGCGACCTCTGCGTTGAGGGTCGGG
                <br>+
                <br>AADEGGAGIIEIHFHKHJKKJKHIJJIIKCJAHBFKKFHIJIF;JIH5DE$I>CBE$E:FGEJCGABEEECCDKD?D?C$ECEEE;CEEDEEAD=?ED$D
                <br><sentinel>$</sentinel> umgap-analyse.sh -1 A1.fq -2 A2.fq -t tryptic-precision -z -o tryptic-precision-output.fa.gz
                <br><sentinel>$</sentinel> zcat tryptic-precision-output.fa.gz | head -2
                <br>>1198114###CP002480-_Acidobacteria_733918/1_1_100_-
                <br>1
            </boxed>

            <p>
                It seems the pipeline cannot be more specific than root (Taxon ID 1) for the first read.
            </p>

            <p>
                If you used a non-default configuration directory for setup, you'll need to pass the same directory here, with the <inline-code>-c</inline-code>
                option. When running the pipeline on large samples, it may be useful to compress the output. Use the <inline-code>-z</inline-code> flag to
                <initialism>GZIP</initialism> the results. Should the input be <initialism>GZIP</initialism>-compressed, the script will detect
                this. Note that all arguments can be repeated to bundle multiple analysis, each series ending with a <inline-code>-o</inline-code> option.
            </p>

            <parameter-table
                class="my-3"
                :parameters="analysisParameters"
            />
        </header-body-card>

        <header-body-card
            class="mt-5"
            title="Visualize"
            large-title
        >
            <p>
                After analysis, you probably want to view the results. While the analyse script output format is easily parsed, you can
                also use the visualize script to create importable <initialism>CSV</initialism> frequency tables and interactive
                visualisations. The interactive visualisations can be stored locally or hosted online. The following snippet creates
                all three in turn.
            </p>

            <boxed>
                <sentinel>$</sentinel> umgap-visualize.sh -t -r phylum tryptic-precision-output.fa.gz
                <br>taxon id,taxon name,tryptic-precision-output.fa.gz
                <br>1117,Cyanobacteria,2
                <br>57723,Acidobacteria,4
                <br>201174,Actinobacteria,4
                <br>1224,Proteobacteria,5
                <br>1,root,160
                <br><sentinel>$</sentinel> umgap-visualize.sh -w tryptic-sensitivity-output.fa.gz > tryptic-sensitivity.html
                <br><sentinel>$</sentinel> umgap-visualize.sh -u tryptic-sensitivity-output.fa.gz
                <br>tryptic-sensitivity-output.fa.gz: <RLink to="https://bl.ocks.org/11b7809d6754b9530cf1a49d93a8d568">
                    https://bl.ocks.org/11b7809d6754b9530cf1a49d93a8d568
                </RLink>
            </boxed>

            <p>
                The <initialism>CSV</initialism> tables contain a record for each taxon found in the sample. A record contains, in
                order, the taxon ID, (for convenience) the taxon name and the number of reads assigned to this taxon or below. All
                records will be at the same specified taxon rank or at root (unidentified).
            </p>

            <parameter-table
                class="my-3"
                :parameters="visualizeParameters"
            />

            <image-caption-card
                class="mt-5"
                :image="CaseStudyUMGAPBasicImage"
            />
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
import Initialism from '@/components/highlights/Initialism.vue';
import ParameterTable from '@/components/tables/ParameterTable.vue';
import ImageCaptionCard from '@/components/cards/ImageCaptionCard.vue';
import CaseStudyUMGAPBasicImage from '@/assets/documentation/metagenomics/casestudy-umgap-basic.png';

const setupParameters = [
    { name: "-c dir", description: "Set a different configuration directory." },
    { name: "-f dir", description: "Link the location of your FragGeneScan installation." },
    { name: "-d dir", description: "Set a different location for downloading the database files. This can be on a separate disk." },
    { name: "-y", description: "Download all files of the latest version without asking for confirmation." }
];

const analysisParameters = [
    { name: "-c dir", description: "Set a different configuration directory." },
    { name: "-z", description: "Request compression of the output file." },
    { name: "-1 file", description: "Single ended FASTA or first pair-ended FASTQ input file, optionally compressed." },
    { name: "-2 file", description: "Second pair-ended FASTQ input file, optionally compressed." },
    { name: "-t", description: "Type of the analysis (high precision by default)." },
    { name: "-o file", description: "The output file." }
];

const visualizeParameters = [
    { name: "-t", description: "Output a CSV frequency table on species rank." },
    { name: "-w", description: "Output an HTML webpage of an interactive visualization." },
    { name: "-u", description: "Print a shareable URL to a online interactive visualisation." },
    { name: "-r rank", description: "Set the rank for the CSV frequency table (default: species)." }
]

const references = {
    lindgreen: {
        full: "Lindgreen, S., Adair, K. L., & Gardner, P. P. (2016). An evaluation of the accuracy and speed of metagenome analysis tools. Scientific reports, 6, 19233.",
        short: "Lindgreen et al. (2016)"
    }
}
</script>

<style scoped>
li {
    line-height: 1.5 !important;
    padding-bottom: 8px;
}
</style>
