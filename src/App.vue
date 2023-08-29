<template>
    <v-app>
        <v-app-bar
            app
            color="secondary"
            dark
            hide-on-scroll
            class="px-lg-16"
        >
            <h2 class="pl-4">
                <router-link
                    to="/"
                    class="homepage-title"
                >
                    Unipept
                </router-link>
            </h2>

            <v-spacer />

            <router-link
                v-slot="{ href, navigate }"
                to="/publications"
            >
                <v-btn
                    :href="href"
                    variant="text"
                    color="white"
                    @click="navigate"
                >
                    Publications
                </v-btn>
            </router-link>
            <router-link
                v-slot="{ href, navigate }"
                to="/about"
            >
                <v-btn
                    :href="href"
                    variant="text"
                    color="white"
                    @click="navigate"
                >
                    About
                </v-btn>
            </router-link>

            <template #extension>
                <v-tabs
                    slider-color="white"
                    :mandatory="false"
                >
                    <v-tab
                        class="pa-0 ma-0"
                        style="min-width: 0"
                    />
                    <v-tab
                        v-for="item in navItems"
                        :key="item.name"
                        :to="item.path"
                        class="text-white font-weight-bold"
                    >
                        {{ item.name }}
                    </v-tab>
                </v-tabs>
            </template>
        </v-app-bar>

        <v-main class="d-flex flex-column">
            <v-container class="main-container flex-grow-1">
                <router-view />
            </v-container>

            <v-footer
                dark
                class="bg-grey-darken-3 d-flex"
                style="flex: 0 0 auto; "
                height="100px"
            >
                <div style="width: 100%">
                    <div class="d-md-flex justify-space-between">
                        <div
                            v-if="$route.meta"
                            class="text-center text-grey"
                        >
                            {{ $route.meta.publication }}
                            <a
                                class="link"
                                :href="'https://' + $route.meta.publicationLink"
                                target="_blank"
                            >
                                &nbsp;{{ $route.meta.publicationLink }}
                            </a>
                        </div>
                        <div
                            class="text-center mt-3 mt-md-0"
                        >
                            <a
                                class="link"
                                href="mailto:unipept@ugent.be"
                            >
                                <v-icon
                                    size="30px"
                                    class="grey--text link"
                                >
                                    mdi-email-outline
                                </v-icon>
                            </a>
                            <a
                                class="ml-10 link"
                                href="https://twitter.com/unipept"
                                target="_blank"
                            >
                                <v-icon
                                    size="30px"
                                    class="grey--text link"
                                >
                                    mdi-twitter
                                </v-icon>
                            </a>
                            <a
                                class="ml-10 link"
                                href="https://github.com/unipept/unipept"
                                target="_blank"
                            >
                                <v-icon
                                    size="30px"
                                    class="grey--text link"
                                >
                                    mdi-github
                                </v-icon>
                            </a>
                        </div>
                    </div>
                    <div class="d-md-flex justify-space-between">
                        <div class="text-center text-grey mt-3 mt-md-0">
                            © 2023 Universiteit Gent
                        </div>
                        <div class="text-center mt-3 mt-md-0">
                            <router-link
                                class="link"
                                to="/about"
                            >
                                Terms of service
                            </router-link>
                            <router-link
                                class="link ml-5"
                                to="/news"
                            >
                                News
                            </router-link>
                            <router-link
                                class="link ml-5"
                                to="/publications"
                            >
                                Publications
                            </router-link>
                        </div>
                        <div class="text-center text-grey mt-3 mt-md-0">
                            Unipept {{ unipeptVersion }} using UniProt {{ uniprotVersion }}
                        </div>
                    </div>
                </div>
            </v-footer>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { QueueManager } from 'unipept-web-components';
import { onBeforeMount, ref } from 'vue';
import { GithubCommunicator } from "@/logic/communicators/github/GithubCommunicator";
import UnipeptCommunicator from "@/logic/communicators/unipept/UnipeptCommunicator";

const unipeptVersion = ref<string>("");
const uniprotVersion = ref<string>("");

const navItems = [
    { name: "Tryptic Peptide Analysis", path: "/tpa" },
    { name: "Metaproteomics Analysis", path: "/mpa" },
    { name: "API", path: "/apidocs" },
    { name: "CLI", path: "/clidocs" },
    { name: "Metagenomics", path: "/umgap" },
    { name: "Unipept Desktop", path: "/desktop" }
];

QueueManager.initializeQueue(4);

const githubCommunicator = new GithubCommunicator();
const unipeptCommunicator = new UnipeptCommunicator();

onBeforeMount(async () => {
    const web = await githubCommunicator.latestRelease("https://api.github.com/repos/unipept/unipept/releases");
    unipeptVersion.value = web.tag_name.replace("v", "");
    uniprotVersion.value = await unipeptCommunicator.uniprotVersion();
});
</script>


<style lang="scss">
//noinspection CssUnknownTarget (Intellij does not yet consider the package.json exports field)
@import "unipept-web-components/style.css";

body {
    font-size: 16px;
}

.homepage-title {
    color: white !important;
    text-decoration: none;
}

.v-slide-group__prev {
    display: none !important;
}

footer .link {
    color: #9e9e9e !important;
    text-decoration: none;
}

footer .link:hover {
    color: white !important;
    text-decoration: none;
}

.v-card__text {
    color: #333333 !important;
}

p {
    color: #333333 !important;
    margin-bottom: 8px !important;
}

li {
    font-size: 16px;
}

td {
    font-size: 16px !important;
}

.v-card h3 {
    font-weight: 300;
    font-size: large;
}

.v-card h2 {
    font-weight: 300;
    font-size: x-large;
}

.v-alert__wrapper {
    display:block !important;
}

.screenshot {
    filter: drop-shadow(0 0 0.50rem gray);
}

.v-tab {
    text-transform: none !important;
}
</style>
