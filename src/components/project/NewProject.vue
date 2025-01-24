<template>
    <v-card variant="flat">
        <v-card-title>
            <h1>Empty project</h1>
        </v-card-title>

        <v-card-text>
            <p>
                You are currently looking at an empty project. If this is the first time you're using this application,
                you can use the following steps as a guide to get started.
            </p>

            <v-row class="mt-3">
                <v-col cols="4">
                    <v-card>
                        <v-card-title>
                            Step 1: Create a new group
                        </v-card-title>

                        <v-card-text>
                            <p>
                                To get started, you can create a new group. A group is a collection of samples that you want to
                                analyze together. You can create a group by clicking the button below, or by clicking the button
                                in the bottom-left corner of your screen.
                            </p>

                            <v-btn
                                class="mt-3"
                                color="primary"
                                text="Add group"
                                @click="addGroup(DEFAULT_NEW_GROUP_NAME)"
                            />
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4">
                    <v-card height="100%">
                        <v-card-title>
                            Step 2: Add new samples
                        </v-card-title>

                        <v-card-text>
                            <p>
                                After you've created a group, you can add samples to it. Samples are the actual data that you
                                want to analyze. You can add samples by clicking the pencil icon (<v-icon
                                    size="x-small"
                                    style="position: relative; bottom: 1px;"
                                >
                                    mdi-pencil
                                </v-icon>)
                                next to your group in the left sidebar.
                            </p>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4">
                    <v-card height="100%">
                        <v-card-title>
                            Step 3: Select a sample and start analyzing
                        </v-card-title>

                        <v-card-text>
                            <p>
                                After you've added a single or multiple sample(s) to your group, you can select a sample and start analyzing it.
                                You can do this by clicking the sample in the left sidebar. As soon as the analysis is finished, you will see
                                the results in the main screen.
                            </p>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import {DEFAULT_NEW_GROUP_NAME} from "@/store/new/GroupAnalysisStore";

const emits = defineEmits<{
    'group:add': (name: string) => void;
}>();

const addGroup = (name: string) => {
    emits('group:add', name);
}
</script>

<style scoped>

</style>
