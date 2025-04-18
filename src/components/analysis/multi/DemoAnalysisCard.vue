<template>
    <v-unipept-card>
        <v-card-title>
            <h2>New here? Try a sample dataset</h2>
        </v-card-title>

        <v-card-text>
            <p>
                If this is the first time you're using our application, we advise you to try a sample
                project and discover what this application can do for you.
            </p>

            <div class="d-flex justify-center">
                <v-btn
                    class="float-right mt-1"
                    color="primary"
                    variant="tonal"
                    text="Try a sample dataset"
                    @click="console.log"
                />
            </div>

<!--            <v-unipept-card-->
<!--                v-for="item in samples"-->
<!--                :key="item.id"-->
<!--                class="mt-3 pa-0"-->
<!--            >-->
<!--                <v-card-text>-->
<!--                    <div-->
<!--                        class="d-flex flex-column"-->
<!--                    >-->
<!--                        <span><b>Environment:</b> {{ item.environment }}</span>-->
<!--                        <span>-->
<!--                            <b>Reference:</b> {{ item.reference }}-->
<!--                            <v-icon-->
<!--                                color="primary"-->
<!--                                size="small"-->
<!--                                @click="openReference(item)"-->
<!--                            >-->
<!--                                mdi-link-variant-->
<!--                            </v-icon>-->
<!--                        </span>-->
<!--                    </div>-->
<!--                    <v-btn-->
<!--                        class="mt-1 float-right mb-3"-->
<!--                        text="Analyze"-->
<!--                        variant="tonal"-->
<!--                        @click="() => emits('select', item)"-->
<!--                    />-->
<!--                </v-card-text>-->
<!--            </v-unipept-card>-->
        </v-card-text>
    </v-unipept-card>
</template>

<script setup lang="ts">
import {SampleData} from "@/composables/communication/unipept/useSampleData";

const { samples } = defineProps<{
    samples: SampleData[]
}>();

const emits = defineEmits<{
    (e: "select", sample: SampleData): void;
}>();

const openReference = (sample: SampleData) => window.open(sample.url, '_blank');
</script>

<style scoped>

</style>
