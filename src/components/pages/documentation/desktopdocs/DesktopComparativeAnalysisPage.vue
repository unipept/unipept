<template>
    <v-container>
        <h1 class="font-weight-light">
            Comparative Analysis
        </h1>
        <h3 class="font-weight-light mb-2">
            Select features and compare them within a single assay or over multiple assays.
        </h3>
        <header-body-card
            id="overview"
            title="Overview"
            class="mb-5"
            large-title
        >
            <div class="d-flex justify-center">
                <v-img
                    :src="DesktopComparisonOverviewImage"
                    max-width="800"
                    contain
                    eager
                    class="screenshot ma-6"
                />
            </div>

            <p>
                Unipept offers a powerful tool for comparing features over multiple assays or within a single assay.
                This tool can be used to gain insight into the shifts in population and function when studying multiple
                conditions or changing environmental parameters. Unipept allows you to construct an interactive heatmap
                that is highly configurable. On this page, we will guide you through the different steps that are
                required to construct such a heatmap.
            </p>
        </header-body-card>

        <header-body-card
            id="intra_assay_comparison"
            title="Intra-assay comparison"
            class="mb-5"
            large-title
        >
            <p>
                The intra-assay comparison component of Unipept Desktop allows you to compare different features with
                each other, within a single assay. This is useful when you want to compare the relative abundance of
                organisms or functions in the assay. Follow the steps below to start constructing your own inter-assay
                comparative heatmap.
            </p>

            <h3>Navigate to the heatmap wizard</h3>
            <p>
                First, make sure that you are situated on the &quot;Single assay analysis&quot; page. This page can be
                reached by clicking the second button in the sidebar (indicated by a single test tube). On the middle
                of the page, you will find all of the taxonomic analysis results of the assay. Click on the
                &quot;heatmap&quot; button, directly above the visualizations, to navigate to the heatmap wizard.
            </p>
            <div class="d-flex justify-center">
                <v-img
                    :src="DesktopComparisonIntraAssayOverviewImage"
                    max-width="800"
                    contain
                    eager
                    class="screenshot ma-6"
                />
            </div>

            <h3>Select a data source for the horizontal axis</h3>
            <p>
                A heatmap always consists of two axes. For the single-assay comparison, you are free to chose what you
                want to compare with each other and you are thus required to select a set of features for each axis
                individually. The first step is to select a data source for the horizontal axis. This can be either a
                collection of features from taxonomic or functional origin. First select a data source by clicking on
                the first dropdown (labeled by &quot;Horizontal data source&quot;), then tick the checkbox in front of
                the features you want to include in the heatmap.
            </p>

            <v-alert
                color="info"
                variant="outlined"
            >
                <span class="font-weight-bold">Remark:</span>
                Ticking the &quot;select all&quot; checkbox on the top left of the selection table will only select
                all features on the current page. A button that allows you to select
                <span class="font-weight-bold">all</span> features of this data source will appear once you have
                selected at least one feature.
            </v-alert>

            <p>
                After you're done selecting the features for the horizontal axis, click on the &quot;next&quot; button.
                The wizard will now automatically navigate to the next step.
            </p>

            <h3>Select a data source for the vertical axis</h3>
            <p>
                The second step in the wizard is identical to the first step and consists of picking features for the
                vertical heatmap axis. Select a distinct set of features for the vertical axis in order to construct
                a useful heatmap visualization.
            </p>

            <h3>Pick a normalization type</h3>
            <p>
                The last step of the heatmap construction wizard consists of selecting the appropriate normalization
                type. You can choose between the following options:
            </p>

            <ul>
                <li>
                    <span class="font-weight-bold">All:</span> compute the largest values over all cells in the heatmap
                    and normalize all cells according to this one value.
                </li>
                <li>
                    <span class="font-weight-bold">Rows:</span> compute the largest value for each row in the heatmap
                    and normalize all cells on a row-by-row basis. The relative values between distinct rows can not
                    directly be compared in this case (but values within one row can).
                </li>
                <li>
                    <span class="font-weight-bold">Columns:</span> compute the largest vlaue for each column in the
                    heatmap and normalize all cells on a column-by-column basis. The relative vales between distinct
                    columns can not directly be compared in this case (but values within one column can).
                </li>
            </ul>

            <p>
                After you're done, click the &quot;next&quot; button once again. The heatmap that you have constructed
                should appear now.
            </p>

            <div class="d-flex justify-center">
                <v-img
                    :src="DesktopComparisonIntraAssayResultImage"
                    max-width="800"
                    contain
                    eager
                    class="screenshot ma-6"
                />
            </div>
        </header-body-card>

        <header-body-card
            id="inter_assay_comparison"
            title="Inter-assay comparison"
            class="mb-5"
        >
            <p>
                The inter-assay comparison component of Unipept Desktop allows you to compare different features over
                multiple assays and investigate how the relative abundance of organisms or functions changes between
                different conditions of an experiment. Follow the steps below to start construction your own intra-assay
                comparative heatmap visualization.
            </p>

            <h3>Assay selection</h3>
            <p>
                The first step in the process of constructing a heatmap consists of selecting a collection of assays for
                which you want to compare features. You can select as many assays as you'd like, but note that
                computation time will go up with the number of assays you select. You can select an assay by clicking
                the little checkbox in front of the assay item in the project explorer, or you can select multiple
                assays at once by clicking the checkbox in front of the study name (also in the project explorer, on the
                left side of the window).
            </p>
            <div class="d-flex justify-center">
                <v-img
                    :src="DesktopComparisonProjectExplorerImage"
                    max-width="800"
                    contain
                    eager
                    class="screenshot"
                />
            </div>


            <h3>Data source selection</h3>
            <p>
                Once you have selected a collection of assays that you want to include in the comparison, you need to
                choose a set of features that you want to compare between the different assays. A data source is one of
                the following:
            </p>

            <ul>
                <li>
                    <span class="font-weight-bold">NCBI Taxonomy:</span> choose from a list of all organisms that are
                    identified in the selected assays.
                </li>
                <li>
                    <span class="font-weight-bold">Gene Ontology:</span> choose from a list of all Gene Ontology terms
                    that are identified in the selected assays.
                </li>
                <li>
                    <span class="font-weight-bold">Enzyme Commission:</span> choose from a list of all Enzyme Commission
                    numbers that are identified in the selected assays.
                </li>
                <li>
                    <span class="font-weight-bold">InterPro:</span> choose from a list of all InterPro-entries that are
                    identified in the selected assays.
                </li>
            </ul>

            <v-alert
                color="info"
                variant="outlined"
                class="mt-2"
            >
                <span class="font-weight-bold">Remark:</span>
                Please note that you can only compare features from one datasource at a time. It's not possible to
                mix features from distinct data sources and visualize them at the same time in the heatmap.
            </v-alert>

            <h3>Normalization</h3>
            <p>
                The second step required for the heatmap construction consists of choosing which type of normalization
                should be applied to the input data. There are three normalization types available:
            </p>

            <ul>
                <li>
                    <span class="font-weight-bold">All:</span> compute the largest values over all cells in the heatmap
                    and normalize all cells according to this one value.
                </li>
                <li>
                    <span class="font-weight-bold">Rows:</span> compute the largest value for each row in the heatmap
                    and normalize all cells on a row-by-row basis. The relative values between distinct rows can not
                    directly be compared in this case (but values within one row can).
                </li>
                <li>
                    <span class="font-weight-bold">Columns:</span> compute the largest vlaue for each column in the
                    heatmap and normalize all cells on a column-by-column basis. The relative vales between distinct
                    columns can not directly be compared in this case (but values within one column can).
                </li>
            </ul>

            <h3 class="mt-2">
                Visualization
            </h3>
            <p>
                Once all of the previous steps have properly been configured, the end result will be shown here. If
                everything goes well, you will be greeted by an interactive heatmap.
            </p>
            <div class="d-flex align-center flex-column">
                <v-img
                    :src="DesktopComparisonHeatmapImage"
                    max-width="800"
                    contain
                    eager
                    class="ma-6"
                />
                <div>
                    <span class="font-weight-bold">Figure 2:</span>
                    an example of a heatmap constructed using the inter-assay comparative pipeline of the Unipept
                    Desktop application.
                </div>
            </div>
        </header-body-card>
    </v-container>
</template>

<script setup lang="ts">
import HeaderBodyCard from "@/components/cards/HeaderBodyCard.vue";
import DesktopComparisonOverviewImage from "@/assets/documentation/desktop/comparative_analysis/desktop_comparison_overview.png";
import DesktopComparisonIntraAssayOverviewImage from '@/assets/documentation/desktop/comparative_analysis/desktop_comparison_intra_assay_overview.png';
import DesktopComparisonIntraAssayResultImage from '@/assets/documentation/desktop/comparative_analysis/desktop_comparison_intra_assay_result.png'
import DesktopComparisonProjectExplorerImage from '@/assets/documentation/desktop/comparative_analysis/desktop_comparison_project_explorer.png';
import DesktopComparisonHeatmapImage from '@/assets/documentation/desktop/comparative_analysis/desktop_comparison_heatmap.png';

</script>

<style scoped>

</style>
