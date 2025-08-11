<template>
    <div>
        <v-card-title class="text-center">
            <h1 class="title" style="white-space: normal;">
                Not enough samples selected
            </h1>
        </v-card-title>

        <v-card-text class="text-center pa-0">
            <p class="intro-text">
                Select at least two samples. Follow the steps below to get started!
            </p>

            <v-row class="mt-5" justify="center">
                <v-col cols="12" md="4">
                    <v-unipept-card class="step-card">
                        <v-card-title class="step-title" style="white-space: normal;">
                            <v-icon color="primary" class="mr-2">mdi-cursor-default-click</v-icon>
                            Step 1: Select samples
                        </v-card-title>
                        
                        <v-card-text>
                            <p>
                                Select <span class="font-weight-bold">two or more samples</span> from your project to compare their analysis results. You can
                                select samples by clicking their names in the project explorer on the left.
                            </p>
                        </v-card-text>
                    </v-unipept-card>
                </v-col>

                <v-col cols="12" md="4">
                    <v-unipept-card class="step-card">
                        <v-card-title class="step-title" style="white-space: normal;">
                            <v-icon color="secondary" class="mr-2">mdi-chart-multiple</v-icon>
                            Step 2: Choose a visualization
                        </v-card-title>

                        <v-card-text>
                            <p>
                                Choose one of the built-in comparison methods to continue your analysis.
                            </p>
                        </v-card-text>
                    </v-unipept-card>
                </v-col>

                <v-col cols="12" md="4">
                    <v-unipept-card class="step-card">
                        <v-card-title class="step-title" style="white-space: normal;">
                            <v-icon color="success" class="mr-2">mdi-layers-search</v-icon>
                            Step 3: Explore your data
                        </v-card-title>

                        <v-card-text>
                            <p>
                                Explore your selected samples using the available visualization methods and analysis
                                tools. You can also export your results for further use or documentation.
                            </p>
                        </v-card-text>
                    </v-unipept-card>
                </v-col>
            </v-row>
        </v-card-text>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
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
