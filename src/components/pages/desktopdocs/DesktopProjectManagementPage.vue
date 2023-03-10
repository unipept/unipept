<template>
    <v-container>
        <h1 class="font-weight-light">
            Project Management
        </h1>
        <h3 class="font-weight-light mb-2">
            An important central concept in the Unipept Desktop application is the project. A project is a collection of
            studies and assays and can be used to organise a set of experiments that belong together.
        </h3>
        <header-body-card title="Overview" id="overview" class="mb-5">
            <p>
                Central to the working of Unipept Desktop is the concept of a project. A project is simply a collection
                of studies and assays and is physically represented on your hard disk as a folder containing a set of
                files and folders. All inputs and analysis results that belong to the project will be stored in this
                folder which means that analyses performed earlier can easily be reloaded and reused. Since all required
                information is stored in the project folder, these projects can also be shared with other researchers
                around the globe by simply sending them a copy of the project's folder.
            </p>

            <h3>Project structure</h3>
            <p>
                A project will always consists of a collection of studies that, in turn, contain a collection of assays.
                Each of these terms is defined in a specific way:
            </p>

            <ul>
                <li>
                    <span class="font-weight-bold">Project:</span>
                    A project is a collection of studies, and every study is a collection of assays. This terminology
                    adheres to the definitions found in the
                    <a href="https://isa-specs.readthedocs.io/en/latest/isatab.html">ISA-tab standard</a>.
                </li>
                <li>
                    <span class="font-weight-bold">Study:</span>
                    A study is a collection of assays that are somehow related. They, for example, all originate from
                    the same object under study. Every study needs to be uniquely named, no two studies with the same
                    name in one project can exist! The application will inform you of a conflict, should one arise.
                </li>
                <li>
                    <span class="font-weight-bold">Assay:</span>
                    An assay corresponds directly to a list of peptides and the configuration of search settings for
                    this assay. Note that a project can thus contain multiple assays with the same peptide content, but
                    with a different search configuration. Every assay should be uniquely named within a study. Assays
                    with the same name can only occur within one project, if they belong to different studies.
                </li>
            </ul>

            <h3 class="mt-3">Physical representation</h3>
            <p>
                As described above, a single project will correspond to one root folder on your hard drive and will
                always contain at least the following files and folders:
            </p>
            <ul>
                <li>
                    <span class="font-weight-bold">metadata.sqlite:</span>
                    This file is a SQLite-database that keeps track of the analysis results and metadata that belongs to
                    this project.
                </li>
                <li>
                    <span class="font-weight-bold">subfolder per study:</span> One folder per study is present. A
                    study's name is derived from the folder's name. The study's name in the application will change if
                    you change the name of this folder.
                    <ul>
                        <li>
                            <span class="font-weight-bold">file per assay:</span>
                            The study folder also contains one file per assay that belongs to this study. These files
                            end in the ".pep" extension and contain one peptide per line.
                        </li>
                    </ul>
                </li>
            </ul>
        </header-body-card>

        <header-body-card title="Managing projects" id="managing_projects" class="mb-5">
            <div class="d-flex justify-center ma-6" >
                <v-img
                    :src="require('@/assets/documentation/desktop/project_management/desktop_project_management_overview.png')"
                    max-width="800"
                    contain
                    eager
                    class="screenshot" />
            </div>
            <p>
                The project management page is the central hub for managing projects. It allows you to create new
                projects, open existing projects, and delete projects. The project management page is the first page
                that you will see when you start the application and will also be shown whenever you click on the
                &quot;home&quot; button in the sidebar.
            </p>

            <h3>The demo project</h3>
            <p>
                If this is the first time that you are using the application, it is recommended that you start by
                opening the demo project and browse between the different features and pages of the app. The demo
                project contains some studies and pre-loaded assays that showcase most capabilities of Unipept. In order
                to open the demo project, click on the blue &quot;Open demo project&quot; button on the home page.
            </p>

            <h3>Creating a project</h3>
            <p>
                To create a new project, click on the &quot;Create new project&quot; button on the home page. This
                will open a dialog that allows you to select an empty folder on your hard drive where you want
                the project to live. If the folder you selected already contains contents, the application will
                display an error.
            </p>

            <h3>Opening a project</h3>
            <p>
                A list of the most recently created and opened projects is always shown on the home page. The simplest
                way of opening a project is to simply click on one of the items in this list. If, however, you decide
                to continue with a project that you have not opened for a while (or that has been downloaded from
                an external source), you should manually look for it on your hard drive. To do so, click on the blue
                text &quot;Open a project that's not shown in this list&quot; and select the wanted folder in the
                dialog that pops up.
            </p>
        </header-body-card>
    </v-container>
</template>

<script setup lang="ts">
import HeaderBodyCard from "@/components/cards/HeaderBodyCard.vue";
</script>

<style scoped>

</style>
