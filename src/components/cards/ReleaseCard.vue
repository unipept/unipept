<template>
    <div v-if="changelog">
        <v-card v-if="!release.tag_name">
            <v-card-title class="bg-blue text-white pa-4 ">
                This application has not yet been released
            </v-card-title>
        </v-card>

        <a
            v-else
            :href="release.html_url"
            target="_blank"
        >
            <v-hover v-slot="{ isHovering, props }">
                <v-card
                    :hover="!!isHovering"
                    v-bind="props"
                >
                    <v-card-title class="bg-blue text-white pa-4 ">
                        Unipept {{ release.tag_name.replace(/^v/, "") }}
                        <div
                            style="font-size: 16px; line-height: 1rem;"
                            class="font-weight-light"
                        >
                            Posted on {{ formatDate(release.published_at) }}
                        </div>
                    </v-card-title>

                    <v-card-text
                        v-if="changelog.description"
                        class="px-5 pt-5 mb-n7"
                    >
                        <div v-html="changelog.description" />
                    </v-card-text>

                    <v-card-text class="mt-5">
                        <ul
                            v-for="(item, i) in changelog.changelog"
                            :key="i"
                            class="align-center px-0"
                        >
                            <li style="list-style-type: none;">
                                <v-chip
                                    v-if="item.tag"
                                    class="me-2"
                                    :class="item.tag"
                                    size="x-small"
                                    label
                                >
                                    {{ item.tag }}
                                </v-chip>
                                {{ item.description }}
                            </li>
                        </ul>
                        <Rlink
                            class="d-flex justify-end"
                            :to="release.html_url"
                        >
                            View on GitHub
                        </Rlink>
                    </v-card-text>

                    <slot name="extension" />
                </v-card>
            </v-hover>
        </a>
    </div>
    <div v-else class="d-flex justify-center">
        <v-progress-circular indeterminate color="primary" />
    </div>
</template>

<script setup lang="ts">
import { GithubRelease } from '@/logic/communicators/github/GithubCommunicator';
import {ReleaseParser, ReleaseParserResult} from '@/logic/parsers/github/ReleaseParser';
import Rlink from '../highlights/ResourceLink.vue';
import {onMounted, ref, Ref, watch} from "vue";

export interface Props {
    release: GithubRelease,
    parser: ReleaseParser
}

const { release, parser } = defineProps<Props>()

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}

const changelog: Ref<ReleaseParserResult | undefined> = ref();

onMounted(async () => {
  changelog.value = await parser.parse(release.body)
});
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
</style>
