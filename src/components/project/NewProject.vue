<template>
    <div>
        <v-card-title class="text-center">
            <h1 class="title">Empty project</h1>
        </v-card-title>

        <v-card-text class="text-center">
            <p class="intro-text">
                This project is currently empty. Follow the steps below to get started!
            </p>

            <v-row class="mt-5" justify="center">
                <v-col cols="12" md="4" >
                    <v-unipept-card class="step-card">
                        <v-card-title class="step-title">
                            <v-icon color="primary" class="mr-2">mdi-folder-plus</v-icon>
                            Step 1: Create a new group
                        </v-card-title>

                        <v-card-text>
                            <p>
                                Start by creating a group. A group is a collection of samples you want to analyze together..
                            </p>

                            <div class="d-flex justify-center mt-5">
                                <v-btn
                                    color="primary"
                                    text="Create Group"
                                    @click="addGroup(DEFAULT_NEW_GROUP_NAME)"
                                />
                            </div>
                        </v-card-text>
                    </v-unipept-card>
                </v-col>

                <v-col cols="12" md="4">
                    <v-unipept-card class="step-card">
                        <v-card-title class="step-title">
                            <v-icon color="secondary" class="mr-2">mdi-flask</v-icon>
                            Step 2: Add Samples
                        </v-card-title>

                        <v-card-text>
                            <p>
                                Once your group is created, add samples to it. Samples represent the data you want to analyze.
                                Use the pencil icon
                                <v-icon size="small" color="secondary">mdi-pencil</v-icon> next to your group in the sidebar.
                            </p>
                        </v-card-text>
                    </v-unipept-card>
                </v-col>

                <v-col cols="12" md="4">
                    <v-unipept-card class="step-card">
                        <v-card-title class="step-title">
                            <v-icon color="success" class="mr-2">mdi-chart-line</v-icon>
                            Step 3: Start Analyzing
                        </v-card-title>

                        <v-card-text>
                            <p>
                                After adding samples, select one from the sidebar and start analyzing! Once the analysis is done,
                                results will be displayed here.
                            </p>
                        </v-card-text>
                    </v-unipept-card>
                </v-col>
            </v-row>
        </v-card-text>
    </div>
</template>

<script setup lang="ts">
import { DEFAULT_NEW_GROUP_NAME } from "@/store/new/GroupAnalysisStore";

const emits = defineEmits<{
    (e: 'group:add', name: string): void;
}>();

const addGroup = (name: string) => {
    emits('group:add', name);
};
</script>

<style scoped>
.empty-state {
    padding: 40px;
    background: #f9fafc;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
}

.intro-text {
    font-size: 16px;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
}

.step-title {
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
}

.step-card {
    padding: 16px !important;
    min-height: 100%;
}
</style>
