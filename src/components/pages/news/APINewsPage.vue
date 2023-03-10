<template>
    <v-container>
        <h1 class="font-weight-light">
            Unipept API news
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
            <ResourceLink to="https://github.com/unipept/unipept/releases">View all releases on github</ResourceLink>
            <!-- TODO: change when API is extracted from unipept repo -->
        </v-container>
    </v-container>
</template>

<script setup lang="ts">
import { GithubCommunicator, GithubRelease } from '@/logic/communicators/github/GithubCommunicator';
import { ref, onBeforeMount } from 'vue';
import ReleaseCard from "@/components/cards/ReleaseCard.vue";
import APIReleaseParser from '@/logic/parsers/github/DescriptionChangelogParser';
import ResourceLink from '@/components/highlights/ResourceLink.vue';

const githubCommunicator = new GithubCommunicator();
const releaseParser = new APIReleaseParser();

const releases = ref<GithubRelease[]>([]);

onBeforeMount(async () => {
    const result = await githubCommunicator.releases("https://api.github.com/repos/unipept/unipept/releases", 5);

    releases.value = result.filter(r => !r.prerelease);
})
</script>
