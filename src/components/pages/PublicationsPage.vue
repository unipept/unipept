<template>
    <v-container>
        <h1 class="font-weight-light">
            Publications
        </h1>
        <h3 class="font-weight-light">
            This page lists all Unipept peer-reviewed journal articles in reverse-chronological order.
        </h3>

        <publication-card
            class="mt-5"
            title="Biodiversity Analysis of Metaproteomics Samples with Unipept: A Comprehensive Tutorial"
            :authors='["Tim Van Den Bossche", "Pieter Verschaffelt", "Tibo Vande Moortele", "Peter Dawyndt", "Lennart Martens", "Bart Mesuere"]'
            journal="Protein Bioinformatics"
            year="2024"
            doi="doi.org/10.1007/978-1-0716-4007-4_11"
            google-scholar="https://scholar.google.com/scholar?cluster=6092631055419369067&hl=nl&as_sdt=0,5"
            :image="Publication2024Image"
        >
            <template #abstract>
                Metaproteomics has become a crucial omics technology for studying microbiomes.
                In this area, the Unipept ecosystem, accessible at https://unipept.ugent.be, has emerged as a valuable resource for analyzing metaproteomic data.
                It offers in-depth insights into both taxonomic distributions and functional characteristics of complex ecosystems.
                This tutorial explains essential concepts like Lowest Common Ancestor (LCA) determination and the handling of peptides with missed cleavages.
                It also provides a detailed, step-by-step guide on using the Unipept Web application and Unipept Desktop for thorough metaproteomics analyses.
                By integrating theoretical principles with practical methodologies, this tutorial empowers researchers with the essential knowledge and tools needed to fully utilize metaproteomics in their microbiome studies.
            </template>
        </publication-card>

        <publication-card
            class="mt-5"
            title="Unipept in 2024: Expanding Metaproteomics Analysis with Support for Missed Cleavages, Semi-Tryptic and Non-Tryptic Peptides"
            :authors='["Tibo Vande Moortele", "Bram Devlaminck", "Simon Van de Vyver", "Tim Van Den Bossche", "Lennart Martens", "Peter Dawyndt", "Bart Mesuere", "Pieter Verschaffelt"]'
            journal="BioRXiv"
            year="2024"
            doi="doi.org/10.1101/2024.09.26.615136"
            google-scholar="https://scholar.google.com/scholar?hl=nl&as_sdt=0%2C5&q=unipept+in+2024&btnG=&oq=unipe"
            :image="Publication2023Image"
        >
            <template #abstract>
                Unipept, a pioneering software tool in metaproteomics, has significantly advanced the analysis of complex ecosystems by facilitating both taxonomic and functional insights from environmental samples.
                From the onset, Unipept’s capabilities focused on tryptic peptides, utilizing the predictability and consistency of trypsin digestion to efficiently construct a protein reference database.
                However, the evolving landscape of proteomics and emerging fields like immunopeptidomics necessitate a more versatile approach that extends beyond the analysis of tryptic peptides.
                In this article, we present a significant update to the underlying index structure of Unipept, which is now powered by a Sparse Suffix Array index.
                This advancement enables the analysis of semi-tryptic peptides, peptides with missed cleavages, and non-tryptic peptides such as those encountered in other research fields such as immunopeptidomics (e.g. MHC- and HLA-peptides).
                This new index benefits all tools in the Unipept ecosystem such as the web application, desktop tool, API and command line interface.
                A benchmark study highlights significantly improved performance in handling missed cleavages, preserving the same level of accuracy.
            </template>
        </publication-card>

        <publication-card
            class="mt-5"
            title="Unipept Desktop 2.0: Construction of Targeted Reference Protein Databases for Metaproteogenomics Analyses"
            :authors='["Pieter Verschaffelt", "Alessandro Tanca", "Marcello Abbondio", "Tim Van Den Bossche", "Tibo Vande Moortele", "Peter Dawyndt", "Lennart Martens", "Bart Mesuere"]'
            journal="Journal of Proteome Research"
            year="2023"
            doi="doi.org/10.1021/acs.jproteome.3c00091"
            google-scholar="https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&as_ylo=2023&q=Unipept+Desktop+2.0%3A+construction+of+targeted+reference+protein+databases+for+proteogenomics+analyses&btnG="
            :image="Publication2023Image"
        >
            <template #abstract>
                Unipept Desktop 2.0 is the most recent iteration of the Unipept Desktop tool that adds support for the analysis 
                of proteogenomics datasets. Unipept Desktop now supports the automatic construction of targeted protein reference 
                databases that only contain proteins associated with a predetermined list of taxa. This improves both the 
                taxonomic and functional resolution of a metaproteomic analysis and yields several technical advantages. By 
                limiting the proteins present in a reference database, it is now also possible to perform (meta)proteogenomics 
                analyses. Since the protein reference database now lives on the user's local machine, they have complete control 
                over the database used during an analysis. Data does no longer need to be transmitted over the internet, 
                decreasing the time required for an analysis and better safeguarding privacy sensitive data. As a proof of 
                concept, we present a case study in which a human gut metaproteome dataset is analyzed with Unipept Desktop 2.0 
                using different targeted databases based on matched 16S rRNA gene sequencing data.
            </template>
        </publication-card>

        <publication-card
            class="mt-5"
            title="Unipept Desktop: a faster, more powerful metaproteomics results analysis tool"
            :authors='["Pieter Verschaffelt", "Tim Van Den Bossche", "Lennart Martens", "Peter Dawyndt", "Bart Mesuere"]'
            journal="Journal of Proteome Research"
            year="2021"
            doi="doi.org/10.1021/acs.jproteome.0c00855"
            google-scholar="https://scholar.google.com/scholar?cluster=14287692748263471832&hl=nl&as_sdt=0,5"
            :image="Publication2021Image"
        >
            <template #abstract>
                Metaproteomics has become an important research tool to study microbial systems, which has resulted in increased
                metaproteomics data generation. However, efficient tools for processing the acquired data have lagged behind. One
                widely used tool for metaproteomics data interpretation is Unipept, a web-based tool that provides, among others,
                interactive and insightful visualizations. Due to its web-based implementation, however, the Unipept web application
                is limited in the amount of data that can be analyzed. In this manuscript we therefore present Unipept Desktop, a desktop
                application version of Unipept that is designed to drastically increase the throughput and capacity of metaproteomics
                data analysis. Moreover, it provides a novel comparative analysis pipeline and improves the organization of experimental
                data into projects, thus addressing the growing need for more efficient and versatile analysis tools for metaproteomics
                data.
            </template>
        </publication-card>

        <publication-card
            class="mt-5"
            title="Unipept CLI 2.0: adding support for visualizations and functional annotations"
            :authors='["Pieter Verschaffelt", "Philippe Van Thienen", "Tim Van Den Bossche", "Felix Van der Jeugt", "Caroline De Tender", "Lennart Martens", "Peter Dawyndt", "Bart Mesuere"]'
            journal="Bioinformatics"
            year="2020"
            doi="doi.org/10.1093/bioinformatics/btaa553"
            google-scholar="https://scholar.google.com/scholar?cluster=12996336077971755665&hl=nl&as_sdt=0,5"
            :image="Publication2020Image"
        >
            <template #abstract>
                Unipept is an ecosystem of tools developed for fast metaproteomics data-analysis consisting of a web application, a
                set of web services (application programming interface, <Initialism>API</Initialism>) and a command-line interface (<Initialism>CLI</Initialism>). After the successful
                introduction of version 4 of the Unipept web application, we here introduce version 2.0 of the <Initialism>API</Initialism> and <Initialism>CLI</Initialism>. Next to the
                existing taxonomic analysis, version 2.0 of the <Initialism>API</Initialism> and <Initialism>CLI</Initialism> provides access to Unipept’s powerful functional analysis
                for metaproteomics samples. The functional analysis pipeline supports retrieval of Enzyme Commission numbers, Gene
                Ontology terms and InterPro entries for the individual peptides in a metaproteomics sample. This paves the way for
                other applications and developers to integrate these new information sources into their data processing pipelines, which
                greatly increases insight into the functions performed by the organisms in a specific environment. Both the <Initialism>API</Initialism> and
                <Initialism>CLI</Initialism> have also been expanded with the ability to render interactive visualizations from a list of taxon ids. These
                visualizations are automatically made available on a dedicated website and can easily be shared by users.
            </template>
        </publication-card>

        <publication-card
            class="mt-5"
            title="Unipept 4.0: functional analysis of metaproteome data"
            :authors='["Robbert Gurdeep Singh", "Alessandro Tanca", "Antonio Palomba", "Felix Van der Jeugt", "Pieter Verschaffelt", "Sergio Uzzau", "Lennart Martens", "Peter Dawyndt", "Bart Mesuere"]'
            journal="Journal of Proteome Research"
            year="2019"
            doi="doi.org/10.1021/acs.jproteome.8b00716"
            google-scholar="https://scholar.google.be/scholar?cluster=10704911090193210592&hl=en&as_sdt=0,5"
            :image="Publication2019Image"
        >
            <template #abstract>
                Unipept is a web application for metaproteome data analysis, with an initial focus on tryptic-peptide-based biodiversity
                analysis of <Initialism>MS/MS</Initialism> samples. Because the true potential of metaproteomics lies in gaining insight into the expressed
                functions of complex environmental samples, the 4.0 release of Unipept introduces complementary functional analysis
                based on <Initialism>GO</Initialism> terms and <Initialism>EC</Initialism> numbers. Integration of this new functional analysis with the existing biodiversity analysis
                is an important asset of the extended pipeline. As a proof of concept, a human faecal metaproteome data set from 15
                healthy subjects was reanalyzed with Unipept 4.0, yielding fast, detailed, and straightforward characterization of
                taxon-specific catalytic functions that is shown to be consistent with previous results from a <Initialism>BLAST</Initialism>-based functional
                analysis of the same data.
            </template>
        </publication-card>

        <publication-card
            class="mt-5"
            title="High-throughput metaproteomics data analysis with Unipept: a tutorial"
            :authors='["Bart Mesuere", "Felix Van der Jeugt", "Toon Willems", "Tom Naessens", "Bart Devreese", "Lennart Martens", "Peter Dawyndt"]'
            journal="Journal of Proteomics"
            year="2018"
            extra="171, pp 11-22"
            doi="doi.org/10.1016/j.jprot.2017.05.022"
            google-scholar="https://scholar.google.be/scholar?cluster=6566003157091239958&hl=en&as_sdt=0,5"
            :image="Publication2018Image"
        >
            <template #abstract>
                In recent years, shotgun metaproteomics has established itself as an important tool to study the composition of complex
                ecosystems and microbial communities. Two key steps in metaproteomics data analysis are the inference of proteins from
                the identified peptides, and the determination of the taxonomic origin and function of these proteins. This tutorial
                therefore introduces the Unipept command line interface (<RLink
                    to="/clidocs"
                    router
                >
                    http://unipept.ugent.be/clidocs
                </RLink> )
                as a platform-independent tool for such metaproteomics data analyses. First, a detailed overview is given of the
                available Unipept commands and their functions. Next, the power of the Unipept command line interface is illustrated
                using two case studies that analyze a single tryptic peptide, and a set of peptides retrieved from a shotgun
                metaproteomics experiment, respectively. Finally, the analysis results obtained using these command line tools are
                compared with the interactive taxonomic analysis that is available on the Unipept website.
            </template>
        </publication-card>

        <publication-card
            class="mt-5"
            title="The unique peptidome: Taxon-specific tryptic peptides as biomarkers for targeted metaproteomics"
            :authors='["Bart Mesuere", "Felix Van der Jeugt", "Bart Devreese", "Peter Vandamme", "Peter Dawyndt"]'
            journal="Proteomics"
            year="2016"
            extra="16 (17), pp 2313–2318"
            doi="doi.org/10.1002/pmic.201600023"
            google-scholar="https://scholar.google.com/scholar?cluster=10033728957067620724&hl=en&as_sdt=0,5"
            :image="Publication2016bImage"
        >
            <template #abstract>
                The Unique Peptide Finder is an interactive web application to quickly hunt for tryptic peptides that are unique to a
                particular species, genus, or any other taxon. Biodiversity within the target taxon is represented by a set of proteomes
                selected from a monthly updated list of complete and nonredundant UniProt proteomes, supplemented with proprietary
                proteomes loaded into persistent local browser storage. The software computes and visualizes pan and core peptidomes as
                unions and intersections of tryptic peptides occurring in the selected proteomes. In addition, it also computes and
                displays unique peptidomes as the set of all tryptic peptides that occur in all selected proteomes but not in any UniProt
                record not assigned to the target taxon. As a result, the unique peptides can serve as robust biomarkers for the target
                taxon, for example, in targeted metaproteomics studies. Computations are extremely fast since they are underpinned by the
                Unipept database, the lowest common ancestor algorithm implemented in Unipept and modern web technologies that facilitate
                in-browser data storage and parallel processing.
            </template>
        </publication-card>

        <publication-card
            class="mt-5"
            title="Unipept Web Services for Metaproteomics Analysis"
            :authors='["Bart Mesuere", "Toon Willems", "Felix Van der Jeugt", "Bart Devreese", "Peter Vandamme", "Peter Dawyndt"]'
            journal="Bioinformatics"
            year="2016"
            extra="32 (11), pp 1746-1748"
            doi="doi.org/10.1093/bioinformatics/btw039"
            google-scholar="https://scholar.google.be/scholar?cluster=6023517943371055318&hl=en&as_sdt=0,5"
            :image="Publication2016aImage"
        >
            <template #abstract>
                Unipept is an open source web application that is designed for metaproteomics analysis with a focus on interactive
                datavisualization. It is underpinned by a fast index built from UniProtKB and the <Initialism>NCBI</Initialism> taxonomy that enables quick
                retrieval of all UniProt entries in which a given tryptic peptide occurs. Unipept version 2.4 introduced web services
                that provide programmatic access to the metaproteomics analysis features. This enables integration of Unipept
                functionality in custom applications and data processing pipelines. Availability and Implementation The web services
                are freely available at <RLink to="http://api.unipept.ugent.be">
                    http://api.unipept.ugent.be
                </RLink>> and are open
                sourced under the <Initialism>MIT</Initialism> license.
            </template>
        </publication-card>

        <publication-card
            class="mt-5"
            title="The Unipept Metaproteomics Analysis Pipeline"
            :authors='["Bart Mesuere", "Griet Debyser", "Maarten Aerts", "Bart Devreese", "Peter Vandamme", "Peter Dawyndt"]'
            journal="Proteomics"
            year="2015"
            extra="15 (8), pp 1437–1442"
            doi="doi.org/10.1002/pmic.201400361"
            google-scholar="https://scholar.google.be/scholar?cluster=4081421507601531351&hl=en&as_sdt=0,5"
            :image="Publication2015Image"
        >
            <template #abstract>
                Unipept (<RLink
                    to="/"
                    router
                >
                    http://unipept.ugent.be
                </RLink>) is a web application that offers a user-friendly way to
                explore the biodiversity of complex metaproteome samples by providing interactive visualizations. In this article, the
                updates and changes to Unipept since its initial release are presented. This includes the addition of interactive
                sunburst and treeview visualizations to the multipeptide analysis, the foundations of an application programming
                interface (<Initialism>API</Initialism>) and a command line interface, updated data sources, and the open-sourcing of the entire application
                under the <Initialism>MIT</Initialism> license.
            </template>
        </publication-card>

        <publication-card
            class="mt-5"
            title="Unipept: Tryptic Peptide-Based Biodiversity Analysis of Metaproteome Samples"
            :authors='["Bart Mesuere", "Bart Devreese", "Griet Debyser", "Maarten Aerts", "Peter Vandamme", "Peter Dawyndt"]'
            journal="J. Proteome Res."
            year="2012"
            extra="11 (12), pp 5773–5780"
            doi="doi.org/10.1021/pr300576s"
            google-scholar="https://scholar.google.be/scholar?cluster=13083723326591523916&hl=en&as_sdt=2005&sciodt=0,5"
            :image="Publication2012Image"
        >
            <template #abstract>
                The Unipept web application (<RLink
                    to="/"
                    router
                >
                    http://unipept.ugent.be
                </RLink>) supports biodiversity analysis of
                large and complex metaproteome samples using tryptic peptide information obtained from shotgun <Initialism>MS/MS</Initialism> experiments. Its
                underlying index structure is designed to quickly retrieve all occurrences of a tryptic peptide in UniProt entries.
                Taxon-specificity of the tryptic peptide is successively derived from these occurrences using a novel lowest common
                ancestor approach that is robust against taxonomic misarrangements, misidentifications, and inaccuracies. Not taking
                into account this identification noise would otherwise result in drastic loss of information. Dynamic treemaps visualize
                the biodiversity of metaproteome samples, which eases the exploration of samples with highly complex compositions.
                The potential of Unipept to gain novel insights into the biodiversity of a sample is evaluated by reanalyzing publicly
                available metaproteome data sets taken from the bacterial phyllosphere and the human gut.
            </template>
        </publication-card>
    </v-container>
</template>

<script setup lang="ts">
import PublicationCard from '../cards/PublicationCard.vue';
import Initialism from '../highlights/Initialism.vue';
import RLink from '../highlights/ResourceLink.vue';
import Publication2024Image from '@/assets/publications-2024.jpg';
import Publication2023Image from '@/assets/publications-2023.jpg';
import Publication2021Image from '@/assets/publications-2021.jpg';
import Publication2020Image from '@/assets/publications-2020.jpg';
import Publication2019Image from '@/assets/publications-2019.jpg';
import Publication2018Image from '@/assets/publications-2018.jpg';
import Publication2016bImage from '@/assets/publications-2016b.jpg';
import Publication2016aImage from '@/assets/publications-2016a.jpg';
import Publication2015Image from '@/assets/publications-2015.jpg';
import Publication2012Image from '@/assets/publications-2012.jpg';

</script>
