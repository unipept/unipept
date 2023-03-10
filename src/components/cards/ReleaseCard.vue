<template>
    <div>
        <v-card v-if="!release.tag_name">
            <v-card-title class="blue white--text">This application has not yet been released</v-card-title>
        </v-card>

        <a v-else :href="release.html_url" target="_blank">
            <v-hover>
                <template v-slot:default="{ hover }">
                    <v-card :hover="hover">
                        <v-card-title class="blue white--text">Unipept {{ release.tag_name.replace(/^v/, "") }}</v-card-title>
                        <v-card-subtitle class="blue white--text">Posted on {{ formatDate(release.published_at) }}</v-card-subtitle>

                        <v-card-text 
                            v-if="changelog.description"
                            class="px-5 pt-5 mb-n7"
                        >
                            {{ changelog.description }}
                        </v-card-text>

                        <v-card-text class="mt-5">
                            <ul class="align-center px-0" v-for="(item, i) in changelog.changelog" :key="i">
                                <li class="nobull">
                                    <v-chip
                                        v-if="item.tag"
                                        class="me-2"
                                        :class="item.tag"
                                        x-small
                                        label
                                    >
                                        {{ item.tag }}
                                    </v-chip>
                                    {{ item.description }}
                                </li>
                            </ul>
                            <Rlink class="d-flex justify-end" :to="release.html_url">View on GitHub</Rlink>
                        </v-card-text>

                        <slot name="extension"></slot>
                    </v-card>
                </template>
            </v-hover>
        </a>
    </div>
</template>

<script setup lang="ts">
import { GithubRelease } from '@/logic/communicators/github/GithubCommunicator';
import { ReleaseParser } from '@/logic/parsers/github/ReleaseParser';
import Rlink from '../highlights/ResourceLink.vue';

export interface Props {
    release: GithubRelease,
    parser: ReleaseParser
}

/* eslint-disable */
const { release, parser } = defineProps<Props>()

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}

const changelog = parser.parse(release.body);

</script>

<style scoped>
a {
    text-decoration: none;
}

.added {
    background-color: #00a82d !important;
    color: white !important;
    font-weight: 800 !important;
    text-transform: uppercase;
    align-content: center;
}

.improved,
.updated {
    background-color: #2196F3 !important;
    color: white !important;
    font-weight: 800 !important;
    text-transform: uppercase;
    align-content: center;
}

.removed,
.fixed {
    background-color: red !important;
    color: white !important;
    font-weight: 800 !important;
    text-transform: uppercase;
    align-content: center;
}

.nobull {
    list-style-type: none;
}
</style>