<template>
    <v-list-item ripple @click="activateAssay(assayData.assay)" :class="this.$store.getters.activeAssay === assayData.assay ? 'selected-list-item' : ''">
        <v-list-item-action>
            <div class="select-dataset-radio" v-if="progress === 1">
                <v-radio-group v-model="activeAssayModel">
                    <v-radio :value="assayData.assay"></v-radio>
                </v-radio-group>
            </div>
            <v-progress-circular v-else :rotate="-90" :size="24" :value="progress * 100" color="primary"></v-progress-circular>
        </v-list-item-action>
        <v-list-item-content>
            <v-list-item-title>
                {{ assayData.assay.getName() }}
            </v-list-item-title>
            <v-list-item-subtitle>
                {{ assayData.assay.getAmountOfPeptides() }} peptides
            </v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
            <v-list-item-action-text>
                {{ assayData.assay.getDate().toLocaleDateString() }}
            </v-list-item-action-text>
            <tooltip message="Remove assay from analysis.">
                <v-icon @click="deselectAssay(assayData.assay)" v-on:click.stop>mdi-delete-outline</v-icon>
            </tooltip>
        </v-list-item-action>
    </v-list-item>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { AssayData, ProteomicsAssay, Tooltip } from "unipept-web-components";

@Component({
    components: {
        Tooltip
    },
    computed: {
        activeAssayModel: {
            get(): ProteomicsAssay {
                return this.$store.getters.activeAssay;
            },
            set(assay: ProteomicsAssay) {
                // Nothing to do here!
            }
        }
    }
})
export default class AssayItem extends Vue {
    @Prop({ required: true })
    private assayData: AssayData;

    get progress(): number {
        console.log(this.assayData.analysisMetaData.progress);
        console.log(this.assayData.analysisMetaData.progress === 1);
        return this.assayData.analysisMetaData.progress;
    }

    private activateAssay(assay: ProteomicsAssay): void {
        this.$store.dispatch("activateAssay", assay);
    }

    private deselectAssay(assay: ProteomicsAssay): void {
        this.$store.dispatch("removeAssay", assay);
    }
}
</script>

<style>
    .selected-list-item .v-list__item:before {
        content: ' ';
        background-color: #2196F3;
        width: 4px;
        height: 100%;
        position: relative;
        left: -12px;
    }

    .selected-list-item .v-list__item {
        margin-left: -4px;
    }
</style>
