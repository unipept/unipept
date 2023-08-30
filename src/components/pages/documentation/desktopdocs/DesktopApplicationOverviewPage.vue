<template>
    <v-container>
        <h1 class="font-weight-light">
            Application overview
        </h1>
        <h3 class="font-weight-light mb-2">
            This document provides a quick overview and explanation of the main application window and how this is
            composed of smaller components.
        </h3>
        <header-body-card
            id="application_window"
            title="Application window"
            class="mb-5"
            large-title
        >
            <div class="d-flex justify-center ma-5">
                <v-img
                    :src="DesktopApplicationStructureImage"
                    max-width="800"
                    contain
                    class="screenshot"
                />
            </div>
            <p>
                The application window will always consists of two main parts. On the far left (depicted in red in the
                screenshot), you will find the sidebar. The sidebar is always visible and can be used to navigate
                between the different windows of this application (each corresponding to a specific feature or
                functionality). On the right (depicted in purple in the screenshot) the main content view is located.
                This is the part of the application that will change depending on the selected tab in the sidebar.
            </p>
        </header-body-card>

        <header-body-card
            id="sidebar"
            title="Sidebar"
            large-title
        >
            <p>
                Below you will find a short overview of all buttons that are present in the sidebar and what the
                associated functionality of these buttons is. Dedicated documentation pages are available for each of
                the functions / components described below.
            </p>

            <h3 class="mb-1">
                Home
            </h3>
            <v-row>
                <v-col
                    sm="2"
                    md="1"
                >
                    <v-img
                        :src="DesktopHomeButtonImage"
                        max-width="50"
                        :cover="false"
                        class="mr-2"
                    />
                </v-col>
                <v-col
                    sm="10"
                    md="11"
                >
                    <div>
                        The homepage of the application is dedicated to project management. Everytime you want to switch
                        between projects, create a new project, or open an existing one, you will have to go back to this
                        page.
                    </div>
                </v-col>
            </v-row>

            <h3 class="mt-4 mb-1">
                Single assay analysis
            </h3>

            <v-row>
                <v-col
                    sm="2"
                    md="1"
                    class="d-flex align-center"
                >
                    <v-img
                        :src="DesktopSingleAnalysisButtonImage"
                        max-width="50"
                        :cover="false"
                        class="mr-2"
                    />
                </v-col>
                <v-col
                    sm="10"
                    md="11"
                >
                    <div>
                        In order to analyse individual samples (and browse the analysis results), you will have to navigate
                        to the &quot;single assay analysis&quot; page. This page allows you to manage the contents of your
                        project, manage studies and assays and browse the results of the analyses that were performed
                        earlier.
                    </div>
                </v-col>
            </v-row>

            <h3 class="mt-4 mb-1">
                Inter-assay comparative analysis
            </h3>

            <v-row>
                <v-col
                    sm="2"
                    md="1"
                    class="d-flex align-center"
                >
                    <v-img
                        :src="DesktopComparativeButtonImage"
                        max-width="50"
                        :cover="false"
                        class="mr-2"
                    />
                </v-col>
                <v-col
                    sm="10"
                    md="11"
                >
                    <div>
                        Unipept Desktop allows you to compare features between distinct samples. By navigating to the
                        &quot;inter-assay comparative analysis&quot; page, you can select multiple samples in the project
                        explorer view on the left and a set of features that should be compared between these samples. After
                        properly selecting and configuring all settings on this page, an interactive heatmap visualization
                        will automatically be generated.
                    </div>
                </v-col>
            </v-row>

            <h3 class="mt-4 mb-1">
                Tryptic peptide analysis
            </h3>

            <v-row>
                <v-col
                    sm="2"
                    md="1"
                    class="d-flex align-center"
                >
                    <v-img
                        :src="DesktopSinglePeptideButtonImage"
                        max-width="50"
                        :cover="false"
                        class="mr-2"
                    />
                </v-col>
                <v-col
                    sm="10"
                    md="11"
                >
                    <div>
                        All analysis types that have been described above require a project to be loaded. They perform a
                        specific analysis on a set of peptides and aggregate the results. In contrast, the &quot;tryptic
                        peptide analysis&quot; page allows you to perform a specific analysis on a single peptide. This
                        component type generates a report with all information that is known about a single tryptic peptide
                        and produces a list of all proteins that match with this peptide, as well as a taxonomic and
                        functional annotation.
                    </div>
                </v-col>
            </v-row>

            <h3 class="mt-4 mb-1">
                Targeted database management
            </h3>

            <v-row>
                <v-col
                    sm="2"
                    md="1"
                    class="d-flex align-center"
                >
                    <v-img
                        :src="DesktopDatabaseButtonImage"
                        max-width="50"
                        :cover="false"
                        class="mr-2"
                    />
                </v-col>
                <v-col
                    sm="10"
                    md="11"
                >
                    <div>
                        If you want to construct, delete or modify a targeted protein reference database (for use with the
                        metaproteomics analysis pipeline), you need to navigate to the
                        &quot;targeted database management&quot; page. This page will provide you with a list of all
                        available databases, their current construction status and a handy wizard that will guide you
                        through the database construction process.
                    </div>
                </v-col>
            </v-row>

            <h3 class="mt-4 mb-1">
                Settings
            </h3>

            <v-row>
                <v-col
                    sm="2"
                    md="1"
                    class="d-flex align-center"
                >
                    <v-img
                        :src="DesktopSettingsButtonImage"
                        max-width="50"
                        :cover="false"
                        class="mr-2"
                    />
                </v-col>
                <v-col
                    sm="10"
                    md="11"
                >
                    <div>
                        The behaviour of the Unipept Desktop application can be finetuned in a lot of cases. All available
                        configuration options can be configured on the &quot;settings&quot; page. Some examples of this are
                        the location of the Unipept Desktop application data directory, configuration settings for
                        communication between Unipept and the local Docker Daemon, etc.
                    </div>
                </v-col>
            </v-row>
        </header-body-card>
    </v-container>
</template>

<script setup lang="ts">
import HeaderBodyCard from "@/components/cards/HeaderBodyCard.vue";
import DesktopApplicationStructureImage from '@/assets/documentation/desktop/application_overview/desktop_application_structure.png';
import DesktopHomeButtonImage from '@/assets/documentation/desktop/application_overview/desktop_home_button.png';
import DesktopComparativeButtonImage from '@/assets/documentation/desktop/application_overview/desktop_comparative_button.png';
import DesktopSingleAnalysisButtonImage from '@/assets/documentation/desktop/application_overview/desktop_single_analysis_button.png';
import DesktopSinglePeptideButtonImage from '@/assets/documentation/desktop/application_overview/desktop_single_peptide_button.png';
import DesktopDatabaseButtonImage from '@/assets/documentation/desktop/application_overview/desktop_database_button.png';
import DesktopSettingsButtonImage from '@/assets/documentation/desktop/application_overview/desktop_settings_button.png';

</script>
