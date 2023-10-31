<template>
    <v-container>
        <h1 class="font-weight-light">
            Unipept Desktop releases
        </h1>

        <release-card
            v-for="release in releases"
            :key="release.tag_name"
            class="mb-5"
            :release="release"
            :parser="releaseParser"
        />

        <v-container
            v-if="releases.length == 5"
            class="pa-0 d-flex justify-end"
        >
            <resource-link
                to="https://github.com/unipept/unipept-desktop/releases"
                target="_blank"
            >
                View all releases on github
            </resource-link>
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
    releases.value = await githubCommunicator.releases("https://api.github.com/repos/unipept/unipept-desktop/releases", 5);
})
</script>
