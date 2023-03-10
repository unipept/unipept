<template>
    <v-container>
        <h1 class="font-weight-light">
            Unipept desktop news
        </h1>

        <ReleaseCard
            v-for="release in releases"
            class="mb-5"
            :key="release.tag_name"
            :release="release"
            :parser="releaseParser"
        >
        </ReleaseCard>

        <v-container v-if="releases.length == 5" class="pa-0 d-flex justify-end">
            <ResourceLink to="https://github.com/unipept/unipept-desktop/releases" target="_blank">View all releases on github</ResourceLink>
            <!-- TODO: change when API is extracted from unipept repo -->
        </v-container>
    </v-container>
</template>

<script setup lang="ts">
import { GithubCommunicator, GithubRelease } from '@/logic/communicators/github/GithubCommunicator';
import { ref, onBeforeMount } from 'vue';
import ReleaseCard from "@/components/cards/ReleaseCard.vue";
import DesktopReleaseParser from '@/logic/parsers/github/DesktopReleaseParser';
import ResourceLink from '@/components/highlights/ResourceLink.vue';

const githubCommunicator = new GithubCommunicator();
const releaseParser = new DesktopReleaseParser();

const releases = ref<GithubRelease[]>([]);

onBeforeMount(async () => {
    const result = await githubCommunicator.releases("https://api.github.com/repos/unipept/unipept-desktop/releases", 5);

    releases.value = result;
})
</script>
