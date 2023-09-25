<template>
    <v-container>
        <h1 class="font-weight-light">
            Unipept Desktop - Single Assay Analysis
        </h1>
        <h3 class="font-weight-light mb-2">
            Analyse individual metaproteomics samples and browser their taxonomic and functional composition.
        </h3>
        <header-body-card
            id="overview"
            title="Overview"
            class="mb-5"
            large-title
        >
            <div class="d-flex justify-center">
                <v-img
                    :src="DesktopSingleAssayAnalysisOverviewImage"
                    max-width="800"
                    :cover="false"
                    eager
                    class="screenshot ma-6"
                />
            </div>
            <p>
                The single assay analysis page provides you with the ability to analyse individual metaproteomics
                samples, browse all samples in a project and organize them within a project (into studies). This page
                consists of three main sections. The <span class="font-weight-bold">sidebar</span> on the far left,
                the <span class="font-weight-bold">project explorer</span> directly to the right of the sidebar and
                the <span class="font-weight-bold">content viewer</span>.
            </p>
            <p>
                The sidebar allows is the same throughout all pages of the application and allows you to switch
                between the different functions of the application. Directly to the right of the sidebar is the
                project explorer which provides a view on the contents of the current project. It allows you to create
                studies or assays and to switch between assays. The currently selected assay will be highlighted in
                blue and is the one for which the taxonomic and functional composition can be viewed in the content
                viewer on the right.
            </p>
        </header-body-card>
        <header-body-card
            id="analysing_assay"
            title="Analyse an assay"
            class="mb-5"
            large-title
        >
            <h3>Start by creating a study</h3>
            <p>
                In order to add a new assay to the current project, you first have to make sure that at least one
                study exists. An assay must be associated to a study at all times. If no study exists yet, you can
                create one by clicking on the <span class="font-weight-bold">Add study</span> button in the project
                explorer. You will notice that a new item appears in the project explorer with the name "Study name".
                This is simply the default name that is given to newly create studies and can easily be changed by
                either double-clicking the study or by right-clicking on the study item and selecting
                <span class="font-weight-bold">Rename study</span>.
            </p>

            <v-alert
                color="info"
                variant="outlined"
            >
                <span class="font-weight-bold">Remark:</span>
                Please note that each study and assay must have a unique name. No two studies in one project (or
                two assays in a study) can have the same name. This requirement will automatically be enforced by
                the application.
            </v-alert>

            <h3 class="mt-6">
                Adding one or more assays to a study
            </h3>
            <p>
                Once a study has been created, you can add a new assay by clicking the little file icon
                (<v-icon x-small>mdi-file-plus-outline</v-icon>) on the right side of the study name. A dialog
                will pop up (see Figure 1). This dialog allows you to create one (or more!) assays at once. If you
                click the <span class="font-weight-bold">Add assay</span> button, you will be prompted to choose between
                two options. The first option (<span class="font-weight-bold">Empty assay</span>) allows you to manually
                add a single assay. You will be required to paste a list of peptides into the text area that pops up
                and choose a suiting name for your new assay. The second option
                (<span class="font-weight-bold">Bulk import from files</span>) can be used when you have a large number
                of peptide files that need to be imported at once. In this case, a new assay entry will be added for
                each input file and the name of the assays will be deducted from the provided file name.
            </p>

            <div class="my-5">
                <v-img
                    :src="DesktopAddAssayDialogImage"
                    max-width="800"
                    :cover="false"
                    eager
                    class="screenshot ma-6"
                />
                <div>
                    <span class="font-weight-bold">Figure 1:</span> the assay creation dialog will guide you through
                    the process of adding one or more assays to your project.
                </div>
            </div>

            <v-alert
                color="info"
                variant="outlined"
                class="mb-4"
            >
                <span class="font-weight-bold">Remark:</span>
                Please note that the application only accepts text-based files containing one peptide per line. These
                files should end with the &quot;.txt;&quot; or &quot;.pep&quot; extension. If this is not the case, an
                error message will be displayed.
            </v-alert>

            <h3 class="mt-6">
                Configuring the assays before importing
            </h3>

            <div class="my-5">
                <v-img
                    :src="DesktopConfigureAssaysImage"
                    max-width="800"
                    :cover="false"
                    eager
                    class="screenshot ma-6"
                />
                <div>
                    <span class="font-weight-bold">Figure 2:</span> search settings for each of the new assays can also
                    be configured in the assay creation dialog.
                </div>
            </div>

            <p>
                It is important to note here that each assay can have its own search settings. These settings determine
                a set of parameters that influence the outcome of your metaproteomics analysis:
            </p>

            <ul>
                <li>
                    <span class="font-weight-bold">Equate I/L:</span> Since the amino acids isoleucine and leucine share
                    the same mass, they can be indistinguishable in a mass spectrometry experiment. By enabling this
                    setting, Unipept will treat isoleucine and leucine as the same amino acid.
                </li>
                <li>
                    <span class="font-weight-bold">Filter duplicates:</span> By enabling this setting, only unique
                    peptides will be retained. This means that if a peptide is found multiple times in the input file,
                    only one occurrence will be retained.
                </li>
                <li>
                    <span class="font-weight-bold">Advanced missed cleavage handling:</span> If not all input peptides
                    are tryptic peptides, you can enable this setting to allow for more peptides to be matched by
                    Unipept. Enabling this setting will cause the analysis time to increase, so it is recommended only
                    to use it when strictly necessary.
                </li>
                <li>
                    <span class="font-weight-bold">Analysis source:</span> The analysis source determines which
                    protein reference database is used for the analysis of the corresponding sample. You can choose
                    between Unipept's online services (which typically try to match the peptides against all proteins
                    in UniProtKB) or a local database (that typically contains only a subset of the proteins in
                    UniProtKB). Note that local databases can be constructed on the &quot;Targeted database
                    management&quot; page.
                </li>
            </ul>

            <p class="mt-2">
                Finally, click on <span class="font-weight-bold">Continue</span> to import the assays into the current
                project and start the metaproteomic analysis.
            </p>
        </header-body-card>

        <header-body-card
            id="taxonomic_analysis_results"
            title="Browse analysis results"
            large-title
        >
            <p>
                Once an analysis is finished, the main results are split into a taxonomic and a functional part. On top
                of the &quot;Single assay analysis&quot; page, you will directly see a summary of the analysis including
                some useful statistics. Directly underneath this summary is a card that shows all taxonomic analysis
                results and on the bottom is a third card that shows all functional analysis results.
            </p>

            <h3 class="mt-6">
                Taxonomic profile
            </h3>
            <p>
                In order to explore the taxonomic composition of a sample, users can browser through 4 different
                visualizations that each try to model the same information in a different way. This allows individual
                users to gain a deeper understanding of the organisms that are present in the sample. The tabs on top
                of the taxonomic profile card allow you to switch between the different visualizations.
            </p>

            <div class="my-5">
                <v-img
                    :src="DesktopTaxonomicAnalysisImage"
                    max-width="800"
                    :cover="false"
                    eager
                    class="screenshot ma-6"
                />
                <div>
                    <span class="font-weight-bold">Figure 3:</span> the taxonomic analysis of a metaproteomics sample
                    results in a set of interactive visualizations that can be used to explore the results.
                </div>
            </div>

            <h3 class="mt-6">
                Functional profile
            </h3>
            <p>
                The functional profile of a sample can be explored in the last card on this page. A functional summary
                is provided for all identified Gene Ontology terms, Enzyme Commission numbers and InterPro domains. You
                can switch between these distinct types of functional annotations by using the tabs on top of the
                functional card.
            </p>

            <div class="my-5">
                <v-img
                    :src="DesktopFunctionalAnalysisImage"
                    max-width="800"
                    contain
                    eager
                    class="screenshot ma-6"
                />
                <div>
                    <span class="font-weight-bold">Figure 4:</span> the functional analysis of a metaproteomics sample
                    results in a set of tables that allows users to explore the different functional domains.
                </div>
            </div>

            <h3 class="mt-6">
                Filtering by taxon
            </h3>
            <p>
                One of the key features of Unipept that distinguish it from other major metaproteomics analysis tools
                is it's ability to keep track of the link between taxa and functions in a sample. This allows Unipept
                to filter all functional annotations by a specific taxon which allows you to find out which functions
                are performed by which set of organisms in the environment under study. In order to perform such a
                filtering, you can click on any of the taxa in the taxonomic visualizations. If you, for example, click
                the &quot;Bacteria&quot; node in the sunburst, the functional profile below will only take into account
                bacterial taxa.
            </p>

            <div class="my-5">
                <v-img
                    :src="DesktopTaxonomicFilterImage"
                    max-width="800"
                    contain
                    eager
                    class="screenshot ma-6"
                />
                <div>
                    <span class="font-weight-bold">Figure 5:</span> if a taxonomic filter is active, a banner on top
                    of the page will be clearly displayed (and also allows you to reset the filter).
                </div>
            </div>
        </header-body-card>
    </v-container>
</template>

<script setup lang="ts">
import HeaderBodyCard from "@/components/cards/HeaderBodyCard.vue";
import DesktopSingleAssayAnalysisOverviewImage from '@/assets/documentation/desktop/single_assay_analysis/desktop_single_assay_analysis_overview.png';
import DesktopAddAssayDialogImage from '@/assets/documentation/desktop/single_assay_analysis/desktop_add_assay_dialog.png';
import DesktopConfigureAssaysImage from '@/assets/documentation/desktop/single_assay_analysis/desktop_configure_assays.png';
import DesktopTaxonomicAnalysisImage from '@/assets/documentation/desktop/single_assay_analysis/desktop_taxonomic_analysis.png';
import DesktopFunctionalAnalysisImage from '@/assets/documentation/desktop/single_assay_analysis/desktop_functional_analysis.png';
import DesktopTaxonomicFilterImage from '@/assets/documentation/desktop/single_assay_analysis/desktop_taxonomic_filter.png';

</script>

<style scoped>

</style>
