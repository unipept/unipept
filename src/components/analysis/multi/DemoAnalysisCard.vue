<template>
    <div>
        <v-unipept-card :disabled="disabled">
            <v-card-title>
                <h2 style="white-space: normal;">New here? Try a demo project</h2>
            </v-card-title>

            <v-card-text>
                <p>
                    If this is the first time you're using our application, we advise you to try a demo
                    project and discover what this application can do for you.
                </p>

                <div>
                    <v-btn
                        class="w-100 w-lg-auto float-lg-right mt-1"
                        color="primary"
                        variant="tonal"
                        text="Select a demo project"
                        :loading="loading"
                        @click="dialogOpen = true"
                    />
                </div>
            </v-card-text>
        </v-unipept-card>

        <v-dialog v-model="dialogOpen">
            <v-unipept-card class="bg-mainBody">
                <v-card-title class="d-flex align-center">
                    <h2>Select a demo project</h2>
                    <v-spacer/>
                    <v-btn
                        color="transparent"
                        icon
                        flat
                        @click="dialogOpen = false"
                    >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <v-row>
                        <v-col
                            v-for="sample in samples"
                            :key="sample.id"
                            cols="12"
                            md="6"
                        >
                            <v-unipept-card
                                class="d-flex flex-row align-center"
                                style="min-height: 100%;"
                            >
                                <div>
                                    <v-card-title class="text-primary">
                                        {{ sample.environment }}
                                    </v-card-title>
                                    <v-card-text style="padding-top: 0 !important;" class="mb-md-8">
                                        <div class="text-body-2 mb-2">{{ sample.reference }}</div>
                                        <div>
                                            <v-btn
                                                color="primary"
                                                class="w-100 float-md-right w-md-auto mb-1 mb-md-0"
                                                variant="text"
                                                style="z-index: 10000"
                                                @click.stop="openReference(sample)"
                                            >
                                                View Article
                                            </v-btn>
                                            <v-btn
                                                class="w-100 w-md-auto float-md-right"
                                                color="primary"
                                                variant="tonal"
                                                style="z-index: 10000"
                                                @click="selectSample(sample)"
                                            >
                                                Load project
                                            </v-btn>
                                        </div>
                                    </v-card-text>
                                </div>
                            </v-unipept-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-unipept-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import {SampleData} from "@/composables/communication/unipept/useSampleData";
import {ref} from "vue";

const {samples, loading = false, disabled = false} = defineProps<{
    samples: SampleData[],
    loading?: boolean,
    disabled?: boolean
}>();

const emits = defineEmits<{
    (e: "select", sample: SampleData): void;
}>();

const dialogOpen = ref(false);

const selectSample = (sample: SampleData) => {
    dialogOpen.value = false;
    emits("select", sample);
};

const openReference = (sample: SampleData) => {
    window.open(sample.url, "_blank");
};
</script>

<style scoped>

</style>
