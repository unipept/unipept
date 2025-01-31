<template>
    <div>
        <v-row>
            <v-col
                sm="12"
                md="8"
            >
                <v-radio-group
                    v-model="selected"
                    color="primary"
                >
                    <v-radio
                        :value="NormalizationType.All"
                        label="All"
                    />
                    <span class="ms-10">
                        Normalize over all data points of the input. Values are normalized with respect to the global maximum and minimum value.
                    </span>
                    <v-radio
                        :value="NormalizationType.Rows"
                        label="Rows"
                    />
                    <span class="ms-10">
                        Normalize values on a row-per-row basis. Values are normalized with respect to the maximum and minimum value in their respective row.
                    </span>
                    <v-radio
                        :value="NormalizationType.Columns"
                        label="Columns"
                    />
                    <span class="ms-10">
                        Normalize values on a column-per-column basis. Values are normalized with respect to the maximum and minimum value in their respective column.
                    </span>
                </v-radio-group>
            </v-col>
            <v-col
                class="hidden-sm-and-down"
                md="4"
            >
                <v-card
                    class="d-flex justify-center align-center"
                    variant="flat"
                    height="100%"
                >
                    <v-img
                        :src="image"
                        alt="normalization explanation"
                        max-height="300"
                    />
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
import AllNormalizerImage from "@/assets/normalization/all_normalizer.svg";
import ColumnNormalizerImage from "@/assets/normalization/column_normalizer.svg";
import RowNormalizerImage from "@/assets/normalization/row_normalizer.svg";
import {computed} from "vue";
import {NormalizationType} from "@/composables/useNormalization";

const selected = defineModel<NormalizationType>({ default: NormalizationType.All });

const image = computed(() => {
    switch (selected.value) {
        case NormalizationType.All: return AllNormalizerImage;
        case NormalizationType.Rows: return RowNormalizerImage;
        case NormalizationType.Columns: return ColumnNormalizerImage;
        default: return AllNormalizerImage;
    }
});
</script>

<style scoped>

</style>
