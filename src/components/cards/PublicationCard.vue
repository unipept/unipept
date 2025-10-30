<template>
    <v-unipept-card class="pa-0">
        <v-card-title
            class="bg-blue text-white"
            style="letter-spacing: 0.0125rem"
        >
            <div style="font-size: 1.25rem">
                {{ title }}
            </div>
            <div>
                {{ authors.length == 1 ? authors[0] : authors.slice(0, -1).join(", ") + ', and ' + authors[authors.length - 1] }}
            </div>
        </v-card-title>

        <v-divider />

        <v-card-text>
            <v-row>
                <v-col
                    cols="12"
                    md="8"
                    xl="9"
                >
                    <h2 class="mb-3">
                        Abstract
                    </h2>
                    <slot name="abstract" />

                    <h2 class="mt-5 mb-3">
                        Citation
                    </h2>
                    {{ authors.length == 1 ? authors[0] : authors.slice(0, -1).join(", ") + ', and ' + authors[authors.length - 1] }}
                    <br>
                    <b>{{ title }}</b>
                    <br>
                    {{ journal + ", " + year + (extra ? ", " + extra : extra) }}
                    <br>
                    <div>
                        <v-icon
                            size="x-small"
                            class="mr-1"
                        >
                            mdi-link-variant
                        </v-icon>

                        <RLink :to="'https://' + doi">
                            {{ doi }}
                        </RLink>

                        <v-icon
                            class="ml-1"
                            size="x-small"
                        >
                            mdi-link-variant
                        </v-icon>

                        <RLink :to="googleScholar">
                            Google Scholar
                        </RLink>
                    </div>
                </v-col>
                <v-col
                    cols="12"
                    md="4"
                    xl="3"
                >
                    <RLink :to="'https://' + doi">
                        <v-hover v-slot="{ isHovering, props }">
                            <v-unipept-card
                                class="pa-0"
                                :elevation="isHovering ? 6 : 2"
                                v-bind="props"
                            >
                                <v-img
                                    :src="image"
                                    :alt="image"
                                />
                            </v-unipept-card>
                        </v-hover>
                    </RLink>
                </v-col>
            </v-row>
        </v-card-text>
    </v-unipept-card>
</template>

<script setup lang="ts">
import RLink from '../highlights/ResourceLink.vue';

export interface Props {
    title: string,
    authors: string[],
    journal: string,
    year: string,
    extra?: string,
    doi: string,
    googleScholar: string,
    image: string
}

withDefaults(defineProps<Props>(), {
    extra: ""
});
</script>
