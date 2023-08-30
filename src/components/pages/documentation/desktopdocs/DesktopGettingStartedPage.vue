<template>
    <v-container>
        <h1 class="font-weight-light">
            Unipept Desktop documentation <small>v2.0.0</small>
        </h1>
        <h3 class="font-weight-light mb-2">
            The Unipept Desktop application allows, in contrast to the web application, to analyse much larger samples,
            to store analysis results offline, extensively compare assays with each other, better manage
            samples and perform proteogenomics data analyses using targeted protein reference databases.
        </h3>

        <header-body-card
            id="overview"
            title="Overview"
            class="mb-5"
            large-title
        >
            <div>
                <v-img
                    :src="DesktopOverviewImage"
                    contain
                    eager
                    class="screenshot ma-6"
                />
            </div>

            <p>
                Unipept's web application provides users with the ability to analyze a metaproteomics sample and extract
                taxonomic and functional information from environmental samples. Our web app provides interactive
                visualizations to researchers and allows them to, for example, filter out all functions that are
                associated with a specific taxon. Due to its inherent web-based nature, the size and amount of samples
                that can be analysed are rather limited.
            </p>
            <p>
                The Unipept Desktop application, however, is not limited in the amount of memory and storage that it can
                consume, allowing us to process datasets with much more peptides than before. This a list of all major
                differences between the Unipept desktop app and the web app:
            </p>
            <ul>
                <li>
                    <span class="font-weight-bold">Support for proteogenomics:</span> configure and construct your own
                    targeted protein reference databases that only contain a subset of all the proteins from the
                    UniProtKB resource.
                </li>
                <li>
                    <span class="font-weight-bold">Organise samples in studies and projects:</span> it's now easier than
                    ever to combine and organise samples into studies and projects. One project contains all information
                    required to reconstruct an experiment and can easily be shared with other researchers.
                </li>
                <li>
                    <span class="font-weight-bold">Analyse much larger samples:</span> since the desktop app is not
                    artificially limited in the amount of compute resources that it is allowed to use, it allows you to
                    analyse samples that contain much more peptides (when compared to the web app).
                </li>
                <li>
                    <span class="font-weight-bold">Improved inter- and intra-assay comparison pipeline:</span> the
                    desktop app provides an improved comparative analysis pipline that allows you to compare both
                    features within and between samples. This can help you to improve your insight in the functional
                    or taxonomic shift that might occur in an ecosystem over time.
                </li>
            </ul>

            <p>
                If you use our Unipept Desktop application, then please cite Verschaffelt et al. (2021) Journal of
                Proteome Research:
                <resource-link to="https://academic.oup.com/bioinformatics/article/32/11/1746/1742840?login=false">
                    doi:10.1093/bioinformatics/btw039
                </resource-link>
            </p>
        </header-body-card>
        <header-body-card
            id="download"
            title="Download"
            class="mb-5"
            large-title
        >
            <p>
                In order to use the Unipept Desktop Application, it needs to be installed first. You can always download
                the most recent version for your operating system from the releases on GitHub. Direct links for the
                different operating systems are also available (these links will always point to the most recent
                version):
            </p>
            <v-row dense>
                <v-col
                    sm="12"
                    md="4"
                >
                    <v-btn
                        style="width: 100%;"
                        color="primary"
                        prepend-icon="mdi-microsoft-windows"
                        href="https://github.com/unipept/unipept-desktop/releases/latest/download/Unipept-Desktop-x64.exe"
                    >
                        Download for Windows
                    </v-btn>
                </v-col>
                <v-col
                    sm="12"
                    md="4"
                >
                    <v-menu offset-y>
                        <template #activator="{ props }">
                            <v-btn
                                style="width: 100%;"
                                color="primary"
                                v-bind="props"
                                prepend-icon="mdi-apple"
                            >
                                Download for macOS
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item
                                href="https://github.com/unipept/unipept-desktop/releases/latest/download/Unipept-Desktop-x64.dmg"
                                title="Mac with Intel Processor (x86, AMD64)"
                            />
                            <v-list-item
                                href="https://github.com/unipept/unipept-desktop/releases/latest/download/Unipept-Desktop-arm64.dmg"
                                title="Mac with Apple Silicon Processor (ARM)"
                            />
                        </v-list>
                    </v-menu>
                </v-col>
                <v-col
                    sm="12"
                    md="4"
                >
                    <v-btn
                        style="width: 100%;"
                        color="primary"
                        prepend-icon="mdi-linux"
                        href="https://github.com/unipept/unipept-desktop/releases/latest/download/Unipept-Desktop-x86_64.AppImage"
                    >
                        Download for Linux
                    </v-btn>
                </v-col>
            </v-row>
            <p>
                Most required dependencies will automatically be installed using the installation packages provided
                above. If a specific installer is not suitable for your current operating system (e.g. specific flavours
                of Linux that do not support AppImage's), you can always clone the repository and build the project
                yourselves.
            </p>
            <v-alert
                color="warning"
                variant="outlined"
            >
                <span class="font-weight-bold">Warning:</span>
                If your are planning to use the Unipept Desktop application to build custom targeted protein reference
                databases (which are required for proteogenomics data analyses), then you also need to make sure that
                <a href="https://www.docker.com/products/docker-desktop/">Docker Desktop</a> is installed and working on
                your system. See <ResourceLink to="/desktop/configuration#docker">this page</ResourceLink> for more
                information on how to set up Docker Desktop with the Unipept Desktop application.
            </v-alert>
        </header-body-card>

        <header-body-card
            id="windows_installation"
            title="Install for Windows"
            class="mb-5"
            large-title
        >
            <v-container>
                <v-row>
                    <v-col :cols="stepWidth">
                        <h3>1. Start the installer package</h3>
                        <p>
                            Double-click the installer package to start the installation. You will be greeted by a
                            window that asks for your explicit approval to install our application. Click "More info".
                        </p>
                    </v-col>
                    <v-col
                        :cols="imgWidth"
                        :class="screenshotClass"
                    >
                        <a :href="DesktopInstallWindowsImage1">
                            <v-img
                                :src="DesktopInstallWindowsImage1"
                                contain
                                eager
                                class="screenshot"
                            />
                        </a>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col :cols="stepWidth">
                        <h3>2. Proceed with security checks</h3>
                        <p>
                            A new button appears "Run anyway". Click this button to start the installation process.
                            Windows shows this warning as part of the "SmartScreen Security" system. This system
                            protects your computer from running potentially unsafe apps. Windows displays this message
                            for our application since it's very new, without a large userbase yet. The more people start
                            to use this app, the faster it will be trusted by Microsoft.
                        </p>
                    </v-col>
                    <v-col
                        :cols="imgWidth"
                        :class="screenshotClass"
                    >
                        <a :href="DesktopInstallWindowsImage2">
                            <v-img
                                :src="DesktopInstallWindowsImage2"
                                contain
                                eager
                                class="screenshot"
                            />
                        </a>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col :cols="stepWidth">
                        <h3>3. Installation process is started</h3>
                        <p>
                            The installation process is now started, and a progress bar should be visible. This process
                            should not take longer than one minute on most modern systems. Please wait for the installer
                            to disappear (without any errors). Once it's gone, the installation process is fully
                            finished.
                        </p>
                    </v-col>
                    <v-col
                        :cols="imgWidth"
                        :class="screenshotClass"
                    >
                        <a :href="DesktopInstallWindowsImage3">
                            <v-img
                                :src="DesktopInstallWindowsImage3"
                                contain
                                eager
                                class="screenshot"
                            />
                        </a>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col :cols="stepWidth">
                        <h3>4. Installation process is done</h3>
                        <p>
                            You can now start the application, by double clicking it's shortcut on your desktop or by
                            selecting it from the applications list in Windows.
                        </p>
                    </v-col>
                    <v-col
                        :cols="imgWidth"
                        :class="screenshotClass"
                    >
                        <a :href="DesktopInstallWindowsImage4">
                            <v-img
                                :src="DesktopInstallWindowsImage4"
                                contain
                                eager
                                class="screenshot"
                            />
                        </a>
                    </v-col>
                </v-row>
            </v-container>
        </header-body-card>

        <header-body-card
            id="macos_installation"
            title="Install for macOS"
            class="mb-5"
        >
            <v-container>
                <v-row>
                    <v-col :cols="stepWidth">
                        <h3>1. Mount the installer image</h3>
                        <p>
                            Double-click the downloaded "Unipept.dmg" file to mount the installer image. A new window
                            pops up in which you need to drag the Unipept Desktop logo into your applications folder.
                        </p>
                    </v-col>
                    <v-col
                        :cols="imgWidth"
                        :class="screenshotClass"
                    >
                        <a :href="DesktopInstallMacOSImage1">
                            <v-img
                                :src="DesktopInstallMacOSImage1"
                                contain
                                eager
                                class="screenshot"
                            />
                        </a>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col :cols="stepWidth">
                        <h3>2. Installation process is done</h3>
                        <p>
                            Look for the installed application in Launchpad and start Unipept Desktop.
                        </p>
                    </v-col>
                    <v-col
                        :cols="imgWidth"
                        :class="screenshotClass"
                    >
                        <a :href="DesktopInstallMacOSImage2">
                            <v-img
                                :src="DesktopInstallMacOSImage2"
                                contain
                                eager
                                class="screenshot"
                            />
                        </a>
                    </v-col>
                </v-row>
            </v-container>
        </header-body-card>

        <header-body-card
            id="linux_installation"
            title="Install for Linux"
            class="mb-5"
            large-title
        >
            <v-container>
                <v-row>
                    <v-col :cols="stepWidth">
                        <h3>1. Open AppImage properties</h3>
                        <p>
                            Right-click the downloaded "Unipept.AppImage" file and select "properties". A properties
                            window will pop up.
                        </p>
                    </v-col>
                    <v-col
                        :cols="imgWidth"
                        :class="screenshotClass"
                    >
                        <a :href="DesktopInstallUbuntuImage1">
                            <v-img
                                :src="DesktopInstallUbuntuImage1"
                                contain
                                eager
                                class="screenshot"
                            />
                        </a>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col :cols="stepWidth">
                        <h3>2. Enable executable permissions</h3>
                        <p>
                            Click the "permissions" tab and check the box before "Allow executing file as program".
                            Close the window.
                        </p>
                    </v-col>
                    <v-col
                        :cols="imgWidth"
                        :class="screenshotClass"
                    >
                        <a :href="DesktopInstallUbuntuImage2">
                            <v-img
                                :src="DesktopInstallUbuntuImage2"
                                contain
                                eager
                                class="screenshot"
                            />
                        </a>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col :cols="stepWidth">
                        <h3>3. Open the application</h3>
                        <p>
                            Double-click the downloaded AppImage-file to start the application.
                        </p>
                    </v-col>
                    <v-col
                        :cols="imgWidth"
                        :class="screenshotClass"
                    >
                        <a :href="DesktopInstallUbuntuImage3">
                            <v-img
                                :src="DesktopInstallUbuntuImage3"
                                contain
                                eager
                                class="screenshot"
                            />
                        </a>
                    </v-col>
                </v-row>
            </v-container>
        </header-body-card>

        <header-body-card
            id="first_time_use"
            title="First time use"
            class="mb-5"
            large-title
        >
            <p>
                If this is your first time using the application, we recommend to follow the steps in this guide to
                get you started easily and to get acquainted with the basic functionality of the application.
            </p>

            <h3>Static database download</h3>
            <p>
                A few things are automatically set up the first time you start this application. You will directly
                notice a dialog popping up that downloads a small SQLite-database. This database is called the
                &quot;static database&quot; and contains static information about taxa and functional annotations. Every
                month, a new release of this database is automatically generated. Unipept Desktop will regularly check
                for a new version of this database and automatically download it when necessary.
            </p>
            <div class="d-flex justify-center">
                <v-img
                    :src="DesktopDownloadStaticDatabaseImage"
                    max-width="800"
                    eager
                    :cover="false"
                />
            </div>
            <p>
                Download and installation of this static database can take a few minutes, depending on the available
                speed of your internet connection. If, for some reason, the download fails, the application will
                automatically fallback to a (slower) online version of this database and will continue to work. A new
                attempt to install the database will be made when you restart the application.
            </p>
            <h3 class="mb-2">
                Opening the demo project
            </h3>
            <v-alert
                color="warning"
                variant="outlined"
            >
                <span class="font-weight-bold">Warning:</span>
                Changes made to the demo project will not be saved! The demo project is read-only and all changes will
                be lost when you close the application.
            </v-alert>
            <p>
                Every assay or sample needs to be associated with a project. So, before you can start analyzing your
                data, you need to create a project. However, since this is the first time you use the application, we
                recommend you to click the &quot;Open demo project&quot; button. By doing so, a preconfigured project
                will be loaded and you can quickly browse the analysis results that are being produced by Unipept
                and play with some of its features.
            </p>
            <h3>Creating a new project</h3>
            <p>
                In order to create a project of your own, head back to the homepage of the application by clicking on
                the &quot;home&quot; button in the sidebar. Here, you will find a button to create a new project or to
                reopen an existing project. Click the &quot;New project&quot; button, select an empty folder (or create
                a new one) and continue.
            </p>
            <h3>Saving a project</h3>
            <p>
                Changes made to projects are automatically saved. If you close the application, the current state of
                the project will already be persisted and there's nothing else that needs to be done.
            </p>
        </header-body-card>

        <header-body-card
            id="update"
            title="Updating the application"
            class="mb-5"
            large-title
        >
            <div class="d-flex align-center flex-column ma-6">
                <v-img
                    :src="DesktopUpdateNotificationImage"
                    max-width="800"
                    :cover="false"
                    eager
                    class="screenshot ma-6"
                />
                <div>
                    <span class="font-weight-bold">Figure 1:</span> a notification is shown during the automatic
                    application update process on the bottom of the main application window.
                </div>
            </div>
            <p>
                The application will automatically be kept up-to-date. Everytime it is started, Unipept will
                automatically contact the update-servers and check if a new version if available. If this is
                the case, a notification will appear on the bottom of the application window. The notification shows
                the update progress and will ask you to restart the application once the update is finished. The
                previous version will be used as long as the app is not (manually) restarted.
            </p>
            <p>
                A summary of all changes that were made between the current version of the application and the previous
                version will always be displayed on the right side of the home page. This summary (for all versions)
                is also available on our
                <a class="link" href="https://github.com/unipept/unipept-desktop/releases">release notes page</a>.
            </p>
            <div class="d-flex align-center flex-column">
                <v-img
                    :src="DesktopUpdateChangesImage"
                    max-width="800"
                    :cover="false"
                    eager
                    class="screenshot ma-6"
                />
                <div>
                    <span class="font-weight-bold">Figure 2:</span> when an update is available, a small message will
                    appear on the homepage. A dialog with a summary of all changes will pop up after clicking on this
                    message.
                </div>
            </div>
        </header-body-card>
    </v-container>
</template>

<script setup lang="ts">
import ResourceLink from '@/components/highlights/ResourceLink.vue';
import HeaderBodyCard from "@/components/cards/HeaderBodyCard.vue";
import DesktopOverviewImage from '@/assets/documentation/desktop/getting_started/desktop_overview.png';
import DesktopInstallWindowsImage1 from '@/assets/documentation/desktop/getting_started/desktop_install_windows_1.png';
import DesktopInstallWindowsImage2 from '@/assets/documentation/desktop/getting_started/desktop_install_windows_2.png';
import DesktopInstallWindowsImage3 from '@/assets/documentation/desktop/getting_started/desktop_install_windows_3.png';
import DesktopInstallWindowsImage4 from '@/assets/documentation/desktop/getting_started/desktop_install_windows_4.png';
import DesktopInstallMacOSImage1 from '@/assets/documentation/desktop/getting_started/desktop_install_macos_1.png';
import DesktopInstallMacOSImage2 from '@/assets/documentation/desktop/getting_started/desktop_install_macos_2.png';
import DesktopInstallUbuntuImage1 from '@/assets/documentation/desktop/getting_started/desktop_install_ubuntu_1.png';
import DesktopInstallUbuntuImage2 from '@/assets/documentation/desktop/getting_started/desktop_install_ubuntu_2.png';
import DesktopInstallUbuntuImage3 from '@/assets/documentation/desktop/getting_started/desktop_install_ubuntu_3.png';
import DesktopDownloadStaticDatabaseImage from '@/assets/documentation/desktop/desktop_download_static_database.png';
import DesktopUpdateNotificationImage from '@/assets/documentation/desktop/getting_started/desktop_update_notification.png';
import DesktopUpdateChangesImage from '@/assets/documentation/desktop/getting_started/desktop_update_changes.png';

const stepWidth = 9;
const imgWidth = 3;
const screenshotClass = "pa-6";
</script>
