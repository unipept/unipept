<template>
    <div>
        <div v-if="!loading">
            <h1 class="font-weight-light">
                Latest API version
            </h1>
            <release-card
                class="mb-2"
                :release="latestAPIRelease"
                :parser="descriptionChangelogParser"
            />
            <resource-link
                class="d-flex justify-end"
                to="news/api"
                router
            >
                Go to API changelog
            </resource-link>

            <h1 class="font-weight-light">
                Latest CLI version
            </h1>
            <release-card
                class="mb-2"
                :release="latestCLIRelease"
                :parser="descriptionChangelogParser"
            />
            <resource-link
                class="d-flex justify-end"
                to="news/cli"
                router
            >
                Go to CLI changelog
            </resource-link>

            <h1 class="font-weight-light">
                Latest Web version
            </h1>
            <release-card
                class="mb-2"
                :release="latestWebRelease"
                :parser="descriptionChangelogParser"
            />
            <resource-link
                class="d-flex justify-end"
                to="news/web"
                router
            >
                Go to web changelog
            </resource-link>

            <h1 class="font-weight-light">
                Latest Desktop version
            </h1>
            <release-card
                class="mb-2"
                :release="latestDesktopRelease"
                :parser="desktopReleaseParser"
            />
            <resource-link
                class="d-flex justify-end"
                to="news/desktop"
                router
            >
                Go to desktop changelog
            </resource-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import ReleaseCard from '@/components/cards/ReleaseCard.vue';
import { defaultGithubRelease, GithubCommunicator, GithubRelease } from '@/logic/communicators/github/GithubCommunicator';
import DescriptionChangelogParser from '@/logic/parsers/github/DescriptionChangelogParser';
import DesktopReleaseParser from "@/logic/parsers/github/DesktopReleaseParser";
import { onBeforeMount, ref } from 'vue';
import ResourceLink from '@/components/highlights/ResourceLink.vue';

const githubCommunicator = new GithubCommunicator();
const descriptionChangelogParser = new DescriptionChangelogParser();
const desktopReleaseParser = new DesktopReleaseParser();

const loading = ref<boolean>(true);
const latestAPIRelease = ref<GithubRelease>(defaultGithubRelease);
const latestCLIRelease = ref<GithubRelease>(defaultGithubRelease);
const latestWebRelease = ref<GithubRelease>(defaultGithubRelease);
const latestDesktopRelease = ref<GithubRelease>(defaultGithubRelease);

onBeforeMount(async () => {
    latestAPIRelease.value = await githubCommunicator.latestRelease("https://api.github.com/repos/unipept/unipept/releases");
    latestCLIRelease.value = await githubCommunicator.latestRelease("https://api.github.com/repos/unipept/unipept-cli/releases");
    latestWebRelease.value = await githubCommunicator.latestRelease("https://api.github.com/repos/unipept/unipept-web/releases");
    latestDesktopRelease.value = await githubCommunicator.latestRelease("https://api.github.com/repos/unipept/unipept-desktop/releases");

    loading.value = false;
});
</script>
