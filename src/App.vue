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
                        class="text-white font-weight-bold"
                        @click="navigateToPage(item)"
                    >
                        {{ item.name }}
                    </v-tab>
                </v-tabs>
            </template>
        </v-app-bar>

        <v-main class="d-flex flex-column bg-mainBody">
            <v-container
                class="main-container flex-grow-1"
                style="max-width: 1400px;"
                fluid
            >
                <router-view :key="navigationKey" />
            </v-container>

            <v-footer
                class="text-center d-flex flex-column ga-2 py-4 flex-grow-0"
                color="grey-darken-3"
            >
                <div class="d-flex ga-3 text-color">
                    <v-btn
                        icon="mdi-email-outline"
                        density="comfortable"
                        variant="text"
                        @click="openLink('mailto:unipept@ugent.be')"
                    />
                    <v-btn
                        icon="mdi-twitter"
                        density="comfortable"
                        variant="text"
                        @click="openLink('https://twitter.com/unipept')"
                    />
                    <v-btn
                        icon="mdi-github"
                        density="comfortable"
                        variant="text"
                        @click="openLink('https://github.com/unipept/unipept')"
                    />
                </div>

                <v-divider class="my-2" thickness="2" width="50"></v-divider>

                <div
                    v-if="$route.meta"
                    class="text-center mb-5 text-color"
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

                <div>
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

                <div class="d-flex text-color">
                    <span>© {{ new Date().getFullYear() }} Universiteit Gent</span>
                    <span class="mx-3">-</span>
                    <span>Unipept {{ unipeptVersion }} using UniProt {{ uniprotVersion }}</span>
                </div>
            </v-footer>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router'
import UnipeptCommunicator from "@/logic/communicators/unipept/UnipeptCommunicator";

const router = useRouter();

const unipeptVersion = ref<string>("");
const uniprotVersion = ref<string>("");

type NavItem = {
    name: string,
    path: string,
    forceReload: boolean
}

const navItems: NavItem[] = [
    { name: "Single Peptide Analysis", path: "/spa", forceReload: false },
    { name: "Metaproteomics Analysis", path: "/mpa", forceReload: false },
    { name: "API", path: "/apidocs", forceReload: false },
    { name: "CLI", path: "/clidocs", forceReload: false },
    { name: "Metagenomics", path: "/umgap", forceReload: false },
    { name: "Unipept Desktop", path: "/desktop", forceReload: false },
];

const unipeptCommunicator = new UnipeptCommunicator();

onBeforeMount(async () => {
    unipeptVersion.value = APP_VERSION;
    uniprotVersion.value = await unipeptCommunicator.uniprotVersion();
});

const navigationKey = ref<number>(1);
const navigateToPage = async function(navItem: NavItem) {
    await router.push(navItem.path);

    if (navItem.forceReload) {
        navigationKey.value++;
    }
}

const openLink = (url: string) => {
    window.open(url, "_blank");
}
</script>


<style lang="scss">
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

footer .text-color {
    color: #cccccc !important;
}

footer .link {
    color: #cccccc !important;
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
