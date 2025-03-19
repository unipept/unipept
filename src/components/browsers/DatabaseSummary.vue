<template>
    <v-unipept-card style="width: 100%;" class="mb-2">
        <v-card-text>
            <h3 class="mb-2">Database summary</h3>

            <div class="d-flex">
                <v-col cols="9" :class="invalidItems.length !== 0 ? 'pt-0' : ''">
                    <v-alert
                        v-if="invalidItems.length !== 0"
                        class="mb-2"
                        type="error"
                        variant="outlined"
                        :text="`Some items from the file you've uploaded are invalid: ${invalidItems.join(', ')}. Please check and correct any mistakes.`"
                    />
                    <h4>{{ title }}</h4>
                    <div class="text-caption">
                        {{ description }}
                    </div>
                    <div class="d-flex align-center mt-4">
                        <div
                            v-if="selectedItems.length === 0"
                            class="flex-grow-1 settings-text"
                        >
                            {{ emptyPlaceholder }}
                        </div>
                        <v-chip-group
                            v-else
                            column
                            class="flex-grow-1 d-flex"
                        >
                            <v-chip
                                v-for="item in selectedItems"
                                :key="itemDisplayName(item)"
                                :class="`bg-${chipBackgroundColor(item)}`"
                                closable
                                variant="flat"
                                @click:close="handleRemoveItem(item)"
                            >
                                {{ itemDisplayName(item) }}
                            </v-chip>
                        </v-chip-group>
                        <v-tooltip
                            location="bottom"
                            open-delay="500"
                        >
                            <template #activator="{ props }">
                                <file-upload-button
                                    v-bind="props"
                                    class="mr-2"
                                    style="align-self: start;"
                                    color="primary"
                                    :loading="processingFile"
                                    @upload="onUploadFile"
                                    prepend-icon="mdi-file-upload"
                                >
                                    Upload from file
                                </file-upload-button>
                            </template>
                            <span>Bulk select all items with the IDs in a given file. Each ID that should be selected needs to be placed on a separate line.</span>
                        </v-tooltip>
                        <v-tooltip
                            location="bottom"
                            open-delay="500"
                        >
                            <template #activator="{ props }">
                                <v-btn
                                    v-bind="props"
                                    variant="outlined"
                                    style="align-self: start;"
                                    color="error"
                                    @click="onClearSelection"
                                    :disabled="selectedItems.length === 0"
                                >
                                    Clear all
                                </v-btn>
                            </template>
                            <span>Clear selection</span>
                        </v-tooltip>
                    </div>
                </v-col>

                <v-col cols="3">
                    <h4>Statistics</h4>
                    <div class="text-caption">
                        Final database composition statistics
                    </div>
                    <div class="d-flex align-center mt-2">
                        <v-icon class="mr-2">mdi-database</v-icon>
                        <span v-if="isComputingProteinCount">Computing protein count...</span>
                        <span v-else>~ {{ formatNumber(uniprotRecordCount) }} proteins</span>
                    </div>
                    <div class="d-flex align-center">
                        <v-icon class="mr-2">mdi-bacteria</v-icon>
                        <span v-if="isComputingTaxonCount">Computing taxon count...</span>
                        <span v-else>~ {{ formatNumber(taxonCount) }} different taxa</span>
                    </div>
                </v-col>
            </div>
        </v-card-text>
    </v-unipept-card>
</template>

<script setup lang="ts" generic="T extends { id: number | string }">
import {onMounted, ref, watch} from "vue";
import FileUploadButton from "@/components/filesystem/FileUploadButton.vue";
import {useNumberFormatter} from "@/composables/useNumberFormatter";
import useAsync from "@/composables/useAsync";

const props = defineProps<{
    title: string;
    description: string;
    emptyPlaceholder: string;
    chipBackgroundColor: (item: T) => string;
    itemDisplayName: (item: T) => string;
    invalidItems: string[];
    computeProteinCount: (items: T[]) => Promise<number>;
    computeTaxonCount: (items: T[]) => Promise<number>;
}>();

const selectedItems = defineModel<T[]>("selectedItems", {default: []});
const invalidItems = defineModel<string[]>("invalidItems", {default: []});

const emit = defineEmits<{
    (e: 'uploadFile', file: File, callback: () => void): void,
}>();

// Start of logic for UI and presentation
const { formatNumber } = useNumberFormatter();

// Start of logic for processing the uploaded file
const processingFile = ref(false);

const onUploadFile = async (file: File) => {
    processingFile.value = true;
    await new Promise<void>((resolve) => emit("uploadFile", file, resolve));
    processingFile.value = false;
};

// Start of logic for selection manipulation
const onClearSelection = () => {
    selectedItems.value = [];
};

const handleRemoveItem = (item: T) => {
    const idx = selectedItems.value.findIndex((element) => element.id === item.id);
    selectedItems.value.splice(idx, 1);
};

// Start of logic for computing the protein counts
const isComputingProteinCount = ref(false);
const uniprotRecordCount = ref(0);

const { performIfLast: performIfLastProteinCount } = useAsync<number>();

const countProteins = async () => {
    isComputingProteinCount.value = true;
    await performIfLastProteinCount(
        async () => await props.computeProteinCount(selectedItems.value),
        (result: number) => uniprotRecordCount.value = result
    )
    isComputingProteinCount.value = false;
}

// Start of logic for computing taxon counts
const isComputingTaxonCount = ref(false);
const taxonCount = ref(0);

const { performIfLast: performIfLastTaxonCount } = useAsync<number>();

const countTaxa = async () => {
    isComputingTaxonCount.value = true;
    await performIfLastTaxonCount(
        async () => await props.computeTaxonCount(selectedItems.value),
        (result: number) => taxonCount.value = result
    )
    isComputingTaxonCount.value = false;
}

watch(selectedItems, () => {
    countProteins();
    countTaxa();
});

onMounted(() => {
    countProteins();
    countTaxa();
});
</script>

<style scoped>
.settings-text {
    font-size: 14px;
    color: rgba(0,0,0,.6);
}
</style>
