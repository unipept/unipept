<template>
    <v-dialog
        v-model="dialogOpen"
        max-width="60%"
        @click:outside="undoChanges"
    >
        <v-unipept-card class="bg-mainBody">
            <v-card-title class="d-flex">
                Filter
                <v-spacer />
                <div class="justify-end">
                    <v-btn
                        icon="mdi-close"
                        variant="plain"
                        size="small"
                        density="compact"
                        @click="undoChanges"
                    />
                </div>
            </v-card-title>

            <v-card-text>
                <p>
                    By default Unipept does not report all found annotations. It uses a clever filtering technique that removes untrustworthy annotations.
                    The strength of this filter is expressed as a percentage:
                </p>
                <ul class="my-2 pl-6">
                    <li>
                        <strong>0%</strong> means no filtering occurs.
                        We assign the annotation <i>A</i> to a peptide sequence <i>P</i> if there is at least one protein that contains an exact match for <i>P</i> and has been assigned the annotation <i>A</i>.
                    </li>
                    <li>
                        <strong>100%</strong> is the strongest level of filtering.
                        In this case we require that every protein that contains a certain peptide sequence <i>P</i> has the annotation <i>A</i>. before we assign the annotation <i>A</i>. to the peptide.
                    </li>
                </ul>
                <p>
                    The default value is 5%. This means that a peptide sequence <i>P</i> is assumed to be annotated with an annotation <i>A</i> if at least 5% of the UniProt entries in which <i>P</i> occurs has been annotated with <i>A</i>.
                </p>


                <v-slider
                    v-model="filterPercentage"
                    class="mt-8"
                    thumb-color="primary"
                    thumb-label="always"
                    thumb-size="22"
                    step="1"
                    min="0"
                    max="100"
                    color="primary"
                >
                    <template #prepend>
                        <v-icon size="small">
                            mdi-greater-than-or-equal
                        </v-icon>
                    </template>

                    <template #append>
                        % of annotated proteins
                    </template>
                </v-slider>

                <v-btn
                    class="float-end mb-2"
                    color="primary"
                    variant="elevated"
                    @click="confirmChanges"
                >
                    Set threshold
                </v-btn>
            </v-card-text>
        </v-unipept-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const dialogOpen = defineModel({ default: false });

const emit = defineEmits<{
    confirm: [filterPercentage: number]
}>();

const props = defineProps<{
    filterPercentage?: number
}>();

const filterPercentage = ref(props.filterPercentage ?? 5);

const confirmChanges = () => {
    emit('confirm', filterPercentage.value);
    undoChanges();
};

const undoChanges = () => {
    filterPercentage.value
    dialogOpen.value = false;
};
</script>

<style scoped>
:deep(.v-input__append-outer) {
    width: 316px;
}
</style>
